import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [{type: String}],
  category: String,
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
