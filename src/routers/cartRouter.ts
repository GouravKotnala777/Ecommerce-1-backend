import express from "express";
import { addToCart } from "../controllers/cartController";
import { isUserAuthenticated } from "../middlewares/auth";

const cartRouter = express.Router();

cartRouter.route("/add").post(isUserAuthenticated, addToCart);

export default cartRouter;