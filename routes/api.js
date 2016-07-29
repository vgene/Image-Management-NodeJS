var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

//todo 整合常量
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
        //todo 整合常量
        var carimgs=db.collection('carimgs');
        carimgs.find({id:query_id},{id:1,_id:0,mImage:1,sImage:1,brand:1,type:1,lImage:1}).sort({date:-1}).toArray(function(err,items){
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
      //todo 整合常量
      var carInfo=db.collection('carINFO');
      carInfo.find({},{_id:0,id:1,type:1,brand:1,count:1}).sort({brand:1}).toArray(function(err,items){
        if (err || !items ||items.length==0)
          res.send({code:'nok'});
        else
          res.send({code:'ok',cars:items});
      })
    }
  });
});
router.get('/getCarBrands',function(req,res,next){
	MongoClient.connect(url,function(err,db){
    if (err)
      console.log(err);
    else{
      //todo 整合常量
      var carInfo=db.collection('carINFO');
      carInfo.aggregate([{$group : {_id : "$brand"}}]).toArray(function(err,items){
        if (err || !items ||items.length==0)
          res.send({code:'nok'});
        else
          res.send({code:'ok',cars:items});
      })
    }
  });
});
router.get('/getTypebyBrand',function(req,res,next){
  var infos={};
  if (req.query && req.query.name && req.query.name!=""){
    var name = req.query.name;
	console.log(name);
    MongoClient.connect(url,function(err,db){
      if (err)
        console.log(err);
      else{
        var carINFO=db.collection('carINFO');
        carINFO.find({brand:name}).toArray(function(err,item){
			console.log(item);
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
router.get('/stats',function(req,res,next){
	var rescode=null;
	var brands=0;
	var types=0;
	var imgs=0;
	MongoClient.connect(url,function(err,db){
    if (err)
      console.log(err);
    else{
      var carInfo=db.collection('carINFO');
      carInfo.find().count(function(err,data){
			
			if (err || !data)
            res.send({code:'nok',msg:'no item with id'});
			else{
				console.log(data);
				types=data;
				carInfo.distinct("brand",function(err,data){
				if (err || !data)
					res.send({code:'nok',msg:'no item with id'});
				else{
					brands=data.length;
					var carimgs=db.collection('carimgs');
					carimgs.find().count(function(err,data){
						if (err || !data)
							res.send({code:'nok',msg:'no item with id'});
						else{
							console.log(data);
							imgs=data;
							res.send({code:'ok',brand:brands,type:types,img:imgs});
						}
					})
				}
			  })
		  }
        })
    }
  });
});
router.get('/recent',function(req,res,next){
	if (req.query && req.query.page && req.query.page!=""){
    var id = req.query.page;
	id=(id-1)*20;
    MongoClient.connect(url,function(err,db){
      if (err)
        console.log(err);
      else{
        var carimgs=db.collection('carimgs');
        carimgs.find({}).sort({'date':-1}).skip(id).limit(20).toArray(function(err,item){
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

router.get('/deleteimg',function(req,res,next){
	if (req.query && req.query.id && req.query.id!=""&& req.query.img && req.query.img!=""){
    var IMG = req.query.img;
	var ID=req.query.id;
    MongoClient.connect(url,function(err,db){
      if (err)
        console.log(err);
      else{
        var carimgs=db.collection('carimgs');
		var carinfo=db.collection('carINFO');
        carimgs.remove({sImage:IMG,id:ID},function(err){
          if (err)
            res.send({code:'nok'});
          else{
			  carinfo.update({id:ID},{$inc:{count:-1}},function(err){
				  res.send({code:'ok'});
			  })
		  }
            
        })
      }
    });
  }
  else{
    res.send({code:'nok'});
  }
});
module.exports = router;
