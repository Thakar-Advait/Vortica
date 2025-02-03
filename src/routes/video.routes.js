import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { deleteVideoById, getAllUserVideos, getAllVideos, getVideoById, publishAVideo, togglePublishedVideo, updateVideoById } from "../controllers/video.controllers.js";

const router = Router()

router.route("/video/getAlLVideos").get(verifyJWT, getAllVideos)
router.route("/video/getVideoById/:videoId").get(verifyJWT, getVideoById)
router.route("/video/publish").post(verifyJWT, publishAVideo)
router.route("/video/update/:videoId").put(verifyJWT, updateVideoById)
router.route("/video/delete/:videoId").delete(verifyJWT, deleteVideoById)
router.route("/video/getAllUserVideos").get(verifyJWT, getAllUserVideos)
router.route("/video/togglePublishedVideo/:videoId").put(verifyJWT, togglePublishedVideo)

export { router as videoRouter }