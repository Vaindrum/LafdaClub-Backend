import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, images } = req.body;
    const newProduct = await Product.create({
      name,
      price,
      category,
      description,
      images,
    });

    console.log("Product created:", newProduct._id);
    res.status(201).json(newProduct);
  } catch (error) {
    console.log("Error in createProduct:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.productId);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.log("Error deleting product:", err.message);
    res.status(500).json({ message: "Error deleting product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.log("Error updating product:", err.message);
    res.status(500).json({ message: "Error updating product" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.log("Error in getProduct:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getProducts:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
