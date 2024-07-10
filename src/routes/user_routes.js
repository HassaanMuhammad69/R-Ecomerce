import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user_controler.js";
import {upload} from "../middlewares/multer_middleware.js"
import { verifyJwt } from "../middlewares/auth_middleware.js";

const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJwt, logoutUser)


export default router