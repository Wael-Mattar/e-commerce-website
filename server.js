
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
//require products schema
const products = require('./models/products');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "style")));
app.use("/image", express.static("image"))


mongoose.connect('mongodb+srv://waael:wael123456789@cluster0.a1ufspd.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});
app.use(express.urlencoded({ extended: false }));


app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.get('/', (req, res) => {
  if(!req.session.isLoggedIn)
    req.session.isLoggedIn = false;
  if(!req.session.role)
    req.session.role = "User";
  res.render('home');
})

//delete from store 
app.post('/deleteitem/:name',async(req,res)=>{
  await products.findByIdAndDelete(req.params.name);
  res.redirect('/browse');
})

app.get('/browse', async (req,res)=>{
  //query to find all entries
  const entries = await products.find({});

  //render the browse page with the entries
  res.render('browse',{
    products: entries,
    role: req.session.role,
    isLoggedIn: req.session.isLoggedIn
  })
})

app.get('/forms', async (req, res) => {
  res.render('forms')
})

app.post('/upload', async (req, res) => {
     await products.create({
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
    });
    res.redirect('/browse')//redirect to the handler fo2

})

app.get('/insert',(req,res)=>{
  res.render('insert')
})


var index = require('./routes/index');
const { runInNewContext } = require('vm');

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, function () {
  console.log('Server is started on http://127.0.0.1:'+PORT);
});
