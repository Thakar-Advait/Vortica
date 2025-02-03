import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res)=>{
    const { creatorId } = req.params;

    if(!creatorId) {
        throw new ApiError(400, "User Id is required")
    }

    try {
        const creator = await User.findById(creatorId)
    
        if(!creator) {
            throw new ApiError(404, "Creator not found")
        }
    
        const totalChannelViews = await Video.aggregate([
            {
                $match: {
                    creatorId: creatorId
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: {
                        $sum: "$views"
                    }
                }
            }
        ])
    
        const totalChannelSubscribers = await Subscription.aggregate([
            {
                $match: {
                    creator: creatorId
                }
            }, 
            {
                $group: {
                    _id: null,
                    totalSubscribers: {
                        $sum: 1
                    }
                }
            }
        ])
    
        const totalVideos = await Video.find({
            $where: {
                creatorId: creatorId
            }
        })
    
        const totalVideoLikes = await User.aggregate([
            {
                $match: {
                    _id: creatorId
                }
            },
            {
                $lookup: {
                    from: "video",
                    localField: "_id",
                    foreignField: "creatorId",
                    as: "userVideos",
                    pipeline: [
                        {
                            $lookup: {
                                from: "like",
                                localField: "_id",
                                foreignField: "videoId",
                                as: "totalLikesOnUserVideos"
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalVideoLikes: {
                                    $sum: 1
                                }
                            }
                        }
                    ]
                }
            }
        ])
    
        const totalTweetLikes = await User.aggregate([
            {
                $match: {
                    _id: creatorId
                }
            },
            {
                $lookup: {
                    from: "tweet",
                    localField: "_id",
                    foreignField: "creatorId",
                    as: "userTweets",
                    pipeline: [
                        {
                            $lookup: {
                                from: "like",
                                localField: "_id",
                                foreignField: "tweetId",
                                as: "totalLikesOnUserTweets"
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalVideoLikes: {
                                    $sum: 1
                                }
                            }
                        }
                    ]
                }
            }
        ])
    
        const totalCommentLikes = await User.aggregate([
            {
                $match: {
                    _id: creatorId
                }
            },
            {
                $lookup: {
                    from: "comment",
                    localField: "_id",
                    foreignField: "creatorId",
                    as: "userComments",
                    pipeline: [
                        {
                            $lookup: {
                                from: "like",
                                localField: "_id",
                                foreignField: "commentId",
                                as: "totalLikesOnUserComments"
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalVideoLikes: {
                                    $sum: 1
                                }
                            }
                        }
                    ]
                }
            }
        ])
    
        const response = {
            creator: creatorId,
            totalChannelViews,
            totalChannelSubscribers,
            totalVideos,
            totalVideoLikes,
            totalTweetLikes,
            totalCommentLikes
        }
    
        return res.status(200).json(new ApiResponse(200, response, "Channel stats fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching channel stats")
    }
})

const getChannelVideos = asyncHandler(async (req, res)=>{
    const { creatorId } = req.params

    if(!creatorId) {
        throw new ApiError(400, "Creator id is required!")
    }

    try {
        const channelVideos = await Video.find({
            $where: {
                creatorId: creatorId
            }
        })
    
        if(channelVideos.length === 0) {
            throw new ApiError(404, "No videos found!")
        }
    
        return res.status(200).json(new ApiResponse(200, channelVideos, "Videos fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching the videos!")
    }
})

export {
    getChannelStats,
    getChannelVideos
}