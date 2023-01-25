var express = require('express');
var router = express.Router();
var User = require('../models/user');
const bcrypt = require('bcrypt');
/*const purchaseditems = require('../models/purchaseditems');*/

router.post('/', async (req, res, next)=> {
	console.log(req.body);
	// put the body inputs in one variable
	var personInfo = req.body;

	//for encryption
	var hashed;
	hashed = await bcrypt.hash(req.body.password, 10);

	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send("One of the fields is empty!");
	} else {
		//if the password and the confirm one is equal
		if (personInfo.password == personInfo.passwordConf) {

			//find the most recent user entered the db
			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: hashed,//changed name for encryption
							
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);//sort in desc order as per the id
					
					res.send({"Success":"You are registered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('forms.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if (bcrypt.compare(req.body.password,data.password)){
				//console.log("Done Login");
				req.session.isLoggedIn = true;
				req.session.role = data.role;
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not registered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/home');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});


router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/home');
    	}
    });
}
});

/*
router.post('/purchase', async (req, res)=>{
	var items = req.body;

	for (var i = 0; i < items.length; i++)
		await purchaseditems.create({
			userID: req.session.userID,
			itemName: items.itemName,
			purchaseQuantity: items.purchaseQuantity,
			totalPrice: items.totalPrice
		})

	res.send("Success");
})

router.get('/purchased', async(req,res)=>{
	const purchase = await purchaseditems.find({userId: req.session.userId});
	console.log(purchase)
	res.render('purchaseDetails', {purchases: purchase})
})

*/


router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not registered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;