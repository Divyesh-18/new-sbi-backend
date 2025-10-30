const mongoose = require('mongoose');


const BannerSchema = mongoose.Schema({
	banner_title: {
		type: String,
	},
	material: {
		type: String,
	},
	status: {
		type: Number,
	},
})

const Banners = mongoose.model("banners",BannerSchema);

module.exports = Banners;