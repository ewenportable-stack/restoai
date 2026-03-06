'use strict';

require('reflect-metadata');
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../dist/src/app.module');
const { ValidationPipe } = require('@nestjs/common');

let cachedApp = null;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] },
  );

  nestApp.enableCors({ origin: '*' });
  nestApp.setGlobalPrefix('api/v1');
  nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await nestApp.init();
  cachedApp = expressApp;
  return cachedApp;
}

module.exports = async function handler(req, res) {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ statusCode: 500, message: err.message }));
  }
};
