import crypto from "crypto";
import { razorpay } from "../lib/razorpay.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";

export const createOrder = async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  try {
    const options = {
      amount: amount * 100, // paise
      currency,
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);
    res.status(200).json(order);
  } catch (err) {
    console.log("Error creating Razorpay order:", err.message);
    res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (isValid) {
    console.log("Payment verified:", razorpay_payment_id);
    res.status(200).json({ success: true });
  } else {
    console.log("Invalid Razorpay signature");
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
};

export const submitOrder = async (req, res) => {
  const { paymentId, shippingDetails } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      size: item.size
    }));

    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentId,
      status: "paid",
      shippingDetails
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.log("Error submitting order:", err.message);
    res.status(500).json({ message: "Error submitting order" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("items.product");
    res.status(200).json(orders);
  } catch (err) {
    console.log("Error in getOrders:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user._id })
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err) {
    console.log("Error in getOrder:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "username email").populate("items.product");
    res.status(200).json(orders);
  } catch (err) {
    console.log("Error in getAllOrders:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { runValidators: true }, { new: true });
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.log("Error in updateOrderStatus:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
