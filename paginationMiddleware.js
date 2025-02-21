const Joi = require('joi');

function paginationMiddleware(req, res, next) {
    const schema = Joi.object({
        limit: Joi.number().integer().positive().optional().default(5),
        offset: Joi.number().integer().min(0).optional().default(0)
    });

    const { error, value } = schema.validate(req.query);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    req.pagination = value;

    let originalJson = res.json.bind(res);

    res.json = (data) => {
        res.locals.originaldata = data;

        if (!Array.isArray(data)) {
            return originalJson(data);
        }

        const { limit, offset } = req.pagination;
        const paginatedData = data.slice(offset, offset + limit);

        res.set('X-Total-Count', data.length);
        res.set('X-Total-Pages', Math.ceil(data.length / limit));
        res.set('X-Elements-Per-Page', limit);
        res.set('X-Current-Page', Math.floor(offset / limit) + 1);
        originalJson(paginatedData);
    };

    if (req.cacheddata) {
        res.json(req.cacheddata);
    } else {
        next();
    }
}

module.exports = paginationMiddleware;