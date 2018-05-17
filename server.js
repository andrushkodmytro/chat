

var express=require('express');
var app=express();

app.use(express.static(__dirname));  /*відображення статичного контенту*/

//pidkluchaemo modul socket io

var server=require('http').createServer(app);
var io=require('socket.io')(server);

var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var ChatUser=require('./chatuser');

// Підключаємо кукі прасер
var cookieParser=require('cookie-parser')();
app.use(cookieParser);

// Pidklucheemo cookie sesion i dayemo chas zyednannya 2 godyny
var session=require('cookie-session')({
	keys:['secret'],
	maxAge:2*60*60*1000
});
app.use(session);

//Pidkluchayemo Passport
var passport=require('passport');
app.use(passport.initialize());
app.use(passport.session());

//Stvoryuemo  passport lokal priyednuemo do passporta irelizuyemo logiku autrentyfikacii

var LocalStrategy=require('passport-local').Strategy;
passport.use(new LocalStrategy(function(username, password, done){
	ChatUser.find({
		user:username,
		password:password
	},
	function(err,data){
		console.log(data);
		if(data.length){
			return done(null, {id:data[0]._id, user:data[0].user})
		}
		return done (null, false)
	})
}))
// zapysuemo dani obyekta yakiy povertaye strategiya, korystuvach avtoryzuyetsya

passport.serializeUser(
	function(user, done){
		console.log('serialize user:');
		console.log(user);
		done(null, user)
	}
)
 // pry vsih nastupnych zvernnennyah doservera vibuvayetsa dysserializaciya na osnovi danych sesiyi
 passport.deserializeUser(
 	function(id, done){
 		console.log("deserializeUser");
 		ChatUser.find({
 			_id:id.id
 		}, 
 		function(err, data){
 			console.log(data);
 			if(data.length==1)
 				done(null, {user:data[0].user})
 		})

 	})

//zapusk autyntyfikacii na osnovi likalnli strategii z vidpovidnym redirekt
	var auth=passport.authenticate(
		'local', {successRedirect:'/',
			failureRedirect:'/login'})

// pereviryayemo chy korystuvach avtoryzovaniy
	
	var myAuth=function(req, res, next){
		if(req.isAuthenticated()){
			next();
			console.log('next')
		}

		else 
			res.redirect('/login')
	}

	app.get('/', myAuth);
	app.get('/', function(req, res){
		console.log(req.user);
		console.log(req.session);
		res.sendFile(__dirname+'/chat.html');

	});
	app.post('/login', auth);
	app.get('/login', function(req, res){
		res.sendFile(__dirname+'/login.html')
	})

app.get('/getuser', (req,res)=>{
	console.log(req.user);
	res.send(req.user.user)
})
app.get('/logout', (req,res)=>{
	req.logout();
	console.log(req.sesion)
	 res.send('logout');
	
})
// app.get('/', function(req, res) {
// 	res.sendFile(__dirname+'/Login.html')
// })

//приєднуємо сокет до сесії
io.use(function(socket,next){
	var req=socket.handshake;
	var res={};
	cookieParser(req,res, function(err){
		if(err) next(err);
		session(req,res,next)
	})
})
var users=[];
io.on('connection', function(socket){
	
	var user=socket.handshake.session.passport.user.user;
	console.log(user)
	socket.on('joinuser', function(data){
		console.log(data);
		socket.emit('joinserver', data);
		socket.on('msg',function(data){
			io.sockets.emit('mesegserver',data);
		})
	})
})

//io.sockets.emit повідомлення отримують всі користувачі
// socket.broadcast.emit отримують всі крім відправника




server.listen(process.env.PORT||8080)
console.log('Server run');