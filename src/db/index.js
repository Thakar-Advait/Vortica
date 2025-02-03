import mongoose from "mongoose";
import { DB_NAME } from "../../constants.js";aw

const connectDb = async ()=>{
    try {
        const dbUri = process.env.DB_URI;
        const connectionInstance = await mongoose.connect(`${dbUri}/${DB_NAME}`)

        console.log(`\nMongoDB connected! DB_HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error: ", error)
        process.exit(1)
    }
}

export default connectDb