import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { STATUS } from '../../../enums/user';
import ms, { StringValue } from "ms";
import unlinkFile from '../../../shared/unlinkFile';

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check verified and status
  if (!isExistUser.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account, then try to login again'
    );
  }

  //check user status
  if (isExistUser.status === STATUS.BLOCKED || isExistUser.status === STATUS.DELETED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `You don’t have permission to access this content.It looks like your account has been ${isExistUser.status}.`
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  //create token
  const createToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as StringValue
  );

  //refresh token
  const msVal: number | undefined = ms(config.jwt.jwt_refresh_expire_in as StringValue);
  const expireAt = new Date(Date.now() + msVal);
  const refreshToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_refresh_expire_in as StringValue
  );

  await ResetToken.create({
    user: isExistUser._id,
    token: refreshToken,
    expireAt: expireAt
  })

  return { accessToken: createToken, refreshToken, userId: isExistUser._id, name: isExistUser.name };
};

// refresh access token
const refreshToken = async ({ refreshToken }: { refreshToken: string }) => {

  const isRefreshTokenValid = await ResetToken.findOne({
    token: refreshToken,
    expireAt: { $gt: new Date() }
  });

  if (!isRefreshTokenValid) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired refresh token"
    )
  }

  const user = await User.findById(isRefreshTokenValid.user);
  if (!user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "User not found!"
    )
  }

  const newAccessToken = jwtHelper.createToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as StringValue
  );

  return newAccessToken
}

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp: otp.toString(),
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 5 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code'
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
    message = 'Email verify successfully';
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    data = createToken;
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    '15m'
  );

  return { data, message, accessToken };
};

//forget password
const resetPasswordToDB = async (
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(payload.token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(payload.token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

//Change password to db
const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};


//Config the faceapi
// faceapi.env.monkeyPatch({
//   Canvas: Canvas as any,
//   Image: Image as any,
//   ImageData: ImageData as any
// });

// const MODEL_PATH = path.join( process.cwd(), "trained_models");

// async function loadModels() {
//   await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
//   await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
//   await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
// };

// loadModels()
// .then( e => console.log("Models are loaded: ", e ))
// .catch(console.error)

// const converToFload32Array = (arr:any[])=>{
//   const temp = []
//   const tempObj = arr[0]
//   for(let key in tempObj){
//     temp.push(tempObj[key])
//   }
//   return temp
// }


//Face verification
// const faceVerification = async (
//   image1?: string,
//   image2?: string,
//   user?: JwtPayload
// ) => {
// try {
//   const { id } = user!;
//   const userData = await User.isValidUser(id);
//   if (userData.faceVerifyed) {
//     throw new ApiError(
//       StatusCodes.CREATED,
//       "You are already verifyed!"
//     )
//   }

//   if (!image1 || !image2) {
//     throw new ApiError(
//       StatusCodes.NOT_FOUND,
//       "Images are not founded to calculate!"
//     )
//   }

//   if (!fs.existsSync(image1) || !fs.existsSync(image2)) {
//     throw new ApiError(StatusCodes.NOT_FOUND, 'Image file not found'); 
//   };

//   const img1 = ( await loadImage(image1) ) as unknown as HTMLImageElement;
//   const img2 = ( await loadImage(image2) ) as unknown as HTMLImageElement;

//   const detection1 = await faceapi.detectSingleFace(img1)
//                                   .withFaceLandmarks()
//                                   .withFaceDescriptor()
//   const detection2 = await faceapi.detectSingleFace(img2)
//                                   .withFaceLandmarks()
//                                   .withFaceDescriptor()

//   const descriptor_data_1 = detection1?.descriptor;
//   const descriptor_data_2 = detection2?.descriptor;

//   if (!descriptor_data_1 || !descriptor_data_2) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "Face detection data not found!")
//   };

//   let minDistance = 0.6;
//   const faceArr = converToFload32Array(descriptor_data_1 as any)
//   const distance = faceapi.euclideanDistance(faceArr, descriptor_data_2)

//   const match = distance < minDistance

//   if (match) {
//     return true
//   }

//   if (!match) {
//     return false
//   }

//   unlinkFile(image1!)
//   unlinkFile(image2!)

//   return match

// } catch (error) {
//   unlinkFile(image1!)
//   unlinkFile(image2!)
//   throw new Error()
// }
// }

//Face verification
const faceVerification = async (
  image1?: string,
  image2?: string,
  user?: JwtPayload
) => {
  try {

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const userFromDB = await User.isValidUser(user?.id)

    return {
      image1,
      image2
    }

  } catch (error) {
    unlinkFile(image1!)
    unlinkFile(image2!)
    throw new Error()
  }
};

export const AuthService = {
  verifyEmailToDB,
  refreshToken,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  faceVerification
};
