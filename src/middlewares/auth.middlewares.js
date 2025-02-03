import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next)=>{
    try {
        const accessToken = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "") || req.body.access_token
    
        if(!accessToken) {
            throw new ApiError(401, "Unauthorized request!")
        }
    
        const decryptedToken = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        
        if(!decryptedToken) {
            throw new ApiError(402, "Unknown token!")
        }
    
        try {
            const user = await User.findById(decryptedToken._id).select("-password -refreshToken")
            if(!user) {
                throw new ApiError(404, "User not found!")
            }
            req.user = user
            next()
        } catch (error) {
            throw new ApiError(501, "Something went wrong while fetching user details to verify the token!")
        } 
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})