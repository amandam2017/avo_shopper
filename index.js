const express = require('express');
const exphbs  = require('express-handlebars');

const AvoShopper = require('./avo-shopper');
const pg = require('pg');
const Pool = pg.Pool;

const app = express();
const PORT =  process.env.PORT || 3019;

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//connect to the database with connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/avo_shopper';
 const pool = new Pool({
	 connectionString
 });

const avoshopper = AvoShopper(pool);
 
// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

let counter = 0;

//home route to display top 5 deals
app.get('/', async function(req, res) {

	const topDeals = await avoshopper.topFiveDeals();
	// console.log('deals????'+await avoshopper.topFiveDeals())
	res.render('index', {
		topDeals,
		// counter
	});
});

//add deal and a post route to submit deal to db
app.get('/deal/add', async function(req, res) {
	const shops = await avoshopper.listShops();
	res.render('deal/add', {
		shops
	});
});

app.post('/deal/add:deals', function(req,res){
	console.log(req.body);
	const dealsValues = req.params.deals
	avoshopper.createDeal(dealsValues);
	res.redirect('/');
});

//add shop
app.get('/shop/add', function(req, res) {

	res.render('shop/add', {
	});
});

app.post('/shop/add', function(req,res){
	console.log(req.body);
	avoshopper.createShop(req.body.name);
	res.redirect('shop/add');
});


app.get('/shop/list', async function(req, res) {
	const shops = await avoshopper.listShops();
	res.render('shop/list', {
		shops
	});
});



// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function() {
	console.log(`AvoApp started on port ${PORT}`)
});