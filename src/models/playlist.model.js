/* playlist[icon: list] {
    _id string pk
    owner ObjectId user
    title string
    description string
    videos ObjectId[] video
    createdAt Date
    updatedAt Date
  } */

import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    videos: [{
        type: mongoose.Types.ObjectId,
        ref: "Video"
    }]
},{ timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)