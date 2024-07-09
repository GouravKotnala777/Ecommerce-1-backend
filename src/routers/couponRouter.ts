import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allCoupons, createCoupon } from "../controllers/couponController";

const router = express.Router();

router.route("/new").post(isUserAuthenticated, isUserAdmin, createCoupon);
router.route("/all").get(isUserAuthenticated, isUserAdmin, allCoupons);

export default router;