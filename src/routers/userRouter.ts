import express from "express";
import { aaGET, aaPOST, addToWishlist, findUser, login, logout, me, myWishlist, register, removeAddress, updateMe, forgetPassword, verifyEmail, allUsersActivities } from "../controllers/userController";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { newActivity, updateActivity } from "../middlewares/userActivity.middleware";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/new").post(register);
//userRouter.route("/sms").post(sendReferralSMS);
userRouter.route("/login").post(login, updateActivity);
userRouter.route("/me").get(isUserAuthenticated, me);
userRouter.route("/forgetPassword").put(forgetPassword, updateActivity);
userRouter.route("/update").put(isUserAuthenticated, updateMe, updateActivity)
                        .delete(isUserAuthenticated, removeAddress, updateActivity);
userRouter.route("/logout").post(isUserAuthenticated, logout, updateActivity);
userRouter.route("/verifyemail").post(verifyEmail, updateActivity);
userRouter.route("/wishlist").get(isUserAuthenticated, myWishlist);
userRouter.route("/activities").post(isUserAuthenticated, isUserAdmin, allUsersActivities);
userRouter.route("/:productID/wishlist").put(isUserAuthenticated, addToWishlist, updateActivity);



// =============== Admin's Routes
userRouter.route("/search").post(isUserAuthenticated, findUser);

export default userRouter;