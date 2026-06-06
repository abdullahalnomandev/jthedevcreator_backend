import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { about_us, faq, update_faq } from '../../../types/admin';
import { User } from '../user/user.model';
import { Policie } from '../policies/policie.model';
import { policie_type } from '../../../enums/policie';
import { STATUS, USER_ROLES } from '../../../enums/user';
import { Task } from '../task/task.model';
import { Payment } from '../payments/payment.model';
import { Bid } from '../bid/bid.model';
import { Faq } from '../faq/faq.modal';
import { TopTasks } from '../topTasks/topTast.model';
import { ITopTasks } from '../topTasks/topTast.interface';
import { Types } from 'mongoose';

const create_about_us = async (
    // payload: Partial<register>
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Already another about us data was exist you must delete the older one to create a new one or you can update the older one!"
        )
    };

    const newPoliciData = await Policie.create({
        context: data.data,
        type: policie_type.ABOUT_US
    });

    return newPoliciData;
};

const get_about_us = async (
    payload: JwtPayload,
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your about us data was not exist!"
        )
    };

    return isAboutUsExist;
};

const update_about_us = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.ABOUT_US});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "About us data was not exist at first you must create the about us data to update the data !"
        )
    };

    isAboutUsExist.context = data.data;
    await isAboutUsExist.save();

    return isAboutUsExist;
};

const get_condition_data = async (
    payload: JwtPayload,
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.TERMS_CONDITIONS});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your condition data was not exist!"
        )
    };

    return isAboutUsExist;
};

const create_conditon = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.TERMS_CONDITIONS});
    if (isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Already another condition data was exist you must delete the older one to create a new one or you can update the older one!"
        )
    };

    const newPoliciData = await Policie.create({
        context: data.data,
        type: policie_type.TERMS_CONDITIONS
    });

    return newPoliciData;
};

const update_condition = async (
    payload: JwtPayload,
    data : about_us
): Promise<any> => {
    
    await User.isValidUser(payload.id);
    
    const isAboutUsExist = await Policie.findOne({type: policie_type.TERMS_CONDITIONS});
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "condition data was not exist at first you must create the about us data to update the data!"
        )
    };

    isAboutUsExist.context = data.data
    await isAboutUsExist.save();

    return isAboutUsExist;
};

const get_faq_data = async (
    payload: JwtPayload,
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Faq.find();
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "FAQ data was not exist!"
        )
    };

    return isAboutUsExist;
};

const create_faq = async (
    payload: JwtPayload,
    data : faq
): Promise<any> => {
    
    await User.isValidUser(payload.id)
    
    const isAboutUsExist = await Faq.findOne({question: data.question});
    if (isAboutUsExist) {
      throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "Already another faq was exist on this name!"
      )
    };

    const newPoliciData = await Faq.create({
      question: data.question,
      answer: data.answer
    });

    return newPoliciData;
};

const update_faq = async (
    payload: JwtPayload,
    data : update_faq
): Promise<any> => {
    
    await User.isValidUser(payload.id);
    
    const isAboutUsExist = await Faq.findOne({ _id: data.faqId });
    if (!isAboutUsExist) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "FAQ data was not exist at first you must create the about us data to update the data!"
        )
    };

    isAboutUsExist.question = data.question;
    isAboutUsExist.answer = data.answer;
    await isAboutUsExist.save()

    return isAboutUsExist;
};

const getAllUsers = async (
    payload: JwtPayload,
    data: { 
        limit: number; 
        page: number;
    }
): Promise<any> => {

    await User.isValidUser(payload.id);

    const { limit = 10, page = 1 } = data;

    const skipCount = (page - 1) * limit;

    const allAdminUsers = await User.find({ role: { $ne: USER_ROLES.ADMIN }})
                                    .populate("complitedTasks totalPosts")
                                    .select("-password -paymentValidation -authentication -__v")
                                    .skip(skipCount)
                                    .limit(limit);

    return allAdminUsers;
};

const blockAUser = async (
    userID: any
): Promise<any> => {

    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "user not found!"
        )
    };

    user.status = user.status == STATUS.BLOCKED? STATUS.ACTIVE : STATUS.BLOCKED;
    await user.save();

    return true;
};

// Have a todo after creating the bid and other oparations
// it will need the aggrigation
const getAUser = async (
    userid: string
) => {

    const user = await User
                        .findById(userid)
                        .select("-authentication -searchKeywords -__v -createdAt -updatedAt")

    if (!user) {
        throw new ApiError(
            StatusCodes.BAD_GATEWAY,
            "User not found to send the data!"
        )
    }

    return user;
};

