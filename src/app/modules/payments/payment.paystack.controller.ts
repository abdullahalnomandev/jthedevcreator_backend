import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.paystack.service";

const createPaystackSubaccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { accountNumber, bankCode } = req.body;

    const result = await PaymentService.createPaystackSubaccount(user, { accountNumber, bankCode });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the Paystack subaccount!',
      data: result,
    });
  }
);

const resolveBankAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accountNumber, bankCode } = req.query;

    const result = await PaymentService.resolveBankAccount(
      accountNumber as string,
      bankCode as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Bank account resolved successfully!',
      data: result,
    });
  }
);

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await PaymentService.createCheckoutSession(user, data, req);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully initialized deposit!',
      data: result,
    });
  }
);

const successDeposit = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { reference } = req.query;
    const result = await PaymentService.successDeposit(reference as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Deposit verified successfully!',
      data: result,
    });
  }
);

const createWithdrawSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await PaymentService.createWithdrawSession(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Withdrawal initiated successfully!',
      data: result,
    });
  }
);

export const PaymentController = {
  createPaystackSubaccount,
  resolveBankAccount,
  createCheckoutSession,
  successDeposit,
  createWithdrawSession,
};
