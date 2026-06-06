import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserZodSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  )
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.deleteUser)

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );

router 
  .route('/search')
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    UserController.searchData
  )
  
router
  .route("/keyword")
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    UserController.top10KeyWords
  )

router
  .route("/filter")
  .get(
    auth( USER_ROLES.USER, USER_ROLES.ADMIN ),
    // validateRequest( UserValidation.filterDataZodSchema ),
    UserController.filterData
  )

router
  .route("/home")
  .get(
    (req: Request, res: Response, next: NextFunction)=>{
      const token = req.headers.authorization?.split(" ")[1];
      const verifyUserToken = jwtHelper.verifyToken(token as string, config.jwt.jwt_secret as Secret);

      req.user = verifyUserToken;

      next();
    },
    UserController.homeData
  )

router
  .route("/report-problem")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    UserController.woneReportProblem
  )
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    fileUploadHandler(),
    // validateRequest( UserValidation.createReportRequestZodSchema),
    UserController.sendReportProblem
  )

router
  .route("/notifications")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    UserController.getNotifications
  )

router
  .route("/give-review")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( UserValidation.giveReviewZodSchema ),
    UserController.giveReview
  )

router
  .route("/profile-view/:id")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    UserController.getAProfile
  )

export const UserRoutes = router;