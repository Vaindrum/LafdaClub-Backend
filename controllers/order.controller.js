import crypto from "crypto";
import { razorpay } from "../lib/razorpay.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// createOrder:
//   - If `req.body.productId` is present → treat as “buy directly”
//   - Otherwise → assume “checkout cart”
//   - Compute `orderItems[]` and `totalAmount` in both cases
//   - Create a Razorpay order with that totalAmount
//   - Return the newly created Razorpay order’s id/amount to the frontend
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
export const createOrder = async (req, res) => {
  try {
    const { productId, quantity = 1, size, currency = "INR" } = req.body;
    let items = [];
    let totalAmount = 0;

    if (productId) {
      // → Direct “Buy Now” flow
      //    (frontend should have sent: { productId, quantity, size } in the body)
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Build a single-item array
      items.push({
        product: product._id,
        quantity,
        size,
        price: product.price, // optional, but handy to store
      });
      totalAmount = product.price * quantity;
    } else {
      // → “Buy from cart” flow
      const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Build items[] from cart
      items = cart.items.map((ci) => ({
        product: ci.product._id,
        quantity: ci.quantity,
        size: ci.size,
        price: ci.product.price,
      }));

      // Compute total: sum(product.price * quantity)
      totalAmount = cart.items.reduce(
        (sum, ci) => sum + ci.product.price * ci.quantity,
        0
      );
    }

    // 1) Create Razorpay order for the computed totalAmount
    const options = {
      amount: totalAmount * 100, // in paise
      currency,
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder.id);

    // 2) Send back both the Razorpay order data AND our computed items/total
    //    so the frontend can store them (in memory) until verification.
    return res.status(200).json({
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      orderItems: items,
      totalAmount,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    return res.status(500).json({ message: "Order creation failed" });
  }
};


export const verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // Reconstruct the “body” exactly as recommended by Razorpay docs:
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Use the same secret you used when creating the order
    if (!process.env.RAZORPAY_API_SECRET) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("Payment verified (Razorpay signature matched):", razorpay_payment_id);
      return res.status(200).json({ success: true });
    } else {
      console.warn("Invalid Razorpay signature", {
        expected: expectedSignature,
        received: razorpay_signature,
      });
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// submitOrder:
//   - Called *only after* verifyPayment returned { success: true }
//   - We expect the frontend to send:
//       { paymentId, shippingDetails, orderItems: [ ... ] }
//   - If `orderItems` came from a “direct‐buy”, it’s an array of length 1.
//   - If `orderItems` came from a cart checkout, it’s the full cart.
//   - We store the final Order in the DB, then clear the cart if needed.
// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
export const submitOrder = async (req, res) => {
  const { paymentId, shippingDetails, orderItems } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: "No items to place order." });
  }

  try {
    // Compute totalAmount from orderItems[] (redundant if frontend already sent total, 
    // but good to recompute to avoid tampering):
    const totalAmount = orderItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    // Convert each “{ product: <id>, quantity, size, price }” → what Order schema expects:
    const itemsForDB = orderItems.map((it) => ({
      product: it.product,
      quantity: it.quantity,
      size: it.size,
    }));

    // Create the final Order record:
    const newOrder = await Order.create({
      user: req.user._id,
      items: itemsForDB,
      totalAmount,
      paymentId,
      status: "paid",
      shippingDetails,
    });
    console.log("Order saved in DB:", newOrder._id);

    // If this was a cart checkout, clear out the user’s cart.
    // Heuristics: If `orderItems.length > 1` OR the single orderItem does not match the cart, 
    // we assume “cart checkout.” Another approach is to send an extra flag, e.g. “fromCart: true.”
    //
    // Easiest: front-end can send { fromCart: true } in the body. If so, we clear cart; otherwise we skip.
    //
    // (Here’s a version that relies on a “fromCart” boolean:)
    if (req.body.fromCart) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      console.log("Cleared user’s cart after checkout.");
    }

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error submitting order:", err);
    return res.status(500).json({ message: "Error submitting order" });
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
