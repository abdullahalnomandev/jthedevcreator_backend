import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';

let server: any;

/**
 * Main application entry point for worker processes
 * - Connects to MongoDB
 * - Seeds super admin if not exists
 * - Starts Express server
 * - Initializes Socket.io for real-time communication
 */
async function main() {
  try {
    // Connect to MongoDB database
    await mongoose.connect(`mongodb://${config.database_user_name}:${config.databse_user_password}@mongo:${config.database_port}/${config.database_name}?authSource=admin`);
    logger.info(colors.green('🚀 Database connected successfully'));

    // Seed super admin user into database
    await seedSuperAdmin();

    // Start Express server
    const port = Number(config.port);
    server = app.listen(port, config.ip_address as string, () => {
      logger.info(colors.yellow(`♻️  Worker app running on port:${config.port}`));
    });

    // Initialize Socket.io server for real-time communication
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    // Set up Socket.io event handlers
    socketHelper.socket(io);
    
    // Make io globally available
    //@ts-ignore
    global.io = io;

  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'), error);
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

// Start the application
main();
