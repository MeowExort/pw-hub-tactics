import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

/**
 * Инициализация Express приложения и HTTP сервера.
 * Socket.io настраивается поверх HTTP сервера для обеспечения Real-time связи.
 */
const app = express();
app.use(cors());

const httpServer = createServer(app);

// Настройка Socket.io с поддержкой CORS
// CLIENT_URL берется из переменных окружения для гибкости развертывания
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

/**
 * Обработка подключений по WebSockets.
 */
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Обработчик тестового события ping
  socket.on('ping', () => {
    console.log('Received ping from', socket.id);
    // Отправляем ответ pong обратно клиенту
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
