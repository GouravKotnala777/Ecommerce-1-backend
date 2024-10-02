import mongoose, { Model } from "mongoose";
import { UserLocationTypes } from "../controllers/userController";


export interface UserActivityType extends Document {
    userID: mongoose.Types.ObjectId|null;
    action: "signin"|"logout"|"register"|"verify_email"|"forget_password"|"password_change"|"update_profile"|"add_address"|"remove_address"|"create_review"|"delete_review"|"update_vote"|"update_wishlist"|"search_product"|"create_product"|"add_to_cart"|"remove_from_cart"|"create_payment_intend"|"create_payment_intend_again"|"new_order"|"new_order_fail"|"create_coupon"|"new_chat"|"is_chat_helpful"|"update_order"|"remove_product_from_order"; // e.g., "signin", "logout", "register", "password_change"
    ipAddress: string;
    userAgent: string;
    userLocation: UserLocationTypes; // e.g., user's physical location based on IP
    platform: string; // e.g., 'web', 'mobile', 'desktop'
    device: string; // e.g., 'iPhone', 'Android', 'Windows', etc.
    referrer: string; // Source from where the user accessed (e.g., Google, Direct)
    //success: boolean; // Indicate if the action was successful or not
    errorDetails: string; // Store any error details if the action failed
    timestamp: Date;

    message?:string;
    status:"pending"|"succeeded"|"failed"
};

const userActivitySchema = new mongoose.Schema<UserActivityType>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    action:{
        type:String,
        enum:["signin", "logout", "register", "verify_email",
            "forget_password", "password_change", "update_profile", "add_address", "remove_address",
            "create_review", "delete_review", "update_vote",
            "update_wishlist",
            "search_product", "create_product",
            "add_to_cart", "remove_from_cart",
            "create_payment_intend", "create_payment_intend_again",
            "new_order", "new_order_fail", "update_order", "remove_product_from_order", "create_coupon",
            "new_chat", "is_chat_helpful"
        ],
        required:true
    },
    ipAddress:String,
    userAgent:String,
    userLocation:{
        city:String,
        country:String,
        ip:String,
        loc:String,
        org:String,
        postal:String,
        readme:String,
        region:String,
        timezone:String
    },
    platform:String,
    device:String,
    referrer:String,
    errorDetails:String,
    message:String,
    status:{
        type:String,
        default:"pending"
    }
},{
    timestamps:true
});

const userActivityModel:Model<UserActivityType> = mongoose.models.UserActivity || mongoose.model<UserActivityType>("UserActivity", userActivitySchema);

export default userActivityModel;