#!/usr/bin/env node

// NXT.ai - Universal Entry Point
// This file serves the application in production or development mode

import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distExists = existsSync(join(__dirname, 'dist', 'index.js'));

console.log('🚀 Starting NXT.ai...');
console.log('📦 Production build available:', distExists);

if (distExists && process.env.NODE_ENV === 'production') {
  // Production mode - use built files
  console.log('🎯 Running in production mode');
  import('./dist/index.js').then(() => {
    console.log('✅ NXT.ai production server started');
  }).catch((error) => {
    console.error('❌ Production server failed:', error);
    console.log('🔄 Falling back to development mode...');
    startDevMode();
  });
} else {
  // Development mode
  console.log('🛠️  Running in development mode');
  startDevMode();
}

function startDevMode() {
  const dev = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  dev.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
  });
}