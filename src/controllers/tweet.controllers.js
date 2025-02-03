import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { content } = req.body

    if(!userId) {
        throw new ApiError(401, "User id is required!")
    }

    try {
        const createdTweet = await Tweet.create({
            creatorId: userId,
            content: content
        })
    
        return res.status(200).json(new ApiResponse(200, createdTweet, "Tweet created successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating the tweet!")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "User id is required!")
    }

    if([tweetId, content].some((field)=>{
        return field === null
    })) {
        throw new ApiError(400, "All fields are required!")
    }

    try {
        const tweet = await Tweet.findByIdAndUpdate(tweetId)
        if(!tweet) {
            throw new ApiError(404, "Tweet not found!")
        }
        if(tweet.creatorId !== userId) {
            throw new ApiError(401, "You are not authorized to update this tweet!")
        }
        tweet.content = content
        await tweet.save({validateBeforeSave: false})
    
        return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating the tweet!")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "User id is required!")
    }

    if(!tweetId) {
        throw new ApiError(400, "Tweet id is required!")
    }

    try {
        const tweet = await Tweet.findById(tweetId)
        if(!tweet) {
            throw new ApiError(404, "Tweet not found!")
        }
        else if(tweet.creatorId !== userId) {
            throw new ApiError(401, "You are not authorized to delete this tweet!")
        }
    
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    
        return res.status(200).json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting the tweet!")
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if(!userId) {
        throw new ApiError(400, "User id is required!")
    }

    try {
        const userTweets = await Tweet.find({
            $where: {
                creatorId: userId
            }
        })
    
        if(userTweets.length === 0) {
            throw new ApiError(404, "No tweets found!")
        }
    
        return res.status(200).json(new ApiResponse(200, userTweets, "Tweets fetched successfully!"))
    } catch (error) {
        throw new ApiResponse(500, "Something went wrong while fetching the tweets!")
    }
})

export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweets
}