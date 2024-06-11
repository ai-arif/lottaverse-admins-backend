const AdminSchema = require('../../models/adminSchema');
const sendResponse = require('../../utils/sendResponse');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// create admin, login, change password, 

// create admin
exports.createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await AdminSchema.findOne({ email });
        if (admin) {
            return sendResponse(res, 400, false, 'Admin already exists');
        } 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newAdmin = new AdminSchema({ email, password: hashedPassword });
        await newAdmin.save();
        return sendResponse(res, 200, true, 'Admin created successfully');
    }
    catch (error) {
        return sendResponse(res, 500, false, error.message);
    }
}

exports.verifyAdminHudai=async(req,res)=>{
    try{
        const id=req.id;
        const admin=await AdminSchema.findById(id);
        if(!admin){
            return sendResponse(res,404,false,'Admin not found');
        }
        return sendResponse(res,200,true,'Admin verified',admin);
    }
    catch(error){
        return sendResponse(res,500,false,error.message);
    }
}
// login JWT_ADMIN_SECRET
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await AdminSchema.findOne({ email });
        if (!admin) {
            return sendResponse(res, 404, 'Admin not found');
        }
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return sendResponse(res, 400, 'Invalid password');
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_ADMIN_SECRET, { expiresIn: '60d' });
        return sendResponse(res, 200, true, 'Login successful', { token });
    }
    catch (error) {
        return sendResponse(res, 500, false, error.message);
    }
}

// change password
exports.changeAdminPassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const admin = await AdminSchema.findOne({ email });
        if (!admin) {
            return sendResponse(res, 404, false, 'Admin not found');
        }
        const validPassword = await bcrypt.compare(oldPassword, admin.password);
        if (!validPassword) {
            return sendResponse(res, 400, false, 'Invalid password');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        admin.password = hashedPassword;
        await admin.save();
        return sendResponse(res, 200, true, 'Password changed successfully');
    }
    catch (error) {
        return sendResponse(res, 500, false, error.message);
    }
}

