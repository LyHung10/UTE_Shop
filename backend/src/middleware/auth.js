const jwt = require('jsonwebtoken');
require('dotenv').config();


function auth(required=true) {
return (req,res,next)=>{
const header = req.headers.authorization || '';
const token = header.startsWith('Bearer ') ? header.slice(7) : null;
if(!token){ if(required) return res.status(401).json({message:'Missing token'}); else return next(); }
try {
const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
req.user = payload; // { sub: userId, email }
next();
} catch (e) { return res.status(401).json({message:'Invalid/expired token'}); }
};
}


module.exports = { auth };