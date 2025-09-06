import { Router } from 'express';
import { authenticate, callback } from '../controllers/authController';
import { verify } from '../controllers/verifyController';
import { unauthenticate } from '../controllers/unauthController';

export const router = Router();

// OAuth routes
router.get('/auth', authenticate);
router.get('/auth/callback', callback);

// unAuth routes
router.get('/unauth', unauthenticate);

router.get('/verify/:discordId', verify);
/*router.get('/', (req, res) => {
    res.render('success', { message: 'Hello, World!'});
})*/
