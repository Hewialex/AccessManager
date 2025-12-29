
const http = require('http');

const data = JSON.stringify({
    userId: 'c0c88f45-6d27-426c-90d2-82277c45a661',
    resourceId: '94661ec0-9530-48f8-9571-dfc503b8866f'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug/test-mac',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error('Problem with request:', e.message);
});

req.write(data);
req.end();
