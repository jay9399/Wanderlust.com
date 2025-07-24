const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js");
const Review=require("../models/review.js");
const {isLoggedIn,isOwner}=require("../middleware.js") 
const listingController=require("../controllers/listings.js");
const multer=require('multer');
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

const wrapAsync= (fn)=>{ 
  return (req,res,next)=>{
     fn(req,res,next).catch(next);
  }
};

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"),wrapAsync(listingController.createListing));




router.get("/new", isLoggedIn,listingController.renderNewForm);



router.get("/:id",wrapAsync(listingController.showListing)
); 




router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEdit));

router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),wrapAsync(listingController.updateListing));   
 
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


module.exports=router;