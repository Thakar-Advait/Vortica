/* video[icon: video] {
    _id string pk
    videoFile string
    thumbnail string
    title string
    description string
    creatorId ObjectId user
    isPublished boolean
    duration number
    views number
    createdAt Date
    updatedAt Date
  } */

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true    
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
},{ timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)