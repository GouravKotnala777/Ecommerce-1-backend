import express from "express";
import { addToCart, allCarts, clearMyCart, myCart, removeFromCart } from "../controllers/cartController";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { updateActivity } from "../middlewares/userActivity.middleware";

const cartRouter = express.Router();

cartRouter.route("/add").post(isUserAuthenticated, addToCart, updateActivity);
cartRouter.route("/remove").delete(isUserAuthenticated, removeFromCart, updateActivity);
cartRouter.route("/").get(isUserAuthenticated, myCart)
                    .put(isUserAuthenticated, clearMyCart);


// ===============  Admin's Route
cartRouter.route("/allcarts").get(isUserAuthenticated, isUserAdmin, allCarts);

export default cartRouter;