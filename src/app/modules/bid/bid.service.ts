import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
import { Bids } from '../../../types/bid';
import { User } from '../user/user.model';
import { Post } from '../post/post.model';
import { NotificationModel } from '../notification/notification.model';
import { socketHelper } from '../../../helpers/socketHelper';
import mongoose from 'mongoose';
import { Bid } from './bid.model';
import { Task } from '../task/task.model';
import { BID_STATUS } from '../../../enums/bid';
import { Payment } from '../payments/payment.model';
import { v4 } from 'uuid';

const sendBid = async (
  payload: JwtPayload,
  data: Bids
) => {
  const { id } = payload;

  const userObjId = new mongoose.Types.ObjectId(id);
  const sender = await User.findById(userObjId);
  if (!sender) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found!"
    )
  }

  await checkBidCancellationStatus(sender);

  if (!sender.faceVerifyed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please verify your identity with nid to send a bid!"
    )
  }
  
  if (data.bidOn == "POST" ) {
    const objID = new mongoose.Types.ObjectId(data.postID);
    const post = await Post.findById(objID).lean().exec();
    if (!post) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Post was not found!"
      )
    };
  
    const adventurer = post.createdBy != sender._id ? sender._id : post.createdBy;
    const quizeGiver = post.createdBy == sender._id ? sender._id : post.createdBy;
  
    const bid = await Bid.create({
      adventurer: adventurer,
      quizeGiver: quizeGiver,
      offer_ammount: data.amount,
      createdBy: payload.id,
      reason: data.reason,
      service: post._id
    })
    if (!bid) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Can't create a bid!"
      )
    }
  
    const notification = await NotificationModel.create({
      for: post?.createdBy,
      from: sender._id,
      title: `You got a bid from ${sender.name}`,
      discription: `${data.reason}`
    });
    if (!notification) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Notification not created!"
      )
    }
  
    const populateNotification = await NotificationModel
    .findById(notification._id)
    .populate("from", "name email image")
    .populate("for", "name email image")
    .lean();
  
    const targetSocketId = socketHelper.connectedUsers.get(post!.createdBy!.toString());
    
    // @ts-ignore
    const io = global.io;
  
    if (targetSocketId) {
      io.to(targetSocketId).emit(`socket:notification:${post.createdBy}`, populateNotification);
    }
  
    return notification;
  } else if ( data.bidOn == "BID" ) {

    const objID = new mongoose.Types.ObjectId(data.bidID);
    const existingBId = await Bid.findById(objID)
    if (!existingBId) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Your Given Bid was not exist!"
      )
    }

    existingBId.status = BID_STATUS.DENY;
    
    const newBid = await Bid.create({
      adventurer: existingBId.adventurer,
      createdBy: userObjId,
      service: existingBId.service,
      reason: data.reason,
      offer_ammount: data.amount,
      quizeGiver: existingBId.quizeGiver,
      isInner: true
    })
    
    existingBId.lastBid = newBid._id;
    await existingBId.save();
    
    const post = await Post.findById(newBid.service).lean().exec();
    if (!post) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Post was not found!"
      )
    };

    const notificationFor = sender._id == newBid.adventurer? newBid.quizeGiver : newBid.adventurer

    const notification = await NotificationModel.create({
      for: notificationFor,
      from: sender._id,
      title: `You got a bid from ${sender.name}`,
      discription: `${data.reason}`
    });
    if (!notification) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Notification not created!"
      )
    }
  
    const populateNotification = await NotificationModel
    .findById(notification._id)
    .populate("from", "name email image")
    .populate("for", "name email image")
    .lean();
  
    const targetSocketId = socketHelper.connectedUsers.get(notificationFor.toString());
    
    // @ts-ignore
    const io = global.io;
  
    if (targetSocketId) {
      io.to(targetSocketId).emit(`socket:notification:${notificationFor}`, populateNotification);
    }
  
    return notification;
  }
 
};

