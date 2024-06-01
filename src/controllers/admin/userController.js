const User=require('../../models/userSchema');
const sendResponse=require('../../utils/sendResponse');

// get all users with pagination default 20 users per page
const getUsers=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||20;
        const users=await User.find().skip((page-1)*limit).limit(limit).sort({totalTickets:-1});
        const totalUsers=await User.countDocuments();
        const totalPages=Math.ceil(totalUsers/limit);
        sendResponse(res,200,true,"Users fetched successfully",{users,totalPages});
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
        const users=await User.find({userType:'premium'}).skip((page-1)*limit).limit(limit).sort({totalTickets:-1});
        const totalUsers=await User.countDocuments({userType:'premium'});
        const totalPages=Math.ceil(totalUsers/limit);
        sendResponse(res,200,true,"Premium Users fetched successfully",{
            users,
            totalPages
        });
    }catch(err){
        sendResponse(res,500,false,"Internal server error",err.message);
    }
}
const searchUsersByAddress = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const address = req.query.address;

        if (!address) {
            return sendResponse(res, 400, false, "Address query parameter is required");
        }

        const users = await User.find({ address: { $regex: address, $options: 'i' } })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ totalTickets: -1 });

        const totalUsers = await User.countDocuments({ address: { $regex: address, $options: 'i' } });
        const totalPages = Math.ceil(totalUsers / limit);

        sendResponse(res, 200, true, "Users fetched successfully", {
            users,
            totalPages
        });
    } catch (err) {
        sendResponse(res, 500, false, "Internal server error", err.message);
    }
};


module.exports={
    getUsers,
    makeUser,
    getPremiumUsers,
    searchUsersByAddress
}