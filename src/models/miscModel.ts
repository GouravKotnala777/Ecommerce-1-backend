import mongoose from "mongoose";

export interface MiscSchemaTypes {
    heroSlider:{
        imageURL:string;
        linkURL:string;   
    }[];
}

const miscSchema = new mongoose.Schema<MiscSchemaTypes>({
    heroSlider:[{
        imageURL:{
            type:String
        },
        linkURL:{
            type:String
        }
    }]
});
const miscModel = mongoose.model("Misc", miscSchema);

export default miscModel;