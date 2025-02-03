import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js";

const router = Router()

router.route("/dashboard/getChannelStats/:creatorId").get(getChannelStats)
router.route("/dashboard/getChannelVideos/:creatorId").get(getChannelVideos)

export {router as dashboardRouter}