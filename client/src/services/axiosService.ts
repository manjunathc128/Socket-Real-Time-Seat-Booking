import axios, { AxiosRequestConfig } from 'axios';
import { tokenService } from './auth/tokenService';
import { AuthErrorHandler } from './auth/AuthErrorHandler';
declare module 'axios' {
    interface AxiosRequestConfig{
        skipAuth?: boolean
    }
    interface AxiosResponse{
        get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        // post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})


api.interceptors.request.use(
    (config) => {
        if(!config.skipAuth){
            const token = tokenService.getToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => {
        console.log(error, 'on api request interceptor  error')
        return Promise.reject(error)  
        //Request fails  when 1) browser encounter cors olicy 2) request timeout 3) network offline 4) 
    }
)


api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if(error.response.status === 401 || error.response.status === 403){
            AuthErrorHandler.getInstance().handle401Error()
        }
        console.log(error, 'on api response interceptor error')
        return Promise.reject(error)
    }

)

export default api