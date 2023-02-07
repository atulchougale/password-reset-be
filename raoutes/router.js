const express =require("express");
const router = new express.Router();
const userdb = require ("../models/userSchema");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const keysecret = "atulshahajichougalepoojapatiladi";
const authenticate = require("../moddleware/authenticate");

// email config

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"atul7chougale@gmail.com",
        pass:"smkyxhhmumcmmliq"
    }
})



//for user registration

router.post("/register",async(req,res)=>{
  const { name , email, password ,cpassword } =req.body;

  if( !name || !email || !password || !cpassword){
    res.status(422).json({error:"fill all the details"})
  }

  try {
    const preuser = await userdb.findOne({email:email});
    if(preuser){
        res.status(422).json({error:"This Email is Already Exist"})

    }else if(password !== cpassword){
        res.status(422).json({error:"Password and Confirm Password is Not Match"})
    }else{
        const finalUser = new userdb({
            name, email, password, cpassword
        });

        //here password hashing

        const storeData = await finalUser.save();
        // console.log(storeData)

        res.status(201).json({status:201,storeData})
    }
  } catch (error) {
        res.status(422).json(error);
        console.log("catch block error")
   
  }
});


//user Login

router.post("/login",async(req,res)=>{
    const { email, password } =req.body;

    if( !email || !password){
      res.status(422).json({error:"fill all the details"})
    }

    try {
        const userValid = await userdb.findOne({email:email});
        // console.log(userValid,"userValid")
        if(userValid){
            const isMatch = await bcrypt.compare(password,userValid.password);
            if(!isMatch){
                res.status(422).json({error:"Invalid details"})
            }else{
                // token generate
                const token = await userValid.generateAuthtoken();
                // console.log(token, "token")

                // cookie generate 
                res.cookie("usercookie",token,{
                    expires:new Date(Date.now()+9000000),
                    httpOnly:true
                });

                const result = {
                    userValid,
                    token
                }
                // console.log(result,"result");

                res.status(201).json({status:201,result})
            }
        }else{
            res.status(401).json({status:401,message:"invalid details"});
        }
    } catch (error) {
        res.status(401).json(error)
        console.log("catch block")
    }
})

// User Valid

router.get("/validuser",authenticate,async(req,res)=>{
    try {
        const validUserOne = await userdb.findOne({_id:req.userId});
        // console.log(validUserOne,"validUserOne routerjs91")
        res.status(201).json({status:201,validUserOne})
    } catch (error) {
        res.status(401).json({status:401,error:"error"})
    }
})

//user logout

router.get("/logout",authenticate,async(req,res)=>{
    try {
        req.rootUser.tokens =  req.rootUser.tokens.filter((curelem)=>{
            return curelem.token !== req.token
        });

        res.clearCookie("usercookie",{path:"/"});

        req.rootUser.save();

        res.status(201).json({status:201})

    } catch (error) {
        res.status(401).json({status:401,error})
    }
});

// send email link for reset password 
router.post("/sendpasswordlink",async(req,res)=>{
    console.log(req.body)

    const {email} = req.body;

    if(!email){
        res.status(401)({status:401,message:"Enter Your Email"})
    }

    try {
        const userfind = await userdb.findOne({email:email});
        // console.log(userfind, "userfind");

        // token generate for reset password
        const token = jwt.sign({_id:userfind._id},keysecret,{
            expiresIn:"1d"
        })
        // console.log(token,"token forgot pass")

        const setUserToken = await userdb.findByIdAndUpdate({_id:userfind._id},{verifytoken:token},{new:true})
        // console.log("setUserToken",setUserToken)

        if(setUserToken){
            const mailOption = {
                from:"atul7chougale@gmail.com",
                to:email,
                subject:"Sending Email For Password Reset",
                text:`This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setUserToken.verifytoken}`
            }
            transporter.sendMail(mailOption,(error,info)=>{
                if(error){
                    console.log("error",error);
                    res.status(401).json({status:401,message:"email not send"})
                }else{
                    console.log("Email sent", info.response);
                    res.status(201).json({status:201,message:"Email Send Sucssesfully"})
                }
            })
        }
    } catch (error) {
        res.status(401).json({status:401,message:"invalid user"})
    }
});

// verify user for forgot password time 
router.get("/forgotpassword/:id/:token",async(req,res)=>{
    const {id,token} = req.params;
    // console.log(id,token)

    try {
        const validuser =await userdb.findOne({_id:id,verifytoken:token});
        // console.log("validuser" ,validuser)

        const verifyToken = jwt.verify(token,keysecret);
        // console.log("verifyToken",verifyToken)

        if(validuser && verifyToken._id){
            res.status(201).json({status:201,validuser})
        }else{
            res.status(401).json({status:401,massege:"user not exist"})
        }
    } catch (error) {
        res.status(401).json({status:401,error})

    }
})

// change password

router.post("/forgotpassword/:id/:token",async(req,res)=>{
    const {id,token} = req.params;
    // console.log(id,"id")
    // console.log(token,"token");

    const {password} = req.body;
    console.log(password)

    try {
        const validuser =await userdb.findOne({_id:id,verifytoken:token});
        // console.log("validuser" ,validuser)

        const verifyToken = jwt.verify(token,keysecret);
        // console.log("verifyToken",verifyToken)

        if(validuser && verifyToken._id){
           const newpassword = await bcrypt.hash(password,12);

           const setnewuserpass = await userdb.findByIdAndUpdate({_id:id},{password:newpassword});

           setnewuserpass.save();
           res.status(201).json({status:201,setnewuserpass})
        }else{
            res.status(401).json({status:401,massege:"user not exist"})
        }
    } catch (error) {
        res.status(401).json({status:401,error})

    }
})
module.exports = router;