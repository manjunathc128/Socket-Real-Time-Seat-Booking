import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key'
export interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        username: string;
    }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            })
        }
        
        jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
            if(err){
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                })
            }
            req.user = { 
                id : decoded.userId,
                username: decoded.username
            }
            console.log(req.user, 'req user');
            console.log(decoded, 'decoded');    
            next();
        })
    }catch(err: any){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}