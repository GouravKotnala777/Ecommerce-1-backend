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


    sub_category:string;
    sub_category_type?:string;
    item_form:string;

    total_servings:number;
    diet_type:string;
    flavour:string;
    age_range:string;
    about:string[];
    ingredient:string;



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



  sub_category:{
    type:String
  },
  sub_category_type:{
    type:String
  },
  item_form:{
    type:String
  },

  total_servings:{
    type:Number,
    default:0
  },
  diet_type:{
    type:String,
    default:"veg"
  },
  flavour:{
    type:String,
    default:"unflavoured"
  },
  about:[{
    type:String,
    default:["good product"]
  }],
  age_range:{
    type:String,
    default:"adult"
  },
  ingredient:{
    type:String,
    default:"write ingredients"
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

