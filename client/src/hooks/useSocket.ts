import { useState, useEffect } from "react";
import { io, Socket } from 'socket.io-client';
import { useSelector } from "react-redux";
import { RootState, AppDispatch } from '@/redux/store'
import { tokenService } from "@/services/auth/tokenService";
import  { useMemo } from "react"
export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const token =  useMemo(
        () => tokenService.getToken(), []
    )
    
    useEffect(() => {
        if (token) {
            const newSocket = io('http://localhost:3000', {
                auth: {token}
            })
            
            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
            })
            
            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            })
            
            setSocket(newSocket);

            return () => {
                console.log('🔌 Closing socket connection');
                newSocket.close();
            };
        }
    }, [token])

    return socket
}

