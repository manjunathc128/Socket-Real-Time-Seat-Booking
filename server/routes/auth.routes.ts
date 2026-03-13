import { Request, Response, Router } from 'express';
import { loginController, registerController } from '@controllers/auth.controllers';
const AuthRouter: Router = Router();

AuthRouter.post('/login', loginController)
AuthRouter.post('/register', registerController)

export default AuthRouter;