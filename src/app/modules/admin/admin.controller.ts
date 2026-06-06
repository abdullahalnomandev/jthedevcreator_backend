import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AdminServices } from './admin.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const PostAboutUs = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...aboutUsData } = req.body;
    const user = req.user;
    const result = await AdminServices.create_about_us(user,aboutUsData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the about us data!',
      data: result,
    });
  }
);

const GetAboutUsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await AdminServices.get_about_us(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get the about us data!',
      data: result,
    });
  }
);

const UpdateAboutUsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const {...data} = req.body;
    const result = await AdminServices.update_about_us(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update the about us data!',
      data: result,
    });
  }
);

const GetConditionsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await AdminServices.get_condition_data(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get the condition data!',
      data: result,
    });
  }
);

const CreateConditionsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await AdminServices.create_conditon(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the condition data!',
      data: result,
    });
  }
);

const UpdateConditionsData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await AdminServices.update_condition(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update the condition data!',
      data: result,
    });
  }
);

const GetFAQData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await AdminServices.get_faq_data(user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get the faq data!',
      data: result,
    });
  }
);

const CreateFAQData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await AdminServices.create_faq(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the faq data!',
      data: result,
    });
  }
);

const UpdateFAQData = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await AdminServices.update_faq(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update the faq data!',
      data: result,
    });
  }
);

const usersGet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { ...data } = req.body;
    const result = await AdminServices.getAllUsers(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get all users data!',
      data: result,
    });
  }
);

const blockAUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userID = req.params.id;
    const result = await AdminServices.blockAUser(userID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update user status!',
      data: result,
    });
  }
);

const getAUserdata = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userID = req.params.id;
    const result = await AdminServices.getAUser(userID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get a user data',
      data: result,
    });
  }
);

const getAlTaskdata = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { ...data } = req.body;

    const result = await AdminServices.getAllTaskdata(data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully all task data',
      data: result,
    });
  }
);

const deleteTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const taskID = req.query.id as string;
    const result = await AdminServices.deleteTask(taskID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully delete task!',
      data: result,
    });
  }
);

const getTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...data } = req.body;
    const result = await AdminServices.getTransactions(data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get transactions!',
      data: result,
    });
  }
);

const overview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await AdminServices.overview();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get overview!',
      data: result,
    });
  }
);

const topTaskTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminServices.getTopTasks();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get top task types!',
      data: result,
    });
  }
);

const createTopTask = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...data } = req.body;
    const background = getSingleFilePath(req.files,"image");

    const finalData = {
      background,
      ...data
    }

    const result = await AdminServices.createTopTask(finalData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully create top task!',
      data: result,
    });
  }
);

const updateTopTask = catchAsync(
  async (req: Request, res: Response) => {
    const { ...data } = req.body;
    const background = getSingleFilePath(req.files,"image");
    data.background = background;
    const id = data.topTaskId;
    const result = await AdminServices.updateTopTask(id,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully update top task!',
      data: result,
    });
  }
);

const deleteTopTask = catchAsync(
  async (req: Request, res: Response) => {
    const { ...data } = req.body;
    const id = data.topTaskId;
    const result = await AdminServices.deleteTopTask(id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully delete top task!',
      data: result,
    });
  }
);

export const AdminController = { 
    PostAboutUs,GetAboutUsData,UpdateAboutUsData,
    GetConditionsData,CreateConditionsData,UpdateConditionsData,
    GetFAQData,CreateFAQData,UpdateFAQData,
    usersGet,blockAUser,getAUserdata,
    getAlTaskdata,deleteTask,getTransactions,
    overview,topTaskTypes,createTopTask,updateTopTask,deleteTopTask
};