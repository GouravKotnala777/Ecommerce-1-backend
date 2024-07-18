import mongoose, { Model } from "mongoose";

export interface OrderTypes {
    _id: mongoose.Schema.Types.ObjectId;
    userID: mongoose.Schema.Types.ObjectId;
    orderItems: {
        productID:mongoose.Types.ObjectId;
        quantity:number;
    }[];
    paymentInfo:{
        transactionId?:string;
        status:string;
        shippingType:string;
        message:string;
    },
    coupon:mongoose.Schema.Types.ObjectId|undefined;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new mongoose.Schema<OrderTypes>({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderItems:[{
        productID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            default:1
        }
    }],
    paymentInfo:{
        transactionId:String,
        status:{
            type:String,
            default:"pending"
        },
        shippingType:{
            type:String,
            enum:["express", "standard", "regular"],
            default:"regular"
        },
        message:String
    },
    coupon:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Coupon"
    },
    totalPrice:{
        type:Number,
        required:true
    }
},
{timestamps:true});

const orderModel:Model<OrderTypes> = mongoose.models.Order || mongoose.model<OrderTypes>("Order", orderSchema);

export default orderModel;