import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { LLocation } from '../types/live';

const connectedUsers = new Map<string, string>();
const liveRoom = new Map<string, Set<string>>();

const socket = (io: Server) => {
  io.on('connection', socket => {
    
    logger.info(colors.blue(`User connected with socket ${socket.id}`));

    socket.on("register",(userID: string)=>{
      connectedUsers.set(userID, socket.id);
      logger.info(colors.cyan(`User ${userID} connected with socket ${socket.id}`));
    });
    
    socket.on("location", (data: LLocation) => {
      if (!data.room || !data.userID || !data.lat || !data.lon) {
        logger.error(colors.red("Invalid location data"));
        return;
      }

      const room = liveRoom.get(data.room) || new Set<string>(); 
      
      room.add(socket.id); 
      
      liveRoom.set(data.room, room);

      for (const socketId of room) {
        io.to(socketId).emit(`rider:location:live:${data.room}`, data);
      }
      
    });

    socket.on('disconnect', () => {
      logger.info(colors.red(`User disconnected with socket ${socket.id}`));
    });

  });
};

export const socketHelper = { socket, connectedUsers};
