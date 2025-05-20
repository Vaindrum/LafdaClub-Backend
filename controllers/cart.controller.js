import Cart from "../models/cart.model.js";

export const addToCart = async (req, res) => {
  const { productId, quantity, size } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item =>
      item.product.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ product: productId, quantity: quantity || 1, size });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.log("Error adding to cart:", err.message);
    res.status(500).json({ message: "Error adding to cart" });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId, size } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    
    const item = cart.items.find(
     i => i.product.toString() === productId && i.size === size
   );
   
   if (!item) return res.status(404).json({ message: "Item not found in cart" });
   
    cart.items = cart.items.filter(item =>
      !(item.product.toString() === productId && item.size === size)
    );


    await cart.save();
    res.json(cart);
  } catch (err) {
    console.log("Error removing from cart:", err.message);
    res.status(500).json({ message: "Error removing from cart" });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { productId, size, action } = req.body; // action: "increase" or "decrease"
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      i => i.product.toString() === productId && i.size === size
    );

    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    if (action === "increase") {
      item.quantity += 1;
    } else if (action === "decrease") {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter(
          i => !(i.product.toString() === productId && i.size === size)
        );
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated", cart });

  } catch (error) {
    console.error("Error in updateCart:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.status(200).json({ items: [] });
    res.status(200).json(cart);
  } catch (err) {
    console.log("Error in getCart:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
