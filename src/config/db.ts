import mongoose from "mongoose";

// const connectDatabase = (databaseURI:string) => {
//     mongoose.connect(databaseURI, {
//         dbName:"Ecommerce1"
//     }).then(() => {console.log("database...");})
//     .catch((error) => {console.log(error);})
// };

async function connectDatabase(databaseURI:string|undefined){
    try {
        if (!databaseURI) {
            throw new Error(`databaseURI is undefined ${databaseURI}`);
        }
        const db = await mongoose.connect(databaseURI);
        console.log("database...");
        
    } catch (error) {
        console.log(error);
    }
};

export default connectDatabase;
