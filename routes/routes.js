const express=require("express");
const router=express.Router();
const User=require("../models/users");
const multer=require("multer");
const fs=require("fs");

// image upload
var storage=multer.diskStorage({
    destination:function(req,file,cb){
      cb(null,"./uploads");
    },
    filename:function(req,file,cb){
      cb(null,file.fieldname+"_"+ Date.now() +"_"+ file.originalname);
    }
});

var upload=multer({
    storage:storage,
}).single("image");

// insert an user into database route
router.post("/add",upload, async (req, res) => {
    try {
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            image:req.file.filename
         });
        await user.save();
        req.session.message = {
            type: "success",
            message: "User added successfully!"
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

// Get all users route
router.get("/",async(req,res)=>{    
   try{
    const users=await User.find();  
    res.render("index",{
          title:"Home Page",
          users:users
    });
   }catch (err){
    res.json({ message: err.message });
   }   

});
// Edit an user route
router.get("/edit/:id",async(req,res)=>{ 
  try{
      let id=req.params.id;      
      const user=await User.findOne({_id:id});      
      if(user==null){
        res.redirect("/");
      }else{
         res.render("edit_users",{
            title:"Edit User",
            user:user
         });
      }
  }catch{
    res.redirect("/");
  }
});

// Update user route
router.post("/update/:id",upload,async (req,res)=>{
   try{
       let id=req.params.id;  
       let new_image="";

       if(req.file){
        new_image=req.file.filename; 
        try{
            fs.unlinkSync("./uploads/"+req.body.old_image);
        }catch(err){
          console.log(err);
        }
       }else{
        new_image=req.body.old_image;
       }
         
       const user=await User.findOne({_id:id});
       user.name=req.body.name;     
       user.email=req.body.email,
       user.phone=req.body.phone,
       user.image=new_image
       await user.save();
       req.session.message={
        type:'success',
        message:"User updated successfully!"
       };
       res.redirect("/");
   }catch(err){
       res.json({message: err.message,type:"danger"});
   }
});
// delete User route
router.get("/delete/:id",async(req,res)=>{
    try{
        let id=req.params.id;  
        const user=await User.findOne({_id:id});
        await User.deleteOne({_id:id});
        if(user.image!=''){
            fs.unlinkSync("./uploads/"+user.image);
        }
        
        req.session.message={
            type:'info',
            message:"User deleted successfully!"
           };
          res.redirect("/");
    }catch{
        res.json({message: err.message,type:"danger"});
    }
});

router.get("/add",(req,res)=>{
    res.render("add_users",{title:"Add Users"})
})


module.exports=router; 