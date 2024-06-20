import express from "express";
import { aaGET, aaPOST, login, register } from "../controllers/userController";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/new").post(register);
userRouter.route("/login").post(login);

export default userRouter;