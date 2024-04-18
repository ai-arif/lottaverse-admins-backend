const mongoose = require("mongoose");

console.log(process.env.DB_URL);
// mongoose.connect(
//   "mongodb+srv://mdrifatbd5:mBAoMcR4wx0k1bL5@cluster0.5zrkl1o.mongodb.net/lotaverse-user"
// );

mongoose.connect(process.env.DB_URL);

module.exports = mongoose.connection;
