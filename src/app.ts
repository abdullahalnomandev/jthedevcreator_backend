import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import { serverHome } from './shared/emailTemplate';

// Initialize Express application
const app = express();

// Morgan middleware for HTTP request logging (success and error logs)
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// CORS middleware to allow cross-origin requests
app.use(cors());

// Body parser middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory (for uploaded files)
app.use(express.static('uploads'));

// Mount all API routes under /api/v1 prefix
app.use('/api/v1', router);

// Health check/root endpoint
app.get('/', (req: Request, res: Response) => {
  res.send(serverHome());
});

// Global error handling middleware
app.use(globalErrorHandler);

// 404 Not Found handler for undefined routes
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
