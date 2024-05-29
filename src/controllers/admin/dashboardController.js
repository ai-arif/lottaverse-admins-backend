const User=require('../../models/userSchema');
const sendResponse = require('../../utils/sendResponse');

const dashboardController = async (req, res) => {
    try {
        const users = await User.find();
        sendResponse(res, 200,true, users);
    } catch (error) {
        sendResponse(res, 500,false, error.message);
    }
    }
