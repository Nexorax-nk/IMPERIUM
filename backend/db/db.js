import mongoose from "mongoose";

export async function ConnectDB() {

  try {
    const conn = await mongoose.connect(process.env.URI);
    console.log("successfully connected!!!!!!1");
  } catch (err) {
    console.log("error found ", err);
  }
  
}