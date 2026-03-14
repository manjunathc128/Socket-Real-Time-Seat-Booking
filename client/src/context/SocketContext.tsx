import { createContext, useContext, useEffect, useState, ReactNode, useRef, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { tokenService } from '@/services/auth/tokenService';
import { useSelector } from  'react-redux';
import { RootState } from '@/redux/store';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    console.log('SocketContext rendering');
    // const auth = useSelector((state: RootState) => state.auth, 
    //     (prevAuth, currAuthh) => JSON.stringify(prevAuth.token) == JSON.stringify(currAuthh.token) );
    const token = useSelector((state: RootState) => state.auth.token);
    const [socket, setSocket] = useState<Socket | null>(null);
    const connected = useRef(true);
    // const token = tokenService.getToken();
    useEffect(() => {

        if (token && !socket?.connected) {
            connected.current = false;
            console.log('🔧 Initializing socket');
            console.log('socket connected', socket?.connected, socket)
            const newSocket = io(import.meta.env.VITE_BASE_API_URL || 'http://localhost:3000', {
                auth: { token },
                autoConnect: false,
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
            });

            newSocket.on('disconnect', () => { 
                console.log('❌ Socket disconnected');
            });

            newSocket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error.message);
            });

            newSocket.connect()
            setSocket(newSocket);

            return () => {
                console.log('🔌 Closing socket connection');
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [token, socket?.connected]);

    // Provide socket immediately, even if not connected yet
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
