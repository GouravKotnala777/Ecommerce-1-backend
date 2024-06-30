import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allProducts, createProduct, deleteProduct, singleProducts, updateProduct } from "../controllers/productController";
import upload from "../middlewares/multer.middleware";

const productRouter = express.Router();



productRouter.route("/all").get(allProducts);
productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, upload.single("images"), createProduct);
productRouter.route("/:productID").get(singleProducts)
                                .delete(isUserAuthenticated, isUserAdmin, deleteProduct)
                                .put(isUserAuthenticated, isUserAdmin, updateProduct);



export default productRouter;