var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:29017/carDB';
/* GET users listing. */
router.get('/getCarImages', function(req, res, next) {
  if (!req.query || !req.query.id){
    res.send({code:'nok'});
    console.log('Query failed.');
    console.log(req);
  }
  else{
    var query_id=req.query.id;
    MongoClient.connect(url,function(err,db){
      if (err)
	console.log(err);
      else{
        var carimgs=db.collection('carimgs');
        carimgs.find({id:query_id},{id:1,_id:0,mImage:1,sImage:1,brand:1,type:1,lImage:1},{date:-1}).toArray(function(err,items){
          if (err || !items ||items.length==0)
	    res.send({code:'nok'});
	  else
            res.send({code:'ok',data:items});
	})
      }
    });
  } 
});

router.post('/upload',function(req,res,next){
  var infos={};
  if (req.query){
    infos.brand=req.query.factory;
    infos.type=req.query.type;
    infos.id=req.query.id;
    res.send({code:'ok'});
  }else{
    res.send({code:'nok',msg:'Infomation is not complete'});
    return;
  }
  
});

router.get('/getInfosByID',function(req,res,next){
  var infos={};
  if (req.query && req.query.id && req.query.id!=""){
    var id = req.query.id;
    MongoClient.connect(url,function(err,db){
      if (err)
        console.log(err);
      else{
        var carINFO=db.collection('carINFO');
        carINFO.findOne({id:id},{id:1,_id:0,brand:1,type:1},function(err,item){
          if (err || !item)
            res.send({code:'nok',msg:'no item with id'});
          else
            res.send({code:'ok',data:item});
        })
      }
    });
  }
  else{
    res.send({code:'nok',msg:'empty id'});
  }

});

router.get('/getCarTypes',function(req,res,next){
  MongoClient.connect(url,function(err,db){
    if (err)
      console.log(err);
    else{
      var carInfo=db.collection('carINFO');
      carInfo.find({},{_id:0,id:1,type:1,brand:1,count:1}).toArray(function(err,items){
        if (err || !items ||items.length==0)
          res.send({code:'nok'});
        else
          res.send({code:'ok',cars:items});
      })
    }
  });
});

module.exports = router;
