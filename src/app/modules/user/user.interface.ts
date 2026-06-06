import { Model, Types } from 'mongoose';
import { STATUS, USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  totalSpent: number;
  totalEarn: number;
  totalPosts: Types.ObjectId[];
  user_name: string;
  role: USER_ROLES;
  geoLocation: {
    type: 'Point',
    coordinates: number[],
  },
  contact: string;
  email: string;
  faceVerifyed: boolean;
  password: string;
  location: string;
  image?: string;
  status: STATUS;
  verified: boolean;
  favorites: Types.ObjectId[];
  searchKeywords: string[];
  balance: number;
  firstWithdrawal: boolean;
  lastSession: string;
  gender: string;
  dob: string;
  skills: string[];
  complitedTasks: Types.ObjectId[];
  paymentValidation: {
    accountID: string;
    accountCreated: boolean;
  };
  reviews: [
    {
      star: number,
      comment: string,
      from: string,
      createdAt: Date,
    }
  ];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: string;
    expireAt: Date;
  };
  bidCancelation: {
    bannedFor: Date;
    bidCancelationAvailable: number;
  };
};

export type UserModal = {
  isValidUser(id: string):any;
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
