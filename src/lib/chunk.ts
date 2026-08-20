export function chunkText(text: string, maxChars = 1500): string[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  const chunks: string[] = []
  let start = 0

  while (start < clean.length) {
    let end = Math.min(start + maxChars, clean.length)

    if (end < clean.length) {
      const lastPeriod = clean.lastIndexOf('. ', end)
      if (lastPeriod > start + maxChars * 0.5) {
        end = lastPeriod + 1
      }
    }

    chunks.push(clean.slice(start, end).trim())
    start = end
  }

  return chunks.filter((c) => c.length > 20)
}
