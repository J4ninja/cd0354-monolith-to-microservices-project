import cors from 'cors';
import express, {Request, Response, NextFunction} from 'express';
import {sequelize} from './sequelize';

import {IndexRouter} from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import {config} from './config/config';
import {V0_USER_MODELS} from './controllers/v0/model.index';
import {logger} from './logger';


(async () => {
  logger.info('Initializing database connection...');
  await sequelize.addModels(V0_USER_MODELS);
  await sequelize.sync();
  logger.info('Database connection established');

  const app = express();
  const port = process.env.PORT || 8080;

  app.use(bodyParser.json());

  // Structured request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      logger[level]('HTTP request', {
        method:     req.method,
        url:        req.originalUrl,
        status:     res.statusCode,
        durationMs: duration,
        ip:         req.ip,
      });
    });
    next();
  });

  // We set the CORS origin to * so that we don't need to
  // worry about the complexities of CORS this lesson. It's
  // something that will be covered in the next course.
  app.use(cors({
    allowedHeaders: [
      'Origin', 'X-Requested-With',
      'Content-Type', 'Accept',
      'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    origin: '*',
  }));

  app.use('/api/v0/', IndexRouter);

  // Root URI call
  app.get( '/', async ( req, res ) => {
    res.send( '/api/v0/' );
  } );

  // Start the Server
  app.listen( port, () => {
    logger.info('Server started', { port, url: config.url });
  });

  // Heartbeat — visible in kubectl logs even with no traffic
  setInterval(() => {
    logger.info('Heartbeat — service is healthy', { uptime: `${Math.floor(process.uptime())}s` });
  }, 60_000);
})();
