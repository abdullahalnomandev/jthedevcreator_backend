import { Request, Response, Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PaymentController } from "./payment.paystack.controller";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router
    .route("/resolve-bank")
    .get(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER),
        PaymentController.resolveBankAccount
    )

router
    .route("/paystack-subaccount")
    .post(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER),
        PaymentController.createPaystackSubaccount
    )

router
    .route("/deposit")
    .post(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER),
        validateRequest(PaymentValidation.createDepositZodSchema),
        PaymentController.createCheckoutSession
    )

router
    .route("/deposit/verify")
    .get(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER),
        PaymentController.successDeposit
    )

router
    .route("/withdraw")
    .post(
        auth(USER_ROLES.ADMIN, USER_ROLES.USER),
        validateRequest(PaymentValidation.createWithdrawZodSchema),
        PaymentController.createWithdrawSession
    )

// router
//     .route("/connected-account")
//     .post(
//         auth(USER_ROLES.ADMIN, USER_ROLES.USER),
//         PaymentController.createConnectionAccount
//     )

// router
//     .route("/success/:id")
//     .get(
//         PaymentController.successPageAccount
//     )

// router
//     .route("/refresh/:id")
//     .get(
//         PaymentController.refreshAccount
//     )

// router
//     .route("/deposit/success")
//     .get(
//         PaymentController.successDeposit
//     )

// router
//     .route("/cancel")
//     .get(
//         (req: Request, res: Response) => res.send("Payment cancelled")
//     )

// router.get("/get-dashboard-link", auth(USER_ROLES.ADMIN, USER_ROLES.USER), PaymentController.getDashboardLink)


export const PaymentRouter = router;
