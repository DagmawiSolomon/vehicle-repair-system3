/**
 * Converts a File object to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Validates if a file is an image with allowed formats
 */
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}

/**
 * Resizes an image to a maximum width/height while maintaining aspect ratio
 */
export const resizeImage = (base64Image: string, maxWidth = 1200, maxHeight = 900): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Image
    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)
      }

      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
  })
}

/**
 * Compresses an image file
 */
export const compressImage = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      if (ctx) {
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          quality,
        )
      } else {
        resolve(file)
      }
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Creates a thumbnail from an image file
 */
export const createThumbnail = (file: File, size = 150): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      if (ctx) {
        // Calculate crop dimensions for square thumbnail
        const minDimension = Math.min(img.width, img.height)
        const x = (img.width - minDimension) / 2
        const y = (img.height - minDimension) / 2

        ctx.drawImage(img, x, y, minDimension, minDimension, 0, 0, size, size)
        resolve(canvas.toDataURL("image/jpeg", 0.8))
      }
    }

    img.src = URL.createObjectURL(file)
  })
}
