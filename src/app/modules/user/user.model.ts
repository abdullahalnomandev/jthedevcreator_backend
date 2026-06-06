import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import mongoose, { model, Schema } from 'mongoose';
import { STATUS, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    user_name:{
      type: String
    },
    geoLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0]},
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    totalEarn: {
      type: Number,
      default: 0
    },
    totalPosts:{
      type: [Schema.Types.ObjectId],
      ref: "post"
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: USER_ROLES.USER
    },
    contact:{
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    faceVerifyed:{
      type: Boolean,
      default: false
    },
    paymentValidation:{
      accountID: {
        type: String,
        default: ""
      },
      accountCreated: {
        type: Boolean,
        default: false
      }
    },
    balance: {
      type: Number,
      default: 0
    },
    bidCancelation: {
      bannedFor: Date,
      bidCancelationAvailable: {
        type: Number,
        default: 3
      }
    },
    lastSession: {
      type: String,
      default: ""
    },
    firstWithdrawal: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    location:{
      type: String,
    },
    image: {
      type: String,
      default: '',
    },
    searchKeywords: {
      type: [String],
      default: [],
      maxlength: 5 
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      default:""
    },
    dob: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    favorites: {
      type: [Schema.Types.ObjectId],
      ref: "post"
    },
    complitedTasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "task"
      }
    ],
    reviews:[
        {
          star: Number,
          comment: String,
          from: String,
          createdAt: Date
      }
    ],
    authentication: {
      isResetPassword: {
        type: Boolean,
        default: false,
      },
      oneTimeCode: {
        type: String,
        default: null,
      },
      expireAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  if (isExist) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "Email already exist!"
    )
  }
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//Check user With validation in shourt and return the user
userSchema.statics.isValidUser = async (id: string) => {

  const objID = new mongoose.Types.ObjectId(id);
  const isExist = await User  
                        .findById( objID)
                        .select("-password -authentication -__v -updatedAt -createdAt -totalPosts -paymentValidation")
                        .lean()
                        .exec();

  if (!isExist) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found"
    );
  }

  if (!isExist.verified) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Your account was not verified!"
    )
  }

  if (isExist.status !== STATUS.ACTIVE) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      `You account was ${isExist.status}!`
    );
  }
  return isExist;
};

// //check user
// userSchema.pre('save', async function (next) {
//   //check user
//   // const isExist = await User.findOne({ email: this.email });
//   // if (!isExist) {
//   //   throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found!');
//   // }

//   //password hash
//   // this.password = await bcrypt.hash(
//   //   this.password,
//   //   Number(config.bcrypt_salt_rounds)
//   // );
//   next();
// });

userSchema.index({ 'authentication.expireAt': 1 }, { expireAfterSeconds: 600 });//after 10 minutes
export const User = model<IUser, UserModal>('user', userSchema);
