// validationMiddleware.ts

// Example validation middleware functions

import { Request, Response, NextFunction } from 'express';

// Middleware to validate request body
export const validateRequestBody = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};

// Middleware to validate request params
export const validateRequestParams = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};

// Middleware to validate query parameters
export const validateQueryParams = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};
