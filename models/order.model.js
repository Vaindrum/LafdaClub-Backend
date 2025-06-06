import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    size: String
  }],
  totalAmount: Number,
  status: { type: String, enum: ["pending", "paid", "shipped", "delivered"], default: "pending" },
  razorpayOrderId: String,
  paymentId: String,
  shippingDetails: {
    name: String,
    address: String,
    phone: String,
    pincode: String
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
