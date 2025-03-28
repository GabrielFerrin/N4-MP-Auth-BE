import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 3000
export const DB_HOST = process.env.DB_HOST
export const DB_USER = process.env.DB_USER
export const DB_PASS = process.env.DB_PASS
export const DB_DB = process.env.DB_DB
export const DB_PORT = process.env.DB_PORT
export const JWT_SECRET = process.env.JWT_SECRET
