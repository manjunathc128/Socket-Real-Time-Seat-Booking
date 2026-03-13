import axios, { AxiosRequestConfig } from 'axios';

// Module augmentation at the top
declare module 'axios' {
    interface AxiosInstance {
        get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
        delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
        patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    }
}