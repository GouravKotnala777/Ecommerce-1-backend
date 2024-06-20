import mongoose from "mongoose";

interface ProductTypes {
    name:string;
    description:string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    rating: number;
    reviews: {
        userId: mongoose.Schema.Types.ObjectId;
        comment: string;
        rating: number;
        createdAt: Date;
    }[];
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
  },
  price: Number,
  category: String,
  stock: Number,
  images: [{type:String}],
  rating: Number,
  reviews: [{
        userId: mongoose.Schema.Types.ObjectId,
        comment: String,
        rating: Number,
        createdAt: Date
    }],
  sku: String,
  discount: Number,
  brand: String,
  dimensions: {
    height: Number,
    width: Number,
    depth: Number
  },
  weight: Number,
  tags: [{type:String}]
});

const productModel = mongoose.models.Product || mongoose.model<ProductTypes>("Product", productSchema);

export default productModel;

