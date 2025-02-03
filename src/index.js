import { app } from "./app.js"
import dotenv from 'dotenv'
import connectDb from "./db/index.js"

dotenv.config({
    path: './.env'
})

const port = process.env.PORT 

connectDb()
    .then(()=>{
        app.listen(port, ()=>{
            console.log(`Server started on port ${port}`)
        })
    })
    .catch(()=>{
        console.log("Something went wrong!")
        process.exit(1)
    })

