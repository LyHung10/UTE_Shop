import express from "express";
import {
    getProfile,
    uploadUserAvatar,
    updateProfileController, changePasswordController
} from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/authController";
import parser from "../middleware/multerCloudinary";

const router = express.Router();

router.use(authenticateToken);
// // router.put("/update", updateUser);
// router.put("/update", updateUser);
router.put("/upload-image", parser.single("avatar"), uploadUserAvatar);
router.patch("/profile", updateProfileController);
router.post("/change-password", changePasswordController);
router.get("/profile", getProfile);
export default router;