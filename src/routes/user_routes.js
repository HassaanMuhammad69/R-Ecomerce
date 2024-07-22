import { Router } from "express";
import {
    
    loginUser,
    logoutUser,
    refreshAceesToken,
    registerUser,
    
} from "../controllers/user_controler.js";
import { verifyJwt } from "../middlewares/auth_middleware.js";

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAceesToken)


export default router