import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/config.js'

const auth = (req, res, next) => {
  const { authorization: token } = req.headers
  try {
    const decode = jwt.verify(token, JWT_SECRET)
    const newToken = jwt.sign({
      userId: decode.userId, email: decode.email
    }, JWT_SECRET, { expiresIn: '1h' })
    req.auth = {
      userId: decode.userId, email: decode.email, token: newToken
    }
    next()
  } catch (error) {
    let message = 'Invalid token'
    if (error.name === 'TokenExpiredError') message = 'La sesión expiró'
    res.status(401).json({ success: false, message })
  }
}

export default auth