const bidRequests = async (
  payload: JwtPayload,
  data: {
    page: number,
    limit: number,
    postID: string,
    filter: "all" | "requested" | "accepted" | "completed" | "canceled"
  }
) => {
  // const { page= 1, limit=60 } = data;
  // const skipCount = (page - 1) * limit;

  if (!data.postID) {
    return await Post.find({
      createdBy: new mongoose.Types.ObjectId(payload.id)
    }).populate("createdBy","name image location").select("-lat -lon").lean();
  }

  const post = await Post.findById( new mongoose.Types.ObjectId(data.postID) ).lean();
  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Your post was not found"
    )
  }

  if (data.filter == "all") {
    const bids = await Bid.find({
      service: post._id,
      isInner: false
    })
    .populate("adventurer","name _id image location")
    .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
    .select("adventurer status offer_ammount reason createdAt lastBid")
    // .skip( skipCount )
    // .limit(limit)
    .lean();
  
    return bids
  } else if ( data.filter == "requested" ) {
    const bids = await Bid.find({
      service: post._id,
      status: BID_STATUS.WATING,
      isInner: false
    })
    .populate("adventurer","name _id image location")
    .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
    .select("adventurer status offer_ammount reason createdAt lastBid")
    // .skip( skipCount )
    // .limit(limit)
    .lean();
  
    return bids
  } else if ( data.filter == "accepted" ) {
    const bids = await Bid.find({
      service: post._id,
      status: BID_STATUS.ACCEPTED,
      isInner: false
    })
    .populate("adventurer","name _id image location")
    .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
    .select("adventurer status offer_ammount reason createdAt lastBid")
    // .skip( skipCount )
    // .limit(limit)
    .lean();
  
    return bids
  }else if ( data.filter == "completed" ) {
    const bids = await Bid.find({
      service: post._id,
      status: BID_STATUS.COMPLETED,
      isInner: false,
      isPaid: true
    })
    .populate("adventurer","name _id image location")
    .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
    .select("adventurer status offer_ammount reason createdAt lastBid")
    // .skip( skipCount )
    // .limit(limit)
    .lean();
  
    return bids
  }else if ( data.filter == "canceled" ) {
    const bids = await Bid.find({
      service: post._id,
      status: BID_STATUS.DENY,
      isInner: false
    })
    .populate("adventurer","name _id image location")
    .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
    .select("adventurer status offer_ammount reason createdAt lastBid")
    // .skip( skipCount )
    // .limit(limit)
    .lean();
  
    return bids
  }
};

const bidRequesteAsAdvengerer = async (
  payload: JwtPayload,
  data: {
    page: number,
    limit: number
    filter: "all" | "requested" | "accepted" | "completed" | "canceled"
  }
) => {
  const user = await User.isValidUser(payload.id);

  // const { page= 1, limit=10 } = data;

  // const skipCount = (page - 1) * limit;

    if ( data.filter == "all" ) {
      const requests = await Bid.find({ 
        adventurer: user._id, 
      })
      .populate({
        path: 'service',
        select: ' _id title amount images description createdAt location address',
      })
      .populate({
        path: 'createdBy',
        select: '_id name image location',
      })
      .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
      .select("-updatedAt -createdAt -__v -createdBy -quizeGiver -adventurer")
      // .skip(skipCount)
      // .limit(limit)
      .lean();
    
      return requests;
    } else if ( data.filter == "requested" ) {
      const requests = await Bid.find({ 
        adventurer: user._id, 
        status: BID_STATUS.WATING,
        isInner: false
      })
      .populate({
        path: 'service',
        select: ' _id title amount images description createdAt location address',
      })
      .populate({
        path: 'createdBy',
        select: '_id name image location',
      })
      .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
      .select("-updatedAt -createdAt -__v -createdBy -quizeGiver -adventurer")
      // .skip(skipCount)
      // .limit(limit)
      .lean();
    
      return requests;
    } else if ( data.filter == "accepted" ) {
      const requests = await Bid.find({ 
        adventurer: user._id, 
        status: BID_STATUS.ACCEPTED,
        isInner: false
      })
      .populate({
        path: 'service',
        select: ' _id title amount images description createdAt location address',
      })
      .populate({
        path: 'createdBy',
        select: '_id name image location',
      })
      .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
      .select("-updatedAt -createdAt -__v -createdBy -quizeGiver -adventurer")
      // .skip(skipCount)
      // .limit(limit)
      .lean();
    
      return requests;
    } else if ( data.filter == "completed" ) {
      const requests = await Bid.find({ 
        adventurer: user._id, 
        isInner: false,
        isPaid: true
      })
      .populate({
        path: 'service',
        select: ' _id title amount images description createdAt location address',
      })
      .populate({
        path: 'createdBy',
        select: '_id name image location',
      })
      .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
      .select("-updatedAt -createdAt -__v -createdBy -quizeGiver -adventurer")
      // .skip(skipCount)
      // .limit(limit)
      .lean();
    
      return requests;
    } else if ( data.filter == "canceled" ) {
      const requests = await Bid.find({ 
        adventurer: user._id, 
        isInner: false,
        status: BID_STATUS.DENY
      })
      .populate({
        path: 'service',
        select: ' _id title amount images description createdAt location address',
      })
      .populate({
        path: 'createdBy',
        select: '_id name image location',
      })
      .populate({
        path: "lastBid",
        select: "adventurer status offer_ammount reason createdAt lastBid",
        populate:{
          path: "adventurer",
          select: "name _id image location"
        }
      })
      .select("-updatedAt -createdAt -__v -createdBy -quizeGiver -adventurer")
      // .skip(skipCount)
      // .limit(limit)
      .lean();
    
      return requests;
    }
};

