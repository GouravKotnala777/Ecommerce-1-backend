import mongoose, { Model } from "mongoose";

export interface UserActivityType extends Document {
    userID: mongoose.Types.ObjectId;
    action: string; // e.g., "signin", "logout", "register", "password_change"
    ipAddress: string;
    userAgent: string;
    userLocation: string; // e.g., user's physical location based on IP
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
        enum:["signin", "logout", "register", "password_change", "profile_update"],
        required:true
    },
    ipAddress:String,
    userAgent:String,
    userLocation:String,
    platform:String,
    device:String,
    referrer:String,
    success:Boolean,
    errorDetails:String
},{
    timestamps:true
});

const userActivityModel:Model<UserActivityType> = mongoose.models.UserActivity || mongoose.model<UserActivityType>("UserActivity", userActivitySchema);

export default userActivityModel;