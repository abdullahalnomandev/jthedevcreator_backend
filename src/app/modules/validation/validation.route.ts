import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ValidationController } from './validation.controller';
import { ValidationValidation } from './validation.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route("/azure")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    validateRequest(ValidationValidation.FaceValidationZodSchema),
    fileUploadHandler(),
    ValidationController.faceVerificationController
);

router
  .route("/python")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    validateRequest(ValidationValidation.FaceValidationZodSchema),
    fileUploadHandler(),
    ValidationController.pythonFaceVerificationController
);

export const ValidationRoutes = router;
