import express from "express"
import { isUserAdmin, isUserAuthenticated } from "../middlewares/auth";
import { deleteAllChats, getAllChats, newChat, searchChats, updateChatsHelpfulness } from "../controllers/chatController";

const chatRouter = express.Router();

chatRouter.route("/new").post(isUserAuthenticated, newChat);
chatRouter.route("/all").get(isUserAuthenticated, isUserAdmin, getAllChats);
chatRouter.route("/specific").post(isUserAuthenticated, isUserAdmin, searchChats);
chatRouter.route("/isHelpfull").put(isUserAuthenticated, updateChatsHelpfulness);
chatRouter.route("/deleteAll").delete(isUserAuthenticated, isUserAdmin, deleteAllChats);


export default chatRouter;