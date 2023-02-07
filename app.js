const express = require("express");
const app = express();
const router = require("./raoutes/router");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./db/dbConnect");
const port = 7007;
require("dotenv").config();

// app.get("/",(req,res)=>{
//     res.status(201).json("server crerated")
// })

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(router);

app.listen(port, () => {
    console.log(`server started at port no.: ${port}`)
})