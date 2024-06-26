import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createReview, removeReview } from "../controllers/reviewController";

const reviewRouter = express.Router();

reviewRouter.route("/:productID/create").post(isUserAuthenticated, createReview);
reviewRouter.route("/:productID/remove").delete(isUserAuthenticated, removeReview);

export default reviewRouter;