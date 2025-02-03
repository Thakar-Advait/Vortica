/* user[icon: user] {
    _id string pk
    avatar string
    coverImage string
    fullname string
    username: string
    password string
    email string
    watchHistory ObjectId[] video
    refreshToken string
    createdAt Date
    updatedAt Date
  } */

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowecase: true,
        unique: true
    },
    watchHistory: [{
        type: mongoose.Types.ObjectId,
        ref: "Video"
    }],
    refreshToken: {
        type: String,
        trim: true
    }
},{ timestamps: true })

userSchema.pre("save", function(next) {
    if(!this.isModified("password")){
        return next()
    }
    
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    console.log(this.password)
    console.log(password)
    // return await bcrypt.compare(this.password, password) //bycrpt not working properly... CHECK!!!!
    return this.password===password
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}

export const User = mongoose.model("User", userSchema)