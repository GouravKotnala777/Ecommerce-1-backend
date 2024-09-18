import mongoose, { Model } from "mongoose";
import { UserLocationTypes } from "../controllers/userController";

export interface UserActivityType extends Document {
    userID: mongoose.Types.ObjectId;
    action: string; // e.g., "signin", "logout", "register", "password_change"
    ipAddress: string;
    userAgent: string;
    userLocation: UserLocationTypes; // e.g., user's physical location based on IP
    platform: string; // e.g., 'web', 'mobile', 'desktop'
    device: string; // e.g., 'iPhone', 'Android', 'Windows', etc.
    referrer: string; // Source from where the user accessed (e.g., Google, Direct)
    success: boolean; // Indicate if the action was successful or not
    errorDetails: string; // Store any error details if the action failed
    timestamp: Date;
};

const userActivitySchema = new mongoose.Schema<UserActivityType>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    action:{
        type:String,
        enum:["signin", "logout", "register", "password_change", "profile_update", "create_review", "delete_review", "wishlist", "add_to_cart", "remove_from_cart"],
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
    success:{
        type:Boolean,
        default:false
    },
    errorDetails:String
},{
    timestamps:true
});

const userActivityModel:Model<UserActivityType> = mongoose.models.UserActivity || mongoose.model<UserActivityType>("UserActivity", userActivitySchema);

export default userActivityModel;