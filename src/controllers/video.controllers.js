import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, userId } = req.query

    if (!userId) {
        throw new ApiError(400, "User id is required!")
    }

    if ([sortBy, sortType].some((field) => {
        return field === null
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    try {
        const userVideos = await Video.aggregate([
            {
                $match: {
                    creatorId: mongoose.Types.ObjectId(userId),
                    isPublished: true
                }
            },
            {
                $sort: {
                    sortBy: sortType
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ])

        if (userVideos.length === 0) {
            throw new ApiError(404, "No videos found")
        }

        return res.status(200).json(new ApiResponse(200, userVideos, "Videos fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching the videos!")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User id is required!")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found!")
    }

    const { title, description } = req.body
    const vidoeFileLocalePath = req.file?.video[0]?.path
    const videoThumbnailLocalePath = req.file?.thumbnail[0]?.path

    if ([title, description, vidoeFileLocalePath, videoThumbnailLocalePath].some((field) => {
        return field === null
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    try {
        try {
            const uploadedVideo = await uploadToCloudinary(vidoeFileLocalePath, {
                resource_type: "video"
            })
            const uploadedThumbnail = await uploadToCloudinary(videoThumbnailLocalePath)

            if (!uploadedVideo || !uploadedThumbnail) {
                throw new ApiError(500, "Something went wrong while uploading the video!")
            }
        } catch (error) {
            throw new ApiError(500, "Something went wrong while uploading the video to cloudinary!")
        }

        const video = await Video.create({
            videoFile: uploadedVideo.url,
            thumbnail: uploadedThumbnail.url,
            title: title,
            description: description,
            duration: 0,
            creatorId: new mongoose.Types.ObjectId(userId)
        })

        if (!video) {
            throw new ApiError(500, "Something went wrong while publishing the video!")
        }

        return res.status(200).json(new ApiResponse(200, video, "Video published successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while publishing the video!")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required!")
    }

    try {
        const video = await Video.findById(videoId).where({
            isPublished: true
        })

        if (!video) {
            throw new ApiError(404, "Video not found!")
        }

        return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching the video!")
    }
})

const updateVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const userId = req.user?._id

    const updatedData = {}

    if (!userId) {
        throw new ApiError(401, "User id is required!")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found!")
    }

    if (video.creatorId !== userId) {
        throw new ApiError(403, "You are not authorized to update this video!")
    }

    if (title && title.trim() !== "") {
        updatedData.title = title
    }

    if (description && description.trim() !== "") {
        updatedData.description = description
    }

    try {
        const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedData, {
            new: true
        })

        if (!updatedVideo) {
            throw new ApiError(500, "Something went wrong while updating the video!")
        }

        return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating the video!")
    }
})

const deleteVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User id is required!")
    }

    try {
        const video = await Video.findById(videoId)
    
        if (!video) {
            throw new ApiError(404, "Video not found!")
        }
    
        if (video.creatorId !== userId) {
            throw new ApiError(403, "You are not authorized to delete this video!")
        }
    
        const deletedVideo = await Video.findByIdAndDelete(videoId)
    
        if (!deletedVideo) {
            throw new ApiError(500, "Something went wrong while deleting the video!")
        }
    
        return res.status(200).json(new ApiResponse(200, deletedVideo, "Video deleted successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting the video!")
    }
})

const getAllUserVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType } = req.query

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "User id is required!")
    }

    if ([sortBy, sortType].some((field) => {
        return field === null
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    try {
        const userVideos = await Video.aggregate([
            {
                $match: {
                    creatorId: new mongoose.Types.ObjectId(userId),
                }
            },
            {
                $sort: {
                    sortBy: sortType
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ])

        if (userVideos.length === 0) {
            throw new ApiError(404, "No videos found")
        }

        return res.status(200).json(new ApiResponse(200, userVideos, "Videos fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching the videos!")
    }
})

const togglePublishedVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User id is required!")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found!")
    }

    if (video.creatorId !== userId) {
        throw new ApiError(403, "You are not authorized to update this video!")
    }

    try {
        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            isPublished: !video.isPublished
        }, {
            new: true
        })

        if (!updatedVideo) {
            throw new ApiError(500, "Something went wrong while updating the video!")
        }

        return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating the video!")
    }
})

export {
    getAllVideos,
    getVideoById,
    publishAVideo,
    updateVideoById,
    deleteVideoById,
    getAllUserVideos,
    togglePublishedVideo
}