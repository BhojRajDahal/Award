import { jsPDF } from "jspdf"

export type MarkCertificateInput = {
  application_id: number
  name: string
  email: string
  phone: string | null
  award: string
  year: number
  marks: number
  remarks: string | null
}

const HEADER_RGB: [number, number, number] = [182, 42, 45]

/** Page margins in mm (from spec: left ~1.3in, right 1in, top 0.4in, bottom 1in) */
const inToMm = (inch: number) => inch * 25.4
const MARGIN = {
  L: inToMm(1.3),
  R: inToMm(1),
  T: inToMm(0.4),
  B: inToMm(1),
} as const

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageH = doc.internal.pageSize.getHeight()
  if (y + needed > pageH - MARGIN.B) {
    doc.addPage()
    return MARGIN.T
  }
  return y
}

async function fetchImageDataUrl(path: string): Promise<string | null> {
  try {
    const res = await fetch(path, { cache: "force-cache" })
    if (!res.ok) return null
    const blob = await res.blob()
    const mime = blob.type || ""
    if (!mime.startsWith("image/")) return null
    return await new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onloadend = () => resolve(fr.result as string)
      fr.onerror = () => reject(new Error("read"))
      fr.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function rasterizeToPngDataUrl(path: string, sizePx: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.decoding = "async"
    img.onload = () => {
      try {
        const c = document.createElement("canvas")
        c.width = sizePx
        c.height = sizePx
        const ctx = c.getContext("2d")
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.clearRect(0, 0, sizePx, sizePx)
        const nw = img.naturalWidth || img.width
        const nh = img.naturalHeight || img.height
        if (!nw || !nh) {
          resolve(null)
          return
        }
        const scale = Math.min(sizePx / nw, sizePx / nh)
        const w = nw * scale
        const h = nh * scale
        const x = (sizePx - w) / 2
        const y = (sizePx - h) / 2
        ctx.drawImage(img, x, y, w, h)
        resolve(c.toDataURL("image/png"))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = path
  })
}

type SealFormat = "PNG" | "JPEG"

function detectFormat(dataUrl: string): SealFormat {
  if (dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg")) return "JPEG"
  return "PNG"
}

/** Prefer official seal assets; includes app logo path used in the UI. */
async function resolveSealForPdf(): Promise<{ dataUrl: string; format: SealFormat } | null> {
  const png = await fetchImageDataUrl("/nast-logo.png")
  if (png?.startsWith("data:image")) return { dataUrl: png, format: detectFormat(png) }

  const jpg = await fetchImageDataUrl("/nast-logo.jpg")
  if (jpg?.startsWith("data:image")) return { dataUrl: jpg, format: detectFormat(jpg) }

  const appLogo = await fetchImageDataUrl("/Nepal_Academy_of_Science_and_Technology_Logo.svg.png")
  if (appLogo?.startsWith("data:image")) return { dataUrl: appLogo, format: detectFormat(appLogo) }

  const svgSeal = await rasterizeToPngDataUrl("/nast-seal.svg", 768)
  if (svgSeal) return { dataUrl: svgSeal, format: "PNG" }

  const icon = await rasterizeToPngDataUrl("/icon.svg", 768)
  if (icon) return { dataUrl: icon, format: "PNG" }

  return null
}

export async function downloadMarkCertificatePdf(mark: MarkCertificateInput): Promise<void> {
  const seal = await resolveSealForPdf()

  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const contentRight = pageW - MARGIN.R
  const contentWidth = contentRight - MARGIN.L

  let y = MARGIN.T

  const logoMm = 36
  const textX = MARGIN.L + logoMm + 5
  const textW = Math.max(40, contentRight - textX)

  if (seal) {
    doc.addImage(seal.dataUrl, seal.format, MARGIN.L, y, logoMm, logoMm, undefined, "FAST")
  } else {
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.35)
    doc.circle(MARGIN.L + logoMm / 2, y + logoMm / 2, logoMm / 2, "S")
  }
//start
const TITLE = "NEPAL ACADEMY OF SCIENCE & TECHNOLOGY"

doc.setFont("times", "bold")
doc.setTextColor(HEADER_RGB[0], HEADER_RGB[1], HEADER_RGB[2])

let titlePt = 15
let titleLines: string[] = []

// Reduce font size until title fits in ONE line
while (titlePt >= 8) {
  doc.setFontSize(titlePt)
  titleLines = doc.splitTextToSize(TITLE, textW)

  if (titleLines.length <= 1) break

  titlePt -= 1
}

// fallback
if (titleLines.length > 1) {
  doc.setFontSize(8)
  titleLines = [TITLE]
}

doc.text(titleLines, textX, y + 8)

const lineHeightMm = Math.max(5.2, titlePt * 0.38)
let textBottom = y + 8 + titleLines.length * lineHeightMm

doc.setFontSize(12)
doc.setTextColor(HEADER_RGB[0], HEADER_RGB[1], HEADER_RGB[2])

doc.text("CENTRAL OFFICE", pageW / 2+19, textBottom + 3, {
  align: "center",
})

textBottom += 10
//end
  const headerBottom = Math.max(y + logoMm, textBottom + 2)
  y = headerBottom + 4

  const lineX1 = MARGIN.L
  const lineX2 = contentRight
  const nastLabel = "NAST"

  doc.setDrawColor(HEADER_RGB[0], HEADER_RGB[1], HEADER_RGB[2])
  doc.setLineWidth(0.45)

  y = ensureSpace(doc, y, 8)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(HEADER_RGB[0], HEADER_RGB[1], HEADER_RGB[2])

  const textWidth = doc.getTextWidth(nastLabel)
  const centerX = (lineX1 + lineX2) / 2
  const gap = 2
  const textStart = centerX - textWidth / 2
  const textEnd = centerX + textWidth / 2

  doc.line(lineX1, y, textStart - gap, y)
  doc.line(textEnd + gap, y, lineX2, y)
  doc.text(nastLabel, centerX, y + 1.2, { align: "center" })

  y += 1.8
  doc.line(lineX1, y, textStart - gap, y)
  doc.line(textEnd + gap, y, lineX2, y)

  doc.setDrawColor(0, 0, 0)
  y += 6
  doc.setTextColor(0, 0, 0)

  y += 10

  const appId = `APP-${String(mark.application_id).padStart(3, "0")}`
  const MARKS_RGB: [number, number, number] = [190, 24, 93]

  const fields: { label: string; value: string; valueRgb?: [number, number, number] }[] = [
    { label: "APP ID", value: appId },
    { label: "Name", value: mark.name },
    { label: "Phone no.", value: mark.phone?.trim() || "N/A" },
    { label: "Email", value: mark.email },
    { label: "Award", value: mark.award },
    { label: "Year", value: String(mark.year) },
    { label: "Assigned Marks", value: Number(mark.marks).toFixed(2), valueRgb: [0, 0, 0] },
    {
      label: "Remarks",
      value: "\n" + (mark.remarks?.trim() || "—")
        .split("\n")
        .join("\n\n"),
    },
  ]

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  const labelX = MARGIN.L
  const valueX = MARGIN.L + 42
  const valueMaxW = contentRight - valueX

  for (const row of fields) {
    const valueLines = doc.splitTextToSize(row.value, valueMaxW)
    const blockH = 6 + valueLines.length * 5.2
    y = ensureSpace(doc, y, blockH)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text(`${row.label}:`, labelX, y)

    if (row.valueRgb) {
      doc.setTextColor(row.valueRgb[0], row.valueRgb[1], row.valueRgb[2])
    } else {
      doc.setTextColor(40, 40, 40)
    }
    doc.setFont("helvetica", "normal")
    doc.text(valueLines, valueX, y)
    doc.setTextColor(0, 0, 0)
    y += Math.max(7, valueLines.length * 5.2) + 3
  }

  doc.save(`NAST-marks-${appId}.pdf`)
}
