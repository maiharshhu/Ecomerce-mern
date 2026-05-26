import express from 'express';
import { loginUser, signupUser, firebaseLogin } from '../controllers/authControllers.js';


const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/firebase', firebaseLogin);

export default router;