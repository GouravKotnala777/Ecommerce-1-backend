import express from "express";
import { aaGET, aaPOST, findUser, login, logout, me, register, updateMe } from "../controllers/userController";
import { isUserAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isUserAuthenticated, me);
userRouter.route("/update").put(isUserAuthenticated, updateMe);
userRouter.route("/logout").post(isUserAuthenticated, logout);



// =============== Admin's Routes
userRouter.route("/search").post(isUserAuthenticated, findUser);

export default userRouter;