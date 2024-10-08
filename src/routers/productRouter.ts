import express from "express";
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { allProducts, createProduct, deleteProduct, findAllCategories, findIncompleteProducts, findOutStockProducts, getProductsOfSame, searchProductByQuery, similarProductRecommendation, singleProducts, updateProduct } from "../controllers/productController";
import upload from "../middlewares/multer.middleware";
import { updateActivity } from "../middlewares/userActivity.middleware";

const productRouter = express.Router();



productRouter.route("/all").get(allProducts);
productRouter.route("/new").post(isUserAuthenticated, isUserAdmin, upload.single("images"), createProduct);
productRouter.route("/outstock").get(isUserAuthenticated, isUserAdmin, findOutStockProducts);
productRouter.route("/incomplete").get(isUserAuthenticated, isUserAdmin, findIncompleteProducts);
productRouter.route("/same/:query/:value").get(getProductsOfSame);
productRouter.route("/groupedBy/:groupedBy").get(findAllCategories);
//productRouter.route("/search/:searchQry").get(searchProductByQuery);
productRouter.route("/search/:searchQry").post(searchProductByQuery, updateActivity);
productRouter.route("/recommendation").post(similarProductRecommendation);
productRouter.route("/:productID").get(singleProducts)
                                .delete(isUserAuthenticated, isUserAdmin, deleteProduct)
                                .put(isUserAuthenticated, isUserAdmin, updateProduct);




export default productRouter;