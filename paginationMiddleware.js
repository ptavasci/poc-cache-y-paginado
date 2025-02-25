const Joi = require('joi');

function paginationMiddleware(req, res, next) {
    const schema = Joi.object({
        limit: Joi.number().integer().positive().optional().default(5),
        offset: Joi.number().integer().min(0).optional().default(0)
    }).unknown(true); // Allow unknown query parameters

    const { error, value } = schema.validate(req.query);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    req.pagination = value;

    const originalJson = res.json.bind(res);

    const paginatedData = (data) => {
        res.locals.originaldata = data;

        if (!Array.isArray(data)) {
            return originalJson(data);
        }
        const { limit, offset } = req.pagination;
        const paginatedData = data.slice(offset, offset + limit);
        const totalPages = Math.ceil(data.length / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        console.info('Getting page %i from %i pages (total elements %i)', currentPage, totalPages, data.length);

        res.set('X-Total-Count', data.length);
        res.set('X-Total-Pages', totalPages);
        res.set('X-Elements-Per-Page', limit);
        res.set('X-Current-Page', currentPage);
        originalJson(paginatedData);
    };

    res.json = paginatedData;

    if (req.cacheddata) {
        paginatedData(req.cacheddata);
    } else {
        next();
    }
}

module.exports = paginationMiddleware;