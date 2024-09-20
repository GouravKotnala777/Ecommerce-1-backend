import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allOrders, myOrders, newOrder } from "../controllers/orderController";
import { updateActivity } from "../middlewares/userActivity.middleware";
const orderRouter = express.Router();

orderRouter.route("/new").post(isUserAuthenticated, newOrder, updateActivity);
orderRouter.route("/myOrders").get(isUserAuthenticated, myOrders);
orderRouter.route("/all").get(isUserAuthenticated, isUserAdmin, allOrders);

export default orderRouter;