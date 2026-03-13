import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
    createPaymentOrder,
    verifyPayment, 
    handleWebhook,
    getPaymentStatus
} from '../controllers/payment.controllers';


const router: Router = Router();

router.post('/create-order', authenticateToken, createPaymentOrder );

router.post('/verify', authenticateToken, verifyPayment);

router.post('/webhook', handleWebhook);

router.get('/status/:paymentId', authenticateToken, getPaymentStatus)

export default router;

