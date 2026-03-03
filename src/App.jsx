import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, User, CheckCircle, ChevronDown, Minus, Plus, Leaf, ArrowRight, ArrowLeft, Loader2, Lock, Search, X, AlertCircle, Sparkles, Trash2 } from 'lucide-react';

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
const SCRIPT_SECRET = 'kff_secret_9x7z';

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
    padding: '1rem 1rem 2rem',
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
    <circle cx="48" cy="65" r="1.5" fill="#1b3314" opacity="0.6" />
    <circle cx="51" cy="78" r="1.5" fill="#1b3314" opacity="0.6" />
  </svg>
);


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

const MulberryIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* Stem */}
    <path d="M44 18 Q 50 8 56 18" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Elongated drupe cluster — dark purple, like a blackberry/mulberry */}
    <circle cx="50" cy="27" r="9"   fill="#7e22ce"/>
    <circle cx="40" cy="37" r="9"   fill="#6b21a8"/>
    <circle cx="60" cy="37" r="9"   fill="#6b21a8"/>
    <circle cx="50" cy="47" r="9"   fill="#7e22ce"/>
    <circle cx="38" cy="56" r="8.5" fill="#6b21a8"/>
    <circle cx="62" cy="56" r="8.5" fill="#6b21a8"/>
    <circle cx="50" cy="65" r="9"   fill="#7e22ce"/>
    <circle cx="42" cy="74" r="8"   fill="#6b21a8"/>
    <circle cx="58" cy="74" r="8"   fill="#6b21a8"/>
    <circle cx="50" cy="82" r="8"   fill="#581c87"/>
    {/* Shine dots */}
    <circle cx="47" cy="29" r="2.5" fill="rgba(255,255,255,0.35)"/>
    <circle cx="47" cy="49" r="2"   fill="rgba(255,255,255,0.3)"/>
    <circle cx="47" cy="67" r="2"   fill="rgba(255,255,255,0.3)"/>
  </svg>
);

const IndianRaspberryIcon = () => (
  <svg viewBox="0 0 100 100" style={{ width: 40, height: 40, overflow: 'visible' }}>
    {/* Stem */}
    <path d="M44 16 Q 50 6 56 16" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Round drupe cluster — golden yellow (hill raspberry is yellow when ripe) */}
    <circle cx="50" cy="34"  r="11"  fill="#f59e0b"/>
    <circle cx="36" cy="46"  r="11"  fill="#fbbf24"/>
    <circle cx="64" cy="46"  r="11"  fill="#fbbf24"/>
    <circle cx="43" cy="61"  r="11"  fill="#f59e0b"/>
    <circle cx="57" cy="61"  r="11"  fill="#f59e0b"/>
    <circle cx="50" cy="74"  r="10"  fill="#d97706"/>
    {/* Hollow centre hint (raspberries are hollow) */}
    <circle cx="50" cy="52"  r="5"   fill="#92400e" opacity="0.25"/>
    {/* Shine dots */}
    <circle cx="47" cy="32"  r="3"   fill="rgba(255,255,255,0.5)"/>
    <circle cx="33" cy="44"  r="2.5" fill="rgba(255,255,255,0.45)"/>
  </svg>
);

const SpinLoader = () => (
  <>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
  </>
);

