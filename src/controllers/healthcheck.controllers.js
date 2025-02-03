import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async(req, res)=>{
    try {
        return res.json(new ApiResponse(200, "OK", "Healthcheck passed!"))
    } catch (error) {
        return res.json(new ApiError(400))
    }
})

export default healthcheck;