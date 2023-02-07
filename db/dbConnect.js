const mongoose = require("mongoose");

const DB = "mongodb+srv://atul3733:atul3733@tasks.bwwk1qs.mongodb.net/Authusers?retryWrites=true&w=majority"

mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(()=> console.log("DataBase Connected")).catch((errr)=>{
    console.log(errr);
})