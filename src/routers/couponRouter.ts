import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allCoupons, createCoupon, myCoupons, singleCoupon } from "../controllers/couponController";
import { updateActivity } from "../middlewares/userActivity.middleware";

const router = express.Router();

router.route("/new").post(isUserAuthenticated, isUserAdmin, createCoupon, updateActivity);
router.route("/all").get(isUserAuthenticated, isUserAdmin, allCoupons);
router.route("/myCoupons").get(isUserAuthenticated, myCoupons);
router.route("/apply").post(isUserAuthenticated, singleCoupon);

export default router;