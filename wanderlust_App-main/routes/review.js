 const express=require("express");
const router=express.Router({mergeParams:true});
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const reviewController=require("../controllers/reviews.js");
const {isLoggedIn, isReviewAuthor}=require("../middleware.js");
const wrapAsync= (fn)=>{
  return (req,res,next)=>{
     fn(req,res,next).catch(next);
  }
};

router.post("/",isLoggedIn,reviewController.createReview);

router.delete("/:reviewId",isReviewAuthor,wrapAsync(reviewController.destroyReview));
module.exports=router;