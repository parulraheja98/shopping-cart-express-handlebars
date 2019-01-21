var express = require('express'),
    handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/d45');

var app = express();
var credentials = require('./credentials.js');
var product = require('./models/product.js');
var cookieSession = require('cookie-session');
var rateLimit = require('express-rate-limit');
var createFetchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min window
    max: 200, // start blocking after 100 requests
    message:
        "Too many requests , don't try to brute force hahaha"
});
// setting up rate limit for potential brute force attacks
app.use(createFetchLimiter);
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        debug: function () {
            console.log("Current Context");
            console.log("=================");
            console.log(this);
            return null
        },
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3017);
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('body-parser').json());
app.set('trust proxy', 1)
app.use(
    cookieSession({
        secret: 'keyboard cat',
        name: 'session',
        keys: ['key1', 'key2'],
        cookie: {secure: false}

    }))

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(express.static(__dirname + '/public'));

/**
 * Delete all the custom products , except the default products created on start
 automatically for testing
 */

app.get('/deletecustomproducts', function (req, res) {
    product.remove({}, function (err, products) {
        if (!err)
            res.render('deleteproducts');
    })


})

/**
 * Let the user create custom products
 *
 */

app.get('/createcustomproducts', function (req, res) {
    res.render('createproducts');
})


app.post('/createProduct', function (req, res) {

    product.find({title: req.body.title}, function (err, prod) {

    }).then(function (resProduct) {

        if (resProduct.length <= 0) {
            newproduct = product({
                title: req.body.title,
                price: req.body.price,
                inventory_count: req.body.inventory
            });
            newproduct.save();
            res.redirect('/fetchproducts');
        }
        else {
            res.render('incorrectproduct');
        }
    })
})

/**
 * Create Sample Products for testing
 *
 */

app.get('/createsampleproducts', function (req, res) {

    var products = [
        {title: 'test-product-1', price: 20, inventory_count: 10},
        {title: 'test-product-2', price: 10, inventory_count: 20},
    ];

    products.forEach(function (n, i) {

        product.update(
            {title: n.title},
            {$setOnInsert: n},
            {upsert: true},
            function(err, numAffected) {
                console.log("Update Completed ");
            }
        );

            if (i == products.length - 1)
                productsCreated();


        function productsCreated() {
            res.redirect(303, '/fetchproducts');
        }


    })

})

/**
 * Get the products with available inventory
 * Parameter check type String
 * If parameter passed is available it will list all products
 * Displays the title , price and inventory of product
 * having inventory
 *
 */
app.get('/fetchproducts/:check', function (req, res) {
    if (req.params.check === 'available') {
        product.find({inventory_count: {$gt: 0}}, function (err, products) {
            res.render("displayProducts", {productsForDisplay: products});
        })
    }
    else {
        res.render('404');
    }
})

/**
 * Get all the products created with or without inventory
 * Displays the title , price and inventory of product
 *
 */

app.get('/fetchproducts', function (req, res) {
    product.find({}, function (err, prod) {
        res.render('displayProducts', {productsForDisplay: prod})
    })


})


/**
 * Update the quantity of product when in the cart
 * Check if updated quantity is greater than the available inventory
 * If quantity is greater than inventory disable checkout button
 * Update the quantity of product along with the price of product.
 */

app.post('/updatecart', function (req, res) {
    var testCheck = false;
    var counter = 0;
    var testInvt = 0;
    var cartinf = req.session.cart;
    var ar = [];
    cartinf.items.forEach(function (cartitem, count) {

        function contentcart() {
            res.redirect(303, '/cart');
        }

        var difference = req.body[cartitem.title] - cartitem.quantity;
        quant = cartitem.quantity;
        var cartstoreitem = {
            title: cartitem.title,
            quantity: quant
        }
        ar.push(cartstoreitem);
        cartitem.quantity = parseInt(req.body[cartitem.title]);
        product.find({title: cartitem.title}, function (err, r) {
            return r
        }).then(function (r) {
            if (req.body[cartitem.title] > r[0].inventory_count) {
                req.session.cart.inventory_available = false;
                testInvt++;
            }

            /**
             * If quantity entered for the product is 0 , product is removed from cart
             */
            if (req.body[cartitem.title] == 0) {
                var updQuantity;
                for (var i = 0; i < ar.length; i++) {
                    if (cartitem.title == ar[i].title)
                        updQuantity = ar[i].quantity;

                }
                cartinf.total_price -= updQuantity * cartitem.price;
                cartinf.items.splice(count - counter, 1);
                counter++;
                testCheck = true;


            }
            /*
            Total Price is decreased because quantity is decreased
             */
            else if (difference < 0) {
                cartinf.total_price -= (-difference) * cartitem.price;
                cartinf.total_price = Math.round(cartinf.total_price * 100) / 100;
            }
            /*
            Total Price is increased because quantity is increased
             */
            else if (difference > 0) {
                cartinf.total_price += (difference) * cartitem.price;
                cartinf.total_price = Math.round(cartinf.total_price * 100) / 100;

            }
            /*
            If cart has no items ask the user to add items
             */

            if (cartinf.items.length == 0)
                res.render('emptycart');

            else {
                if ((count === cartinf.items.length - 1 && !testCheck) || (testCheck && count === cartinf.items.length - 1 + counter)) {
                    if (testInvt === 0)
                        req.session.cart.inventory_available = true;
                    contentcart();

                }


            }
        })
    })
})

