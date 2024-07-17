import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}${path.extname(file.originalname)}`
    req.body.filename = filename
    cb(null, filename)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se admiten archivos de imagen'))
  }
}

const limits = {
  fileSize: 1024 * 1024 * 5,
  files: 1
}

export const uploadImage = multer({ storage, fileFilter, limits })

export const fileError = (error, req, res, next) => {
  let message = 'El archivo supera el tamaño permitido'
  if (error && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(500).json({ success: false, message })
  }
  // catch the number of files
  if (error && error.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Solo se permite un archivo'
    return res.status(500).json({ success: false, message })
  }
  if (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
  message = 'Error interno'
  return res.status(500).json({ success: false, message })
}

export const attachFile = (filename) => {
  const route = `./images/${filename}`
  try {
    if (fs.existsSync(route)) {
      const file = fs.readFileSync(route)
      return {
        success: true,
        data: file,
        ext: path.extname(route).slice(1)
      }
    } else {
      return { success: false }
    }
  } catch (error) {
    return { success: false }
  }
}

export const deleteFile = (filename) => {
  const route = `./images/${filename}`
  try {
    if (fs.existsSync(route)) {
      fs.unlinkSync(route)
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}
