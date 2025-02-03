import { Router } from "express";
import { registerUser, loginUser, refreshToken, logoutUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//unsecured routes

router.route("/users/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1 
    }
]), registerUser);  

router.route("/users/login").post(loginUser)

router.route("/users/refreshToken").post(refreshToken)

//secured routes

router.route("/users/logout").post(verifyJWT, logoutUser)

export { router as userRouter };
