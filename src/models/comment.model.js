/* comment[icon: comment] {
    _id string pk
    content string
    owner ObjectId user
    videoId ObjectId video
    createdAt Date
    updatedAt Date
  } */

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        ref: "Video",
        required: true
    }
}, { timestamps: true })

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)

dubai

indial