import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

console.log('[clean-cf-assets] Checking for files exceeding Cloudflare 25 MiB limit...');

if (fs.existsSync(distDir)) {
  const maxBytes = 24 * 1024 * 1024; // 24 MiB safe limit

  function checkAndRemove(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkAndRemove(fullPath);
      } else if (entry.isFile()) {
        const stats = fs.statSync(fullPath);
        if (stats.size > maxBytes) {
          console.log(`[clean-cf-assets] Removing oversized asset: ${entry.name} (${(stats.size / 1024 / 1024).toFixed(2)} MiB)`);
          fs.unlinkSync(fullPath);
        }
      }
    }
  }

  // Also remove libreoffice-wasm folder if it exists in dist
  const libreOfficePath = path.join(distDir, 'libreoffice-wasm');
  if (fs.existsSync(libreOfficePath)) {
    console.log('[clean-cf-assets] Removing dist/libreoffice-wasm folder...');
    fs.rmSync(libreOfficePath, { recursive: true, force: true });
  }

  checkAndRemove(distDir);
  console.log('[clean-cf-assets] Clean up completed successfully.');
} else {
  console.log('[clean-cf-assets] dist folder does not exist, skipping.');
}
