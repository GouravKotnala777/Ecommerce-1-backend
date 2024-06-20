import mongoose, { Model } from "mongoose";

interface AddressTypes {
    street: string;
    city: string;
    state: string;
    zip: string;
}
export interface UserTypes extends Document{
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    address: AddressTypes;
    mobile: string;
    role: string;
    orderHistory: mongoose.Schema.Types.ObjectId[];
    wishlist: mongoose.Schema.Types.ObjectId[];
    cart: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    emailVerified: boolean;
    profileImage: string;
    lastLogin: Date;
}

const userSchema = new mongoose.Schema<UserTypes>({
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    address:{
        street: String,
        city: String,
        state: String,
        zip: String
    },
    mobile: {
        type:String,
        required:true
    },
    role: {
        type:String,
        enum:["admin", "user"],
        required:true,
        default:"user"
    },
    orderHistory: [{
        type:mongoose.Schema.Types.ObjectId
    }],
    wishlist: [{
        type:mongoose.Schema.Types.ObjectId
    }],
    cart: mongoose.Schema.Types.ObjectId,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerified: Boolean,
    profileImage: {
        type:String
    },
    lastLogin: Date
}, {
    timestamps:true
});

const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;