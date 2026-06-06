import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ChatController } from './chat.controller';
import { ChatValidation } from './chat.validation';

const router = express.Router();

router
  .route('/')
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( ChatValidation.getChatWithIdZodSchema ),
    ChatController.getChatRoomWithId
  )
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    validateRequest(ChatValidation.createChatZodSchema),
    ChatController.createChat
  )

router
  .route("/:chatId")
  .delete(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    ChatController.deleteChat
  )

router
  .route("/all")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( ChatValidation.allChatZodSchema),
    ChatController.allChats
  )

export const ChatRoutes = router;
