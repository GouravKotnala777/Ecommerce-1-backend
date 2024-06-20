import express from "express";
import userRouter from "./routers/userRouter";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/errorMiddleware";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

config({path:"./.env"});

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin:[`${process.env.CLIENT_URL}` as string],
    credentials: true
}));

app.use("/api/v1/user", userRouter);

app.get("/test", (req, res, next) => {
    return res.status(200).json({success:true, message:`server is running at port no ${process.env.PORT}`})
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
    console.log("Listening....");
})