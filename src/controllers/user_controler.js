import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user_model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        // console.log(accessToken)
        const refreshToken = await user.generateRefreshToken()
        // console.log(refreshToken)

        //saving refresh token in database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get userDetails from frontend
    // validation- not empty
    // check if email or username already existed
    // crate user object- create enty in DB
    // remove password and refresh token feom field in respomse
    // check for user creation
    // return res 

    //validation
    const { fullname, email, username, password,address, phoneNumber } = req.body
    // console.log("email", email)

    if (
        [fullname, email, username, password,address, phoneNumber ].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }

    //checking user and email

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already existed")
    }


    // crate user object- create enty in DB
    const user = await User.create({
        fullname,
        phoneNumber,
        address,
        email,
        password,
        username: username.toLowerCase()
    })


    // remove password and refresh token feom field in respomse
    // check for user creation

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return res 

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // username or email check
    // password
    // access  and refresh token
    //  send cookie

    const { username, email, password } = req.body
    // console.log(email);


    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }

    //refreshToken
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    //cookie

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "user loggged in succesfully"
            )
        )



})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
        , {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAceesToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }

})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAceesToken
}