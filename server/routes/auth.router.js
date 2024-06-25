const express=require("express")
const CryptoJS=require("crypto-js")
const jwt=require("jsonwebtoken")

const router=express.Router()

const User=require("../modal/user.model")

const {protect}=require("../middleware.js/authMiddleware")


router.route("/register")
    .post(async(req,res)=>{
        try {

            const { name, email, password, pic } = req.body;
            const userExists = await User.findOne({ email });
            if (!name || !email || !password) {
                res.status(400).json({message:"Please Enter all the Feilds"});
            }
            
            else if (userExists) {
                res.status(400).json({message:"User already exists"});
            }
            else{
                const newUser=new User({
                    name:name,
                    email:email,
                    password:CryptoJS.AES.encrypt(req.body.password,process.env.PASSWORD_SECRET_KEY).toString(),
                    pic:pic
                })
                const savedUser=await newUser.save()
                const accessToken=jwt.sign({id:savedUser._id},process.env.ACCESS_TOKEN,{expiresIn:"1d"})
                res.status(201).json({savedUser,accessToken})
            }
            
        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Error in Creating a User"})
            
        }
        
    })

    router.route("/login")
        .post(async(req,res)=>{
            try {
                const { email, password } = req.body;
                const user = await User.findOne({ email });
                if(!user){
                    res.status(400).json({message:"User not Exists"})  
                }
                if(user){
                    const decodePassword=CryptoJS.AES.decrypt(user.password,process.env.PASSWORD_SECRET_KEY).toString(CryptoJS.enc.Utf8)
                    decodePassword!==req.body.password && res.status(401).json({message:"Incorrect Password"})
                    const{password,confirmPassword, ...rest}=user._doc
                    const accessToken=jwt.sign({id:user._id},process.env.ACCESS_TOKEN)
                    res.json({...rest,accessToken})

                }
                else{
                    res.status(401).json({message:"Invalid Mobile Number"})
                }
            } catch (error) {
                console.log(error)    
            }
        })

    router.route("/users")
        .get(protect,async(req,res)=>{
            const keyword = req.query.search
            ? {
                $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
                ],
            }
            : {};

        const users = await User.find(keyword).find({ _id: { $ne: req.user._id} });
        res.send(users);
    })

    
    module.exports=router
