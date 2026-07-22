"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const error_middleware_1 = require("./error.middleware");
const validate = (schema, location = 'body') => (req, _res, next) => {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
        const errors = result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        next(new error_middleware_1.AppError('Validation failed', 422, errors));
        return;
    }
    // Replace request data with coerced/validated data
    req[location] = result.data;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map