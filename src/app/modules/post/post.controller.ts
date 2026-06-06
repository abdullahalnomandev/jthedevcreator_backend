import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { PostService } from './post.service';
import ApiError from '../../../errors/ApiError';

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const user = req.user;

    const images = getMultipleFilesPath(req.files,"image")
    
    const data = {
      images,
      ...userData
    }

    const result = await PostService.createPost(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the post',
      data: result,
    });
  }
);

const aPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postID = req.params.id;
    const user = req.user;

    const result = await PostService.aPost(user,postID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully created the post',
      data: result,
    });
  }
);

const updateAPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    
    const user = req.user;
    const images = getMultipleFilesPath(req.files,"image")

    const data = {
      images,
      ...userData
    }

    const result = await PostService.updatedPost(user,data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully updated the post',
      data: result,
    });
  }
);

const lastPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { limit, page } = req.body;

    const result = await PostService.lastPosts(user,limit,page);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get latest post',
      data: result,
    });
  }
);

const favorites = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { limit, page } = req.body;

    const result = await PostService.getFavorite(user,limit,page);
    
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get favorite posts',
      data: result,
    });
  }
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const postID = req.params.id;

    if (!postID) {
      throw new ApiError(344,"This is an error")
    }
    const result = await PostService.deletePost(user,postID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully deleted the post',
      data: result,
    });
  }
);

const addFavorites = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const postID = req.params.id;

    if (!postID) {
      throw new ApiError(344,"This is an error")
    }
    const result = await PostService.addToFavorite(user,postID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully added on the favorites!',
      data: result,
    });
  }
);

const removeFavorites = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const postID = req.params.id;

    if (!postID) {
      throw new ApiError(344,"This is an error")
    }
    const result = await PostService.removeFromFavorite(user,postID);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully removed from the favorites!',
      data: result,
    });
  }
);

const getWonePosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const data = req.body;
    const result = await PostService.woneCreatedPosts(user, data.page, data.limit);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get wone created posts!',
      data: result,
    });
  }
);

const getPostWithCodinats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.user.id;
    
    const result = await PostService.postDataWithCordinats( id );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully get posts!',
      data: result,
    });
  }
);

const skipPostID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.user.id;
    const postId = req.params.id;

    const result = await PostService.skipFrom( id, postId );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Successfully skip posts!',
      data: result,
    });
  }
);

export const PostController = { 
  createPost,aPost,updateAPost,lastPosts,getWonePosts, skipPostID,
  favorites,addFavorites,removeFavorites,deletePost,getPostWithCodinats
};