var express = require('express');
var bcrypt = require('bcryptjs');
var router = express.Router();


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

router.get('/register',function(req,res){
    res.render('register');
});

router.get('/login',function(req,res){
    res.render('login');
});

function ensureAuthenticated(req,res,next){
    if (req.isAuthenticated()){
        if (res.locals.user.privilege != 'unchecked')
            next();
        else{
            res.render('login',{err:"尚未审核"});
        }
    }else{
        res.render('login',{err:'重新登陆'});
    }
}

passport.use(new LocalStrategy(
    function(username,password, done){
        User.getUserByUsername(username,function(err,user){
            if (err) throw err;
            
            if (!user){
                return done(null,false,{message:"未找到用户"});
            }
            
            User.validPassword(password,user.password,function(err,isMatch){
                if (err) throw err;
                if (isMatch)
                    return done(null,user);
                else{
                    return done(null,false,{message:"密码错误"});
                }
            })
        })
    
}));

passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
    User.getUserByID(id,function(err,user){
        done(err,user);
    })
});

router.post('/register',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    
    if (!username || !password || password!=password2){
        res.render('/user/register',{err:"用户名、密码为空或两次密码不一致"})
    }else{
        var newUser = new User({
            username:username,
            password:password
        });
        
        User.createUser(newUser,function(err,user){
            if (err){
                console.log(err);
                res.render('/user/register',{err:err})
            }else{
                res.redirect('/user/login');
            }
        })
        
    }
});

router.post('/login',passport.authenticate('local',{successRedirect:'/',failureRedirect:'/user/login',failureFlash:true}),
function(req,res,next){
    res.redirect('/');
});

router.get('/logout',function(req,res,next){
    req.logout();
    res.redirect('/user/login');
});

module.exports = router;