import axios from "axios"

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "")

/**
 * Base URL for API calls.
 * Paths already include `/api` (e.g. `/api/auth/me`).
 *
 * In development, default to same-origin (empty base) so requests hit Next.js and
 * `next.config.mjs` rewrites proxy to the backend. That avoids CORS/credential issues
 * when NEXT_PUBLIC_API_BASE_URL pointed at :5000 but cookies/CORS are strict.
 * Set NEXT_PUBLIC_API_DIRECT=true to force using NEXT_PUBLIC_API_BASE_URL in dev.
 */
const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL
const forceDirectInDev = process.env.NEXT_PUBLIC_API_DIRECT === "true"
const useRelativeApiInDev =
  process.env.NODE_ENV === "development" && !forceDirectInDev

let API_BASE_URL: string
if (useRelativeApiInDev) {
  API_BASE_URL = ""
} else if (rawBase) {
  if (rawBase.includes("http")) {
    API_BASE_URL = normalizeBaseUrl(rawBase)
  } else {
    API_BASE_URL = normalizeBaseUrl(rawBase)
  }
} else {
  API_BASE_URL = ""
}

// Log the base URL for debugging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[API Client] Base URL configured:', API_BASE_URL || '(empty - paths include /api)')
  console.log('[API Client] NEXT_PUBLIC_API_BASE_URL:', rawBase || 'not set (using empty baseURL)')
  console.log('[API Client] Note: All API paths already include /api prefix')
}

export { API_BASE_URL }

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000, // 2 minute timeout for slower uploads/form submissions
})

// Add request interceptor for debugging and FormData handling
apiClient.interceptors.request.use(
  (config) => {
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // Only log requests in development
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${config.baseURL}${config.url}`
      console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`)
      if (config.data instanceof FormData) {
        console.log(`[API Request] Sending FormData with ${Array.from(config.data.keys()).length} fields`)
      }
    }
    return config
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error("[API Request Error]", error)
    }
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    // Only log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    // Safely extract error information
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const statusText = error.response.statusText
      const data = error.response.data
      const url = error.config?.url
      const method = error.config?.method?.toUpperCase()
      
      // Extract user-friendly error message
      const errorMsg = 
        (typeof data === "object" && data?.msg) || 
        (typeof data === "string" && data) || 
        error.message || 
        "Request failed"
      
      // Only log detailed errors in development mode
      // For authentication errors (401), log minimal info even in development
      if (process.env.NODE_ENV === 'development' && status !== 401) {
        const fullUrl = `${error.config?.baseURL || ''}${url || ''}`
        console.error(
          `[API Error] ${method} ${fullUrl} - ${status} ${statusText}`,
          "\nMessage:", errorMsg
        )
      } else if (process.env.NODE_ENV === 'development' && status === 401) {
        // Session probe returns 401 for guests — avoid warning spam
        const path = typeof url === "string" ? url.split("?")[0] : ""
        if (path !== "/api/auth/me") {
          console.warn(`[API] Authentication failed for ${url}`)
        }
      }
      // In production, don't log error details to console
    } else if (error.request) {
      // Request made but no response received (proxy refused, CORS/preflight abort, offline, etc.)
      if (process.env.NODE_ENV === "development") {
        const cfg = error.config
        const path = cfg?.url ?? ""
        const base = cfg?.baseURL ?? ""
        const fullUrl =
          base && path.startsWith("http")
            ? path
            : `${typeof window !== "undefined" ? window.location.origin : ""}${base}${path}`
        console.error(
          "[API Error] No response received — browser never got an HTTP response.",
          "\nPath:", path || "(missing)",
          "\nAxios baseURL:", base === "" ? "(empty — same-origin /api + Next rewrites)" : base,
          "\nResolved:", fullUrl,
          "\nAxios message:", error.message,
          "\nHint: Ensure the API is up (e.g. GET /health on port 5000) and Next rewrites match API_PROXY_TARGET.",
          "\n      In dev, omit NEXT_PUBLIC_API_BASE_URL or set NEXT_PUBLIC_API_DIRECT=true only when CORS is configured."
        )
      }
    } else {
      // Error setting up request
      if (process.env.NODE_ENV === 'development') {
        console.error("[API Error] Request setup failed:", error.message)
      }
    }
    
    return Promise.reject(error)
  }
)







