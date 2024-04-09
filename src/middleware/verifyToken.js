const jwt=require('jsonwebtoken');
const User=require('../models/userSchema');

const verifyToken=async(req,res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({success:false,message:'Invalid token'});
        }
        req.id=user._id;
        next();
    }
    catch(err){
        return res.status(401).json({success:false,message:'Invalid token'});
    }
}

module.exports=verifyToken;