const Modal = ({ isOpen, type, message, title, onClose, onConfirm, confirmLabel, refId, isLoading }) => {
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
            <>
              {message}
              {refId && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: '#a8a29e', fontFamily: 'monospace' }}>
                  {refId}
                </div>
              )}
            </>
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
              {confirmLabel || (type === 'confirm' ? 'Yes, Proceed' : 'Okay')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DATA ---
const PRODUCTS = [


  // cat: 'fruits'
  { id: 1,  cat: 'fruits', name: 'Strawberry - 200gm',                       unit: 'Box (200g)',   price: 100, icon: <span style={{ fontSize: '2rem' }}>🍓</span>, desc: 'Sweet & Red' },
  { id: 2,  cat: 'fruits', name: 'Strawberry - 500gm',                       unit: 'Box (500g)',   price: 225, icon: <span style={{ fontSize: '2rem' }}>🍓</span>, desc: 'Sweet & Red' },
  { id: 3,  cat: 'fruits', name: 'Strawberry - 1Kg',                         unit: 'Box (1Kg)',    price: 400, icon: <span style={{ fontSize: '2rem' }}>🍓</span>, desc: 'Sweet & Red' },
  { id: 4,  cat: 'fruits', name: 'Goldenberry - 150gm',                      unit: '150gm',        price: 100, icon: <GoldenBerryIcon />, desc: 'Sweet & Zesty' },
  { id: 5,  cat: 'fruits', name: 'Goldenberry - 250gm',                      unit: '250gm',        price: 150, icon: <GoldenBerryIcon />, desc: 'Sweet & Zesty' },
  { id: 6,  cat: 'fruits', name: 'Tender Coconut',                           unit: 'Piece',        price: 50,  icon: <TenderCoconutIcon />, desc: 'Refreshing' },
  { id: 7,  cat: 'fruits', name: 'Guava',                                    unit: '1 Kg',         price: 80,  icon: <span style={{ fontSize: '2rem' }}>🍈</span>, desc: 'Fresh & Sweet' },
  { id: 8,  cat: 'fruits', name: 'Banana - Karpooravalli',                   unit: '1 Kg',         price: 100, icon: <span style={{ fontSize: '2rem' }}>🍌</span>, desc: 'Rich & Aromatic' },
  { id: 9,  cat: 'fruits', name: 'Mulberry',                                 unit: '125gm',        price: 100, icon: <MulberryIcon />,        desc: 'Sweet & Juicy' },
  { id: 10, cat: 'fruits', name: 'Indian Raspberry',                        unit: '100gm',        price: 200, icon: <IndianRaspberryIcon />, desc: 'Tangy & Fresh' },

  // cat: 'vegs'
  { id: 21, cat: 'vegs',   name: 'Beetroot',                                 unit: '500gm',        price: 35,  icon: <BeetrootIcon />, desc: 'Earthy Root' },
  { id: 22, cat: 'vegs',   name: 'Bitter Gourd',                             unit: '500gm',        price: 40,  icon: <BitterGourdIcon />, desc: 'Healthy' },
  { id: 23, cat: 'vegs',   name: 'Bottle Gourd',                             unit: '500gm',        price: 30,  icon: <BottleGourdIcon />, desc: 'Healthy' },
  { id: 24, cat: 'vegs',   name: 'Smooth Gourd',                             unit: '500gm',        price: 40,  icon: <SmoothGourdIcon />, desc: 'Nutritious' },
  { id: 25, cat: 'vegs',   name: 'Ridge Gourd',                              unit: '500gm',        price: 40,  icon: <RidgeGourdIcon />, desc: 'Fibrous & Healthy' },
  { id: 26, cat: 'vegs',   name: 'Tomato',                                   unit: '1 Kg',         price: 60,  icon: <span style={{ fontSize: '2rem' }}>🍅</span>, desc: 'Fresh & Tangy' },
  { id: 27, cat: 'vegs',   name: 'Carrot',                                   unit: '1 Kg',         price: 60,  icon: <span style={{ fontSize: '2rem' }}>🥕</span>, desc: 'Crunchy & Sweet' },


  // cat: 'dairy'
  { id: 31, cat: 'dairy',  name: 'Plain Paneer',                             unit: '200g',         price: 119, icon: <span style={{ fontSize: '2rem' }}>🧀</span>, desc: 'Rich Protein' },
  { id: 32, cat: 'dairy',  name: 'Sundried Tomato & Basil flavoured Paneer', unit: '200g',         price: 149, icon: <span style={{ fontSize: '2rem' }}>🧀</span>, desc: 'Rich Protein' },
  { id: 33, cat: 'dairy',  name: 'Mint & Chilli flavoured Paneer',           unit: '200g',         price: 149, icon: <span style={{ fontSize: '2rem' }}>🧀</span>, desc: 'Rich Protein' },
  { id: 34, cat: 'dairy',  name: 'Pepper flavoured Paneer',                  unit: '200g',         price: 149, icon: <span style={{ fontSize: '2rem' }}>🧀</span>, desc: 'Rich Protein' },
  { id: 35, cat: 'dairy',  name: 'Plain Tofu',                               unit: '200g',         price: 119, icon: <span style={{ fontSize: '2rem' }}>🧊</span>, desc: 'Lean & Vegan' },


  // cat: 'greens'
  { id: 41, cat: 'greens', name: 'Palak',                                    unit: 'Bunch (200g)', price: 30,  icon: <span style={{ fontSize: '2rem' }}>🥬</span>, desc: 'Iron Rich' },
  { id: 42, cat: 'greens', name: 'Methi Leaves',                             unit: 'Bunch (200g)', price: 30,  icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Nutritious' },
  { id: 43, cat: 'greens', name: 'Coriander Leaves',                         unit: 'Bunch (200g)', price: 30,  icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Aromatic' },
  { id: 44, cat: 'greens', name: 'Curry Leaves',                             unit: 'Bunch (200g)', price: 30,  icon: <span style={{ fontSize: '2rem' }}>🌿</span>, desc: 'Aromatic' },

];

const CATEGORIES = [
  { key: 'fruits', label: 'Fruits',       emoji: '🍓', iconBg: '#ffe4ef' },
  { key: 'greens', label: 'Fresh Greens', emoji: '🥬', iconBg: '#dcfce7' },
  { key: 'vegs',   label: 'Vegetables',   emoji: '🥦', iconBg: '#fed7aa' },
  { key: 'dairy',  label: 'Dairy & More', emoji: '🧀', iconBg: '#fef3c7' },
];

const DELIVERY_OPTIONS = [
  { id: 'vihanga', label: 'My Home Vihanga', requiresApt: true },
  { id: 'krishe', label: 'My Home Krishe', requiresApt: true },
  { id: 'bhooja', label: 'My Home Bhooja', requiresApt: true },
  //  { id: 'phf', label: 'Prestige High Fields', requiresApt: true },
  { id: 'atria', label: 'Rajapushpa Atria', requiresApt: true },
//  { id: 'tranquil', label: 'Prestige Tranquil', requiresApt: true },
//  { id: 'pbel', label: 'PBEL City', requiresApt: true },
  { id: 'mtv', label: 'Maple Town Villas', requiresApt: true },
  { id: 'asblks', label: 'ASBL Lakeside', requiresApt: true },

//  { id: 'aristos', label: 'Poulomi Aristos', requiresApt: true },
//  { id: 'pickup', label: 'Store pick up (Malabar Natives)', requiresApt: false },
//  { id: 'gc', label: 'Pick up (Gachibowli Meditation Centre)', requiresApt: false },
];

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7cz_Ykzim6EYILS0Fpo5_DJlcJiuO01mefnkqHUGqeui3zd6pRf95oTFJiit3tB6X/exec";

const classifyPaymentError = (err) => {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('hash') || msg.includes('mismatch') || msg.includes('verif')) return 'Gateway verification failed';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) return 'Connection issue';
  if (msg.includes('token') || msg.includes('access_key')) return 'Gateway unavailable';
  return 'Unexpected error';
};

function SmartGrocerApp() {
  const [view, setView] = useState('landing');
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', message: '', title: '', onConfirm: null, isLoading: false });

  // Customer State
  const [cart, setCart] = useState({});
  const [deliveryType, setDeliveryType] = useState('');
  const [aptNumber, setAptNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  // Admin State
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilterType, setAdminFilterType] = useState('');
  const [adminSearchName, setAdminSearchName] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('Pending');
  const [adminSection, setAdminSection] = useState('menu');
  const [disabledProducts, setDisabledProducts] = useState([]);
  const [productsReady, setProductsReady] = useState(false);
  const [productsError, setProductsError] = useState(false);

  const paymentHandledRef = useRef(false); // prevents duplicate onResponse processing

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setShowScrollCue(false);
      else setShowScrollCue(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch disabled products on mount — use localStorage cache if available
  useEffect(() => {
    const CACHE_KEY = 'kff_disabled_products';
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setDisabledProducts(JSON.parse(cached));
      setProductsReady(true);
    }
    fetch(`${GOOGLE_SCRIPT_URL}?action=get_disabled_products&cb=${Date.now()}`, { credentials: 'omit' })
      .then(r => r.json())
      .then(data => {
        const disabled = data.disabled || [];
        setDisabledProducts(disabled);
        setProductsReady(true);
        localStorage.setItem(CACHE_KEY, JSON.stringify(disabled));
      })
      .catch(() => {
        if (!cached) {
          // No cache — refuse to show products to avoid showing disabled items
          setProductsError(true);
          setProductsReady(true);
        }
        // If cache exists it's already applied — silently keep it
      });
  }, []);

  // Auto-navigate back to products if cart becomes empty while on cart view
  useEffect(() => {
    if (view === 'cart' && Object.keys(cart).length === 0) setView('home');
  }, [cart, view]);

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
              secret: SCRIPT_SECRET,
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
            setModal({ isOpen: true, type: 'alert', title: 'Order not saved', message: 'Your payment went through! But we couldn\'t save your order. Please WhatsApp Mani on 81790 68821 and we\'ll sort it out right away.' });
          }
        })();
      }
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentResult === 'failure') {
      setModal({ isOpen: true, type: 'alert', title: 'Payment Failed', message: 'Payment was not completed. Please try again or use manual UPI.' });
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Recovery: resubmit any paid order whose Sheets entry was lost (e.g. network drop after payment)
    const savedPaid = sessionStorage.getItem('kff_paid_order');
    if (savedPaid) {
      (async () => {
        try {
          const o = JSON.parse(savedPaid);
          if (o.orderBody) {
            const parsedBody = JSON.parse(o.orderBody);
            parsedBody.secret = SCRIPT_SECRET;
            await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(parsedBody) });
            sessionStorage.removeItem('kff_paid_order');
          }
        } catch { /* will retry on next load */ }
      })();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- LOGIC ---
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


  const loadCheckoutScript = () => new Promise((resolve, reject) => {
    if (window.EasebuzzCheckout) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/easebuzz-checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load payment SDK'));
    document.head.appendChild(script);
  });

  const initiateEasebuzzPayment = async () => {
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const deliveryLabel = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label || '';
      const safeName = customerName.replace(/[^a-zA-Z0-9 ]/g, '').trim().substring(0, 50) || 'Customer';
      const itemsString = Object.entries(cart).map(([id, qty]) => {
        const product = PRODUCTS.find(p => p.id === parseInt(id));
        return `${product.name} (${qty})`;
      }).join(', ');

      // Webhook URL = this app's own Vercel function, receives Easebuzz payment
      // confirmation server-to-server the instant payment completes
      const webhookUrl = window.location.origin + '/api/payment-webhook';
      const buildUrl = () =>
        `${GOOGLE_SCRIPT_URL}?action=get_easebuzz_access_key&secret=kff_secret_9x7z&amount=${encodeURIComponent(total.toString())}&firstname=${encodeURIComponent(safeName)}&phone=${encodeURIComponent(mobileNumber)}&webhookUrl=${encodeURIComponent(webhookUrl)}&cb=${Date.now()}`;

      // Retry once — Easebuzz's initiateLink API occasionally returns transient errors
      let apiResponse = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(buildUrl(), { credentials: 'omit' });
        apiResponse = await res.json();
        if (apiResponse.access_key && apiResponse.status === 1) break;
        if (attempt < 2) await new Promise(r => setTimeout(r, 1000)); // brief pause before retry
      }
      const { key, access_key, txnid, status: apiStatus } = apiResponse;

      if (!access_key || apiStatus !== 1) throw new Error(apiResponse.eb_error || 'Could not get payment token. Please try again.');

      // Step 1: Create a PENDING order row in Sheets immediately (before overlay opens).
      // The Apps Script webhook will update this row the moment Easebuzz confirms payment —
      // no need to wait for the customer to return to the app.
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            action: 'create',
            secret: SCRIPT_SECRET,
            customerName,
            mobileNumber,
            deliveryType: deliveryLabel,
            aptNumber: aptNumber ? "'" + aptNumber : '',
            items: itemsString,
            total,
            image: `PAYMENT PENDING | TxnID: ${txnid}`,
            imageName: 'easebuzz_pending',
          }),
        });
      } catch { /* best-effort; webhook + client fallback will still update the row */ }

      // Step 2: Open payment overlay
      paymentHandledRef.current = false;
      await loadCheckoutScript();
      const checkout = new window.EasebuzzCheckout(key, 'prod');
      checkout.initiatePayment({
        access_key,
        onResponse: (data) => {
          if (paymentHandledRef.current) return; // guard against duplicate callbacks
          paymentHandledRef.current = true;
          setIsSubmitting(false);

          if (data.status === 'success') {
            // Sheet update handled by Vercel webhook (server-to-server) — no client call needed.
            setOrderSummary({ total, deliveryLabel, items: Object.entries(cart).filter(([,qty]) => qty > 0).map(([id, qty]) => { const p = PRODUCTS.find(p => p.id === parseInt(id)); return { name: p.name, unit: p.unit, qty }; }) });
            setOrderPlaced(true);
            window.scrollTo(0, 0);
          } else if (data.status !== 'userCancelled') {
            setModal({ isOpen: true, type: 'alert', title: 'Payment not completed', message: 'Your payment didn\'t go through. Please try again — or use the manual UPI option below if the issue continues.' });
          }
        },
        theme: '#059669',
      });
    } catch (e) {
      setIsSubmitting(false);
      const refId = 'KFF-' + Date.now().toString(36).toUpperCase().slice(-6);
      setModal({
        isOpen: true, type: 'confirm', title: 'Almost there!',
        message: 'The payment gateway took a moment to respond. Tap Try Again — it usually works on the next attempt.',
        refId: `${classifyPaymentError(e)} · Ref: ${refId}`,
        confirmLabel: 'Try Again',
        onConfirm: initiateEasebuzzPayment,
      });
    }
  };

  const fetchAdminOrders = async (token) => {
    const authToken = token || adminToken;
    setAdminLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?admin_token=${encodeURIComponent(authToken)}&v=${new Date().getTime()}`, { credentials: 'omit' });
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
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=mark_delivered&admin_token=${encodeURIComponent(adminToken)}&rowIndex=${order.rowIndex}&cb=${Date.now()}`, { credentials: 'omit' });
        const result = await response.json();
        if (result.result === 'success') { fetchAdminOrders(); } else { throw new Error(); }
      } catch (error) { fetchAdminOrders(); }
    }});
  };

  const toggleProduct = async (productId) => {
    const id = String(productId);
    const isDisabled = disabledProducts.includes(id);
    const newDisabled = isDisabled ? disabledProducts.filter(x => x !== id) : [...disabledProducts, id];
    setDisabledProducts(newDisabled); // optimistic update
    await fetch(
      `${GOOGLE_SCRIPT_URL}?action=set_disabled_products&secret=${SCRIPT_SECRET}&ids=${newDisabled.join(',')}&cb=${Date.now()}`,
      { credentials: 'omit' }
    ).catch(() => setDisabledProducts(disabledProducts)); // revert on error
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
          <form onSubmit={async (e) => {
            e.preventDefault();
            setAdminLoggingIn(true);
            setAdminError('');
            try {
              const res = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'verify_admin', username: adminUser, password: adminPass }),
                credentials: 'omit',
              });
              const data = await res.json();
              if (data.token) {
                setAdminToken(data.token);
                setView('admin-dashboard');
                fetchAdminOrders(data.token);
                setAdminError('');
              } else {
                setAdminError('Invalid credentials');
              }
            } catch { setAdminError('Login failed. Please try again.'); }
            finally { setAdminLoggingIn(false); }
          }}>
            <div style={s.inputGroup}>
              <input type="text" placeholder="Username" value={adminUser} onChange={e => setAdminUser(e.target.value)} style={s.input} />
            </div>
            <div style={s.inputGroup}>
              <input type="password" placeholder="Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={s.input} />
            </div>
            {adminError && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.875rem' }}>{adminError}</p>}
            <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={adminLoggingIn}>
              {adminLoggingIn ? 'Verifying...' : 'Login'}
            </button>
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

    const sectionTitles = { menu: 'Admin Dashboard', products: 'Product Availability', orders: 'Manage Orders' };

    return (
      <div style={{ ...s.container, paddingBottom: '2rem' }}>
        <Modal {...modal} onClose={() => setModal({ ...modal, isOpen: false })} />

        {/* ── Header ── */}
        <div style={{ background: '#064e3b', color: 'white', padding: '1rem', position: 'sticky', top: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {adminSection !== 'menu' ? (
              <button onClick={() => setAdminSection('menu')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0 0.25rem', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Lock size={18} />
            )}
            <h1 style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>{sectionTitles[adminSection]}</h1>
          </div>
          <button onClick={() => { setView('home'); setAdminSection('menu'); }} style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
        </div>

        <div style={{ padding: '1rem' }}>

          {/* ── MENU ── */}
          {adminSection === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { key: 'products', emoji: '🛒', title: 'Product Availability', desc: 'Show or hide items from the catalogue' },
                { key: 'orders',   emoji: '📦', title: 'Manage Orders',        desc: 'View orders and mark deliveries' },
              ].map(item => (
                <button key={item.key} onClick={() => setAdminSection(item.key)} style={{ width: '100%', padding: '1.25rem', background: 'white', border: '1px solid #e7e5e4', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ background: '#d1fae5', padding: '0.75rem', borderRadius: '10px', fontSize: '1.5rem', lineHeight: 1 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#1c1917' }}>{item.title}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#78716c' }}>{item.desc}</p>
                  </div>
                  <ArrowRight size={20} color="#a8a29e" />
                </button>
              ))}
            </div>
          )}

          {/* ── PRODUCT AVAILABILITY ── */}
          {adminSection === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {CATEGORIES.map(cat => {
                const catProds = PRODUCTS.filter(p => p.cat === cat.key);
                if (catProds.length === 0) return null;
                const visibleCount = catProds.filter(p => !disabledProducts.includes(String(p.id))).length;
                return (
                  <div key={cat.key} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e7e5e4', overflow: 'hidden' }}>
                    {/* Category header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', background: '#f5f5f4', borderBottom: '1px solid #e7e5e4' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#57534e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat.emoji} {cat.label}</span>
                      <span style={{ fontSize: '0.7rem', color: '#78716c' }}>{visibleCount}/{catProds.length} visible</span>
                    </div>
                    {/* Product rows */}
                    {catProds.map((product, idx) => {
                      const isDisabled = disabledProducts.includes(String(product.id));
                      return (
                        <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: isDisabled ? '#fafaf9' : '#f0fdf4', borderBottom: idx < catProds.length - 1 ? '1px solid #e7e5e4' : 'none' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isDisabled ? '#a8a29e' : '#1c1917', textDecoration: isDisabled ? 'line-through' : 'none' }}>{product.name}</div>
                            <div style={{ fontSize: '0.72rem', color: isDisabled ? '#c4c4c0' : '#6b7280', marginTop: '0.1rem' }}>{product.unit} · <strong>₹{product.price}</strong></div>
                          </div>
                          {/* Toggle switch */}
                          <div onClick={() => toggleProduct(product.id)} style={{ width: '44px', height: '26px', borderRadius: '13px', background: isDisabled ? '#d4d4d0' : '#059669', display: 'flex', alignItems: 'center', padding: '3px', cursor: 'pointer', flexShrink: 0, marginLeft: '1rem', justifyContent: isDisabled ? 'flex-start' : 'flex-end' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MANAGE ORDERS ── */}
          {adminSection === 'orders' && (
            <>
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
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: order.status === 'Done' ? '#d1fae5' : '#fef3c7', color: order.status === 'Done' ? '#047857' : '#b45309' }}>{order.status || 'Pending'}</span>
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
                  ))
                }
              </div>
            </>
          )}

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
            {/* Items list */}
            {orderSummary?.items?.length > 0 && (
              <>
                <p style={{ margin: '0 0 0.625rem', fontSize: '0.7rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Order</p>
                {orderSummary.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: i < orderSummary.items.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: '0.72rem', color: '#a8a29e', marginLeft: '0.35rem' }}>({item.unit})</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>× {item.qty}</span>
                  </div>
                ))}
                <div style={{ height: '1px', background: '#e7e5e4', margin: '0.75rem 0' }} />
              </>
            )}
            {/* Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ color: '#78716c', fontSize: '0.875rem' }}>📍 Location</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{orderSummary?.deliveryLabel || DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#78716c', fontSize: '0.875rem' }}>💰 Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#064e3b' }}>₹{orderSummary?.total ?? calculateTotal()}</span>
            </div>
          </div>
          <button onClick={() => window.location.reload()} style={{ ...s.btn, ...s.btnPrimary }}>Place Another Order</button>
        </div>
      ) : view === 'cart' ? (
        // ── CART VIEW ──
        <>
          <div style={{ background: '#047857', color: 'white', padding: '1rem', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={22} />
            </button>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Your Cart</h2>
          </div>

          <div style={{ padding: '1rem' }}>
            {Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => {
              const product = PRODUCTS.find(p => p.id === parseInt(id));
              if (!product) return null;
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', border: '1px solid #e7e5e4', borderRadius: '12px', padding: '0.75rem 0.875rem', marginBottom: '0.625rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: '1.75rem', flexShrink: 0, lineHeight: 1, display: 'flex', alignItems: 'center' }}>{product.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#1c1917', lineHeight: 1.3 }}>{product.name}</p>
                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: '#78716c' }}>{product.unit} · ₹{product.price}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <button onClick={() => updateQuantity(product.id, -1)} style={{ width: '28px', height: '28px', border: '1px solid #e7e5e4', borderRadius: '6px', background: 'white', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={13} /></button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#1c1917' }}>{qty}</span>
                    <button onClick={() => updateQuantity(product.id, 1)} style={{ width: '28px', height: '28px', border: 'none', borderRadius: '6px', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={13} /></button>
                    <button onClick={() => setCart(prev => { const next = { ...prev }; delete next[product.id]; return next; })} style={{ width: '28px', height: '28px', border: 'none', borderRadius: '6px', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '0.25rem' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={s.bottomBar}>
            <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#78716c', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>Total</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b', margin: 0 }}>₹{calculateTotal()}</p>
              </div>
              <button onClick={() => setView('checkout')} style={{ ...s.btn, ...s.btnPrimary, width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', marginTop: 0 }}>
                Proceed <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </>

      ) : view === 'checkout' ? (
        // ── CHECKOUT VIEW ──
        <>
          <div style={{ background: '#047857', color: 'white', padding: '1rem', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setView('cart')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={22} />
            </button>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Checkout</h2>
          </div>

          <div style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 0.5rem' }}>Delivery Location</p>
            <div style={s.card}>
              <select
                value={deliveryType}
                onChange={e => { setDeliveryType(e.target.value); setAptNumber(''); }}
                style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', border: '1px solid #e7e5e4', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', color: deliveryType ? '#1c1917' : '#a8a29e', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2378716c\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
              >
                <option value="">— Choose a location —</option>
                {DELIVERY_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              {DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Block & Flat Number</p>
                  <input type="text" placeholder="e.g. A-101" value={aptNumber} onChange={e => setAptNumber(e.target.value.slice(0, 15))} maxLength={15} style={s.input} />
                  <p style={{ fontSize: '0.7rem', color: '#a8a29e', marginTop: '0.25rem', textAlign: 'right' }}>{aptNumber.length}/15</p>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '1rem 0 0.5rem' }}>Your Info</p>
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

            <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.75rem 1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#047857' }}>Order Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#064e3b' }}>₹{calculateTotal()}</span>
            </div>
          </div>

          <div style={s.bottomBar}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {(() => {
                const needsApt = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt;
                const ready = !!deliveryType && (!needsApt || !!aptNumber.trim()) && customerName.trim().length >= 2 && mobileNumber.length >= 10;
                return (
                  <>
                    <button
                      onClick={() => ready && !isSubmitting && initiateEasebuzzPayment()}
                      disabled={!ready || isSubmitting}
                      style={{ ...s.btn, ...s.btnPrimary, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', fontSize: '1.05rem', padding: '1rem', gap: '0.6rem', boxShadow: ready ? '0 4px 14px rgba(5,150,105,0.35)' : 'none', marginTop: 0, opacity: !ready || isSubmitting ? 0.6 : 1 }}
                    >
                      {isSubmitting ? <SpinLoader /> : <span style={{ fontSize: '1.2rem' }}>💳</span>}
                      <span>{isSubmitting ? 'Preparing Payment...' : `Pay ₹${calculateTotal()} Securely`}</span>
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#a8a29e', margin: '0.4rem 0 0' }}>UPI · Cards · Net Banking · Wallets</p>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={s.header}>
            <div style={{ backgroundColor: 'white', color: '#059669', padding: '0.5rem', borderRadius: '10px', display: 'flex', flexShrink: 0 }}>
              <Leaf size={24} fill="currentColor" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.1, color: 'white' }}>Kanha Farm Fresh</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.3px' }}>Vanashanti FPO</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.55rem' }}>•</span>
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.3px' }}>100% Organic</span>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '0 1rem', marginTop: '-1.5rem', position: 'relative', zIndex: 20 }}>
            <div style={{ backgroundColor: '#047857', height: '2rem', marginBottom: '-2rem' }}></div> 
            
            {/* Products */}
            <div style={{ paddingTop: '2rem' }}>
              {!productsReady ? (
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e7e5e4', padding: '3rem 1rem', textAlign: 'center' }}>
                  <SpinLoader />
                  <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', color: '#a8a29e' }}>Loading products…</p>
                </div>
              ) : productsError ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'white', borderRadius: '14px', border: '1px solid #e7e5e4' }}>
                  <p style={{ margin: '0 0 0.75rem', color: '#78716c', fontSize: '0.9rem' }}>Couldn't load the product list. Please check your connection and try again.</p>
                  <button onClick={() => window.location.reload()} style={{ ...s.btn, ...s.btnPrimary, width: 'auto', padding: '0.5rem 1.5rem', marginTop: 0 }}>Retry</button>
                </div>
              ) : <div>
                {CATEGORIES.map(cat => {
                  const catProducts = PRODUCTS.filter(p => p.cat === cat.key && !disabledProducts.includes(String(p.id)));
                  if (catProducts.length === 0) return null;
                  return (
                    <div key={cat.key} style={{ marginBottom: '1.25rem' }}>
                      {/* Category header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat.label}</span>
                        <div style={{ flex: 1, height: '1px', background: '#e7e5e4' }} />
                      </div>
                      {/* Product grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                        {catProducts.map(product => {
                          const qty = cart[product.id] || 0;
                          return (
                            <div key={product.id} style={{ backgroundColor: 'white', border: qty > 0 ? '2px solid #059669' : '1px solid #e7e5e4', borderRadius: '14px', overflow: 'hidden', boxShadow: qty > 0 ? '0 2px 8px rgba(5,150,105,0.15)' : '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                              {qty > 0 && (
                                <div style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: '#059669', color: 'white', fontSize: '0.6rem', fontWeight: 700, borderRadius: '10px', padding: '1px 6px', lineHeight: 1.4, zIndex: 1 }}>×{qty}</div>
                              )}
                              {/* Coloured icon area */}
                              <div style={{ background: cat.iconBg, padding: '0.75rem 0.5rem 0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.4rem', lineHeight: 1 }}>
                                {product.icon}
                              </div>
                              {/* Text + controls */}
                              <div style={{ padding: '0.5rem 0.5rem 0.625rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flex: 1 }}>
                                <h4 style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.3, fontWeight: 600, color: '#1c1917' }}>{product.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.65rem', color: '#78716c' }}>{product.unit}</p>
                                <span style={{ fontWeight: 700, color: '#047857', fontSize: '0.95rem', marginTop: '0.1rem' }}>₹{product.price}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                                  <button onClick={() => updateQuantity(product.id, -1)} disabled={!qty} style={{ width: '28px', height: '28px', border: qty ? '1px solid #059669' : '1px solid #e7e5e4', borderRadius: '6px', background: 'white', color: qty ? '#059669' : '#d4d4d0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: qty ? 'pointer' : 'default' }}><Minus size={12} /></button>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '1.2rem', textAlign: 'center', color: qty > 0 ? '#059669' : '#1c1917' }}>{qty}</span>
                                  <button onClick={() => updateQuantity(product.id, 1)} style={{ width: '28px', height: '28px', border: 'none', borderRadius: '6px', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={12} /></button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>}

            </div>

            {productsReady && (
              <div style={{ textAlign: 'center', paddingBottom: '2rem', marginTop: '2rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', margin: 0 }}>For Enquiries</p>
                <p style={{ fontWeight: 700, color: '#065f46', margin: '0.25rem 0 0' }}>Mani - 81790 68821</p>
                <button onClick={() => setView('admin-login')} style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer' }}>Admin</button>
              </div>
            )}
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
              {(() => {
                const total = calculateTotal();
                const itemCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
                return (
                  <button
                    onClick={() => { if (total > 0) setView('cart'); }}
                    disabled={total === 0}
                    style={{ ...s.btn, ...s.btnPrimary, width: 'auto', paddingLeft: '1.25rem', paddingRight: '1.25rem', marginTop: 0, opacity: total === 0 ? 0.5 : 1 }}
                  >
                    {total === 0 ? 'Add Items' : `View Cart (${itemCount})`} <ArrowRight size={18} />
                  </button>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return <SmartGrocerApp />;
}