var mongoose=require('mongoose');
var fs=require('fs');
var root_path=process.argv[2] //root path of img file

mongoose.connect('mongodb://localhost:29017/carDB');

var imgSchema = new mongoose.Schema({
	mImage:{type:String},
	sImage:{type:String},
	lImage:{type:String},
	brand:{type:String},
	type:{type:String},
	id:{type:String}
});//build class Img

var imgModel=mongoose.model('carIMG',imgSchema);

function insertToMongo(name,id){
	//console.log(name);
	var iName=name.substring(0,name.lastIndexOf('.jpg'));
	var info= new imgModel({
		mImage:iName,
		sImage:null,
		lImage:null,
		brand:null,
		type:null,
		id:id
	});
	info.save(function(err,info){
		if(err)
			console.log(err);
	});
}

function transverse(root,id){
	console.log(root);
	var files = fs.readdirSync(root);

	files.forEach(function (file){
		if (file.length-file.lastIndexOf('jpg')==3)
			insertToMongo(file,id)
	});
}

function tranverseMain(root){
	var folders = fs.readdirSync(root);

	folders.forEach(function (folder){
		var pathname = root+'/'+folder;
		var stat = fs.lstatSync(pathname);
		if (stat.isDirectory())
			transverse(pathname,folder);
	});
}

tranverseMain(root_path);
