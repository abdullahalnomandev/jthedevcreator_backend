import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { filterType, giveReviewType, register } from '../../../types/user';
import { Post } from '../post/post.model';
import SearchKeyword from '../keywords/search.model';
import validator from 'validator';
import bcrypt from "bcrypt"
import config from '../../../config';
import { Suport } from '../suport/suport.model';
import { NotificationModel } from '../notification/notification.model';
import { socketHelper } from '../../../helpers/socketHelper';
import mongoose, { Types } from 'mongoose';
import { startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from 'date-fns';
import { Task } from '../task/task.model';
import { Reating } from '../rating/rating.model';
import { calculateDistanceInKm } from '../../../helpers/destanceCountHelper';

const createUserToDB = async (payload: Partial<register>): Promise<any> => {
  if (!payload) {
    throw new Error('payload is missing!')
  }
  let isExists = await User.findOne({ email: payload.email as string });

  if (isExists && isExists.verified) {
    throw new Error('User Already Exists!')
  }

  if (!isExists) {
    const hashPasswod = await bcrypt.hash(
      payload!.password!,
      Number(config.bcrypt_salt_rounds)
    );

    const user = {
      name: payload.first_name + " " + payload.last_name,
      email: payload.email,
      password: hashPasswod,
      role: USER_ROLES.USER
    }

    isExists = await User.create(user);
    if (!isExists) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    };

  }

  //send email
  const otp = generateOTP();
  const values = {
    name: isExists.name,
    otp: otp,
    email: isExists.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  await User.findOneAndUpdate(
    { _id: isExists._id },
    {
      $set: {
        "authentication.oneTimeCode": otp,
        "authentication.expireAt": new Date(Date.now() + 5 * 60000),
      },
    }
  );

  return {
    name: isExists.name,
    email: isExists.email,
    image: isExists.image,
  };
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  };

  return isExistUser;
};

const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>) => {

  try {
    const { id } = user;
    const isExistUser = await User.isValidUser(id);

    //unlink file here
    if (payload.image && isExistUser.image) {
      unlinkFile(isExistUser.image);
    };

    const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
      new: true,
    }).select("-password -verified -authentication -complitedTasks -reviews -totalPosts -favorites -searchKeywords ").lean().exec();

    return updateDoc;

  } catch (error: any) {
    if (payload.image) {
      unlinkFile(payload.image as string)
    }
    throw new ApiError(
      500,
      error.message
    )
  };
};

// Also this will remove
const searchData = async (
  payload: JwtPayload,
  keyword: string,
  page: number = 1,
  limit: number = 10
) => {

  // if (typeof keyword !== 'string' || keyword.trim().length === 0) {
  //     throw new Error('Invalid keyword format');
  // }

  const sanitizedKeyword = validator.escape(keyword.trim());

  const skipCount = (page - 1) * limit;

  const posts = await Post.find({
    $or: [
      { title: { $regex: sanitizedKeyword, $options: 'i' } },
      { description: { $regex: sanitizedKeyword, $options: 'i' } }
    ]
  })
    .skip(skipCount)
    .limit(limit);

  if (posts.length === 0) {
    const randomPosts = await Post.aggregate([
      { $sample: { size: limit } }
    ]);
    const user = await User.findById(new mongoose.Types.ObjectId(payload.id));
    if (user) {
      user.searchKeywords.unshift(keyword);

      if (user.searchKeywords.length > 5) {
        user.searchKeywords.pop();
      }

      await user.save();
    }
    return randomPosts;
  }

  const searchKeyword = await SearchKeyword.findOne({ keyword: sanitizedKeyword });
  if (searchKeyword) {
    searchKeyword.count += 1;
    await searchKeyword.save();
  } else {
    await SearchKeyword.create({ keyword: sanitizedKeyword });
  }

  const user = await User.findById(new mongoose.Types.ObjectId(payload.id));
  if (user) {
    user.searchKeywords.unshift(keyword);

    if (user.searchKeywords.length > 5) {
      user.searchKeywords.pop();
    }

    await user.save();
  }

  return posts;
};

