import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { roomManager } from './rooms/RoomManager.js';
/**
 * Инициализация Express приложения и HTTP сервера.
 * Socket.io настраивается поверх HTTP сервера для обеспечения Real-time связи.
 */
const app = express();
app.use(cors());
const httpServer = createServer(app);
/**
 * Типизированный Socket.io сервер.
 * Типы событий определены в types/socket-events.ts
 */
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
/**
 * Обработка подключений по WebSockets.
 *
 * Механизм синхронизации:
 * 1. Клиент подключается и отправляет join_room с UUID комнаты
 * 2. Сервер добавляет сокет в комнату Socket.io и отправляет текущее состояние
 * 3. При update_object сервер обновляет состояние и делает broadcast остальным
 * 4. При create_object сервер добавляет объект и делает broadcast
 */
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    /**
     * Обработчик присоединения к комнате.
     * Клиент получает текущее состояние всех объектов в комнате.
     */
    socket.on('join_room', (payload) => {
        const { roomId } = payload;
        // Сохраняем roomId в данных сокета для последующего использования
        socket.data.roomId = roomId;
        // Присоединяем сокет к комнате Socket.io
        socket.join(roomId);
        // Получаем или создаем комнату в менеджере
        roomManager.getOrCreateRoom(roomId);
        // Отправляем текущее состояние комнаты новому участнику
        const objects = roomManager.getRoomObjects(roomId);
        socket.emit('room_state', objects);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });
    /**
     * Обработчик обновления позиции объекта.
     * Обновляет состояние в памяти и рассылает изменения остальным участникам.
     */
    socket.on('update_object', (payload) => {
        const roomId = socket.data.roomId;
        if (!roomId) {
            console.warn(`User ${socket.id} tried to update object without joining a room`);
            return;
        }
        const { objectId, position } = payload;
        // Обновляем позицию в состоянии комнаты
        const updated = roomManager.updateObjectPosition(roomId, objectId, position);
        if (updated) {
            // Рассылаем обновление всем участникам комнаты, кроме отправителя
            socket.to(roomId).emit('object_updated', payload);
        }
    });
    /**
     * Обработчик создания нового объекта.
     * Добавляет объект в состояние комнаты и рассылает остальным участникам.
     */
    socket.on('create_object', (payload) => {
        const roomId = socket.data.roomId;
        if (!roomId) {
            console.warn(`User ${socket.id} tried to create object without joining a room`);
            return;
        }
        // Добавляем объект в состояние комнаты
        roomManager.addObject(roomId, payload);
        // Рассылаем новый объект всем участникам комнаты, кроме отправителя
        socket.to(roomId).emit('object_created', payload);
    });
    // Обработчик тестового события ping
    socket.on('ping', () => {
        console.log('Received ping from', socket.id);
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
//# sourceMappingURL=index.js.map