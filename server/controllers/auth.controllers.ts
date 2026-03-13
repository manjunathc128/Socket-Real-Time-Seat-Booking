import  jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import {UserModel} from '@models/User.model';
import { error } from 'node:console';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key'

function generateToken(payload: any): Promise<string> {

  return new Promise((resolve, reject) => {
    try{
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        resolve(token);
    }catch(err){
        reject(err)
    }
    
  }) 
}


export const loginController = async (req: Request, res: Response) => {
    try{
        const {username, password} = req.body ;
        let token : string
        if(!username && !password){
           return res.status(400).json({ error :'Username and password are required'});
        //    token = generateToken({username, password});  
            // return res.status(400).send('Username and password are required');
        }
        const user = await UserModel.findByUsername(username)
        console.log(user, 'user returned from usermodel') 
        if(!user){
            return res.status(401).json({error: 'Invalid username or password'});
        }
        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!user || !isValidPassword ){
           return res.status(401).json({error: 'Invalid username or password'});
        }
        else{
          token = await generateToken({userId: user.id, username: user.username});
        }
        res.status(200).json({username: user.username ,token: token, email: user.email, full_name: user.full_name, phone_number: user.phone_number});

    }catch(err){
         const error = err as Error;
        res.status(500).json({error: error.message})  
    }
}

export const registerController = async (req: Request, res: Response) => {
    try{
        const {username, password} = req.body
        if(!username || !password){
            return res.status(400).json({
                error: 'Username and password are required'
            })
        }
        const existingUser = await UserModel.findByUsername(username)
        if(existingUser){
            return res.status(409).json({
                error: 'Username already exists'
            })
        }
        const  hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await UserModel.createUser(username, hashedPassword)

        let token: string
        try{
            token = await generateToken({userId: newUser.id, username: newUser.username})
        }catch(err){
            return res.status(500).json({
                error: 'Error generating token'
            })
        }    

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id :newUser.id,
                username: newUser.username,
             },
            token: token
        })

    }catch(err: any){
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
} 