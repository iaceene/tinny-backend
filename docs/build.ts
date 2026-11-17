import fs from 'node:fs/promises';
import path from 'node:path';

async function buildDocs() {
  const docsDir = path.resolve(__dirname);
  const outDir = path.join(docsDir, 'dist');
  const assetsDir = path.join(outDir, 'assets');

  console.log('🚀 Building tinny-backend documentation for GitHub Pages...');

  // Ensure output directories exist
  await fs.mkdir(assetsDir, { recursive: true });

  // 1. Bundle JavaScript & React app with Bun
  const buildResult = await Bun.build({
    entrypoints: [path.join(docsDir, 'src/main.tsx')],
    outdir: assetsDir,
    naming: '[name].[ext]',
    minify: true,
    target: 'browser',
    format: 'esm',
    sourcemap: 'none',
  });

  if (!buildResult.success) {
    console.error('❌ Bundle build failed:');
    for (const msg of buildResult.logs) {
      console.error(msg);
    }
    process.exit(1);
  }

  console.log('✅ JavaScript bundled successfully into dist/assets/main.js');

  // 2. Copy and minify CSS
  const cssSource = await fs.readFile(path.join(docsDir, 'src/styles/main.css'), 'utf-8');
  await fs.writeFile(path.join(assetsDir, 'main.css'), cssSource, 'utf-8');
  console.log('✅ CSS written to dist/assets/main.css');

  // 3. Generate index.html in dist
  const htmlTemplate = await fs.readFile(path.join(docsDir, 'index.html'), 'utf-8');
  await fs.writeFile(path.join(outDir, 'index.html'), htmlTemplate, 'utf-8');

  // 4. Create 404.html for GitHub Pages SPA routing fallback
  await fs.writeFile(path.join(outDir, '404.html'), htmlTemplate, 'utf-8');

  // 5. Create .nojekyll for GitHub Pages
  await fs.writeFile(path.join(outDir, '.nojekyll'), '', 'utf-8');

  // 6. Copy imgs to dist/imgs
  const imgsSrc = path.join(docsDir, 'imgs');
  const imgsDest = path.join(outDir, 'imgs');
  try {
    await fs.cp(imgsSrc, imgsDest, { recursive: true });
    console.log('✅ Images copied to dist/imgs');
  } catch (err) {
    console.warn('Warning copying imgs:', err);
  }

  console.log('🎉 Documentation build complete! Ready for GitHub Pages in docs/dist/');
}

buildDocs().catch((err) => {
  console.error('Build error:', err);
  process.exit(1);
});
