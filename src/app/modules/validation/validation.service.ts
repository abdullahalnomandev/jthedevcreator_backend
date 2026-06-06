/* eslint-disable no-undef */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { JwtPayload } from 'jsonwebtoken';
import { imageData } from './validation.interface';
import { User } from '../user/user.model';
import fs from 'fs';
import axios from 'axios';
import config from '../../../config';
import FormData from "form-data";
import path from 'path';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import { FaceClient } from '@azure/cognitiveservices-face';
import mongoose from 'mongoose';

const credentials = new CognitiveServicesCredentials(config.azure.key as string); 
const client = new FaceClient(credentials, config.azure.endpoint as string);

const faceVerificationService = async (
  paylaod: JwtPayload,
  data: imageData
) => {
  try {

    const currentDir = process.cwd();
    const filePth1 = path.join(currentDir, "uploads", data.FaceImage);
    const absolutePath1 = path.resolve(filePth1);
    const faceImage = fs.readFileSync(absolutePath1); 

    const filePth2 = path.join(currentDir, "uploads", data.NIDImage);
    const absolutePath2 = path.resolve(filePth2);
    const nidImage = fs.readFileSync(absolutePath2); 

    const face1 = await client.face.detectWithStream(faceImage);
    const face2 = await client.face.detectWithStream(nidImage);

    const faceId1 = face1[0].faceId;
    const faceId2 = face2[0].faceId;

    if (!faceId1 || !faceId2) throw new ApiError(StatusCodes.BAD_REQUEST, 'Face detection failed for one or both images.')

    const verificationData = await client.face.verifyFaceToFace(faceId1, faceId2);

    return verificationData;

    
  } catch (error: any) {
    console.log(error)
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

const faceValidationWithPython = async (
  payload: JwtPayload,
  data: imageData,
  protocol: string,
  host: string
) => {
  try {
    const objID = new mongoose.Types.ObjectId(payload.id);
    const user = await User.findById(objID);
    if (!user) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "User not found!"
      )
    }

    const currentDir = process.cwd();
    const filePth1 = path.join(currentDir, "uploads", data.FaceImage);
    const absolutePath1 = path.resolve(filePth1);
    const faceImageBuffer = fs.createReadStream(absolutePath1); 

    const filePth2 = path.join(currentDir, "uploads", data.NIDImage);
    const absolutePath2 = path.resolve(filePth2);
    const nidImageBuffer = fs.createReadStream(absolutePath2); 

    // const mainHost = host.split(":")[0];
    // const url = `${protocol}://${mainHost}:${config.python_port}/face-verify`;
    const url = `${protocol}://${config.ip_address}:${config.python_port}/face-verify`;

    const formData = new FormData();

    formData.append("faceImage", faceImageBuffer);  
    formData.append("nidImage", nidImageBuffer);    

    const pythonServerResponse = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });

    unlinkFile(data.FaceImage); 
    unlinkFile(data.NIDImage);

    if (!pythonServerResponse.data.verified) throw new ApiError(StatusCodes.BAD_REQUEST, "Face is not matched with nid!")

    user.faceVerifyed = true;
    await user.save();

    return pythonServerResponse.data;

  } catch (error: any) {

    unlinkFile(data.FaceImage); 
    unlinkFile(data.NIDImage);
    
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    )
  }
}

export const ValidationService = {
  faceVerificationService,
  faceValidationWithPython
};
