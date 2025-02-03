import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";


const createPlaylist = asyncHandler(async (req, res)=>{
    const { title, description } = req.body

    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "User id is required!")
    }

    try {
        const user = await User.findById(userId)
    
        if(!user) {
            throw new ApiError(404, "User not found!")
        }
    
        const newPlaylist = await Playlist.create({
            owner: userId,
            title: title,
            description: description,
            videos: []
        })
    
        if(!newPlaylist) {
            throw new ApiError(500, "Something went wrong while creating playlist!")
        }
    
        return res.status(200).json(new ApiResponse(200, newPlaylist, "Playlist created successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while creating playlist!")
    }
})

const getUserPlaylists = asyncHandler(async (req, res)=>{
    const { userId } = req.params

    if(!userId) {
        throw new ApiError(400, "User id is required!")
    }

    try {
        const userPlaylists = await Playlist.find({
            $where: {
                owner: userId
            }
        })
    
        if(userPlaylists.length === 0) {
            throw new ApiError(404, "Playlist not found!")
        }
    
        return res.status(200).json(new ApiResponse(200, userPlaylists, "Playlist fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching playlist!")
    }
})

const getPlaylistById = asyncHandler(async (req, res)=>{
    const { playlistId } = req.params

    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required!")
    }

    try {
        const playlist = await Playlist.findById(playlistId)
    
        if(!playlist) {
            throw new ApiError(404, "Playlist not found!")
        }
    
        return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while fetching playlist!")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res)=>{
    const { videoId, playlistId } = req.body
    const userId = req.user?._id

    if(userId) {
        throw new ApiError(401, "User id is required!")
    }

    try {
        const user = await User.findById(userId)
    
        if(!user) {
            throw new ApiError(404, "User not found!")
        }
    
        if([videoId, playlistId].some((field)=>{
            return field === null
        })) {
            throw new ApiError(400, "All fields are required!")
        }
    
        const playlist = await Playlist.findById(playlistId)
        const video = await Video.findById(videoId)
        if(!playlist) {
            throw new ApiError(404, "Playlist not found!")
        }
    
        if(!video) {
            throw new ApiError(404, "Video not found!")
        }
    
        if(playlist.owner !== userId) {
            throw new ApiError(403, "You are not authorized to add video to this playlist!")
        }
        else if(playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video already added to playlist!")
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
            $push: {
                videos: videoId
            }
        }, {
            new: true
        })
    
        if(!updatedPlaylist) {
            throw new ApiError(500, "Something went wrong while adding video to playlist!")
        }
    
        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while adding video to playlist!")
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res)=>{    
    const { videoId, playlistId } = req.body
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(401, "User id is required!")
    }

    if(!videoId) {
        throw new ApiError(400, "Video id is required!")
    }

    try {
        const playlist = Playlist.findById(playlistId)

        if(!playlist) {
            throw new ApiError(404, "Playlist not found!")
        }
        else if(playlist.owner !== userId) {
            throw new ApiError(403, "You are not authorized to remove this video!")
        }
        else if(!playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video is not in the playlist!")
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
            $pull: {
                videos: videoId
            }
        })
    
        if(!updatePlaylist) {
            throw new ApiError(500, "Something went wrong while removing the video from the playlist!")
        }
    
        return res.status(200).json(new ApiResponse(200, updatePlaylist, "Video removed from the playlist successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while removing the video from the playlist!")
    }
})

const deletePlaylist = asyncHandler(async (req, res)=>{
    const { playlistId } = req.params
    const userId = req.user?._id

    if(!userId) {
        throw new ApiError(400, "User id is required!")
    }

    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required!")
    }

    try {
        const playlist = await Playlist.findById(playlistId)
    
        if(!playlist) {
            throw new ApiError(404, "Playlist not found!")
        }
        else if(playlist.owner !== userId) {
            throw new ApiError(403, "You are not authorized to delete this playlist!")
        }
    
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    
        if(!deletedPlaylist) {
            throw new ApiError(500, "Something went wrong while deleting playlist!")
        }
    
        return res.status(200).json(new ApiResponse(200, deletePlaylist, "Playlist deleted successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting playlist!")
    }
})

const updatePlaylist = asyncHandler(async (req, res)=>{
    const { playlistId } = req.params
    const userId = req.user?._id
    const { title, description, videoId } = req.body

    if(!userId) {
        throw new ApiError(400, "User id is required!")
    }

    if(!playlistId) {
        throw new ApiError(400, "Playlist id is required!")
    }

    try {
        const playlist = await Playlist.findById(playlistId)
    
        if(playlist.owner !== userId) {
            throw new ApiError(403, "You are not authorized to update this playlist!")
        }
    
        const updatedData = {}
    
        if(title && title.trim() !== "") {
            updatedData.title = title
        }
        if(description && description.trim() !== "") {
            updatedData.description = description
        }
        if(videoId && playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video is already in the playlist")
        }
    
        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
            title: title,
            description: description,
            $push: {
                videos: videoId
            }
        },{
            new: true
        })
    
        if(!updatedPlaylist) {
            throw new ApiError(500, "Something went wrong while updating playlist!")
        }
    
        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully!"))
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating playlist!")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}