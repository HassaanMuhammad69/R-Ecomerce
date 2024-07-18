import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getUserHistory,
    loginUser,
    logoutUser,
    refreshAceesToken,
    registerUser,
    updateAvatar,
    updateCoverImage,
    updateUserDetails
} from "../controllers/user_controler.js";
import { upload } from "../middlewares/multer_middleware.js"
import { verifyJwt } from "../middlewares/auth_middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAceesToken)
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-user").patch(verifyJwt, updateUserDetails)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar)
router.route("/cover-image").patch(verifyJwt, upload.single("coverImage"), updateCoverImage)

router.route("/channel/:username").get(verifyJwt, getUserChannelProfile)
router.route("/history").get(verifyJwt, getUserHistory)

export default router