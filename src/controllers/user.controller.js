import { attachFile } from '../middlewares/multer.js'
import userM from '../models/user.js'

const createUser = async (req, res) => {
  // validations
  const errorsList = []
  validateUserData(req.body, errorsList)
  if (errorsList.length) {
    const message = 'Existen errores en los datos proporcionados'
    return res.status(400)
      .send({ success: false, status: 400, message, errorsList })
  }
  // create user
  const response = await userM.createUser(req.body)
  res.status(response.status).send(response)
}

// helper | validate
const validateUserData = (data, errorsList) => {
  const { email, password } = data
  !email &&
    errorsList.push('Se debe proporcionar un correo')
  email && !mailIsValid(email) &&
    errorsList.push('El correo no es válido')
  !password &&
    errorsList.push('La contraseña no puede estar vacía')
  password && !passwordIsValid(password) &&
    errorsList.push('La contraseña no es válida')
}

// helper | mail
const mailIsValid = (email) => {
  const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
  return pattern.test(email)
}

// helper | password
const passwordIsValid = (password) => {
  const pattern = /^(?=.*[A-Z]).{8,}$/
  return pattern.test(password)
}

const login = async (req, res) => {
  // validations
  const { email, password } = req.body
  const message = 'Se requiere email y contraseña para iniciar sesión'
  if (!email || !password) {
    return res.status(400).send({ success: false, status: 400, message })
  }
  // login
  const response = await userM.login(req.body)
  res.status(response.status).send(response)
}

const verifyToken = async (req, res) => {
  if (req.auth) {
    res.json({ success: true, data: req.auth })
  }
}

const getUser = async (req, res) => {
  const { userId, email, token } = req.auth
  const response = await userM.getUser(userId, email)
  response.token = token // refresh token
  // get foto
  res.status(response.status).json(response)
}

const getImage = async (req, res) => {
  const { userId, email } = req.auth
  const filename = await userM.getImage(userId, email)
  const message = 'Imagen no encontrada'
  if (!filename.success) {
    return res.status(500).send({ success: false, status: 500, message })
  }
  const image = attachFile(filename.data)
  if (!image.success) {
    return res.status(500).send({ success: false, status: 500, message })
  }
  res.setHeader('Content-Type', `image/${image.ext}`)
  res.send(image.data)
}

const updateUser = async (req, res) => {
  // validations
  const errorsList = []
  delete req.body.email // not allowed
  delete req.body.image // not required
  if (req.body.password) validateUserUpdate(req.body, errorsList)
  // validate new password and email
  if (errorsList.length) {
    const message = 'Existen errores en los datos proporcionados'
    return res.status(400)
      .send({ success: false, status: 400, message, errorsList })
  }
  // update user
  const { userId, email, token } = req.auth
  const response = await userM.updateUser(userId, email, req.body)
  response.token = token // refresh token
  res.status(response.status).send(response)
}

// helpers
const validateUserUpdate = (data, errorsList) => {
  const { password } = data
  !password &&
    errorsList.push('La contraseña no puede estar vacía')
  password && !passwordIsValid(password) &&
    errorsList.push('La contraseña no es válida')
}

const uploadImage = async (req, res) => {
  const { userId, email } = req.auth
  const { filename } = req.body
  if (!userId || !email) {
    const message = 'Credenciales inválidas'
    return res.status(401).send({ success: false, status: 401, message })
  }
  const updateImg = await userM.uploadImage(userId, email, filename)
  return res.status(updateImg.status).json(updateImg)
}

// manage table
const createTale = async (req, res) => {
  const response = await userM.createTale()
  res.status(response.status).json(response)
}

const dropTable = async (req, res) => {
  const response = await userM.dropTable()
  res.status(response.status).json(response)
}

const getAllUsers = async (req, res) => {
  const response = await userM.getAllUsers()
  res.status(response.status).json(response)
}

export default {
  getAllUsers,
  createUser,
  createTale,
  dropTable,
  login,
  updateUser,
  verifyToken,
  getUser,
  uploadImage,
  getImage
}