/**
 * Clear the Cart
 * Removes the session data of the cart
 */


app.get('/cart/clear', function (req, res) {
    req.session.cart = null;
    res.render('emptycart');
})


/**
 * Displays the cart information
 * Cart total price , added products
 * Checkout button is visible if products are in stock
 */

app.get('/cart', function (req, res) {
        if (req.session.cart != undefined) {
            var checkingavailability = true;
            var cart_items = req.session.cart.items;
            cart_items.forEach(function (item, i) {
                product.find({title: item.title}, function (err, prod) {
                    if (prod[0].inventory_count < item.quantity) {
                        /*
                        if quantity entered by user is more than the
                        available inventory set the checkavailability
                        false
                         */
                        checkingavailability = false;
                        req.session.cart.inventory_available = false;
                        navigateCart();
                    }

                    if (cart_items.length - 1 == i && checkingavailability)
                        navigateCart();

                })

            })

            function navigateCart() {
                res.render('cart', {
                    cartitems: req.session.cart.items,
                    total_price: req.session.cart.total_price,
                    checkout: checkingavailability
                });
            }


        }
        else {
            /*
            Message is displayed if navigated to cart with
            no products
             */
            res.send("Your shopping Cart is Empty " + '<a href="/fetchproducts">' + "Click here to choose product" + '</a>')
        }

    }
)

/**
 *  Add the Product with specified id to the cart
 *  Check if the product is already in cart or not
 *  If product is in the cart increase the quantity of product by 1
 *  If product is not in the cart create new cart item of the product
 *  If cart session is empty , create cart session by adding the product with id
 */

app.get('/cart/add/:id', function (req, res) {
    var title = "";
    var price = "";
    product.find({_id: req.params.id}, function (err, prod) {
        if (err)
            res.send('Invalid Id of Product Sent')
        return prod;

    }).then(function (re) {
            // if cart session undefined create new session
            if (req.session.cart == undefined) {
                req.session.cart = {
                    items: [{
                        title: re[0].title,
                        price: re[0].price,
                        inventory_count: re[0].inventory_count,
                        quantity: 1
                    }],
                    inventory_available: true,
                    total_price: re[0].price
                }
            }
            else {
                /*
                Check if product exist in the cart
                If Product exist in the cart update the quantity
                If Product doesnot exist in create add the product
                to cart with quantity of 1
                 */


                var cart_total_price = req.session.cart.total_price;
                var check = true;
                var get_index_of_item;
                var check_cart_item = req.session.cart.items;
                check_cart_item.forEach(function (item, i) {
                    if (item.title == re[0].title) {
                        check = false;
                        get_index_of_item = i;
                    }
                })


                if (check) {
                    var update_price = cart_total_price + re[0].price;
                    var create_new_cart_item = {
                        title: re[0].title,
                        price: re[0].price,
                        inventory_count: re[0].inventory_count,
                        quantity: 1
                    }
                    req.session.cart.total_price = update_price;
                    req.session.cart.items.push(create_new_cart_item);
                }
                else {
                    var update_price = cart_total_price + re[0].price;
                    update_price = Math.round(update_price * 100) / 100;
                    req.session.cart.items[get_index_of_item].quantity += 1;
                    req.session.cart.total_price = update_price;


                }
            }


            res.redirect(303, '/cart');


        }
    )

})

/**
 * Navigate to the checkout page
 * If cart session is null , Ask the user to add products in the cart
 * Product quantity gets reduced by 1 on reaching the checkout page
 * Cart Session is deleted after successful checkout
 */


app.get('/checkout', function (req, res) {
    // if cart is empty ask the user to add products
    if (req.session.cart == null) {
        res.render('emptycart');
    }
    else if (req.session.cart.inventory_available) {
        var cart_items_checkout = req.session.cart;
        var checkout_items = Object.assign({}, cart_items_checkout);
        checkout_items.items.forEach(function (d) {
            product.find({title: d.title}, function (err, re) {
                // update the inventory of the product
                product.update({title: d.title}, {$set: {inventory_count: re[0].inventory_count - d.quantity}}, function (err, checking) {
                })
            })
        })
        // set the session to null after getting checkout information
        req.session.cart = null;
        res.render('checkout', {checkoutitem: checkout_items.items, total_price: checkout_items.total_price});
    }
    else {
        res.render('inventoryerror');
    }
})

app.get('/', function (req, res) {

    res.redirect(303, '/createsampleproducts');

})


app.use(function (req, res) {
    res.status(404);
    res.render('404');
})

app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render('500');
})

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate');
});
