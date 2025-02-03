import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { getChannelSubscriptions, getSubscribedChannels, toggleSubscription } from "../controllers/subscription.controllers.js";

const router = Router()

router.route("/subscription/toggleSubscription/:creatorId").put(verifyJWT, toggleSubscription)
router.route("/subscriptions/getChannelSubscriptions/:creatorId").get(verifyJWT, getChannelSubscriptions)
router.route("/subscriptions/getSubscribedChannels/:userId").get(verifyJWT, getSubscribedChannels)

export { router as subscriptionRouter }