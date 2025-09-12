import { Router } from 'express';
import { callback } from '../controllers/authController';
import { unauthenticate } from '../controllers/unauthController';

export const router = Router();

// OAuth routes
// router.get('/auth', authenticate);
router.get('/auth/callback', callback);

// unAuth routes
router.get('/unauth/callback', unauthenticate);

// router.get('/verify/:discordId', verify);
