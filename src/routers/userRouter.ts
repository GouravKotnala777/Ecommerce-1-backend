import express from "express";
import { aaGET, aaPOST, register } from "../controllers/userController";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/").post(register);

export default userRouter;