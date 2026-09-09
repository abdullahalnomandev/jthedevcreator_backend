
import { JwtPayload } from 'jsonwebtoken';
// import Stripe from 'stripe';
import axios, { AxiosError } from 'axios';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { Request } from 'express';
import config from '../../../config';

// export const stripe = new Stripe(config.stripe.secret_key!, {
//   apiVersion: '2025-04-30.basil',
// });

const resolveBankAccount = async (
  accountNumber: string,
  bankCode: string,
) => {
  const response = await axios.get(
    'https://api.paystack.co/bank/resolve',
    {
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
      headers: {
        Authorization: `Bearer ${config.paystack.secret_key}`,
      },
    },
  );

  return response.data.data;
};

const createPaystackSubaccount = async (
  payload: JwtPayload,
  data: {
    accountNumber: string;
    bankCode: string;
  },
) => {
  const objID = new Types.ObjectId(payload.id);

  const user = await User.findById(objID);

  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'User was not found!',
    );
  }

  if (
    user.paymentValidation.accountCreated &&
    user.paymentValidation.accountID
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User already has a Paystack subaccount!',
    );
  }

  const resolvedAccount = await resolveBankAccount(
    data.accountNumber,
    data.bankCode,
  );

  if (!resolvedAccount || !resolvedAccount.account_name) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Bank account verification failed! Please check your account number and bank code.',
    );
  }

  const response = await axios.post(
    'https://api.paystack.co/subaccount',
    {
      business_name: user.name,
      settlement_bank: data.bankCode,
      account_number: data.accountNumber,
      percentage_charge: 10,
      primary_contact_email: user.email,
      primary_contact_name: user.name,
      primary_contact_phone: user.contact || '',
    },
    {
      headers: {
        Authorization: `Bearer ${config.paystack.secret_key}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const subaccount = response.data.data;

  await user.updateOne({
    $set: {
      'paymentValidation.accountID': subaccount.subaccount_code,
      'paymentValidation.accountCreated': true,
    },
  });

  return {
    subaccountCode: subaccount.subaccount_code,
    accountName: resolvedAccount.account_name,
  };
};

const createCheckoutSession = async (
  payload: JwtPayload,
  data: any,
  request: Request,
) => {
  const objID = new Types.ObjectId(payload.id);
  const user = await User.findById(objID);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User was not found!');
  }

  const { amount } = data;

  const amountInKobo = amount * 100;
  const reference = `DEPOSIT-${Date.now()}-${user._id.toString()}`;

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email: user.email,
      amount: amountInKobo,
      reference: reference,
      metadata: {
        user_id: user._id.toString(),
        amount: amount,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${config.paystack.secret_key}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const transaction = response.data.data;
  const referenceId = transaction.reference;

  user.lastSession = referenceId;
  await user.save();

  return {
    checkoutUrl: transaction.authorization_url,
    reference: referenceId,
    accessCode: transaction.access_code,
  };
};

const successDeposit = async (
  reference: string,
) => {
  if (!reference) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Reference is required!');
  }

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${config.paystack.secret_key}`,
      },
    },
  );

  const transaction = response.data.data;

  if (!transaction || transaction.status !== 'success') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment was not successful!');
  }

  const userId = transaction.metadata?.user_id;
  const amount = parseInt(transaction.metadata?.amount ?? (transaction.amount / 100).toString());

  const objID = new Types.ObjectId(userId);
  const user = await User.findById(objID);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User was not found!');
  }

  if (user.lastSession !== reference) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Reference is not valid!');
  }

  user.lastSession = '';
  user.firstWithdrawal = true;
  user.balance += amount;
  await user.save();

  return {
    amount,
    transactionReference: reference,
    status: 'success',
  };
};

