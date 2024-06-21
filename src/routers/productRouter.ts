import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allProducts, createProduct, singleProducts } from "../controllers/productController";

const productRouter = express.Router();



productRouter.route("/all").get(allProducts);
productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, createProduct);
productRouter.route("/productID").get(singleProducts);



export default productRouter;