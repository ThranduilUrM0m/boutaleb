import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import cors from 'cors';

export const setupMiddleware = (app) => {
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(morgan('dev'));
    app.use(
        session({
            secret: '_secret',
            cookie: {
                maxAge: 60000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            },
            resave: false,
            saveUninitialized: false,
        }),
    );
};
