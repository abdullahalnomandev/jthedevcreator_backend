import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';

/**
 * Authentication middleware to verify JWT tokens and check user roles
 * @param roles - Optional array of roles to restrict access (e.g., ['admin', 'user'])
 * @returns Express middleware function
 */
const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from Authorization header
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      // Extract token from Bearer scheme
      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        // Verify JWT token
        const verifyUser = jwtHelper.verifyToken(
          token,
          config.jwt.jwt_secret as Secret
        );
        
        // Attach verified user to request object
        req.user = verifyUser;

        // Check if user has required role(s)
        if (roles.length && !roles.includes(verifyUser.role)) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this api"
          );
        }

        // Proceed to next middleware/route handler
        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
