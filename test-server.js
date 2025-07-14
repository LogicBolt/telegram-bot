const https = require('https');

// Test GET request (health check)
console.log('Testing GET request...');
const getReq = https.get('https://commonwealthsovereignfoundation.org:3001/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('GET Response:', JSON.parse(data));
  });
});

getReq.on('error', (err) => {
  console.error('GET Error:', err.message);
});

// Test POST request (proposal submission)
console.log('\nTesting POST request...');
const postData = JSON.stringify({
  chatId: 123456789,
  description: "Test proposal",
  amount: "5",
  destinationAddress: "EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t"
});

const postReq = https.request({
  hostname: 'commonwealthsovereignfoundation.org',
  port: 3001,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('POST Response:', JSON.parse(data));
  });
});

postReq.on('error', (err) => {
  console.error('POST Error:', err.message);
});

postReq.write(postData);
postReq.end(); 