const getPostWithDistance = async ({
  payload,
  data,
}: {
  payload: JwtPayload;
  data: {
    maxDistance: number;
    maxPrice: number;
    minPrice: number;
    userLat: number;
    userLng: number;
    search: string;
    page?: number;
    limit?: number;
  };
}) => {
  const { userLat, userLng, maxDistance, minPrice, maxPrice, page = 1, limit = 10, search } = data;
  const skip = (page - 1) * limit;

  const latN = Number(userLat);
  const lngN = Number(userLng);
  const distN = Number(maxDistance);
  const hasCoords = Number.isFinite(latN) && Number.isFinite(lngN);
  const hasDist = Number.isFinite(distN) && distN >= 1;

  const sanitizedKeyword = search.trim();
  const queryFilters: any = {};

  if (sanitizedKeyword) {
    queryFilters.$or = [
      { title: { $regex: sanitizedKeyword, $options: "i" } },
      { description: { $regex: sanitizedKeyword, $options: "i" } }
    ];
  }

  queryFilters.amount = { $gte: minPrice, $lte: maxPrice };

  // Fetch posts based on filters
  const posts = await Post.find(queryFilters)
    .skip(skip)
    .limit(limit)
    .lean();


  const enrichedPosts = await Promise.all(
    posts.map(async (post: any) => {
      const pLat = post?.location?.coordinates?.[1];
      const pLng = post?.location?.coordinates?.[0];
      const dKm = hasCoords ? calculateDistanceInKm(latN, lngN, pLat, pLng) : undefined;

      return {
        ...post,
        isValid: new Date(post.deadline).getTime() > Date.now(),
        distance: dKm,
      };
    })
  );

  // If distance filter is set, filter the posts based on distance
  if (hasCoords && hasDist) {
    return enrichedPosts.filter(p => p.distance <= (distN ?? 30000));
  }

  return enrichedPosts;
};

const getTopSearchedKeywords = async (limit: number = 10) => {

  const topKeywords = await SearchKeyword.find()
    .sort({ count: -1 })
    .limit(limit);

  return topKeywords;
};

const home_data = async (
  payload: JwtPayload,
  page: number = 1,
  limit: number = 10
) => {
  const user = await User.findById(payload.id).select("favorites");

  if (!user) {
    throw new Error('User not found');
  }

  const skipCount = (page - 1) * limit;

  const posts = await Post.find({
    skipFrom: { $ne: { $in: user._id } },
    createdBy: {
      $ne: user._id

    }
  })
    .populate("createdBy", "name image")
    .skip(skipCount)
    .limit(limit)
    .lean();

  const favoriteSet = new Set(user.favorites.map(favId => favId.toString()));

  const postsWithFavoriteFlag = posts.map(post => ({
    ...post,
    isFavorite: favoriteSet.has(post._id.toString())
  }));

  return postsWithFavoriteFlag;
};

const userReport_request = async (
  user: JwtPayload,
  data: {
    title: string,
    description: string,
    image: string
  }
) => {
  try {

    const userData = await User.isValidUser(user.id);
    const admin = await User.find({ role: USER_ROLES.ADMIN }).lean().exec();
    const totalAdmin = admin.map(adminUser => ({
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
    }));
    const suport = await Suport.create({
      user: userData._id,
      title: data.title,
      description: data.description,
      image: data.image
    });

    //@ts-ignore
    const io = global.io

    for (let data of totalAdmin) {

      const not = await NotificationModel.create({
        from: suport.user,
        content: suport.image,
        discription: suport.description,
        //@ts-ignore
        for: data._id,
        title: suport.title
      })
      //@ts-ignore
      const targetSocketId = socketHelper.connectedUsers.get(data.id);
      if (targetSocketId) {
        //@ts-ignore
        io.to(targetSocketId).emit(`socket:notification:${data.id}`, not);
      }
    };

    return suport

  } catch (error: any) {

    if (data.image) {
      unlinkFile(data.image)
    }
    throw new ApiError(StatusCodes.NOT_FOUND, error.message)
  }
}

const wone_created_suports = async (
  userID: string,
  option: {
    limit: number,
    page: number
  }
) => {
  const user = await User.isValidUser(userID);
  const skipCount = (option.page - 1) * option.limit;

  return await Suport.find({ user: user._id }).populate("user", "name email image").skip(skipCount).limit(option.limit)
}

