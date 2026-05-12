const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/deploy' && req.method === 'POST') {
    console.log('🚀 Webhook received');

    exec('bash /var/www/nsango-pulse-africa/deploy.sh', (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
    });

    res.end('Deploy triggered');
  } else {
    res.end('OK');
  }
});

server.listen(4000, () => {
  console.log('Webhook server running on port 4000');
});
