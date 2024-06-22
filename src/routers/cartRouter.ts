import express from "express";
import { addToCart, clearMyCart, myCart, removeFromCart } from "../controllers/cartController";
import { isUserAuthenticated } from "../middlewares/auth";

const cartRouter = express.Router();

cartRouter.route("/add").post(isUserAuthenticated, addToCart);
cartRouter.route("/remove").delete(isUserAuthenticated, removeFromCart);
cartRouter.route("/").get(isUserAuthenticated, myCart)
                    .put(isUserAuthenticated, clearMyCart);

export default cartRouter;