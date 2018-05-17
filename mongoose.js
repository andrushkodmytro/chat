var mongoose=require('mongoose');
mongoose.connect('mongodb://userchat:User2010@ds117730.mlab.com:17730/basechat');
console.log("mongodb connect...")
module.exports=mongoose;