import mongoose, { Model } from "mongoose";

export interface ReviewTypes {
    _id: mongoose.Schema.Types.ObjectId;
    productID: mongoose.Schema.Types.ObjectId;
    userID: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
    helpfulCount: number;
}

const reviewSchema = new mongoose.Schema<ReviewTypes>({
    productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{type:Number, default:0},
    comment:String,
    helpfulCount:Number
}, {
    timestamps:true
});

const reviewModel:Model<ReviewTypes> = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default reviewModel;

