import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";

const router = Router()

router.route("/playlist/createPlaylist").post(verifyJWT, createPlaylist)
router.route("/playlist/getUserPlaylists/:userId").get(verifyJWT, getUserPlaylists)
router.route("/playlist/getPlaylistById/:playlistId").get(verifyJWT, getPlaylistById)
router.route("/playlist/addVideoToPlaylist").post(verifyJWT, addVideoToPlaylist)
router.route("/playlist/removeVideoFromPlaylist").post(verifyJWT, removeVideoFromPlaylist)
router.route("/playlist/deletePlaylist/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/playlist/updatePlaylist/:playlistId").put(verifyJWT, updatePlaylist)

export { router as playlistRouter }