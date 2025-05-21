import Comment from "../models/comment.model.js";
import Review from "../models/review.model.js";

export const createComment = async (req, res) => {
  try {
    const { reviewId, text } = req.body;
    const comment = await Comment.create({
      user: req.user._id,
      review: reviewId,
      text,
    });

    await Review.findByIdAndUpdate(reviewId, {
      $push: { comments: comment._id },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.log("createComment error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (!comment.user.role==="admin" && !comment.user.equals(req.user._id)) return res.status(403).json({ message: "Unauthorized" });

    await Review.findByIdAndUpdate(comment.review._id, {
      $pull: { comments: req.params.commentId },
    });

    await comment.deleteOne();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.log("deleteComment error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reportComment = async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.commentId, { $addToSet: { reports: req.user._id } });
    res.status(200).json({ message: "Comment reported" });
  } catch (err) {
    console.log("reportComment error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;
    const alreadyLiked = comment.likes.includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId }, $pull: { dislikes: userId } };

    await Comment.findByIdAndUpdate(req.params.commentId, update);
    res.status(200).json({ message: alreadyLiked ? "Unliked" : "Liked" });
  } catch (err) {
    console.log("toggleLikeComment error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleDislikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;
    const alreadyDisliked = comment.dislikes.includes(userId);
    const update = alreadyDisliked
      ? { $pull: { dislikes: userId } }
      : { $addToSet: { dislikes: userId }, $pull: { likes: userId } };

    await Comment.findByIdAndUpdate(req.params.commentId, update);
    res.status(200).json({ message: alreadyDisliked ? "Undisliked" : "Disliked" });
  } catch (err) {
    console.log("toggleDislikeComment error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};