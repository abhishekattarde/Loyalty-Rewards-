import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib'

interface QrCodeEntry {
  uniqueCode: string
  dataUrl: string
}

interface GeneratePdfParams {
  codes: QrCodeEntry[]
  pointsPerCode: number
  greetingMsg: string
  appUrl: string
}

// A4 dimensions at 72 DPI
const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842

const COLS = 5
const ROWS = 4
const CODES_PER_PAGE = COLS * ROWS // 20

const H_MARGIN = 10
const V_MARGIN = 10

const CELL_WIDTH = (PAGE_WIDTH - H_MARGIN * 2) / COLS   // ~115
const CELL_HEIGHT = (PAGE_HEIGHT - V_MARGIN * 2) / ROWS  // ~205.5

const CELL_PAD = 4
const INNER_W = CELL_WIDTH - CELL_PAD * 2
const INNER_H = CELL_HEIGHT - CELL_PAD * 2

export async function generateQrBatchPdf(params: GeneratePdfParams): Promise<Uint8Array> {
  const { codes, pointsPerCode, greetingMsg } = params

  const pdfDoc = await PDFDocument.create()
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const totalPages = Math.ceil(codes.length / CODES_PER_PAGE)

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    const pageCodes = codes.slice(pageIdx * CODES_PER_PAGE, (pageIdx + 1) * CODES_PER_PAGE)

    for (let i = 0; i < pageCodes.length; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)

      const cellX = H_MARGIN + col * CELL_WIDTH
      // PDF y-axis is bottom-up; row 0 is at top
      const cellY = PAGE_HEIGHT - V_MARGIN - (row + 1) * CELL_HEIGHT

      await drawCell({
        page,
        cellX,
        cellY,
        code: pageCodes[i],
        pointsPerCode,
        greetingMsg,
        fontRegular,
        fontBold,
        pdfDoc,
      })
    }
  }

  return pdfDoc.save()
}

interface DrawCellParams {
  page: PDFPage
  cellX: number
  cellY: number
  code: QrCodeEntry
  pointsPerCode: number
  greetingMsg: string
  fontRegular: PDFFont
  fontBold: PDFFont
  pdfDoc: PDFDocument
}

async function drawCell({
  page,
  cellX,
  cellY,
  code,
  pointsPerCode,
  greetingMsg,
  fontRegular,
  fontBold,
  pdfDoc,
}: DrawCellParams) {
  // ── Outer border ──────────────────────────────────────────────
  page.drawRectangle({
    x: cellX,
    y: cellY,
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
    color: rgb(1, 1, 1),
  })

  const innerX = cellX + CELL_PAD
  let currentY = cellY + CELL_HEIGHT - CELL_PAD // start from top inside cell

  // ── Logo bar (top ~22pt) ──────────────────────────────────────
  const logoH = 22
  currentY -= logoH

  page.drawRectangle({
    x: innerX,
    y: currentY,
    width: INNER_W,
    height: logoH,
    color: rgb(0.85, 0.42, 0.0), // brand orange
    borderWidth: 0,
  })

  // Logo text centered
  const logoText = 'LOYALTY REWARDS'
  const logoFontSize = 6.5
  const logoTextWidth = fontBold.widthOfTextAtSize(logoText, logoFontSize)
  page.drawText(logoText, {
    x: innerX + (INNER_W - logoTextWidth) / 2,
    y: currentY + (logoH - logoFontSize) / 2,
    size: logoFontSize,
    font: fontBold,
    color: rgb(1, 1, 1),
  })

  currentY -= 4 // gap after logo

  // ── QR Code image (~80×80pt) ──────────────────────────────────
  const qrSize = 78
  try {
    const base64Data = code.dataUrl.split(',')[1]
    const pngBytes = Buffer.from(base64Data, 'base64')
    const pngImage = await pdfDoc.embedPng(pngBytes)

    currentY -= qrSize
    const qrX = innerX + (INNER_W - qrSize) / 2

    page.drawImage(pngImage, {
      x: qrX,
      y: currentY,
      width: qrSize,
      height: qrSize,
    })
  } catch {
    // fallback placeholder rectangle if QR embedding fails
    currentY -= qrSize
    page.drawRectangle({
      x: innerX + (INNER_W - qrSize) / 2,
      y: currentY,
      width: qrSize,
      height: qrSize,
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1,
    })
  }

  currentY -= 5 // gap

  // ── "Scan Me" label ───────────────────────────────────────────
  const scanMeText = 'Scan Me'
  const scanMeFontSize = 8
  const scanMeWidth = fontBold.widthOfTextAtSize(scanMeText, scanMeFontSize)
  currentY -= scanMeFontSize

  page.drawText(scanMeText, {
    x: innerX + (INNER_W - scanMeWidth) / 2,
    y: currentY,
    size: scanMeFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  })

  currentY -= 4

  // ── Points value ──────────────────────────────────────────────
  const pointsText = `${pointsPerCode} Points`
  const pointsFontSize = 7.5
  const pointsTextWidth = fontBold.widthOfTextAtSize(pointsText, pointsFontSize)
  currentY -= pointsFontSize

  page.drawText(pointsText, {
    x: innerX + (INNER_W - pointsTextWidth) / 2,
    y: currentY,
    size: pointsFontSize,
    font: fontBold,
    color: rgb(0.85, 0.42, 0.0), // brand orange
  })

  currentY -= 4

  // ── Greeting message box (dark background, bottom of cell) ────
  // Calculate remaining height for the greeting box
  const greetingBoxY = cellY + CELL_PAD
  const greetingBoxH = currentY - greetingBoxY

  if (greetingBoxH > 10) {
    page.drawRectangle({
      x: innerX,
      y: greetingBoxY,
      width: INNER_W,
      height: greetingBoxH,
      color: rgb(0.15, 0.15, 0.15),
      borderWidth: 0,
    })

    // Wrap and render greeting text
    const greetFontSize = 4.8
    const lineHeight = greetFontSize + 1.5
    const maxLineWidth = INNER_W - 6
    const lines = wrapText(greetingMsg, fontRegular, greetFontSize, maxLineWidth)

    const totalTextH = lines.length * lineHeight
    let textY = greetingBoxY + (greetingBoxH + totalTextH) / 2 - lineHeight

    for (const line of lines) {
      const lineWidth = fontRegular.widthOfTextAtSize(line, greetFontSize)
      page.drawText(line, {
        x: innerX + 3 + (maxLineWidth - lineWidth) / 2,
        y: textY,
        size: greetFontSize,
        font: fontRegular,
        color: rgb(1, 1, 1),
      })
      textY -= lineHeight
    }
  }
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)

  return lines
}