const intrigateWithBid = async (
  payload: JwtPayload,
  bidID: string,
  action: boolean
) => {

  const userObjId = new mongoose.Types.ObjectId(payload.id);
  const user = await User.findById(userObjId);
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found!"
    )
  }

  await checkBidCancellationStatus(user);

  if (!user.faceVerifyed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please verify your identity with nid to intrigate with a bid!"
    )
  }

  const objID = new mongoose.Types.ObjectId(bidID);
  const bid = await Bid.findById(objID);
  if (!bid) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "BID not founded!"
    )
  };
  if (bid.createdBy == user._id) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "You Can't accept you wone bid!"
    )
  }
  
  if (action == true) {

    
    if (bid.lastBid != null || bid.lastBid != undefined) {

      const innerBid = await Bid.findById(bid.lastBid);
      if (!innerBid) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Inner bid was not exist!"
        )
      }

      const notificaitonFor = user._id == bid.quizeGiver? bid.adventurer : bid.quizeGiver

      const notification = await NotificationModel.create({
        for: notificaitonFor,
        from: payload.id,
        title: `your bit was accepted!`,
        discription: `${bid.reason}`
      })

      if (!notification) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "Notification not created!"
        )
      }
      
      const targetSocketId = socketHelper.connectedUsers.get(notificaitonFor.toString());
      bid.status = BID_STATUS.ACCEPTED;
      
      // @ts-ignore
      const io = global.io;
      if (targetSocketId) {
        io.to(targetSocketId).emit(`socket:notification:${notificaitonFor.toString() }`, notification);
      }

      await bid.save();

      if ( innerBid.status == BID_STATUS.ACCEPTED ) {
        await Task.create({ 
          customer: bid.quizeGiver,
          provider: bid.adventurer,
          service: bid.service,
          bid: bid._id
        })
        
        return {
          message: "bic accepted"
        }
      }


    } else {

      const notificaitonFor = user._id == bid.quizeGiver? bid.adventurer : bid.quizeGiver
  
      const notification = await NotificationModel.create({
        for: notificaitonFor,
        from: payload.id,
        title: `your bit was accepted!`,
        discription: `${bid.reason}`
      })
  
      if (!notification) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "Notification not created!"
        )
      }
      
      const targetSocketId = socketHelper.connectedUsers.get(notificaitonFor.toString());
      bid.status = BID_STATUS.ACCEPTED;
      
      // @ts-ignore
      const io = global.io;
      if (targetSocketId) {
        io.to(targetSocketId).emit(`socket:notification:${notificaitonFor.toString() }`, notification);
      }
  
      await bid.save();
  
      if ( bid.status == BID_STATUS.ACCEPTED ) {
        await Task.create({ 
          customer: bid.quizeGiver,
          provider: bid.adventurer,
          service: bid.service,
          bid: bid._id
        })
        
        return {
          message: "bic accepted"
        }
      }
  
      return {
        message: "bid accepted"
      };
    }

  } else if (action == false) {

    if (bid.lastBid != null || bid.lastBid != undefined) {

      const innerBid = await Bid.findById(bid.lastBid);
      if (!innerBid) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          "Inner bid was not exist!"
        )
      }

      const notificaitonFor = user._id == bid.quizeGiver? bid.adventurer : bid.quizeGiver

      const notification = await NotificationModel.create({
        for: notificaitonFor,
        from: payload.id,
        title: `your bit was accepted!`,
        discription: `${bid.reason}`
      })

      if (!notification) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "Notification not created!"
        )
      }
      
      const targetSocketId = socketHelper.connectedUsers.get(notificaitonFor.toString());
      bid.status = BID_STATUS.DENY;
      
      // @ts-ignore
      const io = global.io;
      if (targetSocketId) {
        io.to(targetSocketId).emit(`socket:notification:${notificaitonFor.toString() }`, notification);
      }

      await bid.save();

      if ( innerBid.status == BID_STATUS.DENY ) {
        await Task.create({ 
          customer: bid.quizeGiver,
          provider: bid.adventurer,
          service: bid.service,
          bid: bid._id
        })
        
        return {
          message: "bic accepted"
        }
      }


    } else {

      const notification = await NotificationModel.create({
        for: bid.adventurer,
        from: payload.id,
        title: `your bit was Deny!`,
        discription: `${bid.reason}`,
      })
      if (!notification) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "Notification not created!"
        )
      }

      if (payload.id == bid.adventurer) {
        bid.status = BID_STATUS.DENY;
      } 

      await bid.save();

      const targetSocketId = socketHelper.connectedUsers.get(bid.createdBy.toString());
      
      // @ts-ignore
      const io = global.io;

      if (targetSocketId) {
        io.to(targetSocketId).emit(`socket:notification:${bid.createdBy.toString()}`, notification);
      }    

      return {
        message: "Your bid was cansaled"
      };
    }
  }
};

