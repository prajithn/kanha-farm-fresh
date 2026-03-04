// Vercel serverless function — receives Easebuzz payment webhook instantly
// (server-to-server, no browser redirect needed, no customer action required)
const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz7cz_Ykzim6EYILS0Fpo5_DJlcJiuO01mefnkqHUGqeui3zd6pRf95oTFJiit3tB6X/exec';

const WEBHOOK_SECRET = 'wh_kff_8x3q'; // server-side only — never sent to browser

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  // Easebuzz sends form-encoded body; Vercel parses it into req.body as an object
  const body = req.body || {};
  const txnid      = body.txnid      || '';
  const status     = body.status     || '';
  const paymentRef = body.easepayid  || body.mihpayid || '';
  const amount     = body.amount     || '0';

  console.log('Easebuzz webhook received:', { txnid, status, paymentRef, amount });

  if (txnid && status) {
    try {
      await fetch(
        `${SCRIPT_URL}?action=confirm_payment` +
        `&webhook_secret=${WEBHOOK_SECRET}` +
        `&txnid=${encodeURIComponent(txnid)}` +
        `&ref=${encodeURIComponent(paymentRef)}` +
        `&status=${encodeURIComponent(status)}` +
        `&amount=${encodeURIComponent(amount)}` +
        `&cb=${Date.now()}`
      );
    } catch (e) {
      console.error('Apps Script confirm_payment failed:', e.message);
    }
  }

  // Always return 200 so Easebuzz knows the webhook was received
  res.status(200).send('OK');
}
