const User=require('../../models/userSchema');
const sendResponse=require('../../utils/sendResponse');

// get all users with pagination default 20 users per page
const getUsers=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||20;
        const users=await User.find().skip((page-1)*limit).limit(limit);
        sendResponse(res,200,true,"Users fetched successfully",users);
    }catch(err){
        sendResponse(res,500,false,"Internal server error",err.message);
    }
}

// create controller to make userType user, or premium, just change with the previous one
const makeUser=async(req,res)=>{
    try{
        const userID=req.params.id;
        const user=await User.findById(userID);
        if(!user){
            return sendResponse(res,404,false,"User not found");
        }
        // if user is already user then make it premium
        if(user.userType==='user'){
            user.userType='premium';
        }
        else{
            user.userType='user';
        }
        await user.save();
        sendResponse(res,200,true,"User type updated successfully",user);
    }
    catch(err){
        sendResponse(res,500,false,"Internal server error",err.message);
    }
}

// create an api same strcuture with getUsers, but this time get all premium users
const getPremiumUsers=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||20;
        const users=await User.find({userType:'premium'}).skip((page-1)*limit).limit(limit);
        sendResponse(res,200,true,"Premium Users fetched successfully",users);
    }catch(err){
        sendResponse(res,500,false,"Internal server error",err.message);
    }
}

module.exports={
    getUsers,
    makeUser,
    getPremiumUsers
}