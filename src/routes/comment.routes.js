import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/comment/getVideoComments/:videoId").get(getVideoComments)
router.route("/comment/addComment/:videoId").post(verifyJWT, addComment)
router.route("/comment/updateComment/:videoId").post(verifyJWT, updateComment)
router.route("/comment/deleteComment/:videoId").post(verifyJWT, deleteComment)

export { router as commentRouter }