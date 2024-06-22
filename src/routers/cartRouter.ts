import express from "express";
import { addToCart, myCart } from "../controllers/cartController";
import { isUserAuthenticated } from "../middlewares/auth";

const cartRouter = express.Router();

cartRouter.route("/add").post(isUserAuthenticated, addToCart);
cartRouter.route("/").get(isUserAuthenticated, myCart);

export default cartRouter;