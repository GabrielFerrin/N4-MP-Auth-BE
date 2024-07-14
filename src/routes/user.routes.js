import { Router } from 'express'
import userC from '../controllers/user.controller.js'
import auth from '../middlewares/auth.js'

const router = Router()

// manage rows
router.post('/verify-token', auth, userC.verifyToken)
router.post('/register', userC.createUser)
router.post('/login', userC.login)
router.get('/get-user', auth, userC.getUser)
router.put('/update', auth, userC.updateUser)

// manage table
router.post('/create-table', userC.createTale)
router.get('/get-all', userC.getAllUsers)
router.delete('/delete-table', userC.dropTable)

export default router
