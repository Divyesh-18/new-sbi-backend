const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	price: {
		type: String,
	},
	image: {
		type: String,
	},
	status: {
		type: Number,
	},
})

const Products = mongoose.model("Products",ProductSchema);

module.exports = Products;