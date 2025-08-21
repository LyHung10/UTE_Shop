const db = require('../models');
const User = db.User;


exports.getMe = async (req,res,next)=>{
  try{
    const user = await User.findByPk(req.user.sub, { attributes:['id','email','fullName','avatarUrl','isVerified','created_at','updated_at']});
    res.json(user);
  }catch(err){ next(err); }
};

exports.updateMe = async (req,res,next)=>{
  try{
    const user = await User.findByPk(req.user.sub);
    if(!user) return res.status(404).json({message:'Not found'});
    const { fullName, avatarUrl } = req.body;
    if(fullName !== undefined) user.fullName = fullName;
    if(avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();
    res.json({ message:'Cập nhật thành công' });
  }catch(err){ next(err); }
};