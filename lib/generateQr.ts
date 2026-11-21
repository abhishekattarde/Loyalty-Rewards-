import QRCode from 'qrcode'

export async function generateQrDataUrl(code: string, appUrl: string): Promise<string> {
  const url = `${appUrl}/scan/${code}`
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  })
}

export function generateUniqueCode(length = 15): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function generateUniqueCodes(
  count: number,
  existingCodes: Set<string> = new Set()
): Promise<string[]> {
  const codes: string[] = []
  const usedInBatch = new Set<string>(existingCodes)

  while (codes.length < count) {
    const code = generateUniqueCode()
    if (!usedInBatch.has(code)) {
      usedInBatch.add(code)
      codes.push(code)
    }
  }

  return codes
}
