import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validaiton';
import { AdminController } from './admin.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
const router = express.Router();


router
  .route('/about-us')
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    AdminController.GetAboutUsData
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    validateRequest(AdminValidation.createAbouUsZodSchema),
    AdminController.PostAboutUs
  )
  .patch(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createUpdateAbouUsZodSchema ),
    AdminController.UpdateAboutUsData
  )

router
  .route("/conditions")
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    AdminController.GetConditionsData
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createAbouUsZodSchema ),
    AdminController.CreateConditionsData
  )
  .patch(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createAbouUsZodSchema ),
    AdminController.UpdateConditionsData
  )

router
  .route("/faq")
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    AdminController.GetFAQData
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.createFAQZodSchema ),
    AdminController.CreateFAQData
  )
  .patch(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.updateFAQZodSchema ),
    AdminController.UpdateFAQData
  )

router
  .route("/users")
  .get(
    auth( USER_ROLES.ADMIN ),
    AdminController.usersGet
  )

router
  .route("/user/block/:id")
  .post(
    auth( USER_ROLES.ADMIN ),
    AdminController.blockAUser
  )

router
  .route("/users/:id")
  .get(
    auth( USER_ROLES.ADMIN ),
    AdminController.getAUserdata
  )

router
  .route("/tasks")
  .get(
    auth( USER_ROLES.ADMIN ),
    AdminController.getAlTaskdata
  )
  .delete(
    auth( USER_ROLES.ADMIN ),
    AdminController.deleteTask
  )

router
  .route("/transactions")
  .get(
    auth( USER_ROLES.ADMIN ),
    AdminController.getTransactions
  )

router
  .route("/overview")
  .get(
    auth( USER_ROLES.ADMIN ),
    AdminController.overview
  )

router
  .route("/top-task-types")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    AdminController.topTaskTypes
  )
  .post(
    auth( USER_ROLES.ADMIN ),
    fileUploadHandler(),
    validateRequest( AdminValidation.createTopTaskZodSchema ),
    AdminController.createTopTask
  )
  .put(
    auth( USER_ROLES.ADMIN ),
    fileUploadHandler(),
    validateRequest( AdminValidation.updateTopTaskZodSchema ),
    AdminController.updateTopTask
  )
  .delete(
    auth( USER_ROLES.ADMIN ),
    validateRequest( AdminValidation.deleteTopTaskZodSchema ),
    AdminController.deleteTopTask
  )
  
export const AdminRouter = router;
