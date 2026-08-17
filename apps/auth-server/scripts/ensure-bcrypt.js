#!/usr/bin/env node

const { execSync } = require('node:child_process');

function hasWorkingBcrypt() {
  try {
    require('bcrypt');
    return true;
  } catch {
    return false;
  }
}

if (hasWorkingBcrypt()) {
  process.exit(0);
}

console.warn(
  '[auth-server] bcrypt native binding missing, attempting install...'
);

try {
  execSync('npm explore bcrypt -- npm run install', { stdio: 'inherit' });

  if (!hasWorkingBcrypt()) {
    throw new Error('bcrypt still unavailable after install');
  }

  console.log('[auth-server] bcrypt native binding is ready.');
} catch (err) {
  console.error('[auth-server] Failed to prepare bcrypt native binding.');
  console.error(err && err.message ? err.message : err);
  process.exit(1);
}
