import mongoose, { Model } from "mongoose";


export interface CouponTypes {
    code:string;
    discountType:string;
    amount:number;
    minPerchaseAmount:number;
    startedDate:Date;
    endDate:Date;
    usageLimit:number;
    usedCount:number;
}

const couponSchema = new mongoose.Schema<CouponTypes>({
    code:{
        type:String,
        unique:true,
        required:true
    },
    discountType:{
        type:String,
        enum:["percentage", "fixed"],
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    minPerchaseAmount:{
        type:Number,
        default:0
    },
    startedDate:{
        type:Date,
    },
    endDate:{
        type:Date
    },
    usageLimit:{
        type:Number,
        default:1
    },
    usedCount:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

const couponModel:Model<CouponTypes> = mongoose.models.Coupon || mongoose.model<CouponTypes>("Coupon", couponSchema);

export default couponModel;