/// This will be remove
const filterdata = async (user: JwtPayload, data: filterType) => {
  const { maxDistance, maxPrice, minPrice, userLat, userLng } = data;
  const userFromDB = await User.isValidUser(user.id);

  const posts = await Post.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [userLng, userLat]
        },
        $maxDistance: maxDistance
      }
    },
    amount: {
      $gte: minPrice,
      $lte: maxPrice
    }
  }).exec();

  return posts;
}

const getNotifications = async (user: JwtPayload, option: { limit: number; page: number; date: "weekly" | "monthly" | "yearly" | "Select"; }) => {
  const userFromDB = await User.isValidUser(user.id);

  const skipCount = (option.page - 1) * option.limit;

  const now = new Date();
  let startDate: Date = new Date(0);
  let endDate: Date = now;

  switch (option.date) {
    case "weekly":
      const lastWeek = subWeeks(now, 1);
      startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
      endDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
      break;

    case "monthly":
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;

    case "yearly":
      const lastYear = subYears(now, 1);
      startDate = startOfYear(lastYear);
      endDate = endOfYear(lastYear);
      break;

    default:
      break;
  }

  const filter: any = { for: userFromDB._id };
  if (option.date !== "Select") {
    filter.createdAt = { $gte: startDate, $lt: endDate };
  }

  const totalDocs = await NotificationModel.countDocuments(filter);

  const notifications = await NotificationModel.find(filter)
    .populate("for", "name email image")
    .populate("from", "name email image")
    .sort({ createdAt: -1 })
    .skip(skipCount)
    .limit(option.limit);

  // Only unread notifications
  const unreadIds = notifications
    .filter(n => !n.isRead)             // filter unread
    .map(n => new mongoose.Types.ObjectId(n._id)); // ensure ObjectId type

  if (unreadIds.length > 0) {
    const result = await NotificationModel.updateMany(
      { _id: { $in: unreadIds } },
      { $set: { isRead: true, readAt: new Date() } }
    );
    console.log("Notifications marked as read:", result.modifiedCount);
  } else {
    console.log("No unread notifications to mark as read");
  }

  const totalUnread = await NotificationModel.countDocuments({
    isRead: false,
    for: userFromDB._id
  })

  return {
    data: notifications,
    meta: {
      totalDocs,
      totalPages: Math.ceil(totalDocs / option.limit),
      currentPage: option.page,
      pageSize: option.limit,
      hasNextPage: option.page * option.limit < totalDocs,
      hasPrevPage: option.page > 1,
    },
    totalUnread
  };
};

const getUnreadCount = async (userId: string) => {
  const count = await NotificationModel.countDocuments({
    for: userId,
    isRead: false,
  });

  return count == 0 ? 10 : count
};


const giveReview = async (
  userJWt: JwtPayload,
  data: giveReviewType
) => {

  const from = await User.findById(userJWt.id) as any;
  const userObj = new Types.ObjectId(data.user_id);
  const user = await User.findById(userObj);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };

  const review: any = {
    star: data.star,
    comment: data.comment,
    from: from.name,
    createdAt: new Date(Date.now())
  };

  review.asAProvider = data.asAProvider == "true" ? true : false;
  review.for = userObj

  await Reating.create(review)

  user.reviews.push(review);
  await user.save();

  return review;

}

