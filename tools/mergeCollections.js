var MongoClient=require('mongodb').MongoClient

var url='mongodb://localhost:29017/carDB';


var updateImg=function(doc,imgs,db){

	var carINFO=db.collection('carINFO');

	carINFO.findOne({id:doc.id},function(err,infoDoc){
		console.log(doc.id);
		if (err){
			console.log(err);
		}
		else
			imgs.updateOne(doc,{$set:{brand:infoDoc.brand,type:infoDoc.type}},function(err,result){
				if (err)
					console.log(err);
			});
	})
}

MongoClient.connect(url,function(err,db){
	if (err)
		console.log(err);
	else{
		var imgs = db.collection('carimgs');
		imgs.find({}).toArray(function(err,docs){
			if (err)
				console.log(err);
			else{
				docs.forEach(function(doc){
					updateImg(doc,imgs,db);	
				});
			}
		});
	}
});
