import { Router } from "express";
import { toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/like/toggleVideoLike/:videoId").put(verifyJWT, toggleVideoLike)
router.route("/like/toggleTweetLike/:tweetId").put(verifyJWT, toggleTweetLike)
router.route("/like/toggleCommentLike/:commentId").put(verifyJWT, toggleCommentLike)
router.route("/like/getLikedVideos").get(verifyJWT, getLikedVideos)

export { router as likeRouter }