const createWithdrawSession = async (
  payload: JwtPayload,
  data: any,
) => {
  const objID = new Types.ObjectId(payload.id);
  const user = await User.findById(objID);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User was not found!');
  }
  if (
    !user.paymentValidation.accountCreated ||
    !user.paymentValidation.accountID
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User has not created a Paystack subaccount! Please add your bank account first.',
    );
  }

  const { amount } = data;

  if (user.balance < amount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User has not enough balance!');
  }

  const amountInKobo = amount * 100;
  const transferReference = `WITHDRAW-${Date.now()}-${user._id.toString()}`;

  if (user.firstWithdrawal) {
    try {
      await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: amountInKobo,
          reference: transferReference,
          recipient: user.paymentValidation.accountID,
          reason: `Withdrawal for ${user.name}`,
        },
        {
          headers: {
            Authorization: `Bearer ${config.paystack.secret_key}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (transferError: unknown) {
      if (transferError instanceof AxiosError) {
        const errorMessage =
          transferError.response?.data?.message ||
          'Transfer initiation failed.';
        throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
      }
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Transfer initiation failed.',
      );
    }

    user.balance -= amount;
    user.firstWithdrawal = false;
    await user.save();

    return {
      status: 'successful',
      reference: transferReference,
      amount: amount,
    };
  }

  const feeInKobo = amountInKobo * 0.05;
  const amountAfterFeeInKobo = amountInKobo - feeInKobo;

  try {
    await axios.post(
      'https://api.paystack.co/transfer',
      {
        source: 'balance',
        amount: Math.round(amountAfterFeeInKobo),
        reference: transferReference,
        recipient: user.paymentValidation.accountID,
        reason: `Withdrawal for ${user.name}`,
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secret_key}`,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (transferError: unknown) {
    if (transferError instanceof AxiosError) {
      const errorMessage =
        transferError.response?.data?.message || 'Transfer initiation failed.';
      throw new ApiError(StatusCodes.BAD_REQUEST, errorMessage);
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Transfer initiation failed.');
  }

  user.balance -= amount;
  await user.save();

  return {
    status: 'successful',
    reference: transferReference,
    amount: amount,
    fee: feeInKobo / 100,
  };
};

// const createConnectionAccount = async (payload: JwtPayload, protocol: string, host: string) => {
//   const objID = new Types.ObjectId(payload.id);
//   const user = await User.findById(objID);
//   if (!user) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
//   }
//   if (user.paymentValidation.accountCreated && user.paymentValidation.accountID) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User already has a connection account!");
//   }
//   const account = await stripe.accounts.create({
//     type: 'express',
//     country: 'US',
//     email: user.email,
//     business_type: 'individual',
//     individual: {
//       first_name: user.name.split(' ')[0],
//       last_name: user.name.split(' ')[1] || '',
//       email: user.email,
//       phone: user.contact || '0000000000',
//     },
//     capabilities: {
//       transfers: { requested: true },
//       card_payments: { requested: true },
//     },
//     metadata: {
//       user_id: user._id.toString(),
//     },
//   });
//   await user.updateOne({
//     $set: {
//       "paymentValidation.accountID": account.id,
//     },
//   });
//   const accountLink = await stripe.accountLinks.create({
//     account: account.id,
//     refresh_url: `${protocol}://${host}/api/v1/payment/refresh/${account.id}`,
//     return_url: `${protocol}://${host}/api/v1/payment/success/${account.id}`,
//     type: 'account_onboarding',
//   });
//   return {
//     onboardingUrl: accountLink.url,
//   };
// };

// const transferToConnectedAccount = async (
//   amount: number,
//   currency: string,
//   connectedAccountId: string
// ) => {
//   const transfer = await stripe.transfers.create({
//     amount,
//     currency,
//     destination: connectedAccountId,
//   });
//   return transfer;
// };

// const getDashboardLink = async (userId: string) => {
//   const user = await User.findById(userId);
//   if (!user) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "User was not found!");
//   }
//   if (!user.paymentValidation.accountCreated || !user.paymentValidation.accountID) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, "User has not created a connection account at first you must add you bank account!");
//   }
//   const loginLink = await stripe.accounts.createLoginLink(
//     user.paymentValidation.accountID
//   );
//   return loginLink.url;
// };

export const PaymentService = {
  resolveBankAccount,
  createPaystackSubaccount,
  createCheckoutSession,
  successDeposit,
  createWithdrawSession,
  // createConnectionAccount,
  // transferToConnectedAccount,
  // getDashboardLink
};
