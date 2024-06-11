const jwt=require('jsonwebtoken');
const AdminSchema=require('../models/adminSchema');

const verifyAdminToken=async(req,res,next)=>{
    try{
        const token=req.headers.authorization.split(' ')[1];
        const decoded=jwt.verify(token,process.env.JWT_ADMIN_SECRET);
        const admin=await AdminSchema.findById(decoded.id);
        if(!admin){
            return res.status(401).json({success:false,message:'Invalid token'});
        }
        req.id=admin._id;
        next();
    }
    catch(err){
        return res.status(401).json({success:false,message:'Invalid token'});
    }
}

module.exports=verifyAdminToken;