import { NextFunction, Request, Response } from "express";
import Chat, { MessagesTypes } from "../models/chatModel";
import { ErrorHandler } from "../utils/utilities";

export const newChat = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {adminID, chats, isHelpful}:{adminID:string; chats:MessagesTypes[], isHelpful:boolean;} = req.body;
        
        console.log({adminID, isHelpful});
        

        if (!adminID) return (next(new ErrorHandler("adminID is not found", 404)));
        if (chats.length === 0) return (next(new ErrorHandler("Empty chat array", 400)));
        
        const chat = await Chat.create({
            adminID,
            chats,
            isHelpful
        });

        if (!chat) return (next(new ErrorHandler("Internal server error", 500)));

        res.status(200).json({success:true, message:chat._id});
    } catch (error) {
        console.log(error);
    }
};
export const getAllChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const allChats = await Chat.find();

        if (!allChats) return (next(new ErrorHandler("Chats not found", 404)));

        res.status(200).json({success:true, message:allChats});
    } catch (error) {
        console.log(error);
    }
};
export const searchChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID, adminID, senderID, isHelpful}:{chatID:string, adminID:string; senderID:string; isHelpful:boolean;} = req.body;

        if (!chatID && !adminID && !senderID && !isHelpful) return (next(new ErrorHandler("Bad request", 400)));

        const chats = await Chat.find({
            $or:[
                {_id:chatID},
                {adminID},
                {
                    chats:{
                        $elemMatch:{
                            senderID
                        }
                    }
                },
                {isHelpful}
            ]
        });

        if (!chats) return (next(new ErrorHandler("Chats not found", 404)));

        res.status(200).json({success:true, message:chats});
    } catch (error) {
        console.log(error);
    }
};
export const updateChatsHelpfulness = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {chatID, isHelpful}:{chatID:string; isHelpful:boolean;} = req.body;

        if (!chatID) return (next(new ErrorHandler("chatID not found", 404)));
        if (isHelpful === undefined) return (next(new ErrorHandler("isHelpful is required", 400)));

        await Chat.findByIdAndUpdate(chatID, {
            isHelpful
        });

        res.status(200).json({success:true, message:"Chat review submitted successfully"});
    } catch (error) {
        console.log(error);
    }
};
export const deleteAllChats = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const deletedAllChat = await Chat.deleteMany();

        if (!deletedAllChat) return (next(new ErrorHandler("Chats not found", 404)));
        
        res.status(200).json({success:true, message:"All chats have been deleted successfully"});
    } catch (error) {
        console.log(error);
    }
};