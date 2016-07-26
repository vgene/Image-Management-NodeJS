var express = require('express');
var router = express.Router();
var http = require('http');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/stats',function(req,res,nest){
  res.render('stats');
});
router.get('/upload',function(req,res,next){
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
    res.render('upload',infos);
  }

});

router.get('/readme',function(req,res){
  res.render('readme');
});

module.exports = router;