const paytheBid = async (
  payload: JwtPayload,
  bidID: string
) => {

  const objID = new mongoose.Types.ObjectId(bidID);
  const bid = await Bid.findById(objID);
  if (!bid) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "BID not founded!"
    )
  }

  const quizegiver = await User.findById(bid.quizeGiver);
  if (!quizegiver) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "QuizeGiver not founded!"
    )
  }

  const userObjId = new mongoose.Types.ObjectId(payload.id);
  const user = await User.findById(userObjId);
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not founded!"
    )
  }

  const adventurerObjId = new mongoose.Types.ObjectId(bid.adventurer);
  const adventurer = await User.findById(adventurerObjId);
  if (!adventurer) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Adventurer not founded!"
    )
  }

  if( bid.quizeGiver.toString() != user._id.toString() ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are not the quizeGiver!"
    )
  }

  if (user.balance < bid.offer_ammount) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You don't have enough balance to pay the adventurer! at first add balance to your account!"
    )
  }

  const commission = bid.offer_ammount * 0.10;

  const task = await Task.findOne({bid: bid._id});
  if (!task) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Task not found!"
    )
  }

  const uniqueID = v4().replace(/-/g, '').slice(0, 16);;

  const paytment = await Payment.create({
    taskID:task,
    transactionId: uniqueID,
    commission
  })

  user.balance -= bid.offer_ammount;
  user.totalSpent += bid.offer_ammount;
  adventurer.totalEarn += bid.offer_ammount;
  adventurer.balance += bid.offer_ammount;
  bid.isPaid = true;
  bid.status = BID_STATUS.COMPLETED;

  quizegiver.complitedTasks.push(task._id);
  adventurer.complitedTasks.push(task._id);
  
  await bid.save();
  await user.save();
  await quizegiver.save();
  await adventurer.save();

  return paytment;
};

