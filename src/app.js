import express from 'express'
import morgan from 'morgan'
import userRoutes from './routes/user.routes.js'
import error from './middlewares/error.js'
import notImplemented from './middlewares/notImplemented.js'
import { corsMiddleware, corsOptions } from './middlewares/cors.js'

const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use(corsMiddleware)
app.options(corsOptions)

app.use('/api/users', userRoutes)

app.use(notImplemented)
app.use(error)

export default app
