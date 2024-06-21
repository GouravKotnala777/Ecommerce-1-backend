import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { createProduct } from "../controllers/productController";

const productRouter = express.Router();



productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, createProduct);



export default productRouter;