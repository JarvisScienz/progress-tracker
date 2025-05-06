import express from 'express';
import { register, login, me } from '../controllers/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);

export default router; 