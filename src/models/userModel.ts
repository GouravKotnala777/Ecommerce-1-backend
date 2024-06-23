import mongoose, { Model } from "mongoose";
import bcryptJS from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

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
    wishlist: mongoose.Types.ObjectId[];
    cart: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    profileImage: string;
    lastLogin: Date;

    emailVerified: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    verificationToken?:string;
    verificationTokenExpires?:Date;

    comparePassword:(password:string) => Promise<boolean>;
    generateToken:(userID:mongoose.Schema.Types.ObjectId) => string;
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
    verificationToken:String,
    verificationTokenExpires:Date,
    emailVerified:{
        type:Boolean,
        default:false
    },
    profileImage: {
        type:String
    },
    lastLogin: Date
}, {
    timestamps:true
});

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) return next();

    this.password = await bcryptJS.hash(this.password, 6)
    next();
});
userSchema.methods.comparePassword = async function(password:string) {
    return await bcryptJS.compare(password, this.password);
}
userSchema.methods.generateToken = async function(userID:mongoose.Schema.Types.ObjectId) {
    return jsonwebtoken.sign({id:userID}, "thisissecret", {expiresIn:"3d"});
}


const userModel:Model<UserTypes> = mongoose.models.User || mongoose.model<UserTypes>("User", userSchema);

export default userModel;