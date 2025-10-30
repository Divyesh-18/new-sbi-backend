
module.exports = (schema) => {
    return async (req, res, next) => {
        const params = req.body;
        try {
            await schema.validate(params);
        } catch (error) {
            if (error) {
                return res.status(200).json({
                    status: 0,
                    message: error.message
                });
            }
        }
        next();
    };
};