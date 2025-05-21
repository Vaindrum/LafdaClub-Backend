import Review from "../models/review.model.js";

export const createReview = async (req, res) => {
  try {
    const { productId, text, rating } = req.body;
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      text,
      rating,
    });
    res.status(201).json(review);
  } catch (err) {
    console.log("createReview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (!review.user.equals(req.user._id)) return res.status(403).json({ message: "Unauthorized" });

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted" });
  } catch (err) {
    console.log("deleteReview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reportReview = async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.reviewId, { $addToSet: { reports: req.user._id } });
    res.status(200).json({ message: "Review reported" });
  } catch (err) {
    console.log("reportReview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleLikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user._id;
    const alreadyLiked = review.likes.includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId }, $pull: { dislikes: userId } };

    await Review.findByIdAndUpdate(req.params.reviewId, update);
    res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked" });
  } catch (err) {
    console.log("toggleLikeReview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleDislikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const userId = req.user._id;
    const alreadyDisliked = review.dislikes.includes(userId);
    const update = alreadyDisliked
      ? { $pull: { dislikes: userId } }
      : { $addToSet: { dislikes: userId }, $pull: { likes: userId } };

    await Review.findByIdAndUpdate(req.params.reviewId, update);
    res.status(200).json({ message: alreadyDisliked ? "Undisliked" : "Disliked" });
  } catch (err) {
    console.log("toggleDislikeReview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "username")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" },
      });
    if(!reviews || reviews=="") return res.status(404).json({message: "No reviews yet"});
    res.status(200).json(reviews);
  } catch (err) {
    console.log("getReviews error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate("user", "username")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username" },
      });

    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (err) {
    console.log("getReview error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
