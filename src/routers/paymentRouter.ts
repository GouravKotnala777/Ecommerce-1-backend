import express from "express";
import { createPayment } from "../controllers/paymentController";
import { isUserAuthenticated } from "../middlewares/auth";

const router = express.Router();

router.route("/new").post(isUserAuthenticated, createPayment);

export default router;