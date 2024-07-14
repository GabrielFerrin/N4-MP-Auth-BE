import { createPool } from 'mysql2/promise'
import { DB_HOST, DB_USER, DB_PASS, DB_DB, DB_PORT } from './config.js'

const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_DB,
  port: DB_PORT,
  dateStrings: true
})

export default pool
