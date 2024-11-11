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
import reviewRouter from "./routers/reviewRouter";
import { v2 as cloudinary } from "cloudinary";
import couponRouter from "./routers/couponRouter";
import paymentRouter from "./routers/paymentRouter";
import Stripe from "stripe";
import orderRouter from "./routers/orderRouter";
import http from "http";
import { Server } from "socket.io";
import chatRouter from "./routers/chatRouter";
import miscRouter from "./routers/miscRouter";

config({path:"./.env"});

const PORT = process.env.PORT || 8000;
const DATABASE_URI = process.env.DATABASE_URI || "";
const STRIPE_KEY = process.env.STRIPE_KEY || "";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin:process.env.CLIENT_URL,
        methods:["GET", "POST"],
        credentials:true
    }
});


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(cors({
    origin:[`${process.env.CLIENT_URL}` as string, "https://ipinfo.io"],
    credentials: true
}));


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key:process.env.CLOUDINARY_API_KEY as string,
    api_secret:process.env.CLOUDINARY_API_SECRET as string
  });

connectDatabase(DATABASE_URI);

export const stripe = new Stripe(STRIPE_KEY);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/misc", miscRouter);

app.get("/test", (req, res, next) => {
    return res.status(200).json({success:true, message:`server is running at port no ${process.env.PORT}`})
});

app.use(errorMiddleware);



//const usersa = {
//    "456789987654121":{socketID:"gourav123", userName:"Gourav"}
//    undefined:{socketID:"66bb37913c60c222387502ed", userName:undefined}
//}
//console.log(usersa[456789987654121].socketID);


let users:{[userID:string]:{socketID:string, userName:string};} = {};

io.on("connection", (socket) => {
    //console.log(`${socket.id}connected...`);

    socket.on("registerUser", ({userID, userName}) => {        
        if (userID) {
            users[userID] = {socketID:socket.id, userName:userName};
            //console.log(`${userID} -----> ${users[userID]?.socketID} = ${users[userID]?.userName}`);
            io.to(users["66bb37913c60c222387502ed"]?.socketID).emit("usersList", users);
        }
    });

    socket.on("adminSelectedUser", ({userID, adminID, adminName, defaultMsg}) => {
        io.to(users[userID]?.socketID).emit("adminSelectedUserBE", {adminID, adminName, defaultMsg});
    });

    socket.on("adminEndedChat", ({userID, defaultMsg}) => {
        io.to(users[userID]?.socketID).emit("connectionEnded", {defaultMsg});
    });

    socket.on("userEndedChat", ({defaultMsg}) => {
        io.to(users["66bb37913c60c222387502ed"]?.socketID).emit("connectionEnded", {defaultMsg});
        for (let userid in users) {
            if (users[userid]?.socketID === socket.id) {
                delete users[userid];
                io.to(users["66bb37913c60c222387502ed"]?.socketID).emit("usersList", users);
                break;
            }
        }
        io.to(users["66bb37913c60c222387502ed"]?.socketID).emit("usersList", users);
    });

    socket.on("userMessage", ({userID, userName, msg}) => {
        //console.log(`${userID}:${msg}`);
        if (users["66bb37913c60c222387502ed"] && users["66bb37913c60c222387502ed"]?.socketID) {
            io.to(users["66bb37913c60c222387502ed"]?.socketID).emit("adminReceiveMessage", {userID, userName, msg});
        }
    });

    socket.on("adminResponse", ({adminID, userID, userName, response}) => {
        //console.log(`response ${response} to ${userID} (${users[userID]})`);
        io.to(users[userID]?.socketID).emit("userReceiveResponse", {adminID, userName, response});
    });

    socket.on("disconnect", () => {
        //console.log(`${socket.id}} user disconnected`);
        for (let userid in users) {
            if (users[userid]?.socketID === socket.id) {
                delete users[userid];
                io.to(users["66bb37913c60c222387502ed"]?.socketID).emit("usersList", users);
                break;
            }
        }
    });
    
})




server.listen(PORT, () => {
    console.log("Listening....");
})