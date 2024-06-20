import mongoose from "mongoose";

const connectDatabase = (databaseURI:string) => {
    mongoose.connect(databaseURI, {
        dbName:"Ecommerce1"
    }).then(() => {console.log("database...");})
    .catch((error) => {console.log(error);})
};

export default connectDatabase;