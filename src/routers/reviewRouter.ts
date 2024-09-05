import express from "express";
import { isUserAuthenticated } from "../middlewares/auth";
import { createReview, removeReview, updateVote } from "../controllers/reviewController";

const reviewRouter = express.Router();

reviewRouter.route("/:productID/create").post(isUserAuthenticated, createReview);
reviewRouter.route("/:productID/remove").delete(isUserAuthenticated, removeReview);
reviewRouter.route("/vote").put(isUserAuthenticated, updateVote);

export default reviewRouter;