const getAllTaskdata = async (
    data: { 
        limit: number; 
        page: number;
    }
) => {

    const skipCount = (data.page - 1) * data.limit;

    const taskts = await Task.find()
                             .populate({
                                path: 'provider',
                                select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
                             })
                             .populate({
                                path: 'customer',
                                select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
                             })
                             .populate({
                                path: 'service',
                                select: '-location',
                             })
                             .populate({
                                path: 'bid',
                                select: '-authentication -password -createdAt -updatedAt -__v -searchKeywords -favorites -faceVerifyed',
                             })
                             .skip(skipCount)
                             .limit(data.limit)
                             .sort({ createdAt: -1 });

    return taskts;
};

const deleteTask = async (
    id: string
  ) => {
    const task = await Task.findByIdAndDelete(id);
  
    if (!task) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Task not found!"
      )
    }
  
    return task;
};

const getTransactions = async (
    data: { page: number; limit: number; },
): Promise<any> => {
    
    const { page = 1, limit = 10 } = data;
    
    const skipCount = (page - 1) * limit;
    
    const transactions = await Payment.find()
                                        .populate({
                                            path: 'taskID',
                                            populate: [
                                                { path: 'customer', select: 'name email image' },
                                                { path: 'provider', select: 'name email image' },
                                                { path: 'service', select: 'title description amount' },
                                                { path: 'bid', select: 'offer_ammount reason' }
                                            ]
                                        })
                                        .skip(skipCount)
                                        .limit(limit)
                                        .sort({ createdAt: -1 });

    if (!transactions) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your transactions data was not exist!"
        )
    };

    return transactions;
};

// const overview = async () => {

//     // Total User Count
//     const totalUser = await User.find().countDocuments();
  
//     // Total Job Request (Offer Count)
//     const totalJobRequest = await Bid.find().countDocuments();
  
//     // Total Job Post (Task Count)
//     const totalTask = await Task.find().countDocuments();
  
//     // Total Commission Aggregation for Successful Payments
//     const totalCommission = await Payment.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalCommission: { $sum: "$commission" },
//         },
//       },
//     ]);
//     const commissionSum = totalCommission[0]?.totalCommission || 0;
  
//     // Current Year
//     const currentYear = new Date().getFullYear();
  
//     // Yearly Revenue Data: Grouped by Month
//     const result = await Payment.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: new Date(`${currentYear}-01-01`),
//             $lt: new Date(`${currentYear + 1}-01-01`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           totalCommission: { $sum: "$commission" },
//         },
//       },
//     ]);
  
//     const months = [
//       "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//     ];
  
//     // Format the result to map month to total commission
//     const commissionMap = new Map<number, number>();
//     result.forEach((entry) => {
//       commissionMap.set(entry._id, entry.totalCommission);
//     });
  
//     const formattedRevenueData = months.map((monthName, index) => ({
//       month: monthName,
//       commission: commissionMap.get(index + 1) || 0,
//     }));
  
//     // User Growth Data: Grouped by Month and Role
//     // const userGrowthData = await User.aggregate([
//     //   {
//     //     $project: {
//     //       role: 1,
//     //       month: { $month: "$createdAt" },   
//     //       year: { $year: "$createdAt" },  
//     //     },
//     //   },
//     //   {
//     //     $match: { "year": currentYear }, 
//     //   },
//     //   {
//     //     $group: {
//     //       _id: { month: "$month", role: "$role" },
//     //       count: { $sum: 1 },
//     //     },
//     //   },
//     //   {
//     //     $group: {
//     //       _id: "$_id.month",
//     //       roles: {
//     //         $push: { role: "$_id.role", count: "$count" },
//     //       },
//     //     },
//     //   },
//     //   {
//     //     $project: {
//     //       _id: 0,
//     //       month: "$_id",
//     //       serviceProvider: {
//     //         $let: {
//     //           vars: {
//     //             sp: {
//     //               $arrayElemAt: [
//     //                 {
//     //                   $filter: {
//     //                     input: "$roles",
//     //                     as: "item",
//     //                     cond: { $eq: ["$$item.role", "serviceProvider"] },
//     //                   },
//     //                 },
//     //                 0,
//     //               ],
//     //             },
//     //           },
//     //           in: { $ifNull: ["$$sp.count", 0] },
//     //         },
//     //       },
//     //       categoryUser: {
//     //         $let: {
//     //           vars: {
//     //             cu: {
//     //               $arrayElemAt: [
//     //                 {
//     //                   $filter: {
//     //                     input: "$roles",
//     //                     as: "item",
//     //                     cond: { $eq: ["$$item.role", "categoryUser"] },
//     //                   },
//     //                 },
//     //                 0,
//     //               ],
//     //             },
//     //           },
//     //           in: { $ifNull: ["$$cu.count", 0] },
//     //         },
//     //       },
//     //     },
//     //   },
//     //   { $sort: { month: 1 } }, // Sort by month
//     // ]);

