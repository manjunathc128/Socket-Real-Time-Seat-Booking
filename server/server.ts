/// <reference path="./types/socket.d.ts" />

import express, { Request, Response, Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import AuthRouter from '@routes/auth.routes';
import BookingRouter from '@routes/booking.routes';
import SeatRouter from '@routes/seat.routes';
import EventRouter from '@routes/event.routes';
import PaymentRouter from '@routes/payment.routes';
import VenueRouter from '@routes/venue.routes';
import movieRoutes from './routes/movie.routes';
import movieBookingRoutes from './routes/movieBooking.routes';
import moviePaymentRoutes from './routes/moviePayment.routes';

import { testConnection } from '@models/database';
import { UserSessionModel } from './models/UserSession.model'

import { CleanupService } from './services/cleanup.service';

import dotenv from 'dotenv';

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key'



const app: Application = express();

app.use(cors({
  origin: 'http://localhost:3001'
}))
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
})

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if(!token){
    return next(new Error('Authentication error'));

  }
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if(err){
      return next(new Error('Authentication error'));

    }
    socket.user = {
      id: decoded.userId,
      username: decoded.username
    } 
    console.log("socket user", socket.user)
    next()
  })
})

io.on('connection', (socket) => {
  console.log('User connected', socket.id)
  socket.on('joinEvent', async (eventId: number) => {
    try{
      await UserSessionModel.createOrUpdate(socket.user.id, eventId, socket.id)
      socket.join(`event_${eventId}`);
      console.log(`User joined ${eventId}`);

      const activeUsers = await UserSessionModel.getActiveUsersForEvent(eventId)
      io.to(`event_${eventId}`).emit('userJoined', {
        username: socket.user.username,
        activeUsersCount: activeUsers.length
      });
      console.log(`${socket.user.username} joined event ${eventId}`)
    }catch(error: any){
      console.error(`Error joining event ${eventId}: ${error.message}`)
    }
      
  })
  socket.on('joinMovie', async (movieId: number) => {
    try{
      socket.join(`movie_${movieId}`) 
      console.log(`${socket.user.username} joined movie ${movieId}`);
    } catch(error: any){
      console.error(`Error joining movie ${movieId}: ${error.message}`);
    }
  })
  socket.on('leaveMovie', async (movieId: number) => {
    try{
      socket.leave(`movie_${movieId}`);
      console.log(`${socket.user.username} left movie ${movieId}`);
    }catch(error: any){
      console.error(`Error leaving movie ${movieId}: ${error.message}`);
    }
  }
  )

  socket.on('leaveEvent', async (eventId) => {
    try{
       socket.leave(`event_${eventId}`)
       await UserSessionModel.updateActivity(socket.id)
       console.log(`${socket.user.username} left event ${eventId}`);

    }catch(error: any){
      console.error(`Error leaving event: `, error)
    }
   
  })

  socket.on('activity', async () => {
    try{
      await UserSessionModel.updateActivity(socket.id)
    }catch(error: any){
      console.error('Error updating activity:', error)
    }
  })

  socket.on('disconnect', async () => {
    try{
      await UserSessionModel.removeBySocketId(socket.id)
      console.log('User disconnected:', socket.user.username);
    }catch(error: any){
      console.error('Error disconnecting:', error)
    }
    console.log('User disconnected:', socket.id)
  })
})


app.set('io', io)

const port: number = 3000;
app.use(express.json());
app.use('/auth', AuthRouter);
app.use('/api/bookings', BookingRouter);
app.use('/api/events', EventRouter);
app.use('/api/movies', movieRoutes);
app.use('/api/seats', SeatRouter)
app.use('/api/payments', PaymentRouter)
app.use('/api/venues', VenueRouter)
app.use('/api/movies', movieRoutes);
app.use('/api/movie-bookings', movieBookingRoutes);
app.use('/api/movie-payments', moviePaymentRoutes);


server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

testConnection()


CleanupService.start();

process.on('SIGTERM', () => {
    CleanupService.stop();
    server.close();
})

process.on('SIGINT', () => {
  CleanupService.stop();
  server.close();
})


