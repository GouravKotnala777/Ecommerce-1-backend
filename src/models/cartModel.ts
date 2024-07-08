import mongoose, { Model } from "mongoose";

export interface CartTypes {
    _id: mongoose.Schema.Types.ObjectId;
    userID: mongoose.Schema.Types.ObjectId;
    products: {
        productID:mongoose.Types.ObjectId;
        quantity:number;
    }[];
    createdAt: Date;
    updatedAt: Date;
    totalPrice: number;
}

const cartSchema = new mongoose.Schema<CartTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    products:[{
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity:{type:Number, default:1}
    }],
    totalPrice:{
        type:Number,
        default:0
    }
},
{
    timestamps:true
});

const cartModel:Model<CartTypes> = mongoose.models.Cart || mongoose.model<CartTypes>("Cart", cartSchema);

export default cartModel;