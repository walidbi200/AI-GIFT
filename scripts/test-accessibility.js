import https from 'https';

const urls = [
    'https://www.smartgiftfinder.xyz/gifts-for-mom',
    'https://www.smartgiftfinder.xyz/gifts-for-dad',
    'https://www.smartgiftfinder.xyz/blog',
    'https://www.smartgiftfinder.xyz/blog/gift-giving-psychology',
    'https://www.smartgiftfinder.xyz/gifts-for-girlfriend'
];

console.log('🔍 Testing URL accessibility for Google...\n');

urls.forEach(url => {
    https.get(url, { headers: { 'User-Agent': 'Googlebot' } }, (res) => {
        const status = res.statusCode;
        const robotsTag = res.headers['x-robots-tag'];

        console.log(`${url}`);
        console.log(`  Status: ${status}`);
        console.log(`  X-Robots-Tag: ${robotsTag || 'not set'}`);

        if (status !== 200) {
            console.log(`  ❌ ISSUE: Expected 200, got ${status}`);
        } else if (robotsTag && robotsTag.includes('noindex')) {
            console.log(`  ❌ ISSUE: Page has noindex directive`);
        } else {
            console.log(`  ✅ OK`);
        }
        console.log('');
    }).on('error', (e) => {
        console.log(`❌ ERROR fetching ${url}: ${e.message}\n`);
    });
});
