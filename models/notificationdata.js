const mongoose = require('mongoose');

const notificationdataSchema = mongoose.Schema({
    heading:{
        type:String
    },
    content:{
        type:String
    }
});

const notificationdata = mongoose.model("notificationdata",notificationdataSchema);

module.exports = notificationdata;