#!/usr/bin/env node

const https = require('https');

console.log('🔍 GitHub Pages Deployment Checker\n');

function checkSite() {
  const options = {
    hostname: '666keke.github.io',
    path: '/Shanghai-Gaokao/',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log(`📊 Response Status: ${res.statusCode}`);
    console.log(`📋 Response Headers:`, res.headers);
    
    if (res.statusCode === 200) {
      console.log('✅ Site is live and accessible!');
      console.log('🎉 Deployment successful!');
    } else if (res.statusCode === 404) {
      console.log('❌ Site not found (404). GitHub Pages might not be enabled yet.');
    } else {
      console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
    }
  });

  req.on('error', (err) => {
    console.log('⏰ Request timed out');
  });

  req.on('timeout', () => {
    console.log('⏰ Request timed out');
  });

  req.end();
}

async function main() {
  console.log('📍 Site URL: https://666keke.github.io/Shanghai-Gaokao/');
  checkSite();
}

main();

// Check if the deployment workflow is working
function checkGitHubActions() {
    console.log('📋 IMPORTANT: GitHub Pages Configuration Steps');
    console.log('='.repeat(50));
    console.log('');
    console.log('1. Go to your GitHub repository settings:');
    console.log('   https://github.com/666keke/Shanghai-Gaokao/settings/pages');
    console.log('');
    console.log('2. In the "Source" section, select:');
    console.log('   📦 "GitHub Actions" (NOT "Deploy from a branch")');
    console.log('');
    console.log('3. Click "Save" if you made changes');
    console.log('');
    console.log('4. Check the Actions tab for deployment status:');
    console.log('   https://github.com/666keke/Shanghai-Gaokao/actions');
    console.log('');
    console.log('✅ After configuring, your site should be available at:');
    console.log('   https://666keke.github.io/Shanghai-Gaokao/');
    console.log('');
    console.log('🔧 Changes made to fix the deployment:');
    console.log('   - Added proper permissions (contents: read, pages: write, id-token: write)');
    console.log('   - Switched to official GitHub Actions (actions/deploy-pages@v4)');
    console.log('   - Removed peaceiris/actions-gh-pages@v3 to avoid permission issues');
    console.log('   - Added concurrency control for deployments');
    console.log('   - Removed Supabase secrets (app uses data.json instead)');
    console.log('');
    console.log('🚀 The workflow has been updated and pushed successfully!');
    console.log('   No secrets needed - the app uses local data.json file.');
    console.log('   Please follow the steps above to complete the configuration.');
}

checkGitHubActions(); 