import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BidController } from './bid.controller';
import { BidValidation } from './bid.validation';

const router = express.Router();

router
  .route("/")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.defaultZodSchema ),
    BidController.sendBid
  );

router
  .route("/requests")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    BidController.bidRequestes
  )

router
  .route("/requests/:id")
  .delete(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER),
    BidController.deleteBid
  )

router
  .route("/requests/adventurer")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    BidController.bidRequestesAsAdvengrar
  )

router
  .route("/intrigate")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.intrigateBidZodSchema),
    BidController.intrigateWithBid
  )

router
  .route("/pay")
  .get(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.payBidZodSchema),
    BidController.getBidData
  )
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.payBidZodSchema),
    BidController.paytheBid
  )

router
  .route("/cancel")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.cancelBidZodSchema),
    BidController.cancelTask
  )

router
  .route("/agree/:id")
  .post(
    auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
    validateRequest( BidValidation.agreeWithPostZodSchema),
    BidController.aggryWithTask
  )

export const BidRoutes = router;
