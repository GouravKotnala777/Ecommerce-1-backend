import mongoose, {Model} from "mongoose"

export interface MessagesTypes {
    senderID: string;
    content: string;
    createdAt: string;
}
export interface ChatTypes {
    adminID:mongoose.Schema.Types.ObjectId;
    chats:MessagesTypes[];
    isHelpful:boolean;
    createdAt:string;
}

const chatSchema = new mongoose.Schema<ChatTypes>({
    adminID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    chats:[{
        senderID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:String
    }],
    isHelpful:Boolean
}, {
    timestamps:true
});

const chatModel:Model<ChatTypes> = mongoose.models.Chat || mongoose.model<ChatTypes>("Chats", chatSchema);

export default chatModel;