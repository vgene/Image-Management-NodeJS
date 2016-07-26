var express = require('express');
var router = express.Router();
var im =require('imagemagick');
var child_process = require('child_process')

var MongoClient = require('mongodb').MongoClient;
//todo 整合常量
var url = 'mongodb://localhost:29017/carDB';

var saveToDB=function(infos,min,mid,ori, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err)
            console.log(err);
        else {
            var carimgs = db.collection('carimgs');

            carimgs.insert({id: infos.id,brand:infos.brand,type:infos.type,sImage:min,mImage:mid,lImage:ori,date:new Date()}, function (err, item) {
                if (err || !item)
                    callback(err);
                else{
                    var carInfo =db.collection('carINFO');
                    carInfo.findOne({id:infos.id},function(err,item){
                        if (err)
                            callback(err);
                        else{
                            //update
                            if (item){
                                carInfo.update({id:infos.id},{$inc:{count:1}},function(err){
                                    if (err)
                                        callback(err);
                                    else
                                        callback();
                                })
                            }//insert
                            else{
                                carInfo.insert({id:infos.id,brand:infos.brand,type:infos.type,count:1,lastUpdate:new Date()},
                                    function(err){
                                        if (err)
                                            callback(err);
                                        else
                                            callback();
                                    });
                            }
                        }
                    })
                }

            })
        }
    });
};



//multer-middleware
var multer = require('multer');
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'/tmp/1234')
    },
    filename:function(req,file,cb){
        cb(null,Date.now())
    }
});
var uploadMulter = multer({storage:storage});

router.post('/images',uploadMulter.single('carfile'),function (req,res,next) {

    var file = req.file;
    var infos = JSON.parse(req.body.infos);

    var ret ={};
    var final_err='unknown err';

    var sendErr = function(){
        console.log(final_err);
        ret = {code: 'nok', msg: final_err.toString(),error:final_err.toString()};
        res.send(ret);
    };

    //处理图片
    console.log(infos);
    console.log(file);

    if (infos && infos.id && file) {
        var ext=file.filename;
        ext=ext.substring(ext.lastIndexOf(".")+1,ext.length);
        console.log(ext);
        var iName =  infos.id+'_'+Date.now();
        var DATA_PATH = '/home/zyxu/carImageData/img/';
        var min = 'thumbnail/'+iName;
        var mid = 'train/'+iName;
        var ori = 'original/'+iName;
        if(ext!="zip") {
            //todo 整合常量
            
            
            
            //todo 移动完应该删除tmp中内容
            im.convert([file.path, '-resize',"256x256!", DATA_PATH+mid+'.jpg'],function (err,stdout) {
               if (err){
                   final_err=err;
                   sendErr();
                   return null;
               }else{
                   im.convert([file.path, '-resize',"50x50", DATA_PATH+min+'.jpg'],function (err,stdout){
                       if (err){
                           final_err=err;
                           sendErr();
                           return null;
                       }else{
                           im.convert([file.path,DATA_PATH+ori+'.jpg'],function(err,stdout){
                               if (err){
                                   final_err=err;
                                   sendErr();
                                   return null;
                               } else{
                                   saveToDB(infos,min,mid,ori,function(err){
                                       if (err){
                                           final_err=err;
                                           sendErr();
                                           return null;
                                       }else{
                                           ret.code='ok';
                                           ret.msg='图片上传成功';
                                           ret.initialPreviewConfig={'url':''};
                                           res.send(ret);
                                       }
                                   });

                               }
                           })
                       }
                   })
               }
            });
        }
        if(ext==="zip"){
            //console.log(file.path);
            //console.log(DATA_PATH);
			//console.log(iName);
			console.log("python tools/unzip.py "+file.path+" "+DATA_PATH+" "+iName);
            unzip=child_process.exec("python tools/unzip.py "+file.path+" "+DATA_PATH+" "+iName,function(err,stdout,stderr){
                //console.log(stdout);
                if(stderr.length!=0){
                    final_err=stderr;
                    sendErr();
                    return null;
                }
				var carfiles=stdout.split("\n");
				console.log(carfiles);
				for (x in carfiles){
					var car=carfiles[x]
					if(car.length<1)
						break;
					min='thumbnail/'+car;
					mid='train/'+car;
					ori='original/'+car;
					saveToDB(infos,min,mid,ori,function(err){
						if (err){
							final_err=err;
							sendErr();
							return null;
						}
					});
				}
                ret.code='ok';
				ret.msg='图片上传成功';
				ret.initialPreviewConfig={'url':''};
				res.send(ret);
                
            });
            
        }


    }
    else{
        final_err = 'no infos or no file';
        sendErr();
    }

});


router.post('/submit',function(req,res,next){
    console.log(req.body);
    res.send({code:'ok'});
});

module.exports = router;

