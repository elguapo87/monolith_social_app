import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected");
        });

        await mongoose.connect(`${process.env.MONGODB_URI}/monolith`);

    } catch (error) {
       const errMessage = error instanceof Error ? error.message : "An unknown error occurred" ;
       console.log(errMessage);
    }
};

export default connectDB;