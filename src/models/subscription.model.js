/* subsciption[icon: dollar-sign] {
    _id string pk
    subscriber ObjectId user
    creator ObjectId user
    createdAt Date
    updatedAt Date
  } */

import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    creator: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)