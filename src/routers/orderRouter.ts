import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { newOrder } from "../controllers/orderController";
const orderRouter = express.Router();

orderRouter.route("/new").post(isUserAuthenticated, newOrder);

export default orderRouter;