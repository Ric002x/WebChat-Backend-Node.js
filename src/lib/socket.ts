// socket.ts
import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export const initIO = (server: HTTPServer): IOServer => {
    if (io) {
        return io; // already initialized
    }
    io = new IOServer(server, {
        cors: {
            origin: ["http://localhost:3000", "http://127.0.0.1:3000", process.env.CORS_ALLOWED_ORIGIN as string]
        }
    });
    return io;
};

export const getIO = (): IOServer => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};
