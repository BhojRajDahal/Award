"use client"

import { useEffect } from "react"

/** Avoid a sub-frame flicker when the document is already complete */
const MIN_VISIBLE_MS = 380

/** Fades out `#nast-boot-splash` after the window load event. */
export function BootSplashClient(): null {
  useEffect(() => {
    const el = document.getElementById("nast-boot-splash")
    if (!el) return

    const startedAt = typeof performance !== "undefined" ? performance.now() : 0

    const leave = (): void => {
      el.classList.add("nast-boot-splash--leave")
      el.setAttribute("aria-hidden", "true")
    }

    const scheduleLeave = (): void => {
      const elapsed =
        typeof performance !== "undefined" ? performance.now() - startedAt : MIN_VISIBLE_MS
      const remainder = Math.max(0, MIN_VISIBLE_MS - elapsed)
      window.setTimeout(leave, remainder)
    }

    if (document.readyState === "complete") {
      scheduleLeave()
      return undefined
    }

    window.addEventListener("load", scheduleLeave, { once: true })
    return () => window.removeEventListener("load", scheduleLeave)
  }, [])

  return null
}
