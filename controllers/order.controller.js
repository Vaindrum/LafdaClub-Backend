import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";

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
      status: "paid"
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
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.status(200).json(updatedOrder);
  } catch (err) {
    console.log("Error in updateOrderStatus:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
