import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { myOrders, newOrder } from "../controllers/orderController";
import { updateActivity } from "../middlewares/userActivity.middleware";
const orderRouter = express.Router();

orderRouter.route("/new").post(isUserAuthenticated, newOrder, updateActivity);
orderRouter.route("/myOrders").get(isUserAuthenticated, myOrders);

export default orderRouter;