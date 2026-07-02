// Compress an uploaded image File to a JPEG data URL no wider than 800px.
// Keeps localStorage small enough to hold many daily photos as base64.
const MAX_WIDTH = 800

export function compressImage(file, maxWidth = MAX_WIDTH, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That image could not be opened.'))
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        try {
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          reject(new Error('Could not process that image.'))
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Strip the "data:image/jpeg;base64," prefix → raw base64 + media type,
// the shape the Claude vision API expects.
export function splitDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl || '')
  if (!match) return null
  return { mediaType: match[1], data: match[2] }
}
