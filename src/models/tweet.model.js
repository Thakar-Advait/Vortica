/* tweet[icon: clipboard] {
  _id string pk
  content string
  creatorId ObjectId user
  likes number
  createdAt Date
  updatedAt Date
} */

import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    likes: {
        type: Number,
        default: 0
    }
},{ timestamps: true })

export const Tweet = mongoose.model("Tweet", tweetSchema)