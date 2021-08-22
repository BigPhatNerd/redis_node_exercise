const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const redis = require('redis');

let client = redis.createClient();

client.on('connect', function(){
	console.log("Connected to Redis..")
})


const port = 3000;

const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.get('/', function(req,res,next){
	res.render('searchusers');
})
app.post('/user/search', function(req, res, next){
	let id = req.body.id;

	client.hgetall(id, function(err, obj){
		if(!obj){
			res.render('searchusers', {
				error: "User does not exist"
			})
		}else {
			obj.id = id;
			res.render('details', {
				user: obj
			})

		}
})
})

app.get("/user/add", function (req, res, next) {
  res.render("adduser");
});

app.post("/user/add", function (req, res, next) {
	console.log(req.body)
	let { id, first_name, last_name, email, phone } = req.body

  client.hmset(
    id,
    [
      'first_name',
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    function (err, reply) {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect("/");
    }
  );
});

app.delete("/user/delete/:id", function(req, res, next){
	client.del(req.params.id);
	res.redirect('/');
})

app.listen(port, function(){
	console.log(`Server started on port ${port}`)
})