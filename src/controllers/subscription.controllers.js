import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { creatorId } = req.params
    const userId = req.user?._id
    if(!userId) {
        throw new ApiError(401, "User id is required!")
    }


    if(!creatorId) {
        throw new ApiError(400, "Creator id is required!")
    }

    try {
        const subsciption = await Subscription.findOneAndDelete({
            $where: {
                creator: creatorId,
                subscriber: userId
            }
        })
    
        const response = null
        if(subsciption === null) {
            const newSubscription = await Subscription.create({
                creator: creatorId,
                subscriber: userId
            })
    
            response = newSubscription
        }
        response = subsciption
        return res.status(200).json(new ApiResponse(200, response, "Subscription toggled successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while toggling subscription!")
    }
})

const getChannelSubscriptions = asyncHandler(async (req, res) => {
    const { creatorId } = req.params

    if(!creatorId) {
        throw new ApiError(400, "Creator id is required!")
    }

    const channelSubscribers = await Subscription.find({
        $where: {
            creator: creatorId
        }
    })

    if(channelSubscribers.length === 0) {
        throw new ApiError(404, "No subscribers found!")
    }

    return res.status(200).json(new ApiResponse(200, channelSubscribers, "Subscribers fetched successfully!"))
})

const getSubscribedChannels = asyncHandler(async (req, res)=>{
    const { userId } = req.params

    if(!userId) {
        throw new ApiError(400, "User id is required!")
    }

    try {
        const subscribedChannels = await Subscription.find({
            $where: {
                subscriber: userId
            }
        })
    
        if(subscribedChannels.length === 0) {
            throw new ApiError(404, "No channels found!")
        }
    
        return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching subscribed channels!")
    }
})

export {
    toggleSubscription,
    getChannelSubscriptions,
    getSubscribedChannels
}