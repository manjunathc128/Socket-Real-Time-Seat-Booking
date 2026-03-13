
import { AxiosResponse } from "axios";
import api from "../axiosService";

export interface User {
    id: number;
    username: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: { id: number; username: string };
  token: string;
}

// : Promise<{ username: string; token: string }> 

export  const  authService =  {
    loginService : ( loginData: { username: string; password: string } ) => api.post('/auth/login', loginData )
    ,
    registerService : async ( registerData: {username: string; password: string }, )  => {
            const response = await api.post<RegisterResponse >('/auth/register', registerData)
            return response
    } ,
    logoutService: () => new Promise<string>((resolve, reject) => setTimeout(() => resolve('loggedout'), 3000))

}