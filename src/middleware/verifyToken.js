const jwt=require('jsonwebtoken');
const User=require('../models/userSchema');

// write a function and check if it is 1st day of the month, then update all users payout to 0
const updatePayout=async()=>{
    const date=new Date();
    if(date.getDate()===1){
        await User.updateMany({},{$set:{payout:0}});
    }
}

const verifyToken=async(req,res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({success:false,message:'Invalid token'});
        }
        req.id=user._id;
        updatePayout();
        next();
    }
    catch(err){
        return res.status(401).json({success:false,message:'Invalid token'});
    }
}



module.exports=verifyToken;