const getAProfile = async (
  id: string
) => {

  const userObj = new Types.ObjectId(id);
  const user = await User.findById(userObj)
    // .populate("complitedTasks")
    //  .populate({
    //   path: "complitedTasks",
    //   populate: {
    //     path: "service",
    //     select: "_id title amount"
    //   }
    //  })
    //  .populate({
    //   path: "complitedTasks",
    //   populate: {
    //     path: "adventurer",
    //     select: "_id name email image totalEarn"
    //   }
    //  })
    //  .populate({
    //   path: "complitedTasks",
    //   populate: {
    //     path: "quizeGiver",
    //     select: "_id name email image totalSpent"
    //   }
    //  })
    .select("-authentication -paymentValidation -bidCancelation -firstWithdrawal -searchKeywords -stats -lastSession -totalPosts -totalSpent -totalEarn -favorites -faceVerifyed -status -balance -__v -updatedAt -createdAt -user_name -role -complitedTasks ").lean()

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };

  const taskAsProvider = await Task.find({ provider: user._id }).populate("bid").lean();
  const taskAsCustomer = await Task.find({ customer: user._id }).populate("bid").lean();

  const totalEarnAsAProvider = taskAsProvider.reduce(
    (sum: number, e: any) => sum + (e?.bid?.offer_ammount ?? 0),
    0
  );

  const totalEarnAsACustomer = taskAsCustomer.reduce(
    (sum: number, e: any) => sum + (e?.bid?.offer_ammount ?? 0),
    0
  );

  const reviewAsAprovider = await Reating.find({ for: user._id, asAProvider: true }).lean();
  const reviewAsACustomer = await Reating.find({ for: user._id, asAProvider: false }).lean();

  let avgRatingasACustomer = 0;
  let avgRatingasAProvider = 0;

  if (reviewAsACustomer.length > 0) {
    const totalStars = reviewAsACustomer.reduce((sum, r) => sum + (r.star ?? 0), 0);
    avgRatingasACustomer = totalStars / reviewAsACustomer.length;
  }
  if (reviewAsAprovider.length > 0) {
    const totalStars = reviewAsAprovider.reduce((sum, r) => sum + (r.star ?? 0), 0);
    avgRatingasAProvider = totalStars / reviewAsAprovider.length;
  }


  return {
    ...user,
    asAProvider: {
      complitedTask: taskAsProvider.length,
      totalEarnAsAProvider,
      avgRatingasAProvider
    },
    asACustomer: {
      complitedCustomer: taskAsCustomer.length,
      totalEarnAsACustomer,
      avgRatingasACustomer
    }
  };
}

const deleteUser = async (
  id: string
) => {
  const userObj = new Types.ObjectId(id);
  const user = await User.findByIdAndDelete(userObj);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };

  return true;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDistance?: number;
  userLat?: number;
  userLng?: number;
}

const getPosts = async (
  payload: JwtPayload,
  options: {
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    maxDistance?: number;
    userLat?: number | null;
    userLng?: number | null;
    page?: number;
    limit?: number;
  }
) => {
  const {
    keyword,
    minPrice,
    maxPrice,
    maxDistance = 0.0,
    userLat,
    userLng,
    page = 1,
    limit = 10,
  } = options;

  const user = await User.findById(payload.id).select("favorites");
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found!"
    )
  }
  const skip = (page - 1) * limit;
  const query: any = { createdBy: { $ne: payload.id } };

  if (keyword && keyword.trim() !== "") {
    const sanitizedKeyword = keyword.trim();
    const escapedKeyword = sanitizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    query.$or = [
      {
        title: { $regex: escapedKeyword, $options: 'i' },
        skipFrom: { $nin: [user._id] }
      },
    ];
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    query.amount = {
      $gte: typeof minPrice === "number" ? minPrice : 0,
      $lte: typeof maxPrice === "number" ? maxPrice : Number.MAX_SAFE_INTEGER,
    };
  }

  const isValidNumber = (n: any) => typeof n === "number" && !isNaN(n);
  if (isValidNumber(maxDistance) && isValidNumber(userLat) && isValidNumber(userLng)) {
    query.location = {
      $geoWithin: {
        $centerSphere: [[userLng!, userLat!], maxDistance / 6378137],
      },
    };
  }

  let posts = await Post.find({
    ...query,
    skipFrom: { $nin: [user._id] },
  })
    .populate("createdBy", "name image")
    .skip(skip)
    .limit(limit)
    .select("-skipFrom")
    .lean();

  const favoriteSet = new Set(user?.favorites.map(fav => fav.toString()));
  posts = posts.map(post => ({
    ...post,
    isFavorite: favoriteSet.has(post._id.toString()),
  }));

  const total = await Post.countDocuments(query);

  if (posts.length === 0 && (!keyword || keyword.trim() === "") && !isValidNumber(maxDistance) && minPrice == null && maxPrice == null) {
    const randomPosts = await Post.aggregate([{ $sample: { size: limit } }]);
    return {
      posts: randomPosts.map(post => ({
        ...post,
        isFavorite: favoriteSet.has(post._id.toString()),
      })),
      total: randomPosts.length,
      page,
      limit,
    };
  }

  return { posts, total, page, limit };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  searchData,
  getPosts,
  getTopSearchedKeywords,
  home_data,
  userReport_request,
  wone_created_suports,
  filterdata,
  getNotifications,
  giveReview,
  getAProfile,
  deleteUser,
  getUnreadCount,
  getPostWithDistance
};