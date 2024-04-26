/* eslint-disable n/no-process-env */
import type { SnapConfig } from '@metamask/snaps-cli';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

const enviroment = process.env.NODE_ENV ?? 'development';
console.log('=== Build enviroment: ', enviroment);

dotenv.config({
  path: resolve(__dirname, `.env.${enviroment}`),
});

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
  },
  environment: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  },
};

export default config;
