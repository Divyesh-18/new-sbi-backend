const Joi = require("joi");

const getOneMinResultByCategory = Joi.object({
    page:Joi.number().optional().default(1).label("page"),
    pageRow: Joi.number().optional().default(10).label("page"),
    category: Joi.string().optional().allow("", null).label("category")
});
const bate = Joi.object({
    type: Joi.string().required().label("type"),
    value: Joi.string().required().label("value"),
    counter: Joi.number().required().label("counter"),
    finalamount: Joi.number().required().label("final Amount"),
    tab: Joi.string().required().label("tab"),
})

module.exports = { getOneMinResultByCategory, bate };

