const Joi = require("joi");

module.exports.getFastWinGameResultByCategory = Joi.object({
    page: Joi.number().optional().default(1).label("page"),
    pageRow: Joi.number().optional().default(10).label("page"),
    category: Joi.string().optional().allow("", null).label("category")
});
