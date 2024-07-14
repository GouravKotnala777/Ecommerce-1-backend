import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allCoupons, createCoupon, singleCoupon } from "../controllers/couponController";

const router = express.Router();

router.route("/new").post(isUserAuthenticated, isUserAdmin, createCoupon);
router.route("/all").get(isUserAuthenticated, isUserAdmin, allCoupons);
router.route("/apply").post(isUserAuthenticated, singleCoupon);

export default router;