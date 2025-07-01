#!/usr/bin/env node

// DNXT.ai - Production Entry Point
// This file serves both frontend and backend for deployment

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import the built application
import('./dist/index.js').then(() => {
  console.log('🚀 DNXT.ai is running in production mode');
}).catch((error) => {
  console.error('❌ Failed to start DNXT.ai:', error);
  process.exit(1);
});