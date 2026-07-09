import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

/**
 * Verify user email with OTP
 */
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyEmailToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

/**
 * Authenticate user and issue access/refresh tokens
 */
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result,
  });
});

/**
 * Refresh access token using valid refresh token
 */
const refreshAccesstoken = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.refreshToken(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result,
  });
});

/**
 * Send OTP to user's email for password reset
 */
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  
  const result = await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message:
      'Please check your email. We have sent you a one-time passcode (OTP).',
    data: result,
  });
});

/**
 * Reset user password using OTP
 */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

/**
 * Change password for authenticated user
 */
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

/**
 * Perform face verification using two uploaded images
 */
const faceVerification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const image1 = getSingleFilePath(req.files,"image1")
  const image2 = getSingleFilePath(req.files,"image2")
  const responce = await AuthService.faceVerification(image1, image2, user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: responce,
    message: 'Face verification testing cheacked successfully!',
  });
});

export const AuthController = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  refreshAccesstoken,
  faceVerification
};
