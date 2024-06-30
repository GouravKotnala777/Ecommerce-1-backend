import mongoose, { Model } from "mongoose";

export interface ProductTypes {
    name:string;
    description:string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    rating: number;
    reviews:mongoose.Schema.Types.ObjectId[];
    sku: string;
    discount: number;
    brand: string;
    dimensions: {
        height: number;
        width: number;
        depth: number;
    },
    weight: number;
    tags: string[]
}

const productSchema = new mongoose.Schema<ProductTypes>({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  price: {
    type:Number,
    required:true
  },
  category: {
    type:String,
    required:true
  },
  stock: {
    type:Number,
    default:0
  },
  images: [{type:String}],
  rating: {
    type:Number,
    default:0
  },
  reviews: [{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Review"
  }],
  sku: String,
  discount: {
    type:Number,
    default:0
  },
  brand: {
    type:String,
    required:true
  },
  dimensions: {
    height: Number,
    width: Number,
    depth: Number
  },
  weight: Number,
  tags: [{type:String}]
});

const productModel:Model<ProductTypes> = mongoose.models.Product || mongoose.model<ProductTypes>("Product", productSchema);

export default productModel;

