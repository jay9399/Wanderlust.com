const Listing=require("../models/listing");



module.exports.index = async (req, res) => {
  const { price, location, type } = req.query;
  let filter = {};

  if (price) {
    const [min, max] = price.split('-');
    filter.price = max ? { $gte: min, $lte: max } : { $gte: min };
  }
  if (location) {
    filter.location = location;
  }
  

  const allListings = await Listing.find(filter);
  res.render('listings/index', { allListings });
};


module.exports.renderNewForm=(req,res)=>{
 
  res.render("listings/new.ejs");
  
 };


 module.exports.showListing=async (req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id).populate({path:"reviews",populate:{
   path:"author",
  },}).populate("owner");
  if(!listing){
   req.flash("error","not exist!");
   res.redirect("/listings");
  }
  res.render("listings/show.ejs",{listing});
  
};


module.exports.createListing=async (req,res,next)=>{
 
  let url=req.file.path;
 let filename=req.file.filename;

  const newListing= new Listing(req.body.listing); 
 newListing.owner=req.user._id;
 newListing.image={url,filename};
  await newListing.save();
  console.log(newListing);
  req.flash("success","new listing created:");
  res.redirect("/listings");
 
 };


 module.exports.renderEdit=async (req,res)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  if(!listing){
   req.flash("error","not exist!");
   res.redirect("/listings");
  }
  res.render("listings/edit.ejs",{listing});
 };


 module.exports.updateListing=async(req,res)=>{
  let { id }=req.params;
  console.log(req.body.listing);
  let listing=await Listing.findByIdAndUpdate(id,{ ...req.body.listing });


  if(typeof req.file !=="undefined"){
  let url=req.file.path;
 let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
  }
  
  req.flash("success","listing updated successfully!");
  res.redirect(`/listings/${id}`);   


 };

 module.exports.destroyListing=async (req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success","listing Deleted successfully:");
  res.redirect("/listings");
 };