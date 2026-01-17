const dotenv = require('dotenv');
const mongoose=  require('mongoose');
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async ()=> {
  try {
    const result = await mongoose.connect(MONGO_URI);
    console.log("MongoDB: Connected SuccessFully");
  }catch (err) {
    console.log("MongoDB: Error In Connection : \n" + err);
  }
}

module.exports = [connectDB];