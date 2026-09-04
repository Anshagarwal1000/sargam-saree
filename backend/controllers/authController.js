
const User = require("../models/userModel")

exports.registerUser = async (req,res)=>{
try{

const {name,email,password} = req.body
if(!name || !email || !password){
return res.status(400).json({
message:"All fields are required"
})
}

const existingUser = await User.findOne({email})
if(existingUser){
return res.status(400).json({
message:"User already exists"
})
}
const hashPassword = await bcrypt.hash(password,10)

const user = await User.create({
name,
email,
password : hashPassword,
})

const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'})

res.json({
success:true,
message:"User Registered Successfully",
user,
token
})

}catch(err){
res.status(500).json({
success:false,
error:err.message
})
}
}

exports.loginUser = async (req,res)=>{
try{

const {email,password} = req.body
if(!email || !password){
return res.status(400).json({
message:"All fields are required"
})
}

const user = await User.findOne({email})
if(!user){
return res.status(404).json({
message:"User not found"
})
}

// Add password verification logic here
const isMatch = await bcrypt.compare(password,user.password)
if(!isMatch){
return res.status(400).json({
message:"Invalid credentials"
})
}
const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'})

res.json({
success:true,
message:"User Logged In Successfully",
user,
token
})

}catch(err){
res.status(500).json({
success:false,
error:err.message
})
}
}

exports.getProfile = async (req,res)=>{
try{

const user = await User.findById(req.user.id).select("-password")

if(!user){
return res.status(404).json({
message:"User not found"
})
}

res.json({
success:true,
user
})
}catch(err){
res.status(500).json({
success:false,error:err.message
})
}
}