const getPayDetails = async (
  payload: JwtPayload,
  bidID: string
) => {
  const objID = new mongoose.Types.ObjectId(bidID);

  const bid = await Bid.findById(objID)
    .populate({
      path: "service",
      select: "title amount createdAt description address",
    })
    .populate("createdBy", "name email image location reviews contact")
    .lean();

  if (!bid) {
    throw new ApiError(StatusCodes.NOT_FOUND, "BID not found!");
  }

  const createdBy: any = { ...bid.createdBy };

  if (createdBy?.reviews?.length > 0) {
    const stars = createdBy.reviews.map((r: any) => r.star);
    createdBy.avgRating =
      stars.reduce((a: number, b: number) => a + b, 0) / stars.length;
  } else {
    createdBy.avgRating = 0;
  }

  const post = await Post.findById( bid.service );

  delete createdBy.reviews;

 return {
    createdBy,
    service: bid.service,
    subTotal: bid.offer_ammount,
    bidId: bid._id,
    appFee: bid.offer_ammount * 0.10,
    total: bid.offer_ammount + bid.offer_ammount * 0.10,
    location: post?.location
  };
};

const checkBidCancellationStatus = async (user: any) => {
  
  if (user.bidCancelation.bannedFor > new Date(Date.now())) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are not allowed to perform this action because you are blocked for 3 days."
    )
  }

  if (user.bidCancelation.bannedFor < new Date(Date.now())) {
    user.bidCancelation.bidCancelationAvailable = 3;
    user.bidCancelation.bannedFor = null;
    await user.save();
  }

  if (user.bidCancelation.bidCancelationAvailable <= 0) {
    user.bidCancelation.bannedFor = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); 
    await user.save();
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You have no cancellations left. You are blocked for 3 days."
    )
  }
};

const cancelTask = async (payload: JwtPayload, bidID: string) => {
  const objID = new mongoose.Types.ObjectId(bidID);
  const bid = await Bid.findById(objID);
  if (!bid) {
    throw new ApiError(StatusCodes.NOT_FOUND, "BID not found!");
  }

  if (bid.adventurer.toString() != payload.id && bid.quizeGiver.toString() != payload.id) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are not the adventurer or quizeGiver of this bid!"
    )
  }

  const userObjId = new mongoose.Types.ObjectId(payload.id);
  const user = await User.findById(userObjId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  await checkBidCancellationStatus(user);

  user.bidCancelation.bidCancelationAvailable -= 1;
  bid.isCanceled = true;
  await bid.save();
  await user.save();

  return true;
};

const removeBid = async (
  payload: JwtPayload,
  id: string,
) => {

  const find = await Bid.findById(id);
  if (!find) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Bid Not Founded"
    )
  }

  if (
    find.createdBy.toString() != payload.id
  ) {
    throw new ApiError(
      StatusCodes.NON_AUTHORITATIVE_INFORMATION,
      "You are not abal to delete this bid"
    )    
  }

  await Bid.findByIdAndDelete(find._id);
  return true
};

const aggryWithTask = async (
  payload: JwtPayload,
  id: string,
) => {
  const user = await User.findById( new mongoose.Types.ObjectId( payload.id ));
  if (!user) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not found!"
    )
  }

  const post = await Post.findById( new mongoose.Types.ObjectId( id ) );
  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not founded!"
    )
  }

  const bid = await Bid.create({
    adventurer: user._id,
    isInner: false,
    offer_ammount: post.amount,
    service: post._id,
    status: BID_STATUS.ACCEPTED,
    reason: "Agree with post offer",
    createdBy: user._id
  });
  if (!bid) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Bid not created!"
    )
  }

  const notification = await NotificationModel.create({
    for: post.createdBy,
    from: user._id,
    title: `A Adventurer agree with your post contract!`,
    discription: post.description
  });
  if (!notification) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "Notification not created!"
    )
  }
  
  const populateNotification = await NotificationModel
  .findById(notification._id)
  .populate("from", "name email image")
  .populate("for", "name email image")
  .lean();
  
  const targetSocketId = socketHelper.connectedUsers.get(notification.for.toString());
    
  // @ts-ignore
  const io = global.io;
  
  if (targetSocketId) {
    io.to(targetSocketId).emit(`socket:notification:${notification.for.toString()}`, populateNotification);
  }
  
  return notification;
  
}

export const BidService = {
  sendBid,
  removeBid,
  aggryWithTask,
  getPayDetails,
  paytheBid,
  cancelTask,
  bidRequests,
  intrigateWithBid,
  bidRequesteAsAdvengerer,
  checkBidCancellationStatus
};