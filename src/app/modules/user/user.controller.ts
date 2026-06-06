import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { QueryOptions, UserService } from './user.service';
import ApiError from '../../../errors/ApiError';
import { Post } from '../post/post.model';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (req.files) {
      const image = getSingleFilePath(req.files, 'image');
      if (image) {
        req.body.image = image;
      }
    }
    
    const {
      ...data
    } = req.body;

    if ( data.lng || data.lat ) {
      data.geoLocation = {
        type: "Point",
        coordinates: [Number(data.lng), Number(data.lat)]
      }
    }

    delete data.lng
    delete data.lat

    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const searchData = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const {
    keyWord,
    limit,
    page
   } = req.body;

  const result = await UserService.searchData(user,keyWord,page,limit);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get the data with keyword!',
    data: result,
  });
});

const top10KeyWords = catchAsync(async (req: Request, res: Response) => {
  
  const limit = req.body.limit
  const result = await UserService.getTopSearchedKeywords(limit);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get keywords!',
    data: result,
  });
});

const homeData = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const { ...data }: QueryOptions = req.body;

  const result = await UserService.getPosts(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get home data!',
    data: result,
  });
});

const filterData = catchAsync(async (req: Request, res: Response) => {
  
  // const user = req.user;
  // const { ...data } = req.body;

  let result = await UserService.getPostWithDistance(req.body);

  // if (data.uni && data.uni == 'true') {
  //   result = await Post.find();
  // }else{
  //     if (data.search) {
  //     result = await UserService.searchData(user, data.search, data.page, data.limit);
  //   }if (!data.search) {
  //     result = await UserService.filterdata(user,data);
  //   } 
  // }
  

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get filter data',
    data: result,
  });
});

const sendReportProblem = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const { ...data } = req.body;
  const image = getSingleFilePath(req.files, "image");

  const finalData = {
    image,
    ...data
  }
  const result = await UserService.userReport_request(user, finalData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully send a suport request!',
    data: result,
  });
});

const woneReportProblem = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const { limit, page } = req.body;
  const result = await UserService.wone_created_suports(user.id, {page, limit});

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get wone suport requests data!',
    data: result,
  });
});

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user;
  const { limit, page, date, count } = req.body;
  let result;

  if (count === "true") {
    result = await UserService.getUnreadCount(user.id)
  } else {
    result = await UserService.getNotifications(user, {page, limit, date});
  }

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get notifications data!',
    data: result,
  });
});

const giveReview = catchAsync(async (req: Request, res: Response) => {
  
  const { ...data } = req.body;
  const user = req.user;
  const result = await UserService.giveReview(user,data);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully give review!',
    data: result,
  });
});

const getAProfile = catchAsync(async (req: Request, res: Response) => {
  
  const { id } = req.params;
  if(!id) throw new ApiError(StatusCodes.BAD_REQUEST, "User id is required!");

  const result = await UserService.getAProfile(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully get a profile!',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  
  const id = req.user.id;
  if(!id) throw new ApiError(StatusCodes.BAD_REQUEST, "User id is required!");

  const result = await UserService.deleteUser(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Successfully delete a user!',
    data: result,
  });
});

export const UserController = { 
  createUser, getUserProfile, updateProfile,
  searchData, top10KeyWords, homeData,
  sendReportProblem, woneReportProblem,filterData,
  getNotifications, giveReview, getAProfile, deleteUser
};