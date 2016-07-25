var express = require('express');
var router = express.Router();
var http = require('http');


function ensureAuthenticated(req,res,next){
  if (req.isAuthenticated()){
    if (req.user && req.user.privilege != 'unchecked')
      next();
    else{
      res.render('login',{err:"尚未审核"});
    }
  }else{
    res.render('login',{err:'重新登陆'});
  }
}

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express' ,user:req.user});
});
router.get('/temp', ensureAuthenticated, function(req,res,nest){
  res.render('temp');
});
router.get('/upload',ensureAuthenticated, function(req,res,next){
  var infos={};
  try{
  if (req.query && req.query.id && req.query.id!=""){
    infos.id=req.query.id;
  }
  }
  catch(e){
    console.log(e);
  }

  if (infos.id) {
    infos.readonly = "readonly=\"readonly\"";
//todo 整合常量
    var url='http://localhost:5055/api/getInfosByID?id='+infos.id;
    http.get(url,function(apiRes){
      var resData=[];
      apiRes.on('data',function(chunk){
        console.log(chunk);
        resData.push(chunk);
      })
          .on('end',function(){
            var final;
            try {
              final = resData.join("");
              final = JSON.parse(final);
              console.log(final.data);
              infos.brand = final.data.brand;
              infos.type = final.data.type;
              res.render('upload',infos);
            }catch(e){
              res.render('upload',infos);
            }
          });
    })
  }
  else{
    infos.user = req.user;
    res.render('upload',infos);
  }

});

router.get('/readme',ensureAuthenticated,function(req,res){
  res.render('readme',{user:req.user});
});

module.exports = router;
