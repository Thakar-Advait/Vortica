import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { videoId } = req.params

    if (!userId) {
        throw new ApiError(401, "Unauthrized request!")
    }

    const user = await Like.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        }
    ])

    if (user.length === 0) {
        throw new ApiError(404, "User not found")
    }

    if (!userId || !videoId) {
        throw new ApiError(400, "All fields are required!")
    }
    const toggledLike = null
    try {
        const like = await Like.findOneAndDelete({
            $where: {
                userId: new mongoose.Types.ObjectId(userId),
                videoId: new mongoose.Types.ObjectId(videoId)
            }
        })

        if (!like) {
            const newLike = await Like.create({
                userId: new mongoose.Types.ObjectId(user._id),
                videoId: new mongoose.Types.ObjectId(videoId)
            })
            toggledLike = newLike
        }
        else {
            toggledLike = like
        }

        return res.status(200).json(new ApiResponse(200, toggledLike, "Like toggled successfully"))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while toggling video like")
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { tweetId } = req.params

    if (!userId) {
        throw new ApiError(401, "Unauthrized request!")
    }

    const user = await Like.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        }
    ])

    if (user.length === 0) {
        throw new ApiError(404, "User not found")
    }

    if (!userId || !tweetId) {
        throw new ApiError(400, "All fields are required!")
    }
    const toggledLike = null
    try {
        const like = await Like.findOneAndDelete({
            $where: {
                userId: new mongoose.Types.ObjectId(user._id),
                tweetId: new mongoose.Types.ObjectId(tweetId)
            }
        })

        if (!like) {
            const newLike = await Like.create({
                userId: new mongoose.Types.ObjectId(userId),
                tweetId: new mongoose.Types.ObjectId(tweetId)
            })
            toggledLike = newLike
        }
        else {
            toggledLike = like
        }

        return res.status(200).json(new ApiResponse(200, toggledLike, "Like toggled successfully"))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while toggling tweet like")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { commentId } = req.params

    if (!userId) {
        throw new ApiError(401, "Unauthrized request!")
    }

    const user = await Like.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        }
    ])

    if (user.length === 0) {
        throw new ApiError(404, "User not found")
    }

    if (!userId || !commentId) {
        throw new ApiError(400, "All fields are required!")
    }
    const toggledLike = null
    try {
        const like = await Like.findOneAndDelete({
            $where: {
                userId: new mongoose.Types.ObjectId(user._id),
                commentId: new mongoose.Types.ObjectId(commentId)
            }
        })

        if (!like) {
            const newLike = await Like.create({
                userId: new mongoose.Types.ObjectId(userId),
                commentId: new mongoose.Types.ObjectId(commentId)
            })
            toggledLike = newLike
        }
        else {
            toggledLike = like
        }

        return res.status(200).json(new ApiResponse(200, toggledLike, "Like toggled successfully"))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while toggling comment like")
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "Unauthrized request!")
    }

    try {
        const user = await Like.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ])
    
        if (user.length === 0) {
            throw new ApiError(404, "User not found")
        }
    
        const likedVideos = await Like.find({
            $where: {
                userId: new mongoose.Types.ObjectId(user._id),
                videoId: new mongoose.Types.ObjectId(videoId)
            }
        })
    
        if(likedVideos.length === 0) {
            throw new ApiError(404, "No liked videos found")
        }
    
        return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching liked videos")
    }
})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideos
}