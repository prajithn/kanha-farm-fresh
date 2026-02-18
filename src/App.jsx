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
  { id: 5, name: 'Tender Coconut', unit: 'Piece', price: 50, icon: <TenderCoconutIcon />, desc: 'Refreshing' },
  { id: 6, name: 'Beetroot', unit: '500gm', price: 35, icon: <BeetrootIcon />, desc: 'Earthy Root' },
  { id: 7, name: 'Palak', unit: 'Bunch (300g)', price: 50, icon: <span style={{ fontSize: '2rem' }}>🥬</span>, desc: 'Iron Rich' },
  { id: 8, name: 'Goldenberry', unit: '250gm', price: 200, icon: <GoldenBerryIcon />, desc: 'Sweet & Zesty' },
  { id: 9, name: 'Ridge Gourd', unit: '500gm', price: 40, icon: <RidgeGourdIcon />, desc: 'Fibrous & Healthy' },


  

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

const QR_CODE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=paytm.s18fahk@pty&pn=KanhaFarmFresh"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7cz_Ykzim6EYILS0Fpo5_DJlcJiuO01mefnkqHUGqeui3zd6pRf95oTFJiit3tB6X/exec"; 

export default function SmartGrocerApp() {
  const [view, setView] = useState('home'); 
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
  const [uploadStatus, setUploadStatus] = useState(''); 

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
    if (!paymentFile) { setModal({ isOpen: true, type: 'alert', message: "Please upload the payment screenshot." }); return; }
    setIsSubmitting(true);
    setUploadStatus('uploading');
    try {
      const base64Image = await compressImage(paymentFile);
      const itemsString = Object.entries(cart).map(([id, qty]) => `${PRODUCTS.find(p => p.id === parseInt(id)).name} (${qty})`).join(", ");
      const orderData = {
        action: 'create',
        customerName,
        mobileNumber,
        deliveryType: DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label,
        aptNumber: aptNumber ? "'" + aptNumber : '', 
        items: itemsString,
        total: calculateTotal(),
        image: base64Image,
        imageName: paymentFile.name
      };
      await fetch(GOOGLE_SCRIPT_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(orderData) });
      setUploadStatus('success');
      setOrderDate(new Date());
      setOrderPlaced(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setUploadStatus('error');
      setModal({ isOpen: true, type: 'alert', message: "Error placing order." });
    } finally { setIsSubmitting(false); }
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
            <p style={{ margin: '0 0 0.5rem' }}><strong>Total:</strong> ₹{calculateTotal()}/-</p>
            <p style={{ margin: 0 }}><strong>Location:</strong> {DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label}</p>
          </div>
          <button onClick={() => window.location.reload()} style={{ ...s.btn, ...s.btnPrimary }}>Place Another Order</button>
        </div>
      ) : showPayment ? (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <div style={s.header}>
            <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', color: 'white', marginRight: '1rem', cursor: 'pointer' }}><ArrowRight style={{ transform: 'rotate(180deg)' }} /></button>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>Payment</h2>
          </div>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#78716c', textTransform: 'uppercase', margin: 0 }}>Total Amount</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#065f46', margin: '0.5rem 0 2rem' }}>₹{calculateTotal()}</p>
            
            <div style={{ background: '#3b82f6', padding: '1rem', borderRadius: 16, marginBottom: '2rem', width: '100%', maxWidth: 280 }}>
               <div style={{ background: 'white', padding: '0.5rem', borderRadius: 8, display: 'flex', justifyContent: 'center' }}>
                 <img src={QR_CODE_URL} alt="QR" style={{ width: '100%', mixBlendMode: 'multiply' }} />
               </div>
               <p style={{ textAlign: 'center', color: 'white', fontWeight: 700, marginTop: '0.5rem', fontSize: '0.875rem' }}>Scan to pay via UPI</p>
            </div>

            <label style={{ width: '100%', border: '2px dashed #a7f3d0', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f0fdf4' }}>
               <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: '#059669' }}><Upload /></div>
               <span style={{ color: '#065f46', fontWeight: 600 }}>Upload Payment Screenshot</span>
               <span style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.5rem' }}>{paymentFile ? paymentFile.name : 'Tap to select'}</span>
               <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e7e5e4' }}>
             <button onClick={handleFinalizeOrder} disabled={!paymentFile || isSubmitting} style={{ ...s.btn, ...s.btnPrimary, marginTop: 0 }}>
               {isSubmitting ? <SpinLoader /> : <CheckCircle />} Confirm Order
             </button>
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