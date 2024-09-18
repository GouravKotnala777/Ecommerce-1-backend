import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createReview, removeReview, updateVote } from "../controllers/reviewController";
import { updateActivity } from "../middlewares/userActivity.middleware";

const reviewRouter = express.Router();

reviewRouter.route("/:productID/create").post(isUserAuthenticated, createReview, updateActivity);
reviewRouter.route("/:productID/remove").delete(isUserAuthenticated, removeReview, updateActivity);
reviewRouter.route("/vote").put(isUserAuthenticated, updateVote, updateActivity);

export default reviewRouter;