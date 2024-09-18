import express from "express";
import { createPayment } from "../controllers/paymentController";
import { isUserAuthenticated } from "../middlewares/auth";
import { updateActivity } from "../middlewares/userActivity.middleware";

const router = express.Router();

router.route("/new").post(isUserAuthenticated, createPayment, updateActivity);

export default router;