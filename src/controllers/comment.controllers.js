import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    try {
        const comments = await Comment.aggregate([
            {
                $match: {
                    videoId: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ])
    
        if(comments.length === 0) {
            throw new ApiError(404, "No comments found")
        }
        
        return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching comments")
    }
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { ownerId, content } = req.body

    const userId = req.user?._id

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    else if (userId !== ownerId) {
        throw new ApiError(401, "Unauthorized request")
    }

    if ([videoId, ownerId, content].some((field) => {
        return !field || field === ""
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    try {
        const comment = await Comment.create({
            videoId: videoId,
            owner: ownerId,
            content: content
        })
    
        const createdComment = await Comment.findById(comment._id)
    
        if (!createdComment) {
            throw new ApiError(500, "Something went wrong while creating comment")
        }
    
        return res.status(200).json(new ApiResponse(200, createdComment, "Comment created successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating comment")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { commentId, updatedContent } = req.body

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "Unauthorized request")
    }

    if ([videoId, commentId, updatedId].some((field) => {
        return !field || field === ""
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    try {
        const comment = await Comment.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(commentId)
                }
            }
        ])
    
        if (comment.length === 0) {
            throw new ApiError(404, "Comment not found")
        }
    
        if (userId !== comment[0].owner) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        try {
            const updatedComment = await Comment.findByIdAndUpdate(comment[0]?._id, {
                content: updatedContent
            }, {
                new: true
            })
        
            if (!updatedComment) {
                throw new ApiError(500, "Something went wrong while updating comment")
            }
        
            return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
        } catch (error) {
            throw new ApiError(500, "Something went wrong while updating comment")
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { commentId } = req.query

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User Id is required")
    }

    if ([videoId, commentId].some((field) => {
        return !field || field === ""
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    else if (comment.owner !== userId) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const deletedComent = await Comment.findByIdAndDelete(commentId)
    
        if (!deletedComent) {
            throw new ApiError(500, "Something went wrong while deleting comment")
        }
    
        return res.status(200).json(new ApiResponse(200, deletedComent, "Comment deleted successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting comment")
    }
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}