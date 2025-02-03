import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controllers.js";

const router = Router()

router.route("/tweet/create").post(verifyJWT, createTweet)
router.route("/tweet/update/:tweetId").put(verifyJWT, updateTweet)
router.route("/tweet/delete/:tweetId").delete(verifyJWT, deleteTweet)
router.route("/tweet/getUserTweets/:userId").get(verifyJWT, getUserTweets)

export { router as tweetRouter }