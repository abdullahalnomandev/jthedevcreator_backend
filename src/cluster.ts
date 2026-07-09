import cluster from 'cluster';
import os from 'os';
import colors from 'colors';

/**
 * Starts the application in cluster mode to utilize multiple CPU cores
 * - Primary process manages worker processes
 * - Worker processes run the actual Express server
 * - Automatically restarts workers if they die
 */
export const startCluster = () => {
  if (cluster.isPrimary) {
    // Primary process: manage workers
    const numCPUs = os.cpus().length;
    console.log(colors.cyan(`Primary ${process.pid} is running`));
    console.log(colors.magenta(`🚀 Forking for ${numCPUs} CPUs\n`));

    // Fork a worker process for each CPU core
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    // Restart worker if it dies
    cluster.on('exit', (worker, code, signal) => {
      console.log(colors.red(`Worker ${worker.process.pid} died. Restarting...`));
      cluster.fork();
    });
  } else {
    // Worker process: run the server
    require('./server.worker');
  }
};
