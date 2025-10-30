const mongoose = require('mongoose')

const datatableSchema = mongoose.Schema({
      PeriodID:Number,
      Totalbateamount:Number,
      Totalwinamount:Number,
      ProfitLoss:Number,
      createdate: {
            type: Date,
            default: Date.now
          },
})

const DataTable = mongoose.model("datatable",datatableSchema);

module.exports = DataTable;