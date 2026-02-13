import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
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