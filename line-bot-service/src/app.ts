import express, { Request, Response } from 'express';
import {
    middleware as lineMiddleware,
    JSONParseError,
    SignatureValidationFailed
} from '@line/bot-sdk';

import lineConfig from './config/line';
import lineRouter from './controllers/line';
import { NextCallback } from '@line/bot-sdk/dist/middleware';

const app = express();

// line.middleware must be used in front of express.json() or etc.
// https://line.github.io/line-bot-sdk-nodejs/api-reference/middleware.html#usage
app.use('/line', lineMiddleware(lineConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/line', lineRouter);

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextCallback) => {
    if (err instanceof SignatureValidationFailed) {
        res.status(401).send(err.signature);
        return;
    } else if (err instanceof JSONParseError) {
        res.status(400).send(err.raw);
        return;
    }

    next(err);  // return 500
});




export default app;