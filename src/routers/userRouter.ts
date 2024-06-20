import express from "express";
import { aaGET, aaPOST, login, me, register } from "../controllers/userController";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(me);

export default userRouter;