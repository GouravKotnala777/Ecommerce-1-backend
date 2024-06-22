import express from "express";
import userRouter from "./routers/userRouter";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import connectDatabase from "./config/db";
import productRouter from "./routers/productRouter";
import cartRouter from "./routers/cartRouter";

config({path:"./.env"});

const app = express();


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cors({
    origin:[`${process.env.CLIENT_URL}` as string],
    credentials: true
}));

connectDatabase(process.env.DATABASE_URI as string);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);

app.get("/test", (req, res, next) => {
    return res.status(200).json({success:true, message:`server is running at port no ${process.env.PORT}`})
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log("Listening....");
})