//     const userGrowthData = await User.aggregate([
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//         },
//       },
//       {
//         $match: { year: currentYear }, // Match current year
//       },
//       {
//         $group: {
//           _id: "$month",  // Group by month
//           count: { $sum: 1 }, // Count the number of users in each month
//         },
//       },
//       {
//         $project: {
//           _id: 0,  // Remove the default _id field
//           month: "$_id", // Rename _id to month
//           newUsers: "$count", // Rename count to newUsers
//         },
//       },
//       { $sort: { month: 1 } }, // Sort by month
//     ]);
  
//     const userGrowthMap = new Map<number, { serviceProvider: number, categoryUser: number }>();
  
//     userGrowthData.forEach(entry => {
//       const monthIndex = entry.month - 1; 
//       if (!userGrowthMap.has(monthIndex)) {
//         userGrowthMap.set(monthIndex, { serviceProvider: 0, categoryUser: 0 });
//       }
      
//       const currentData = userGrowthMap.get(monthIndex);
//       if (currentData) {
//         currentData.serviceProvider += entry.serviceProvider;
//         currentData.categoryUser += entry.categoryUser;
//       }
//     });
  
//     const formattedUserGrowthData = months.map((monthName, index) => {
//       const growth = userGrowthMap.get(index) || { serviceProvider: 0, categoryUser: 0 };
//       return {
//         month: monthName,
//         serviceProvider: growth.serviceProvider,
//         categoryUser: growth.categoryUser,
//       };
//     });
  
//     return {
//       totalTask,
//       totalJobRequest,
//       totalUser,
//       totalRevenue: commissionSum,
//       yearlyRevenueData: formattedRevenueData,
//       userGrowth: formattedUserGrowthData,
//     };
// };

const overview = async () => {

  // Total User Count
  const totalUser = await User.find().countDocuments();

  // Total Job Request (Offer Count)
  const totalJobRequest = await Bid.find().countDocuments();

  // Total Job Post (Task Count)
  const totalTask = await Task.find().countDocuments();

  // Total Commission Aggregation for Successful Payments
  const totalCommission = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalCommission: { $sum: "$commission" },
      },
    },
  ]);
  const commissionSum = totalCommission[0]?.totalCommission || 0;

  // Current Year
  const currentYear = new Date().getFullYear();

  // Yearly Revenue Data: Grouped by Month
  const result = await Payment.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalCommission: { $sum: "$commission" },
      },
    },
  ]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Format the result to map month to total commission
  const commissionMap = new Map<number, number>();
  result.forEach((entry) => {
    commissionMap.set(entry._id, entry.totalCommission);
  });

  const formattedRevenueData = months.map((monthName, index) => ({
    month: monthName,
    commission: commissionMap.get(index + 1) || 0,
  }));

  const userGrowthData = await User.aggregate([
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $match: { year: currentYear }, // Match current year
    },
    {
      $group: {
        _id: "$month",  // Group by month
        count: { $sum: 1 },  // Count how many users were created in each month
      },
    },
    {
      $project: {
        _id: 0,  // Remove the default _id field
        month: "$_id", // Rename _id to month
        newUsers: "$count", // Rename count to newUsers
      },
    },
    { $sort: { month: 1 } }, // Sort by month in ascending order
  ]);

  // Map the result to ensure all months are present, even if no users were added in some months
  const formattedUserGrowthData = months.map((monthName, index) => {
    const entry = userGrowthData.find(data => data.month === index + 1);
    return {
      month: monthName,
      newUsers: entry ? entry.newUsers : 0, // If no data for the month, set newUsers to 0
    };
  });

  return {
    totalTask,
    totalJobRequest,
    totalUser,
    totalRevenue: commissionSum,
    yearlyRevenueData: formattedRevenueData,
    userGrowth: formattedUserGrowthData,
  };
};


const getTopTasks = async () => {
  const topTasks = await TopTasks.find();
  return topTasks;
};

const createTopTask = async (data: ITopTasks) => {
  const topTask = await TopTasks.create(data);
  return topTask;
};

const updateTopTask = async (id: string, data: ITopTasks) => {
  const objid = new Types.ObjectId(id);
  const topTask = await TopTasks.findByIdAndUpdate(objid, data, { new: true });
  if (!topTask) throw new ApiError(StatusCodes.NOT_FOUND, "Top task not found!");
  return topTask;
};

const deleteTopTask = async (id: string) => {
  const objid = new Types.ObjectId(id);
  const topTask = await TopTasks.findByIdAndDelete(objid);
  if (!topTask) throw new ApiError(StatusCodes.NOT_FOUND, "Top task not found!");
  return topTask;
};
  
  
export const AdminServices = {
  create_about_us,get_about_us,update_about_us,
  get_condition_data,create_conditon,update_condition,
  get_faq_data,create_faq,update_faq,
  getAllUsers,blockAUser,getAUser,
  getAllTaskdata,deleteTask,
  getTransactions,
  overview,
  getTopTasks,createTopTask,updateTopTask,deleteTopTask
};
