import crypto from 'crypto';

const key         = '8CHTGR7590';
const salt        = 'DHE428HU45';
const txnid       = 'KFF' + Date.now();
const amount      = (1).toFixed(2);           // test with ₹1
const productinfo = 'Kanha Farm Fresh Order';
const firstname   = 'TestCustomer';           // no spaces to keep it clean
const email       = 'noreply@kanhaff.com';
const phone       = '9876543210';
const udf1        = '';

const hashParts = [
  key, txnid, amount, productinfo, firstname, email,
  udf1, '', '', '', '', '', '', '', '', '', salt
];

console.log('Parts count:', hashParts.length);   // must be 17
const hashStr = hashParts.join('|');
console.log('Hash string:\n', hashStr);

const hash = crypto.createHash('sha512').update(hashStr, 'utf8').digest('hex');
console.log('Hash length:', hash.length);        // must be 128
console.log('Hash:', hash);

// Call Easebuzz initiateLink
const payload = new URLSearchParams({
  key, txnid, amount, productinfo, firstname, email, phone,
  udf1: '', udf2: '', udf3: '', udf4: '', udf5: '',
  hash,
  surl: 'https://kanha-farm-fresh-1.vercel.app/api/payment-webhook',
  furl: 'https://kanhaff.com',
}).toString();

console.log('\nCalling Easebuzz API...');
const res = await fetch('https://pay.easebuzz.in/payment/initiateLink', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: payload,
});

const result = await res.json();
console.log('\nEasebuzz response:', JSON.stringify(result, null, 2));

