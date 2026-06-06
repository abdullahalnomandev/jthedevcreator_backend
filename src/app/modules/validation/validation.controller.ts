import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ValidationService } from './validation.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const faceVerificationController = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const FaceImage = getSingleFilePath(req.files,"FaceImage")
  const NIDImage = getSingleFilePath(req.files,"NIDImage")

  const { ...verifyData } = req.body;

  const data = {
    FaceImage,
    NIDImage,
    ...verifyData
  }

  const user = req.user;

  const result = await ValidationService.faceVerificationService(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Face verification successfully!",
    data: result,
  });
});

const pythonFaceVerificationController = catchAsync(async (
  req: Request, 
  res: Response
) => {
  const FaceImage = getSingleFilePath(req.files,"FaceImage")
  const NIDImage = getSingleFilePath(req.files,"NIDImage")

  const { ...verifyData } = req.body;

  const data = {
    FaceImage,
    NIDImage,
    ...verifyData
  }

  const user = req.user;

  const result = await ValidationService.faceValidationWithPython(user,data,req.protocol,req.headers.host as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Face verification successfully with python!",
    data: result,
  });
});


export const ValidationController = { 
  faceVerificationController, 
  pythonFaceVerificationController
};
