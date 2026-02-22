import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, User, Upload, CheckCircle, ChevronDown, Minus, Plus, Leaf, ArrowRight, Loader2, Lock, Search, X, AlertCircle, Sparkles } from 'lucide-react';

// --- GLOBAL SHIM ---
// Prevents environment crashes by mocking the tailwind object immediately
(function() {
  try {
    if (typeof window !== 'undefined') {
      window.tailwind = window.tailwind || { config: {}, theme: {} };
    }
  } catch (e) {}
})();

// --- CONFIGURATION ---
const SHOW_HARVESTING_SCREEN = false;
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'kanha@123';
const UPI_ID = 'paytm.s18fahk@pty';
const MERCHANT_NAME = 'Kanha Farm Fresh';
const EASEBUZZ_PAYMENT_URL = 'https://pay.easebuzz.in/pay/initiateLink';
const USE_EASEBUZZ = false; // toggle: true = Easebuzz gateway, false = manual UPI flow

// --- STYLES (STRICT INLINE - NO CLASSES) ---
const s = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#fafaf9',
    color: '#1c1917',
    minHeight: '100vh',
    paddingBottom: '8rem',
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  centerFlex: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '2rem'
  },
  header: {
    backgroundColor: '#047857',
    color: 'white',
    padding: '1.5rem 1rem 2.5rem',
    borderRadius: '0 0 24px 24px',
    position: 'relative', 
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'opacity 0.2s, transform 0.1s'
  },
  btnPrimary: {
    backgroundColor: '#059669',
    color: 'white'
  },
  btnOutline: {
    backgroundColor: 'transparent',
    border: '1px solid #e7e5e4',
    color: '#78716c'
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e7e5e4',
    borderRadius: '12px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'white'
  },
  iconPrefix: {
    position: 'absolute',
    left: '0.8rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#78716c'
  },
  productRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: 'white',
    border: '1px solid #e7e5e4',
    borderRadius: '12px',
    marginBottom: '0.75rem'
  },
  qtyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: '#fafaf9',
    padding: '0.25rem',
    borderRadius: '8px'
  },
  qtyBtn: {
    width: '24px',
    height: '24px',
    border: 'none',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  deliveryOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    border: '2px solid transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: '#fafaf9',
    marginBottom: '0.5rem'
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: '1rem',
    borderTop: '1px solid #e7e5e4',
    zIndex: 50
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem'
  },
  modal: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: '320px',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }
};

// --- HELPER COMPONENTS ---

const TenderCoconutIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    <path d="M50 95 C25 95 10 75 10 50 C10 25 25 10 50 10 C75 10 90 25 90 50 C90 75 75 95 50 95 Z" fill="#4ade80" stroke="#166534" strokeWidth="2"/>
    <path d="M35 15 L50 2 L65 15 Z" fill="#dcfce7" stroke="#166534" strokeWidth="2"/>
    <path d="M30 30 Q 40 20 60 30" fill="none" stroke="#dcfce7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const BeetrootIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    <path d="M50 30 Q 30 0 20 15 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
    <path d="M50 30 Q 70 0 80 15 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
    <circle cx="50" cy="65" r="32" fill="#be185d" />
    <path d="M50 97 L 50 110" stroke="#be185d" strokeWidth="3" />
  </svg>
);

const AmaranthusIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* Main Stem */}
    <path d="M50 95 L 50 25" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
    
    {/* Bottom Large Leaves */}
    <path d="M50 80 Q 15 75 10 55 Q 15 35 50 50 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
    <path d="M50 80 Q 85 75 90 55 Q 85 35 50 50 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
    
    {/* Middle Leaves */}
    <path d="M50 60 Q 25 55 20 40 Q 25 25 50 35 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
    <path d="M50 60 Q 75 55 80 40 Q 75 25 50 35 Z" fill="#4ade80" stroke="#15803d" strokeWidth="1.5" />
    
    {/* Top Small Budding Leaves */}
    <path d="M50 35 Q 35 30 40 15 Q 50 10 50 25 Z" fill="#86efac" stroke="#166534" strokeWidth="1" />
    <path d="M50 35 Q 65 30 60 15 Q 50 10 50 25 Z" fill="#86efac" stroke="#166534" strokeWidth="1" />
  </svg>
);





const GoldenBerryIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* The Husk (Back Leaves) */}
    <path d="M20 50 Q 10 70 30 90 Q 50 95 70 90 Q 90 70 80 50" fill="#d4a373" stroke="#8b5e34" strokeWidth="1" />
    
    {/* The Berry (Main Fruit) */}
    <circle cx="50" cy="55" r="30" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
    <path d="M45 35 Q 55 30 65 40" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
    
    {/* The Stem (Top) */}
    <path d="M50 30 Q 52 15 48 5" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
    
    {/* The Husk (Front Leaves/Petals) */}
    <path d="M15 45 Q 25 75 50 95 Q 75 75 85 45 L 75 60 Q 50 85 25 60 Z" fill="#e9c46a" stroke="#8b5e34" strokeWidth="1" />
    
    {/* Leaf Detail Lines */}
    <path d="M30 75 L 40 85 M 70 75 L 60 85" stroke="#8b5e34" strokeWidth="0.5" />
  </svg>
);

const SmoothGourdIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* The Stem - Matching your Ridge Gourd style */}
    <path 
      d="M35 15 Q 40 5 45 12" 
      fill="none" 
      stroke="#2d4a22" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    
    {/* The Body - A smooth, slightly tapered cylindrical shape */}
    <path 
      d="M40 18 
         C 55 18, 65 30, 65 55 
         C 65 85, 55 92, 45 92 
         C 35 92, 25 85, 25 55 
         C 25 30, 30 18, 40 18 Z" 
      fill="#6fa15a" 
      stroke="#2d4a22" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />

    {/* Subtle light reflection to emphasize the "smooth" skin */}
    <path 
      d="M35 30 Q 32 50 35 70" 
      fill="none" 
      stroke="white" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      opacity="0.3"
    />
  </svg>
);

const BottleGourdIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* The Stem - Curved slightly to the left */}
    <path 
      d="M50 18 Q 45 5 38 10" 
      fill="none" 
      stroke="#2d4a22" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    
    {/* The Gourd Body - Smooth, rounded, and slightly cinched in the upper middle */}
    <path 
      d="M50 18 
         C 65 18, 65 35, 58 45 
         C 75 55, 75 85, 50 85 
         C 25 85, 25 55, 42 45 
         C 35 35, 35 18, 50 18 Z" 
      fill="#8fbc8f" 
      stroke="#2d4a22" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />

    {/* Subtle highlight for a 3D effect */}
    <path 
      d="M45 75 Q 35 70 38 60" 
      fill="none" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      opacity="0.4"
    />
  </svg>
);

const BitterGourdIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* The Stem - Short and slightly gnarled */}
    <path 
      d="M38 15 Q 40 5 45 10" 
      fill="none" 
      stroke="#1b3314" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    
    {/* The Body - Jagged/Bumpy silhouette with pointed ends */}
    <path 
      d="M40 18 
         L 45 22 L 50 18 L 55 25 L 58 35 L 55 45 L 58 55 L 54 65 L 56 75 L 50 90 
         L 44 75 L 46 65 L 42 55 L 45 45 L 42 35 L 45 25 Z" 
      fill="#4a7c44" 
      stroke="#1b3314" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />

    {/* Internal Bumps - Small dots/dashes to represent texture */}
    <circle cx="48" cy="35" r="1.5" fill="#1b3314" opacity="0.6" />
    <circle cx="52" cy="50" r="1.5" fill="#1b3314" opacity="0.6" />
    <circle cx="48" cy="65" r="1.5" fill="#1b3314" opacity

const RidgeGourdIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* The Stem */}
    <path 
      d="M35 15 Q 40 5 45 12" 
      fill="none" 
      stroke="#2d4a22" 
      strokeWidth="3" 
      strokeLinecap="round" 
    />
    
    {/* Main Body (Elongated, slightly tapered) */}
    <path 
      d="M40 15 
         Q 55 15 65 40 
         Q 75 70 60 85 
         Q 45 95 30 80 
         Q 20 60 40 15 Z" 
      fill="#4a7c44" 
      stroke="#2d4a22" 
      strokeWidth="1.5" 
    />
    
    {/* The Ridges (Longitudinal lines) */}
    <g stroke="#2d4a22" strokeWidth="1" fill="none" opacity="0.6">
      <path d="M42 18 Q 58 40 62 75" />
      <path d="M35 25 Q 45 50 48 85" />
      <path d="M28 45 Q 35 65 35 80" />
    </g>

    {/* Highlights for dimension */}
    <path 
      d="M48 25 Q 55 40 58 60" 
      fill="none" 
      stroke="#ffffff" 
      strokeWidth="1.5" 
      opacity="0.2" 
      strokeLinecap="round" 
    />
    
    {/* Bottom Tip (Blossom end) */}
    <circle cx="58" cy="85" r="1.5" fill="#2d4a22" />
  </svg>
);

const SpinLoader = () => (
  <>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
  </>
);

