import express from "express";
import { aaGET, aaPOST, login, me, register, updateMe } from "../controllers/userController";
import { isUserAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isUserAuthenticated, me);
userRouter.route("/update").put(isUserAuthenticated, updateMe);

export default userRouter;