import { Request, Response, Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PaymentController } from "./payment.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { PyamentCancel } from "../../../shared/templates";


const router = Router();

router
    .route("/connected-account")
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
        PaymentController.createConnectionAccount
    )

router
    .route("/success/:id")
    .get(
        PaymentController.successPageAccount
    )

router
    .route("/refresh/:id")
    .get(
        PaymentController.refreshAccount
    )

router
    .route("/deposit")
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
        validateRequest( PaymentValidation.createDepositZodSchema ),
        PaymentController.createCheckoutSession
    )


router
    .route("/deposit/success")
    .get(
        PaymentController.successDeposit
    )

router
    .route("/cancel")
    .get(
        (req: Request, res: Response) => res.send(PyamentCancel)
    )

router
    .route("/withdraw")
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.USER ),
        validateRequest( PaymentValidation.createWithdrawZodSchema ),
        PaymentController.createWithdrawSession
    )



export const PaymentRouter = router;