const Modal = ({ isOpen, type, message, title, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;
  
  const isAi = type === 'ai';
  let iconBg = '#f5f5f4';
  let iconColor = '#57534e';
  let IconComp = AlertCircle;

  if (isLoading) {
    iconBg = '#f3e8ff';
    iconColor = '#9333ea';
    IconComp = SpinLoader;
  } else if (type === 'confirm') {
    iconBg = '#d1fae5';
    iconColor = '#059669';
  } else if (isAi) {
    iconBg = 'linear-gradient(135deg, #a855f7, #4f46e5)';
    iconColor = 'white';
    IconComp = Sparkles;
  }

  return (
    <div style={s.modalOverlay}>
      <div style={{ ...s.modal, ...(isAi ? { border: '2px solid #f3e8ff' } : {}) }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ ...s.modalIcon, background: iconBg, color: iconColor }}>
            {isLoading ? <SpinLoader /> : <IconComp size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: isAi ? '#581c87' : '#1c1917' }}>
              {isLoading ? 'Processing...' : title || (type === 'confirm' ? 'Confirmation' : isAi ? 'Gemini Says' : 'Notice')}
            </h3>
            {isAi && !isLoading && <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#a855f7', fontWeight: 500 }}>✨ AI Generated Insight</p>}
          </div>
          {!isLoading && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#a8a29e' }}>
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div style={{ marginBottom: '1.5rem', maxHeight: '60vh', overflowY: 'auto', fontSize: '0.9rem', color: '#57534e', whiteSpace: 'pre-line' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ height: '1rem', backgroundColor: '#f3e8ff', borderRadius: '4px', width: '75%', animation: 'pulse 1.5s infinite' }}></div>
              <div style={{ height: '1rem', backgroundColor: '#f3e8ff', borderRadius: '4px', width: '100%', animation: 'pulse 1.5s infinite' }}></div>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
            </div>
          ) : (
            message
          )}
        </div>
        
        {/* Actions */}
        {!isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {type === 'confirm' && (
              <button 
                onClick={onClose} 
                style={{ ...s.btn, ...s.btnOutline, width: 'auto', marginTop: 0, padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            )}
            <button 
              onClick={() => { if (type === 'confirm' && onConfirm) onConfirm(); onClose(); }}
              style={{ 
                ...s.btn, ...s.btnPrimary, width: 'auto', marginTop: 0, padding: '0.5rem 1.25rem',
                backgroundColor: isAi ? '#9333ea' : '#059669'
              }}
            >
              {type === 'confirm' ? 'Yes, Proceed' : 'Okay'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DATA ---
const PRODUCTS = [
  { id: 1, name: 'Strawberry - 200gm', unit: 'Box (200g)', price: 100, icon: <span style={{ fontSize: '2rem' }}>🍓</span>, desc: 'Sweet & Red' },
  { id: 2, name: 'Strawberry - 500gm', unit: 'Box (500g)', price: 225, icon: <span style={{ fontSize: '2rem' }}>🍓</span>, desc: 'Sweet & Red' },
  { id: 3, name: 'Strawberry - 1Kg', unit: 'Box (1Kg)', price: 400, icon: <span style={{ fontSize: '2rem' }}>🍓</span>, desc: 'Sweet & Red' },
  { id: 8, name: 'Goldenberry', unit: '250gm', price: 200, icon: <GoldenBerryIcon />, desc: 'Sweet & Zesty' },
  { id: 5, name: 'Tender Coconut', unit: 'Piece', price: 50, icon: <TenderCoconutIcon />, desc: 'Refreshing' },
  { id: 6, name: 'Beetroot', unit: '500gm', price: 35, icon: <BeetrootIcon />, desc: 'Earthy Root' },
  { id: 7, name: 'Palak', unit: 'Bunch (200g)', price: 30, icon: <span style={{ fontSize: '2rem' }}>🥬</span>, desc: 'Iron Rich' },
  { id: 12, name: 'Methi Leaves', unit: 'Bunch (200g)', price: 30, icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Nutritious' },
  { id: 13, name: 'Coriander Leaves', unit: 'Bunch (200g)', price: 30, icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Aromatic' },
  { id: 16, name: 'Bitter Gourd', unit: '500gm', price: 40, icon: <BitterGourdIcon />, desc: 'Healthy' },
  { id: 14, name: 'Bottle Gourd', unit: '500gm', price: 30, icon: <BottleGourdIcon />, desc: 'Healthy' },
  { id: 15, name: 'Smooth Gourd', unit: '500gm', price: 40, icon: <SmoothGourdIcon />, desc: 'Nutritious' },
  { id: 9, name: 'Ridge Gourd', unit: '500gm', price: 40, icon: <RidgeGourdIcon />, desc: 'Fibrous & Healthy' },
  { id: 10, name: 'Plain Paneer', unit: '200g', price: 119, icon: <span style={{ fontSize: '2rem' }}>🧀</span>, desc: 'Rich Protein' },
  { id: 11, name: 'Plain Tofu', unit: '200g', price: 119, icon: <span style={{ fontSize: '2rem' }}>🧊</span>, desc: 'Lean & Vegan' },
 



  //  { id: 12, name: 'Test Product', unit: '200g', price: 1, icon: <span style={{ fontSize: '2rem' }}>🧊</span>, desc: 'Lean & Vegan' },

  //  { id: 7, name: 'Methi Leaves', unit: 'Bunch (150g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Nutritious' },
 // { id: 7, name: 'Beetroot Leaves', unit: 'Bunch (150g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Nutritious' },
 // { id: 8, name: 'Mint', unit: 'Bunch (300g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Fresh & Cooling' },
 // { id: 9, name: 'Curry Leaves', unit: 'Bunch (300g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🍃</span>, desc: 'Fresh' },
 // { id: 10, name: 'Carrot Leaves', unit: 'Bunch (150g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🍃</span>, desc: 'Fresh' },
 // { id: 3, name: 'Coriander Leaves', unit: 'Bunch (300g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Aromatic' },
 // { id: 4, name: 'Lettuce', unit: 'Bunch (300g)', price: 100, icon: <span style={{ fontSize: '2rem' }}>🥬</span>, desc: 'Crunchy' },


];

const DELIVERY_OPTIONS = [
  { id: 'vihanga', label: 'My Home Vihanga', requiresApt: true },
  { id: 'krishe', label: 'My Home Krishe', requiresApt: true },
  { id: 'phf', label: 'Prestige High Fields', requiresApt: true },
  { id: 'atria', label: 'Rajapushpa Atria', requiresApt: true },
  { id: 'tranquil', label: 'Prestige Tranquil', requiresApt: true },
  { id: 'pbel', label: 'PBEL City', requiresApt: true },
  { id: 'mtv', label: 'Maple Town Villas', requiresApt: true },
  { id: 'pickup', label: 'Store pick up (Malabar Natives)', requiresApt: false },
//  { id: 'gc', label: 'Pick up (Gachibowli Meditation Centre)', requiresApt: false },
];

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7cz_Ykzim6EYILS0Fpo5_DJlcJiuO01mefnkqHUGqeui3zd6pRf95oTFJiit3tB6X/exec";

function TestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'failure' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  const loadCheckoutScript = () => new Promise((resolve, reject) => {
    if (window.EaseCheckout) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout-v2.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load EaseCheckout script'));
    document.head.appendChild(script);
  });

  const handlePay = async () => {
    setIsSubmitting(true);
    setStatus(null);
    setStatusMsg('');
    try {
      // Step 1: Apps Script calls Easebuzz backend and returns access_key
      const qs = new URLSearchParams({
        action: 'get_easebuzz_access_key',
        amount: '1.00',
        firstname: 'Test User',
        phone: '9999999999',
        udf1: 'Test Payment',
        cb: Date.now(),
      });
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?${qs}`, { credentials: 'omit' });
      const { key, access_key, status: apiStatus } = await res.json();

      if (!access_key || apiStatus !== 1) throw new Error('Could not get payment token. Check Apps Script logs.');

      // Step 2: Load EaseCheckout JS from CDN
      await loadCheckoutScript();

      // Step 3: Open payment overlay — no redirect, callback fires on completion
      const checkout = new window.EaseCheckout(key, 'prod');
      checkout.initiatePayment({
        access_key,
        onResponse: (data) => {
          setIsSubmitting(false);
          if (data.status === 'success') {
            setStatus('success');
          } else {
            setStatus('failure');
            setStatusMsg(data.error_Message || data.status || '');
          }
        },
        theme: '#059669',
      });
    } catch (e) {
      setIsSubmitting(false);
      setStatus('error');
      setStatusMsg(e.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 360, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 0.25rem', color: '#1c1917', fontSize: '1.25rem', fontWeight: 700 }}>Payment Test</h2>
        <p style={{ margin: '0 0 1.5rem', color: '#78716c', fontSize: '0.875rem' }}>₹1 test charge — iframe mode, no redirect</p>

        {status === 'success' && (
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 12, padding: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>✅</div>
            <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: '#065f46' }}>Payment Successful!</p>
          </div>
        )}

        {(status === 'failure' || status === 'error') && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>❌</div>
            <p style={{ margin: '0.5rem 0 0', fontWeight: 700, color: '#991b1b' }}>{status === 'error' ? 'Error' : 'Payment Failed'}</p>
            {statusMsg && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#b91c1c' }}>{statusMsg}</p>}
          </div>
        )}

        {!status && (
          <button
            onClick={handlePay}
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.875rem', background: isSubmitting ? '#6ee7b7' : '#059669', color: 'white', border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Opening payment...' : 'Pay ₹1 via Easebuzz'}
          </button>
        )}

        {status && (
          <button
            onClick={() => { setStatus(null); setStatusMsg(''); }}
            style={{ width: '100%', padding: '0.75rem', background: 'none', border: '1px solid #e7e5e4', borderRadius: 12, fontSize: '0.875rem', color: '#78716c', cursor: 'pointer', marginTop: '0.75rem' }}
          >
            Try again
          </button>
        )}

        <p style={{ margin: '1.25rem 0 0', fontSize: '0.75rem', color: '#a8a29e', textAlign: 'center' }}>
          <a href="/" style={{ color: '#059669', textDecoration: 'none' }}>← Back to main app</a>
        </p>
      </div>
    </div>
  );
}

function SmartGrocerApp() {
  const [view, setView] = useState('landing');
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', message: '', title: '', onConfirm: null, isLoading: false });

  // Customer State
  const [cart, setCart] = useState({});
  const [deliveryType, setDeliveryType] = useState('');
  const [aptNumber, setAptNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDate, setOrderDate] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  // Admin State
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilterType, setAdminFilterType] = useState('');
  const [adminSearchName, setAdminSearchName] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('Pending');

  const productsRef = useRef(null);
  const deliveryRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setShowScrollCue(false);
      else setShowScrollCue(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Payment callback — runs once on mount to detect Easebuzz redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('payment');
    const txnid = params.get('txnid');

    if (paymentResult === 'success' && txnid) {
      const saved = sessionStorage.getItem('kff_pending_order');
      if (saved) {
        const order = JSON.parse(saved);
        sessionStorage.removeItem('kff_pending_order');
        (async () => {
          try {
            const orderData = {
              action: 'create',
              customerName: order.customerName,
              mobileNumber: order.mobileNumber,
              deliveryType: order.deliveryLabel,
              aptNumber: order.aptNumber ? "'" + order.aptNumber : '',
              items: order.items,
              total: order.total,
              image: '',
              imageName: '',
            };
            await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(orderData) });
            setCustomerName(order.customerName);
            setDeliveryType(order.deliveryType);
            setOrderSummary({ total: order.total, deliveryLabel: order.deliveryLabel });
            setOrderPlaced(true);
            window.scrollTo(0, 0);
          } catch {
            setModal({ isOpen: true, type: 'alert', title: 'Error', message: 'Payment succeeded but order recording failed. Please contact Mani — 81790 68821.' });
          }
        })();
      }
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentResult === 'failure') {
      setModal({ isOpen: true, type: 'alert', title: 'Payment Failed', message: 'Payment was not completed. Please try again or use manual UPI.' });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- LOGIC ---
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          if (img.width > MAX_WIDTH) { canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; } 
          else { canvas.width = img.width; canvas.height = img.height; }
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const updateQuantity = (id, change) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + change);
      if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => Object.entries(cart).reduce((total, [id, qty]) => {
    const product = PRODUCTS.find(p => p.id === parseInt(id));
    return total + (product ? product.price * qty : 0);
  }, 0);

  const handleSmartAction = () => {
    const total = calculateTotal();
    if (total === 0) { productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!deliveryType) { deliveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const needsApt = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt;
    if (needsApt && aptNumber.trim().length === 0) { deliveryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (customerName.trim().length < 2 || mobileNumber.length < 10) { infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    setShowPayment(true);
    window.scrollTo(0, 0);
  };

  const getButtonText = () => {
     const total = calculateTotal();
     if (total === 0) return { text: "Add Items", icon: <Plus size={20} /> };
     if (!deliveryType) return { text: "Choose Delivery", icon: <MapPin size={20} /> };
     const needsApt = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt;
     // FIX: Validation logic matched to handleSmartAction to prevent confusing user
     if (needsApt && aptNumber.trim().length === 0) return { text: "Enter Apt #", icon: <MapPin size={20} /> };
     if (customerName.trim().length < 2 || mobileNumber.length < 10) return { text: "Enter Contact Info", icon: <User size={20} /> };
     return { text: "Proceed to Pay", icon: <ArrowRight size={20} /> };
  }

  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);
    try {
      const itemsString = Object.entries(cart).map(([id, qty]) => `${PRODUCTS.find(p => p.id === parseInt(id)).name} (${qty})`).join(", ");
      let base64Image = '';
      let imageName = '';
      if (paymentFile) {
        base64Image = await compressImage(paymentFile);
        imageName = paymentFile.name;
      }
      const orderData = {
        action: 'create',
        customerName,
        mobileNumber,
        deliveryType: DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label,
        aptNumber: aptNumber ? "'" + aptNumber : '',
        items: itemsString,
        total: calculateTotal(),
        image: base64Image,
        imageName
      };
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(orderData) });
      setOrderSummary({ total: calculateTotal(), deliveryLabel: DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label || '' });
      setOrderDate(new Date());
      setOrderPlaced(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setModal({ isOpen: true, type: 'alert', message: "Error placing order. Please try again." });
    } finally { setIsSubmitting(false); }
  };

  const copyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID).then(() => {
        setUpiCopied(true);
        setTimeout(() => setUpiCopied(false), 2500);
      });
    }
  };

  const initiateEasebuzzPayment = async () => {
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const deliveryLabel = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label || '';
      const udf1 = `${deliveryLabel}${aptNumber ? ' - ' + aptNumber : ''}`;
      const safeName = customerName.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 50) || 'Customer';

      // Get hash from Apps Script (server-side, keeps salt off client)
      const qs = new URLSearchParams({
        action: 'generate_payment_hash',
        amount: total.toString(),
        firstname: safeName,
        phone: mobileNumber,
        udf1: udf1.substring(0, 100),
        cb: Date.now(),
      });
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?${qs}`, { credentials: 'omit' });
      const payData = await response.json();

      // Save order snapshot to sessionStorage before leaving the page
      const itemsString = Object.entries(cart).map(([id, qty]) => {
        const product = PRODUCTS.find(p => p.id === parseInt(id));
        return `${product.name} (${qty})`;
      }).join(', ');
      sessionStorage.setItem('kff_pending_order', JSON.stringify({
        customerName,
        mobileNumber,
        deliveryType,
        deliveryLabel,
        aptNumber,
        items: itemsString,
        total,
        txnid: payData.txnid,
      }));

      // Build success / failure redirect URLs
      const base = window.location.origin + window.location.pathname;
      const surl = `${base}?payment=success&txnid=${payData.txnid}`;
      const furl = `${base}?payment=failure`;

      // Programmatically POST to Easebuzz (form submit navigates the page)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = EASEBUZZ_PAYMENT_URL;
      const fields = { ...payData, action: '1', surl, furl };
      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      // Note: page navigates away — no need to reset isSubmitting
    } catch {
      setIsSubmitting(false);
      setModal({ isOpen: true, type: 'alert', title: 'Error', message: 'Could not initiate payment. Please try manual UPI or try again.' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const fetchAdminOrders = async () => {
    setAdminLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?v=${new Date().getTime()}`, { credentials: 'omit' }); 
      const data = await response.json();
      setAdminOrders(Array.isArray(data) ? data.reverse() : []);
    } catch (error) { setModal({ isOpen: true, type: 'alert', message: "Failed to load orders." }); } 
    finally { setAdminLoading(false); }
  };

  const markAsDelivered = (order) => {
    if (!order.rowIndex) return;
    setModal({ isOpen: true, type: 'confirm', message: `Mark delivery done for ${order.customerName}?`, onConfirm: async () => {
      setAdminOrders(prev => prev.map(o => o.rowIndex === order.rowIndex ? { ...o, status: 'Updating...', deliveryDate: new Date().toISOString() } : o));
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=mark_delivered&rowIndex=${order.rowIndex}&cb=${Date.now()}`, { credentials: 'omit' });
        const result = await response.json();
        if (result.result === 'success') { fetchAdminOrders(); } else { throw new Error(); }
      } catch (error) { fetchAdminOrders(); }
    }});
  };

  // --- VIEWS ---

  if (view === 'landing') {
    return (
      <div style={{ ...s.container, paddingBottom: 0, backgroundColor: '#fafaf9' }}>

        {/* ══ HERO ══ */}
        <div style={{ background: 'linear-gradient(155deg, #052e16 0%, #064e3b 50%, #065f46 100%)', position: 'relative', overflow: 'hidden', paddingBottom: '4rem' }}>
          {/* Subtle radial glow top-right */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          {/* Subtle glow bottom-left */}
          <div style={{ position: 'absolute', bottom: -40, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.25rem 0', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ backgroundColor: 'white', color: '#059669', padding: '0.35rem', borderRadius: '7px', display: 'flex' }}>
                <Leaf size={18} fill="currentColor" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1 }}>Kanha</div>
                <div style={{ color: '#6ee7b7', fontSize: '0.6rem', letterSpacing: '1.5px', fontWeight: 700 }}>FARM FRESH</div>
              </div>
            </div>
            <button onClick={() => setView('admin-login')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', padding: '0.3rem 0.7rem', borderRadius: 6, cursor: 'pointer' }}>Admin</button>
          </div>

          {/* Hero content */}
          <div style={{ padding: '2.25rem 1.25rem 1.75rem', position: 'relative', zIndex: 2 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.25)', borderRadius: 20, padding: '0.3rem 0.85rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem' }}>🌱</span>
              <span style={{ color: '#a7f3d0', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}>Vanashanti FPO · Kanha Shantivanam</span>
            </div>

            {/* Headline — warm, benefit-led */}
            <h1 style={{ color: 'white', fontSize: '2.15rem', fontWeight: 900, lineHeight: 1.18, margin: '0 0 1rem', letterSpacing: '-0.5px' }}>
              From Kanha's Soil<br />
              to Your Family's<br />
              <span style={{ color: '#6ee7b7' }}>Table.</span>
            </h1>

            <p style={{ color: '#a7f3d0', fontSize: '0.88rem', lineHeight: 1.75, margin: '0 0 0.5rem' }}>
              Pure organic produce, grown without chemicals, nourished by <strong style={{ color: '#d1fae5' }}>biochar & vermicompost</strong> from Kanha Shantivanam.
            </p>
            <p style={{ color: '#6ee7b7', fontSize: '0.8rem', lineHeight: 1.6, margin: '0 0 2rem', fontWeight: 600 }}>
              Delivered fresh to your doorstep. 🚚
            </p>

            {/* CTA */}
            <button
              onClick={() => setView('home')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: 'white', color: '#047857', padding: '0.9rem 2rem', borderRadius: 14, border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', letterSpacing: '0.2px' }}
            >
              🛍️ Shop Now <ArrowRight size={16} />
            </button>
          </div>

          {/* Daaji card floating at bottom of hero */}
          <div style={{ margin: '0 1.25rem', position: 'relative', zIndex: 2 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '1rem 1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
              <img
                src="https://primary-assets.heartfulness.org/strapi-assets/medium_kamlesh_d_patel_daaji_2e9bb8ccd4.png"
                alt="Daaji – Kamlesh D. Patel"
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(110,231,183,0.5)' }}
              />
              <div>
                <p style={{ margin: '0 0 0.1rem', fontSize: '0.62rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>The Vision Behind Vanashanti</p>
                <p style={{ margin: '0 0 0.15rem', fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>Daaji</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#a7f3d0' }}>Kamlesh D. Patel · Global Guide, Heartfulness</p>
              </div>
            </div>
          </div>

          {/* Wave */}
          <svg viewBox="0 0 390 55" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 55, position: 'absolute', bottom: 0, left: 0 }}>
            <path d="M0,35 C80,10 200,55 390,25 L390,55 L0,55 Z" fill="#fafaf9" />
          </svg>
        </div>

        {/* ══ TRUST STRIP ══ */}
        <div style={{ background: 'white', borderBottom: '1px solid #f0fdf4', padding: '0.875rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {[
              { icon: '🚚', label: 'Home Delivery' },
              { icon: '🌾', label: 'Weekly Fresh' },
              { icon: '🚫', label: 'No Chemicals' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#047857', marginTop: '0.15rem' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ VALUE PROPS ══ */}
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <p style={{ margin: '0 0 0.875rem', fontSize: '0.7rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Why Vanashanti</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            {[
              { icon: '🌱', title: 'Farm\nDirect', desc: 'No middlemen' },
              { icon: '🌾', title: 'Healthy\nSoil', desc: 'Biochar & vermicompost' },
              { icon: '🌿', title: 'Fully\nOrganic', desc: 'Chemical-free' },
            ].map(item => (
              <div key={item.title} style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 14, padding: '1rem 0.6rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '0.72rem', color: '#064e3b', whiteSpace: 'pre-line', lineHeight: 1.25 }}>{item.title}</div>
                <div style={{ fontSize: '0.6rem', color: '#a8a29e', marginTop: '0.2rem', lineHeight: 1.3 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ HOW IT WORKS ══ */}
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <p style={{ margin: '0 0 0.875rem', fontSize: '0.7rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>How it works</p>
          <div style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {[
              { step: '1', icon: '🛒', title: 'Browse & add to cart', desc: 'Pick from fresh, organic produce' },
              { step: '2', icon: '💳', title: 'Pay via UPI', desc: 'GPay, PhonePe, Paytm — one tap' },
              { step: '3', icon: '🚚', title: 'Delivered fresh', desc: 'To your door or pickup point' },
            ].map((item, i, arr) => (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderBottom: i < arr.length - 1 ? '1px solid #f0fdf4' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1c1917' }}>{item.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#78716c', marginTop: '0.1rem' }}>{item.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#064e3b', color: 'white', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ ABOUT VANASHANTI ══ */}
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <p style={{ margin: '0 0 0.875rem', fontSize: '0.7rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Story</p>
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 16, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ background: '#d1fae5', borderRadius: 8, padding: '0.3rem', display: 'flex' }}><Leaf size={15} color="#047857" fill="#047857" /></div>
              <h2 style={{ margin: 0, fontWeight: 800, color: '#064e3b', fontSize: '0.95rem' }}>About Vanashanti</h2>
            </div>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.85rem', color: '#374151', lineHeight: 1.75 }}>
              Vanashanti FPO is dedicated to <strong>restoring soil health</strong> through organic methods — helping farmers grow stronger, more resilient crops, naturally and sustainably.
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.75 }}>
              Working with <strong>Kanha Shantivanam</strong>, we supply farmers with <strong>biochar and vermicompost</strong> that rebuild microbial activity and boost natural fertility. Better soil → better crops → better food for your family.
            </p>
          </div>
        </div>

        {/* ══ KANHA SHANTIVANAM ══ */}
        <div style={{ padding: '1.25rem 1.25rem 0' }}>
          <div style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', border: '1px solid #fde68a', borderRadius: 16, padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1.1 }}>🌾</div>
              <div>
                <h3 style={{ margin: '0 0 0.35rem', fontWeight: 800, color: '#78350f', fontSize: '0.9rem' }}>
                  Where Soil Comes Alive Again
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', lineHeight: 1.7 }}>
                  Biochar and vermicompost from <strong>Kanha Shantivanam</strong> enrich microbial activity, rebuild natural fertility, and give farmers the foundation for strong, healthy harvests — season after season.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ══ PRODUCE PREVIEW — live from PRODUCTS ══ */}
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Now</p>
            <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: '#047857', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>See all →</button>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {PRODUCTS.filter((p, idx, arr) => arr.findIndex(q => q.name.split(' - ')[0] === p.name.split(' - ')[0]) === idx).map(p => (
              <div key={p.id} style={{ flexShrink: 0, background: 'white', border: '1px solid #e7e5e4', borderRadius: 14, padding: '0.875rem 0.6rem', textAlign: 'center', minWidth: 72, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '1.5rem', display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>{p.icon}</div>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#374151', lineHeight: 1.3 }}>{p.name.split(' - ')[0]}</div>
                <div style={{ fontSize: '0.58rem', color: '#047857', fontWeight: 700, marginTop: '0.2rem' }}>from ₹{p.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ BOTTOM CTA ══ */}
        <div style={{ padding: '1.5rem 1.25rem 0' }}>
          <button onClick={() => setView('home')} style={{ ...s.btn, ...s.btnPrimary, fontSize: '1.05rem', padding: '1rem', marginTop: 0, boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
            🛍️ Start Shopping <ArrowRight size={18} />
          </button>
        </div>

        {/* ══ FOOTER ══ */}
        <div style={{ margin: '1.5rem 1.25rem 0', padding: '1.25rem', background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.7rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '1px' }}>Have a question?</p>
          <p style={{ margin: '0 0 0.75rem', fontWeight: 800, color: '#064e3b', fontSize: '1rem' }}>Mani — 81790 68821</p>
          <p style={{ margin: 0, fontSize: '0.65rem', color: '#a8a29e', lineHeight: 1.6 }}>
            Fresh · Organic · Direct from Kanha Village<br />
            Vanashanti FPO, Kanha Village, Rangareddy
          </p>
        </div>
        <div style={{ height: '2.5rem' }} />

      </div>
    );
  }

  if (view === 'admin-login') {
    return (
      <div style={{ ...s.centerFlex, backgroundColor: '#fafaf9' }}>
        <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
        <div style={{ ...s.card, width: '100%', maxWidth: 360, padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
             <div style={{ background: '#e7e5e4', padding: '1rem', borderRadius: '50%' }}><Lock size={32} color="#78716c"/></div>
          </div>
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: 0 }}>Admin Login</h2>
          <form onSubmit={(e) => { e.preventDefault(); if(adminUser===ADMIN_USER && adminPass===ADMIN_PASS){ setView('admin-dashboard'); fetchAdminOrders(); setAdminError(''); } else { setAdminError('Invalid credentials'); } }}>
            <div style={s.inputGroup}>
              <input type="text" placeholder="Username" value={adminUser} onChange={e => setAdminUser(e.target.value)} style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <input type="password" placeholder="Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={s.input} />
            </div>
            {adminError && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.875rem' }}>{adminError}</p>}
            <button type="submit" style={{ ...s.btn, ...s.btnPrimary }}>Login</button>
          </form>
          <button onClick={() => setView('home')} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  if (view === 'admin-dashboard') {
    const filteredOrders = adminOrders.filter(order => {
      if (adminFilterStatus !== 'All' && (order.status || 'Pending') !== adminFilterStatus) return false;
      if (adminFilterType && (!order.deliveryType || !order.deliveryType.includes(adminFilterType))) return false;
      if (adminSearchName) {
        const str = adminSearchName.toLowerCase();
        if (!(order.customerName||'').toLowerCase().includes(str) && !(order.aptNumber||'').toLowerCase().includes(str)) return false;
      }
      return true;
    });

    return (
      <div style={{ ...s.container, paddingBottom: '2rem' }}>
        <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
        <div style={{ background: '#064e3b', color: 'white', padding: '1rem', position: 'sticky', top: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.1rem' }}><Lock size={18} /> Admin Dashboard</h1>
          <button onClick={() => setView('home')} style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
        </div>
        
        <div style={{ padding: '1rem' }}>
          <div style={s.card}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <select value={adminFilterStatus} onChange={e => setAdminFilterStatus(e.target.value)} style={s.input}>
                <option value="Pending">Pending</option><option value="Done">Completed</option><option value="All">All</option>
              </select>
              <select value={adminFilterType} onChange={e => setAdminFilterType(e.target.value)} style={s.input}>
                <option value="">All Locations</option>
                {DELIVERY_OPTIONS.map(opt => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
              </select>
            </div>
            <div style={{ ...s.inputGroup, marginBottom: 0 }}>
              <Search style={s.iconPrefix} size={18} />
              <input type="text" placeholder="Search Name/Apt..." value={adminSearchName} onChange={e => setAdminSearchName(e.target.value)} style={s.input} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#78716c' }}>
              <span>Found <strong>{filteredOrders.length}</strong> orders</span>
              <button onClick={fetchAdminOrders} style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Refresh</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {adminLoading ? <div style={{ textAlign: 'center', padding: '2rem', color: '#a8a29e' }}><SpinLoader /> Loading...</div> : 
             filteredOrders.map((order, idx) => (
              <div key={idx} style={{ ...s.card, borderLeft: order.status === 'Done' ? '4px solid #10b981' : '1px solid #e7e5e4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{order.customerName}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#78716c', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <MapPin size={14}/> {order.deliveryType} {order.aptNumber && <span>• {order.aptNumber.replace(/^'/, '')}</span>}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      backgroundColor: order.status === 'Done' ? '#d1fae5' : '#fef3c7',
                      color: order.status === 'Done' ? '#047857' : '#b45309'
                    }}>{order.status || 'Pending'}</span>
                    <p style={{ fontSize: '0.75rem', color: '#a8a29e', margin: '0.25rem 0 0' }}>{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ backgroundColor: '#fafaf9', padding: '0.75rem', borderRadius: 8, fontSize: '0.875rem' }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 700 }}>Items:</p>
                  <p style={{ margin: 0 }}>{order.items}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e7e5e4', fontWeight: 700 }}>
                    <span>Total:</span><span>₹{order.total}</span>
                  </div>
                </div>
                {order.status !== 'Done' && (
                  <button onClick={() => markAsDelivered(order)} disabled={order.status === 'Updating...'} style={{ ...s.btn, ...s.btnPrimary, marginTop: '1rem' }}>
                    {order.status === 'Updating...' ? <SpinLoader /> : <CheckCircle size={20} />}
                    Mark Delivered
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />
      
      {SHOW_HARVESTING_SCREEN ? (
        <div style={s.centerFlex}>
          <Leaf size={64} color="#059669" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#064e3b', margin: 0 }}>Harvesting in Progress</h2>
          <p style={{ textAlign: 'center', color: '#78716c', marginTop: '1rem' }}>We are currently waiting for the harvesting. Ordering will be enabled soon.</p>
          <button onClick={() => setView('admin-login')} style={{ marginTop: '2rem', background: 'none', border: 'none', color: '#d6d3d1' }}>Admin</button>
        </div>
      ) : orderPlaced ? (
        <div style={s.centerFlex}>
          <CheckCircle size={64} color="#059669" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#064e3b', margin: 0 }}>Order Received!</h2>
          <p style={{ textAlign: 'center', color: '#78716c', marginBottom: '1.5rem' }}>Thank you, {customerName}.</p>
          <div style={{ ...s.card, width: '100%' }}>
            <p style={{ margin: '0 0 0.5rem' }}><strong>Total:</strong> ₹{orderSummary?.total ?? calculateTotal()}/-</p>
            <p style={{ margin: 0 }}><strong>Location:</strong> {orderSummary?.deliveryLabel || DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label}</p>
          </div>
          <button onClick={() => window.location.reload()} style={{ ...s.btn, ...s.btnPrimary }}>Place Another Order</button>
        </div>
      ) : showPayment ? (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header */}
          <div style={s.header}>
            <button onClick={() => { setShowPayment(false); setPaymentStep('idle'); setPaymentFile(null); }} style={{ background: 'none', border: 'none', color: 'white', marginRight: '0.5rem', cursor: 'pointer' }}>
              <ArrowRight style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Payment</h2>
          </div>

          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Amount */}
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>Total Amount</p>
              <p style={{ fontSize: '3rem', fontWeight: 800, color: '#065f46', margin: '0.25rem 0 0' }}>₹{calculateTotal()}</p>
            </div>

            {USE_EASEBUZZ ? (
              <>
                {/* ── PRIMARY: Easebuzz gateway ── */}
                <button
                  onClick={initiateEasebuzzPayment}
                  disabled={isSubmitting}
                  style={{ ...s.btn, ...s.btnPrimary, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', fontSize: '1.05rem', padding: '1rem', gap: '0.6rem', boxShadow: '0 4px 14px rgba(5,150,105,0.35)', marginTop: 0, opacity: isSubmitting ? 0.75 : 1 }}
                >
                  {isSubmitting ? <SpinLoader /> : <span style={{ fontSize: '1.3rem' }}>💳</span>}
                  <span>{isSubmitting ? 'Preparing Payment...' : `Pay ₹${calculateTotal()} Securely`}</span>
                </button>

                {/* Supported methods */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.72rem', color: '#a8a29e', margin: '0 0 0.5rem' }}>UPI · Debit / Credit Cards · Net Banking · Wallets</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'G Pay', bg: '#4285F4' },
                      { label: 'PhonePe', bg: '#5f259f' },
                      { label: 'Paytm', bg: '#00BAF2' },
                      { label: 'Cards', bg: '#374151' },
                    ].map(app => (
                      <span key={app.label} style={{ backgroundColor: app.bg, color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 6 }}>{app.label}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── UPI ID ── */}
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 12, padding: '0.875rem 1rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700, margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pay to UPI ID</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#064e3b', fontSize: '1rem' }}>{UPI_ID}</span>
                    <button
                      onClick={copyUpiId}
                      style={{ flexShrink: 0, background: upiCopied ? '#059669' : 'white', color: upiCopied ? 'white' : '#059669', border: '1.5px solid #059669', borderRadius: 8, padding: '0.3rem 0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                    >
                      {upiCopied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* ── QR Code ── */}
                <div style={{ textAlign: 'center', padding: '0.25rem 0' }}>
                  <p style={{ fontSize: '0.75rem', color: '#78716c', margin: '0 0 0.75rem' }}>or scan with any UPI app</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${calculateTotal()}&cu=INR`)}`}
                    alt="UPI QR Code"
                    style={{ width: 180, height: 180, borderRadius: 12, border: '2px solid #a7f3d0', display: 'block', margin: '0 auto' }}
                  />
                  <p style={{ fontSize: '0.7rem', color: '#a8a29e', margin: '0.5rem 0 0' }}>G Pay · PhonePe · Paytm · BHIM · any UPI app</p>
                </div>

                {/* ── Divider ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: 1, background: '#e7e5e4' }} />
                  <span style={{ fontSize: '0.72rem', color: '#a8a29e', whiteSpace: 'nowrap' }}>after payment</span>
                  <div style={{ flex: 1, height: 1, background: '#e7e5e4' }} />
                </div>

                {/* ── Upload instruction ── */}
                <p style={{ fontSize: '0.875rem', color: '#78716c', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                  Take a screenshot from your UPI app and upload it below to confirm your order
                </p>

                {/* ── Mandatory screenshot upload ── */}
                <div style={{ border: `1.5px dashed ${paymentFile ? '#059669' : '#f59e0b'}`, borderRadius: 12, padding: '1rem', textAlign: 'center', background: paymentFile ? '#f0fdf4' : '#fffbeb' }}>
                  <p style={{ fontSize: '0.75rem', color: paymentFile ? '#059669' : '#b45309', fontWeight: 600, margin: '0 0 0.5rem' }}>
                    {paymentFile ? '✓ Screenshot attached' : '📸 Upload payment screenshot to continue'}
                  </p>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: paymentFile ? '#047857' : '#78716c', fontSize: '0.875rem', fontWeight: 600 }}>
                    <Upload size={16} />
                    {paymentFile ? paymentFile.name : 'Choose screenshot'}
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                {paymentFile && (
                  <button
                    onClick={handleFinalizeOrder}
                    disabled={isSubmitting}
                    style={{ ...s.btn, ...s.btnPrimary, marginTop: 0, fontSize: '1.05rem', padding: '1rem' }}
                  >
                    {isSubmitting ? <SpinLoader /> : <CheckCircle size={20} />}
                    {isSubmitting ? 'Placing Order...' : 'Confirm My Order'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={s.header}>
            <div style={{ backgroundColor: 'white', color: '#059669', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}><Leaf size={20} fill="currentColor" /></div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1 }}>Kanha</h1>
              <span style={{ fontSize: '0.7rem', opacity: 0.9, letterSpacing: '1px' }}>FARM FRESH</span>
            </div>
          </div>
          
          <div style={{ padding: '0 1rem', marginTop: '-1.5rem', position: 'relative', zIndex: 20 }}>
            <div style={{ backgroundColor: '#047857', height: '2rem', marginBottom: '-2rem' }}></div> 
            
            {/* Products */}
            <div ref={productsRef} style={{ paddingTop: '2rem' }}>
              <h3 style={s.sectionTitle}><span style={s.step}>1</span> Fresh Produce</h3>
              <div>
                {PRODUCTS.map(product => (
                  <div key={product.id} style={s.productRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem', backgroundColor: '#fafaf9', width: '3rem', height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>{product.icon}</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{product.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#78716c' }}>{product.desc} • {product.unit}</p>
                        <span style={{ fontWeight: 700, color: '#047857', marginTop: '0.25rem', display: 'block' }}>₹{product.price}/-</span>
                      </div>
                    </div>
                    <div style={s.qtyWrapper}>
                      <button style={{ ...s.qtyBtn, backgroundColor: '#059669', color: 'white' }} onClick={() => updateQuantity(product.id, 1)}><Plus size={14}/></button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, margin: '2px 0' }}>{cart[product.id] || 0}</span>
                      <button style={{ ...s.qtyBtn, backgroundColor: 'white', border: '1px solid #e7e5e4', color: '#059669' }} onClick={() => updateQuantity(product.id, -1)} disabled={!cart[product.id]}><Minus size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div ref={deliveryRef}>
              <h3 style={s.sectionTitle}><span style={s.step}>2</span> Delivery Details</h3>
              <div style={s.card}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', marginBottom: '1rem' }}>Select Location</p>
                {DELIVERY_OPTIONS.map(option => (
                  <div key={option.id} style={{ ...s.deliveryOption, backgroundColor: deliveryType === option.id ? '#ecfdf5' : '#fafaf9', borderColor: deliveryType === option.id ? '#059669' : 'transparent' }} onClick={() => setDeliveryType(option.id)}>
                    <div style={{ width: '1.2rem', height: '1.2rem', borderRadius: '50%', border: '2px solid #e7e5e4', marginRight: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: deliveryType === option.id ? '#059669' : '#e7e5e4' }}>
                      {deliveryType === option.id && <div style={{ width: '0.6rem', height: '0.6rem', backgroundColor: '#059669', borderRadius: '50%' }}></div>}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: deliveryType === option.id ? '#064e3b' : '#44403c' }}>{option.label}</span>
                    {option.requiresApt && <MapPin size={16} style={{ marginLeft: 'auto', color: '#a8a29e' }} />}
                  </div>
                ))}
                
                {DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt && (
                  <div style={{ marginTop: '1rem' }}>
                     <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Block & Flat Number</p>
                     <input type="text" placeholder="e.g. A-101" value={aptNumber} onChange={e => setAptNumber(e.target.value)} style={s.input} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div ref={infoRef}>
              <h3 style={s.sectionTitle}><span style={s.step}>3</span> Your Info</h3>
              <div style={s.card}>
                <div style={s.inputGroup}>
                  <User style={s.iconPrefix} size={18} />
                  <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={s.input} />
                </div>
                <div style={{ ...s.inputGroup, marginBottom: 0 }}>
                  <Phone style={s.iconPrefix} size={18} />
                  <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={e => { if(/^\d*$/.test(e.target.value)) setMobileNumber(e.target.value) }} style={s.input} />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '2rem', marginTop: '2rem' }}>
               <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', margin: 0 }}>For Enquiries</p>
               <p style={{ fontWeight: 700, color: '#065f46', margin: '0.25rem 0 0' }}>Mani - 81790 68821</p>
               <button onClick={() => setView('admin-login')} style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer' }}>Admin</button>
            </div>
          </div>

          {showScrollCue && (
            <div style={{ position: 'fixed', bottom: '6rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6, pointerEvents: 'none' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c' }}>Scroll Down</span>
              <ChevronDown color="#78716c" />
            </div>
          )}

          <div style={s.bottomBar}>
            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>Total</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>₹{calculateTotal()}</p>
              </div>
              <button onClick={handleSmartAction} style={{ ...s.btn, ...s.btnPrimary, width: 'auto', paddingLeft: '2rem', paddingRight: '2rem', marginTop: 0 }}>
                {getButtonText().text} {getButtonText().icon}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/test') return <TestPage />;
  return <SmartGrocerApp />;
}