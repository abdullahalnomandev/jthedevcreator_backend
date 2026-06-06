import { JwtPayload } from 'jsonwebtoken';
import Stripe from 'stripe';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { Request, Response } from 'express';
import config from '../../../config';

export const stripe = new Stripe(config.stripe.secret_key!, {
  apiVersion: '2025-04-30.basil',
});

const createConnectionAccount = async (payload: JwtPayload,protocol:string,host:string) => {

    const objID = new Types.ObjectId(payload.id);
    const user = await User.findById(objID);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
    }
  
    if (user.paymentValidation.accountCreated && user.paymentValidation.accountID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User already has a connection account!");
    }
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.email,
      business_type: 'individual',
      individual: {
        first_name: user.name.split(' ')[0],
        last_name: user.name.split(' ')[1] || '',
        email: user.email,
        phone: user.contact || '0000000000',
        // dob: { year: user.dobYear, month: user.dobMonth, day: user.dobDay },
      },
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: {
        user_id: user._id.toString(),
      },
    });

    await user.updateOne({
      $set: {
        "paymentValidation.accountID": account.id,
      },
    });
  
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${protocol}://${host}/api/v1/payment/refresh/${account.id}`,
      return_url: `${protocol}://${host}/api/v1/payment/success/${account.id}`,
      type: 'account_onboarding',
    });
  
    return {
      onboardingUrl: accountLink.url,
    };
};

const transferToConnectedAccount = async (
    amount: number,
    currency: string,
    connectedAccountId: string
  ) => {
    const transfer = await stripe.transfers.create({
      amount,
      currency,
      destination: connectedAccountId,
    });
  
    return transfer;
};

const createCheckoutSession = async (
    payload: JwtPayload,
    data: any,
    request: Request
) => {
    const objID = new Types.ObjectId(payload.id);
    const user = await User.findById(objID);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
    }
    
    const { amount } = data;

    const amountInCents = amount * 100; 

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: 'Sample Product or Service',
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            },
        ],
        success_url: `${request.protocol}://${request.get('host')}/api/v1/payment/deposit/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.protocol}://${request.get('host')}/api/v1/payment/deposit`,
        metadata: {
            user_id: user._id.toString(),
            amount: amount,
        }
    });

    const sessionID = session.id;

    user.lastSession = sessionID;
    await user.save();

    return {
        checkoutUrl: session.url,
    };
};

const successDeposit = async (
    req: Request,
    res: Response,
) => {
    const { session_id } = req.query;
    if (!session_id) throw new ApiError(StatusCodes.BAD_REQUEST, "Session ID is required!");

    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    if (!session) throw new ApiError(StatusCodes.NOT_FOUND, "Session was not found!");

    if (session.payment_status !== 'paid') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment was not successful!");
    }

    const userId = session.metadata?.user_id;
    const amount = parseInt(session?.metadata?.amount!); 

    const objID = new Types.ObjectId(userId);
    const user = await User.findById(objID);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
    }
    
    if (user.lastSession !== session_id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Session ID is not valid!");
    }
    
    user.lastSession = "";

    user.firstWithdrawal = true;

    user.balance += amount;
    await user.save();

    return amount;
};

const createWithdrawSession = async (
  payload: JwtPayload,
  data: any
) => {
  const objID = new Types.ObjectId(payload.id);
  const user = await User.findById(objID);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
  }
  if (!user.paymentValidation.accountCreated || !user.paymentValidation.accountID) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User has not created a connection account at first you must add you bank account!");
  }
  
  const { amount } = data;

  if (user.balance < amount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User has not enough balance!");
  }

  if ( user.firstWithdrawal ) {
    
    await stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: user.paymentValidation.accountID,
    });
  
    user.balance -= amount;
    await user.save();
  
    return "successfull";
  }

  const amountInCents = amount * 100;
  const feeInCents = amountInCents * 0.05;
  const amountAfterFeeInCents = amountInCents - feeInCents;
  
  await stripe.transfers.create({
      amount: amountAfterFeeInCents,
      currency: 'usd',
      destination: user.paymentValidation.accountID,
  });

  user.balance -= amount;
  await user.save();

  return "successfull";
};

export const PaymentService = {
    createConnectionAccount,
    createCheckoutSession,
    transferToConnectedAccount,
    successDeposit,
    createWithdrawSession
};
