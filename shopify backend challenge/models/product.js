var mongoose = require('mongoose');
var productSchema = mongoose.Schema({
    title:String,
    price:Number,
    inventory_count:Number

});
var product = mongoose.model('product',productSchema);
module.exports=product;

