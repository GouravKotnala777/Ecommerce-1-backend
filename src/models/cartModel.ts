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
});

const cartModel:Model<CartTypes> = mongoose.models.Cart || mongoose.model<CartTypes>("Cart", cartSchema);

export default cartModel;

// reviews
// _id: ObjectId
// productId: ObjectId (reference to Products collection)
// userId: ObjectId (reference to Users collection)
// rating: Number
// comment: String
// createdAt: Date
// updatedAt: Date
// helpfulCount: Number


// order
// _id: ObjectId
// userId: ObjectId (reference to Users collection)
// products: Array of product objects
// productId: ObjectId (reference to Products collection)
// quantity: Number
// price: Number
// totalAmount: Number
// shippingAddress: Object
// street: String
// city: String
// state: String
// zip: String
// billingAddress: Object (if different from shipping)
// street: String
// city: String
// state: String
// zip: String
// status: String (e.g., "pending", "shipped", "delivered", "cancelled", "returned")
// paymentMethod: String (e.g., "credit card", "paypal", "bank transfer")
// paymentStatus: String (e.g., "paid", "pending", "failed")
// trackingNumber: String
// createdAt: Date
// updatedAt: Date
// orderNotes: String