import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../errors/ApiError";
import { updatePostT } from "../../../types/post";
import { User } from "../user/user.model";
import unlinkFile from "../../../shared/unlinkFile";
import { Post } from "./post.model";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import { postInterface } from "./post.interface";

const createPost = async (
    payload: JwtPayload,
    data: postInterface
) => {
    try {

        const objid = new Types.ObjectId(payload.id);
        const user = await User.findById(objid);

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "User not found!"
            )
        }

        if (!user.faceVerifyed) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Please verify your identity with nid to create a post!"
            )
        }

        if( user.balance < data.amount ) throw new ApiError(StatusCodes.BAD_REQUEST,"You don't have enough balance to create a post!, you must add balance to your account!")
        
        data.createdBy = new Types.ObjectId( user._id )

        //@ts-ignore
        data.address = data.location

        const lon = Number(data.lng);
        const lat = Number(data.lat);

        if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid latitude or longitude");
        }

        const postPayload = {
            ...data,
            address: data.location, 
            location: {
                type: "Point",
                coordinates: [lon, lat],
            },
        };

        const createdPost = await Post.create(postPayload);

        user.totalPosts.push(createdPost._id);
        await user.save();
        
        return createdPost
        
    } catch (error: any) {
        
        data.images.map( e => unlinkFile(e) );

        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            error.message
        )
    }
};

const woneCreatedPosts = async (
    payload: JwtPayload, 
    page: number = 1,  
    limit: number = 10   
) => {
    const user = await User.isValidUser(payload.id);

    const skipCount = (page - 1) * limit;

    const posts = await Post.find({ createdBy: user._id })
        .skip(skipCount)
        .limit(limit)
        .lean() 
        .exec();

    return posts;
};

const aPost = async (
    payload: JwtPayload,
    postId: any
) => {

    await User.isValidUser(payload.id);

    const isPostExist = await Post
                                .findById(postId)
                                .populate("createdBy","reviews image email name _id")
                                .select("-lat -lot -__v")
    if (!isPostExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Post dos't exist!"
        )
    }

    return isPostExist
};

const updatedPost = async (payload: JwtPayload, data: updatePostT) => {
  await User.isValidUser(payload.id);

  const isPostExist = await Post.findById(data.postId);
  if (!isPostExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Post not found");
  }

  // --- Handle oldImages properly ---
  if (typeof data.oldImages === "string") {
    try {
      data.oldImages = JSON.parse(data.oldImages);
    } catch (e) {
      data.oldImages = [data.oldImages];
    }
  }

  const oldImages: string[] = Array.isArray(data.oldImages) ? data.oldImages : [];
  const newImages: string[] = Array.isArray(data.images) ? data.images : [];

  if (oldImages.length || newImages.length) {
    isPostExist.images = [...oldImages, ...newImages];
  }

  if (data.title) isPostExist.title = data.title;
  if (data.description) isPostExist.description = data.description;
  if (data.amount) isPostExist.amount = Number(data.amount);

  if (data.location && typeof data.location === "string") {
    isPostExist.address = data.location;
  }

  if (data.lat && data.lng) {
    const lat = Number(data.lat);
    const lon = Number(data.lng);

    if (isNaN(lat) || isNaN(lon) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid latitude or longitude");
    }

    isPostExist.location = {
      type: "Point",
      coordinates: [lon, lat], // correct order
    };
  }

  if (data.deadline) {
    // @ts-ignore
    isPostExist.deadline = parseNullableDate(data.deadline);
  }
  if (data.work_time) {
    // @ts-ignore
    isPostExist.work_time = parseNullableDate(data.work_time);
  }

  await isPostExist.save();
  return isPostExist;
};

function parseNullableDate(value: string | null | undefined) {
  if (!value || value === "null") return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
};

const lastPosts = async (
    user: JwtPayload,
    limit: number,
    page: number
) => {
    const userFromDB = await User.isValidUser(user.id);
    
    const skipCount = (page - 1) * limit;

    const posts = await Post.find({ createdBy: userFromDB._id })
        .populate("createdBy","name email image")
        .select(" -lat -lot")
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 });

    return posts;
};

const addToFavorite = async (
  user: JwtPayload,
  postID: string
): Promise<boolean> => {
    
  const userFromDB = await User.findById(user.id);
  if (!userFromDB) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid user");
  }

  const post = await Post.findById(postID);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const isAlreadyFavorite = userFromDB.favorites?.some(
    (favPostId: any) => favPostId.toString() === postID
  );

  if (isAlreadyFavorite) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Post already favorited");
  }

  userFromDB.favorites.push(post._id);
  await userFromDB.save();

  return true;
};

const deletePost = async (
    user: JwtPayload,
    postID: string
) => {
    console.log(postID)
    const userFromDB = await User.isValidUser(user.id);
    const isPostExist = await Post.findById(postID);
    if (!isPostExist) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "Post not founded!"
        )
    };

    await Post.deleteOne({ _id: postID });

    return true
};

const getFavorite = async (
  user: JwtPayload,
  limit: number,
  page: number
) => {
  const userFromDB = await User.isValidUser(user.id);

  if (!userFromDB?.favorites || userFromDB.favorites.length === 0) {
    return [];
  }

  const skipCount = (page - 1) * limit;

  const favorites = await Post.find({ _id: { $in: userFromDB.favorites } })
    .select("-location -__v")
    .populate({
      path: "createdBy",
      select: "name email image"
    })
    .skip(skipCount)
    .limit(limit)
    .lean();

  return favorites.map((fav: any) => ({
    ...fav,
    createdBy: fav.createdBy ? {
      name: fav.createdBy.name,
      email: fav.createdBy.email,
      image: fav.createdBy.image
    } : null
  }));
};

const removeFromFavorite = async (
    payload: JwtPayload,
    id: any
) => {

    const user = await User.findById(payload.id);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not found!"
        )
    }

    const isFavorite = user.favorites.includes(id);
    if (!isFavorite) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Post not found in favorites!"
        );
    }

    user.favorites = user.favorites.filter( e => e != id );

    user.save();

    return false
};

const postDataWithCordinats = async ( id: string ) => 
  await Post
    .find({ createdBy: { $ne: new mongoose.Types.ObjectId( id )}})
    .sort({ createdAt: -1 })
    .populate("createdBy", "geoLocation name image")
    .select("-lat -lot")
.lean();

const skipFrom = async (user: string, id: string) => {
  const post = await Post.findById(new mongoose.Types.ObjectId(id));
  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "The post was not available!"
    );
  }

  const userId = new mongoose.Types.ObjectId(user);

  // check if user already in skipFrom
  if (!post.skipFrom.some(existing => existing.equals(userId))) {
    post.skipFrom.push(userId);
    await post.save();
  }

  return post.skipFrom;
};

export const PostService = {
    createPost,
    postDataWithCordinats,
    aPost,
    skipFrom,
    updatedPost,
    removeFromFavorite,
    lastPosts,
    addToFavorite,
    getFavorite,
    woneCreatedPosts,
    deletePost
};