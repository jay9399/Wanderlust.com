const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initdata=require("./data.js");
main().then(()=>{
  console.log("welcome to database:");
}).catch(err=>{
   console.log(err);
});
async function main(){
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB=async()=>{
  await Listing.deleteMany({});
  initdata.data= initdata.data.map((obj)=>({...obj,owner:"667a8c26dc24dc888e7ed232"}));
  await Listing.insertMany(initdata.data);
  console.log("data updated!");
} 
initDB();