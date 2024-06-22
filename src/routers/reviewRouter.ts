import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createReview } from "../controllers/reviewController";

const reviewRouter = express.Router();

reviewRouter.route("/:productID/create").post(isUserAuthenticated, createReview);

export default reviewRouter;