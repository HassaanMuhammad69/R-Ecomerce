import connectDB from "./db/index.js";
import dotenv from "dotenv"

dotenv.config({
    path: './env'
})

connectDB()
    .then(() => {

        app.on("error", (error) => {
            console.log("ERRR:", error)
            throw error
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is ruuning at ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("MongoDB connection fail !!", err)
    })