import express from "express";
import { aaGET, aaPOST, addToWishlist, findUser, login, logout, me, myWishlist, register, removeAddress, updateMe, forgetPassword, verifyEmail } from "../controllers/userController";
import { isUserAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();


userRouter.route("/aa").get(aaGET).post(aaPOST);
userRouter.route("/new").post(register);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isUserAuthenticated, me);
userRouter.route("/forgetPassword").put(forgetPassword);
userRouter.route("/update").put(isUserAuthenticated, updateMe)
                        .delete(isUserAuthenticated, removeAddress);
userRouter.route("/logout").post(isUserAuthenticated, logout);
userRouter.route("/verifyemail").post(verifyEmail);
userRouter.route("/wishlist").get(isUserAuthenticated, myWishlist);
userRouter.route("/:productID/wishlist").put(isUserAuthenticated, addToWishlist);



// =============== Admin's Routes
userRouter.route("/search").post(isUserAuthenticated, findUser);

export default userRouter;