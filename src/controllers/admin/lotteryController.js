const Lottery=require('../../models/lotterySchema');
const sendResponse=require('../../utils/sendResponse');
const moment = require("moment");
// in this lottery update controller two fields can be updated, image, expiration
// if file is present then image will be updated
// if expiration is present then expiration will be updated
// if both are present then both will be updated
const lotteryUpdateController=async(req,res)=>{
    try{
        const lotteryID=req.params.id;
        const lottery=await Lottery.findOne({lotteryID:lotteryID});
        if(!lottery){
            return sendResponse(res,404,false,"Lottery not found");
        }
        if(req.file){
            lottery.image=`/uploads/${req.file.filename}`;
        }
        if(req.body.expiry!=null || req.body.expiry!=undefined || req.body.expiry!="null"){
            console.log(req.body.expiry);
            const unixEpochTime = moment(req.body.expiry).unix();
            lottery.expiration=unixEpochTime;
        }
        // find and update the lottery
        await lottery.save();
        sendResponse(res,200,true,"Lottery updated successfully",lottery);
    }catch(err){
        sendResponse(res,500,false,"Internal server error",err.message);
    }
}

module.exports={
    lotteryUpdateController
}