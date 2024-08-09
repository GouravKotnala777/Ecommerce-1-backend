import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { myOrders, newOrder } from "../controllers/orderController";
const orderRouter = express.Router();

orderRouter.route("/new").post(isUserAuthenticated, newOrder);
orderRouter.route("/myOrders").get(isUserAuthenticated, myOrders);

export default orderRouter;