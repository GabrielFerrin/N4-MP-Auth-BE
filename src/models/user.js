import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import db from '../config/db.js'
import { JWT_SECRET } from '../config/config.js'

// REGISTER
const createUser = async (data) => {
  const { email, password } = data
  let message
  const hash = await bcrypt.hash(password, 11)
  try {
    let query = 'INSERT INTO user (email, password) VALUES (?, ?)'
    await db.execute(query, [email, hash])
    query = 'SELECT * FROM user WHERE email = ?'
    const [response] = await db.execute(query, [email])
    const user = response[0]
    delete user.password
    const token = getToken(user.user_id, user.email)
    return { success: true, status: 200, token, data: user }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      message = `El correo '${email}' ya está registrado`
      return { success: false, status: 409, message }
    } else {
      message = 'Error interno'
      return { success: false, status: 500, message: 'Error interno' }
    }
  }
}

const getToken = (userId, email) => {
  const token = jwt
    .sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' })
  return token
}

// LOGIN
const login = async (data) => {
  const { email, password } = data
  let message = null
  try {
    const query = 'SELECT * FROM user WHERE email = ?'
    const [response] = await db.query(query, [email])
    if (response.length === 0) {
      message = 'Credenciales inválidas'
      return { success: false, status: 401, message }
    }
    const user = response[0]
    if (await bcrypt.compare(password, user.password)) {
      const token = getToken(user.user_id, user.email)
      delete user.password
      return { success: true, status: 200, token, data: user }
    } else {
      message = 'Credenciales inválidas'
      return { success: false, status: 401, message }
    }
  } catch (error) {
    message = 'Error interno'
    return { success: false, status: 500, message, error: error.message }
  }
}

// GET USER DATA
const getUser = async (userId, email) => {
  try {
    const query = 'SELECT * FROM user WHERE user_id = ? AND email = ?'
    const [response] = await db.query(query, [userId, email])
    const user = response[0]
    delete user.password
    return { success: true, status: 200, data: user }
  } catch (error) {
    const message = 'Error interno'
    return { success: false, status: 500, message, error: error.message }
  }
}

// UPDATE
const updateUser = async (userId, email, data) => {
  let message = ''
  try {
    let query = 'SELECT * FROM user WHERE user_id = ? AND email = ?'
    if (data.password) {
      const [response] = await db.execute(query, [userId, email])
      if (response.length === 1) {
        if (!await bcrypt.compare(data.currentPassword, response[0].password)) {
          message = 'La contraseña no coincide'
          return { success: false, status: 401, message }
        }
      } else {
        message = 'Credenciales inválidas'
        return { success: false, status: 401, message }
      }
      data.password = await bcrypt.hash(data.password, 11)
    }
    delete data.currentPassword
    // prepare query
    const queryParams = Object.keys(data)
      .map(key => `${key} = ?`).join(', ')
    const values = [...Object.values(data), userId, email]
    query = `UPDATE user SET ${queryParams}
      WHERE user_id = ? AND email = ?`
    // update
    await db.query(query, values)
    // prepare response
    message = 'Usuario actualizado'
    data.email = email
    delete data.password
    return { success: true, status: 200, message, data }
  } catch (error) {
    message = 'Error interno'
    return { success: false, status: 500, message, error: error.message }
  }
}

// manage table
// CREATE
const createTale = async () => {
  try {
    const query = `CREATE TABLE IF NOT EXISTS user
      (
        user_id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
        nombres VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        foto VARCHAR(255),
        bio TEXT,
        telefono VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
      )`
    await db.query(query)
    return { success: true, status: 200, message: 'Tabla creada' }
  } catch (error) {
    return { success: false, status: 500, message: error.message }
  }
}

// READ
const getAllUsers = async () => {
  try {
    const query = 'SELECT * FROM user'
    const [response] = await db.query(query)
    return { success: true, status: 200, data: response }
  } catch (error) {
    const message = 'Error interno'
    return { success: false, status: 500, message, error: error.message }
  }
}

// DELETE
const dropTable = async () => {
  try {
    const query = 'DROP TABLE IF EXISTS user'
    await db.query(query)
    return { success: true, status: 200, message: 'Tabla eliminada' }
  } catch (error) {
    return { success: false, status: 500, message: error.message }
  }
}

export default {
  getAllUsers,
  createUser,
  dropTable,
  createTale,
  login,
  updateUser,
  getUser
}
