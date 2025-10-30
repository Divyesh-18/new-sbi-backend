require('dotenv').config();
var mongoose = require("mongoose");

module.exports = async () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        // useFindAndModify: false,
        useUnifiedTopology: true
    }
    );

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error: "));
    db.once("open", function () {
        console.log(`Connected to ${process.env.DATABASE_URL}`);
    });
}
