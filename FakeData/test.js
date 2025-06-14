const crypto = require('crypto');

function generatePayosSignature(body, checksumKey) {
  const jsonString = JSON.stringify(body);
  return crypto.createHmac('sha256', checksumKey).update(jsonString).digest('hex');
}
const body = {
  orderCode: 1749914865854,
  amount: 2000,
  description: "DH684d94f15772d86d59dff5",
  status: "PAID"
};

const checksumKey = "25dd9edfe445a0531c64386e6150dcc050de53517ef67aead8f16229680a24f3";

const signature = generatePayosSignature(body, checksumKey);
console.log(signature);