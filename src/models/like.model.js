/* like[icon: thumbs-up] {
    _id string pk
    userId ObjectId user
    commentId ObjectId comment
    videoId ObjectId video
    tweetId ObjectId tweet
    createdAt Date
    updatedAt Date
  } */

import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
    commentId: {
        type: mongoose.Types.ObjectId,
        ref: "Comment"
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: "Video"
    },
    tweetId: {
        type: mongoose.Types.ObjectId,
        ref: "Tweet"
    }
}, { timestamps: true })

export const Like = mongoose.model("Like", likeSchema)