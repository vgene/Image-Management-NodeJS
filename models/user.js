var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    username:{
        type:String
    },
    password:{
        type:String
    },
    privilege:{
        type:String
    }
});

var User = module.exports = mongoose.model("User",UserSchema);

module.exports.createUser = function(newUser,callback){
    newUser.privilege = 'unchecked';
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(newUser.password,salt,function(err,hash){
            newUser.password = hash;
            User.find({username:newUser.username},{},{limit:1},function (err,user) {
                if (err){
                    callback(err,null);
                }else{
                    if (user.length>0){
                        callback('已被注册',null);
                    }else{
                        console.log(newUser);
                        newUser.save(callback);
                    }
                }
                
            })
        })
    })
};


module.exports.validPassword = function(pwd,hash,callback){
    bcrypt.compare(pwd,hash,function(err,isMatch){
        if (err) throw err;
        callback(null,isMatch);
    })
};

module.exports.getUserByUsername = function(username,callback) {
    User.findOne({username: username}, callback);
};

module.exports.getUserByID = function(id,callback){
    User.findById(id,callback);
};