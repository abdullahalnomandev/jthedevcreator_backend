import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MessageController } from './message.controller';
import { MessageValidation } from './message.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route("/")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    validateRequest( MessageValidation.getAllMessages ),
    MessageController.allMessagesOfARoom
  )
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    validateRequest(MessageValidation.sendMessage),
    MessageController.send
);

router
  .route("/delete/:messageID")
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    MessageController.deleteAMessages
  )

router
  .route("/delete-all/:chatID")
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    MessageController.deleteMessagesOfARoom
  )

export const MessageRoutes = router;
