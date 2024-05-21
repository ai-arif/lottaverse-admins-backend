const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/sendResponse");


exports.registerUser = async (req, res) => {
  try {
    const { address, referralLink } = req.body;
    console.log(req.body);
    let parentReferralId = null;
    if (referralLink) {
      const match = referralLink.match(/ref=([^&]+)/);
      console.log(match);
      if (match) {
        parentReferralId = match[1];
      }
    }

    const referralId = generateReferralId();
    const referralLinkForUser = generateReferralLink(address);

    let user = await User.findOne({ address });

    if (!user) {
      if (parentReferralId) {
        // const referredBy = await User.findOne({ referralId: parentReferralId });
        const referredBy = await User.findOne({ address: parentReferralId });
        if (referredBy) {
          user = await User.create({
            address,
            referralId,
            referralLevel: referredBy.referralLevel + 1,
            referredBy: referredBy._id,
            referralLink: referralLinkForUser,
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          });

          referredBy.referredUsers.push(user);
          await referredBy.save();
        }
      } else {
        user = await User.create({
          address,
          referralId,
          referralLink: referralLinkForUser,
          expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
        });
      }
    }

    const token = jwt.sign({ userId: user._id }, "nonacademryorg", {
      expiresIn: "30d",
    });

    sendResponse(res, 200, true, "User registered successfully", { token });
  } catch (err) {
    console.log(err);
    sendResponse(res, 500, false, "Internal server error", err.message);
  }
};

// create a function same as register which will take array of addresses and register them


// "0x3b95654cA3D98278e3be48BBA3694b0c6717dd02",
// "0x400A39935695ab99796f7818c98Ac13E3C35910C",
// "0xd916B8093A34997DA5B7E59b129784017e1C58dA",
// "0xD7103B12527659C083Abc2bBf1f17D849EF26af9",
// "0x2c85014D0A0C5732f9942302677D2fD10D1764A7",
// getUsersDetails
exports.getUsersDetails = async (req, res) => {
  try {
    const users = await User.find().populate("referredUsers");
    sendResponse(res, 200, true, "Users details fetched successfully", users);
  } catch (err) {
    sendResponse(res, 500, false, "Internal server error", err.message);
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    sendResponse(res, 200, true, "User details fetched successfully", user);
  } catch (err) {
    sendResponse(res, 500, false, err.message, err.message);
  }
};

function generateReferralId() {
  return "REF" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateReferralLink(referralId) {
  return `${process.env.APP_URL}?ref=${referralId}`;
}
