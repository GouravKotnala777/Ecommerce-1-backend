import express from "express";
import { getHeroSlider, insertNewSliderImage, updateHeroSliderImage } from "../controllers/miscController";
import upload from "../middlewares/multer.middleware";

const miscRouter = express.Router();

miscRouter.route("/hero_slider/get").get(getHeroSlider);
miscRouter.route("/hero_slider/insert").post(upload.single("image"), insertNewSliderImage);
miscRouter.route("/hero_slider/update").put(upload.single("image"), updateHeroSliderImage);

export default miscRouter;