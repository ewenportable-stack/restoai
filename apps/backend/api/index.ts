import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await bootstrap();
  app(req as any, res as any);
}
