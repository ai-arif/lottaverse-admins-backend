require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const db = require("./db_config/db");
const app = express();

app.use('/uploads', express.static('uploads'));
// Enable CORS
app.use(cors());
app.use(express.json());
// Connect to the database
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
});


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api", apiRoutes);


const port = process.env.PORT || 5000;
// const port = 6000;


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
