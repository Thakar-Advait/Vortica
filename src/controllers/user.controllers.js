import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { Mongoose } from "mongoose";

const getAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const access_token = await user.generateAccessToken()
        const refresh_token = await user.generateRefreshToken()

        user.refreshToken = refresh_token
        await user.save({ validateBeforeSave: false })

        return { access_token, refresh_token }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullname, email, username, password } = req.body
    // console.log(req.body);
    // console.log(req.files)
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

    // console.log(avatarLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Something went wrong with cloudinary")
    }


    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
    } catch (error) {
        await deleteFromCloudinary(avatar.public_id)
        await deleteFromCloudinary(coverImage.public_id)
        new ApiResponse(501, "User cannot be registered! All resources deleted from cloudinary!")
    }

})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if ([username, email, password].some((field) => {
        return field?.trim() === ""
    })) {
        throw new ApiError(400, "All fields are required")
    }

    console.log(username, email, password);

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    console.log(user);

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect credentials")
    }

    const { access_token, refresh_token } = await getAccessAndRefreshTokens(user._id)

    user.refreshToken = refresh_token
    await user.save({ validateBeforeSave: false })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("access_token", access_token, options)
        .cookie("refresh_token", refresh_token, options)
        .json(new ApiResponse(200, {
            loggedInUser,
            access_token,
            refresh_token
        }, "User logged in successfully"))
})

const refreshToken = asyncHandler(async (req, res) => {
    const refresh = req.cookies.refresh_token || req.body.refresh_token

    if (!refresh) {
        throw new ApiError(400, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            refresh,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (user?.refreshToken !== refresh) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const { access_token, refresh_token } = await getAccessAndRefreshTokens(user._id)

        user.refresh_token = refresh_token
        await user.save({ validateBeforeSave: false })


        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
            .status(200)
            .cookie("access_token", access_token, options)
            .cookie("refresh_token", refresh_token, options)
            .json(new ApiResponse(200, {
                access_token,
                refresh_token
            }, "Tokens issued successfully"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing acces token")
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if (!userId) {
        throw new ApiError(404, "User Id not found while trying to log out the user")
    }

    await User.findByIdAndUpdate(userId, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    res.status(200)
        .clearCookie("access_token", options)
        .clearCookie("refresh_token", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const updateCurrentPassword = asyncHandler(async (req, res) => {
    const { newPassword, currentPassword } = req.body

    if ([newPassword, currentPassword].some((field) => {
        return field?.trim() === ""
    })) {
        throw new ApiError(400, "All fields are required to change the password!")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(404, "User Id not found while trying to update the password!")
    }

    try {
        const user = await User.findById(userId).select("-refreshToken")
        if (!user) {
            throw new ApiError(404, "User not found while updating password!")
        }
        const isValidPassword = await user.isPasswordCorrect(currentPassword)
        if (!isValidPassword) {
            throw new ApiError(401, "Current password does not match the one in the database!")
        }
    } catch (error) {
        throw new ApiError(502, "Something went wrong while fetching user details from database to change the current password!")
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                password: newPassword
            }
        }, {
            new: true
        })
        return res.status(200).json(new ApiResponse(200, updatedUser, "Password updated successfully!"))
    } catch (error) {
        throw new ApiError(502, "Something went wrong while updating the password!")
    }
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user?._id

    if (!user) {
        throw new ApiError(404, "No user found in the request!")
    }

    res.status(200).json(new ApiResponse(200, user, "User details fetched successfully!"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullname } = req.body

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(404, "User Id not found while trying to update the account details!")
    }

    if (!email && !fullname) {
        throw new ApiError(400, "Either/Both email and fullname is required!")
    }

    try {
        if (email) {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    email
                }
            })
        }
        if (fullname) {
            await User.findByIdAndUpdate(userId, {
                $set: {
                    fullname
                }
            })
        }
    } catch (error) {
        throw new ApiError(502, "Something went wrong while updating the account details!")
    }

    const updatedUser = await User.findById(userId).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully!"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(404, "User Id not found while trying to update the account details!")
    }

    const avatarLocalPath = req.file?.path

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!")
    }

    try {
        const avatar = await uploadToCloudinary(avatarLocalPath)

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                avatar: avatar?.url
            }
        }, {
            new: true
        }).select("-password -refreshToken")

        return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar updated successfully!"))
    } catch (error) {
        throw new ApiError(502, "Something went wrong while updating the avatar!")
    }
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(404, "User Id not found while trying to update the account details!")
    }

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Avatar file is required!")
    }

    try {
        const coverImage = await uploadToCloudinary(coverImageLocalPath)

        const updatedUser = await User.findByIdAndUpdate(userId, {
            $set: {
                coverImage: coverImage?.url
            }
        }, {
            new: true
        }).select("-password -refreshToken")

        return res.status(200).json(new ApiResponse(200, updatedUser, "Cover Image updated successfully!"))
    } catch (error) {
        throw new ApiError(502, "Something went wrong while updating the cover image!")
    }
})

const getChannelFromUsername = asyncHandler(async (req, res) => {
    const { username } = req.params

    if(!username) {
        throw new ApiError(400, "Username is required!")
    }

    const channelDetails = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase().trim()
            },
        },
        {
            $lookup: {
                from: "subsciption",
                localField: "_id",
                foreignField: "creator",
                as: "subscribedBy"
            }
        },{
            $lookup: {
                from: "subsciption",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribedBy"
                },
                subscribedCount: {
                    $size: "$subscribedTo"
                }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                fullname: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                subscribedBy: 1,
                subscribedCount: 1,
                subscribedTo: 1
            }
        }
        //Also 
        // 1. find the subscriber details, 
        // 2. find the channels to which the user has subscribed, 
        // 3. find all the video links published by user, 
        // 4. find all the tweets published by user
    ])

    if (!channelDetails?.length) {
        throw new ApiError(404, "Channel not found!")
    }

    return res.status(200).json(new ApiResponse(200, channelDetails[0], "Channel details fetched successfully!"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new Mongoose.Types.ObjectId(req.user?._id)
            }
        },{
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "creatorId",
                            foreignField: "_id",
                            as: "creator",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        email: 1,
                                        avatar: 1,
                                        coverImage: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            creator: {
                                $first: "$creator"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully!"))
})

export {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    updateCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getChannelFromUsername,
    getWatchHistory
};
