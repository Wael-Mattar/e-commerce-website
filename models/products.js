
const mongoose = require('mongoose');

const productsSchema = mongoose.Schema( {
	
	name: String,
	image: String,
	price: Number,
})
module.exports = mongoose.model("products",productsSchema)
