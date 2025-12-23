import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, MapPin, Phone, User, Upload, CheckCircle, ChevronDown, Minus, Plus, Leaf, ArrowRight, Store, Loader2, Lock, Search, Calendar, Check, X, AlertCircle, Filter, Sparkles } from 'lucide-react';

// --- CONFIGURATION ---
const SHOW_HARVESTING_SCREEN = false; 
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'kanha@123';

// --- GEMINI API HELPERS ---
const apiKey = ""; // API Key provided by execution environment

const callGemini = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate that right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Please try again.";
  }
};

// --- COMPONENTS ---

// 1. Custom Icon
const TenderCoconutIcon = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 overflow-visible">
    <path d="M50 95 C25 95 10 75 10 50 C10 25 25 10 50 10 C75 10 90 25 90 50 C90 75 75 95 50 95 Z" fill="#4ade80" stroke="#166534" strokeWidth="2"/>
    <path d="M35 15 L50 2 L65 15 Z" fill="#dcfce7" stroke="#166534" strokeWidth="2"/>
    <path d="M30 30 Q 40 20 60 30" fill="none" stroke="#dcfce7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// 2. Custom Modal (Replaces native alert/confirm)
const Modal = ({ isOpen, type, message, title, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;
  
  const isAi = type === 'ai';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
      <div className={`bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 ${isAi ? 'border-2 border-purple-100' : ''}`}>
        
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {isLoading ? (
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 animate-pulse">
              <Sparkles size={24} className="animate-spin-slow" />
            </div>
          ) : type === 'confirm' ? (
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <AlertCircle size={24} />
            </div>
          ) : isAi ? (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600">
              <AlertCircle size={24} />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${isAi ? 'text-purple-900' : 'text-stone-800'}`}>
              {isLoading ? 'Consulting Gemini...' : title || (type === 'confirm' ? 'Confirmation' : isAi ? 'Gemini Says' : 'Notice')}
            </h3>
            {isAi && !isLoading && <p className="text-xs text-purple-400 font-medium">✨ AI Generated Insight</p>}
          </div>
          
          {!isLoading && (
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
              <X size={20} />
            </button>
          )}
        </div>
        
        {/* Content */}
        <div className="mb-6 leading-relaxed text-stone-600 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3 py-2">
              <div className="h-4 bg-purple-50 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-purple-50 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-purple-50 rounded w-5/6 animate-pulse"></div>
            </div>
          ) : (
            <div className="whitespace-pre-line text-sm">{message}</div>
          )}
        </div>
        
        {/* Actions */}
        {!isLoading && (
          <div className="flex justify-end gap-3">
            {type === 'confirm' && (
              <button 
                onClick={onClose} 
                className="px-5 py-2.5 text-stone-500 font-medium hover:bg-stone-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={() => {
                if (type === 'confirm' && onConfirm) onConfirm();
                onClose();
              }}
              className={`px-6 py-2.5 font-medium rounded-xl shadow-lg transition-all active:scale-95 ${
                isAi 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {type === 'confirm' ? 'Yes, Proceed' : 'Awesome!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DATA ---
const PRODUCTS = [
  { id: 1, name: 'Strawberry', unit: 'Box (200g)', price: 100, icon: <span className="text-4xl">🍓</span>, desc: 'Sweet & Red' },
  { id: 2, name: 'Tender Coconut', unit: 'Piece', price: 80, icon: <TenderCoconutIcon />, desc: 'Refreshing' },
  { id: 3, name: 'Coriander Leaves', unit: 'Bunch (300g)', price: 50, icon: <span className="text-4xl">🌿</span>, desc: 'Aromatic' },
  { id: 4, name: 'Lettuce', unit: 'Bunch (300g)', price: 100, icon: <span className="text-4xl">🥬</span>, desc: 'Crunchy' },
  { id: 5, name: 'Curry Leaves', unit: 'Bunch (300g)', price: 50, icon: <span className="text-4xl">🍃</span>, desc: 'Fresh' },
];

const DELIVERY_OPTIONS = [
  { id: 'vihanga', label: 'My Home Vihanga', requiresApt: true },
  { id: 'krishe', label: 'My Home Krishe', requiresApt: true },
  { id: 'vajrajs', label: 'Vajras Jasmine County', requiresApt: true },
  { id: 'pickup', label: 'Store pick up (Malabar Natives)', requiresApt: false },
];

const QR_CODE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=paytm.s18fahk@pty&pn=KanhaFarmFresh"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7cz_Ykzim6EYILS0Fpo5_DJlcJiuO01mefnkqHUGqeui3zd6pRf95oTFJiit3tB6X/exec"; 

export default function App() {
  const [view, setView] = useState('home'); 

  // --- MODAL STATE ---
  const [modal, setModal] = useState({ isOpen: false, type: 'alert', message: '', title: '', onConfirm: null, isLoading: false });

  // --- CUSTOMER STATES ---
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

  // --- ADMIN STATES ---
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminFilterType, setAdminFilterType] = useState('');
  const [adminSearchName, setAdminSearchName] = useState('');
  const [adminFilterStatus, setAdminFilterStatus] = useState('Pending'); // Default to Pending

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

  // --- MODAL HELPERS ---
  const showAlert = (message, title = 'Notice') => {
    setModal({ isOpen: true, type: 'alert', message, title, onConfirm: null });
  };

  const showConfirm = (message, onConfirm) => {
    setModal({ isOpen: true, type: 'confirm', message, onConfirm });
  };

  const showAiLoading = (title) => {
    setModal({ isOpen: true, type: 'ai', message: '', title, isLoading: true });
  }

  const showAiResult = (message, title) => {
    setModal({ isOpen: true, type: 'ai', message, title, isLoading: false });
  }

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  // --- AI FEATURES ---

  const handleProductTip = async (productName) => {
    showAiLoading(`Tips for ${productName}`);
    const prompt = `Give me one interesting health benefit and one quick storage tip for ${productName}. Keep it short, fun, and use emojis. Max 2 sentences.`;
    const result = await callGemini(prompt);
    showAiResult(result, `Tips for ${productName}`);
  };

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
          
          if (img.width > MAX_WIDTH) {
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const updateQuantity = (id, change) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + change);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = PRODUCTS.find(p => p.id === parseInt(id));
      return total + (product ? product.price * qty : 0);
    }, 0);
  };

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
     if (needsApt && !aptNumber) return { text: "Enter Apt #", icon: <MapPin size={20} /> };
     if (customerName.trim().length < 2 || mobileNumber.length < 10) return { text: "Enter Contact Info", icon: <User size={20} /> };
     return { text: "Proceed to Pay", icon: <ArrowRight size={20} /> };
  }

  const handleFinalizeOrder = async () => {
    if (!paymentFile) { showAlert("Please upload the payment screenshot to confirm your order."); return; }
    
    setIsSubmitting(true);
    setUploadStatus('uploading');

    try {
      const base64Image = await compressImage(paymentFile);
      const itemsString = Object.entries(cart).map(([id, qty]) => {
        const product = PRODUCTS.find(p => p.id === parseInt(id));
        return `${product.name} (${qty})`;
      }).join(", ");

      const orderData = {
        action: 'create',
        customerName,
        mobileNumber,
        deliveryType: DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label,
        // FIX: Prepend single quote to force text format in Google Sheets (prevents date conversion)
        aptNumber: aptNumber ? `'${aptNumber}` : '', 
        items: itemsString,
        total: calculateTotal(),
        image: base64Image,
        imageName: paymentFile.name
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "text/plain" }, 
        body: JSON.stringify(orderData),
      });
      
      setUploadStatus('success');
      setOrderDate(new Date());
      setOrderPlaced(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error submitting order:", error);
      setUploadStatus('error');
      showAlert("Error placing order. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentFile(e.target.files[0]);
    }
  };

  // --- ADMIN FUNCTIONS ---

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser === ADMIN_USER && adminPass === ADMIN_PASS) {
      setView('admin-dashboard');
      fetchAdminOrders();
      setAdminError('');
    } else {
      setAdminError('Invalid credentials');
    }
  };

  const fetchAdminOrders = async () => {
    setAdminLoading(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?v=${new Date().getTime()}`, { credentials: 'omit' }); 
      const data = await response.json();
      setAdminOrders(Array.isArray(data) ? data.reverse() : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showAlert("Failed to load orders. Please try again in 30 seconds.");
    } finally {
      setAdminLoading(false);
    }
  };

  const markAsDelivered = (order) => {
    if (!order.rowIndex) {
      showAlert("Error: Missing Row Index. Refresh and try again.");
      return;
    }

    // Replace native confirm with custom modal logic
    showConfirm(`Mark delivery done for ${order.customerName}?`, async () => {
      // 1. Optimistic Update
      setAdminOrders(prev => prev.map(o => 
        o.rowIndex === order.rowIndex 
          ? { ...o, status: 'Updating...', deliveryDate: new Date().toISOString() } 
          : o
      ));

      try {
        const updateUrl = `${GOOGLE_SCRIPT_URL}?action=mark_delivered&rowIndex=${order.rowIndex}&cb=${Math.floor(Math.random()*1000)}`;
        const response = await fetch(updateUrl, { credentials: 'omit' });
        const result = await response.json();

        if (result.result === 'success') {
          showAlert("✅ Delivery Status Updated Successfully!");
          fetchAdminOrders(); 
        } else {
          throw new Error(result.error || "Unknown server error");
        }
        
      } catch (error) {
        console.error("Error updating order:", error);
        showAlert("❌ Failed to update: " + error.message);
        fetchAdminOrders(); // Revert
      }
    });
  };

  // --- VIEWS ---

  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <Modal {...modal} onClose={closeModal} />
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center">
              <Lock className="text-stone-500" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-stone-800 mb-6">Admin Login</h2>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Username</label>
              <input 
                type="text" 
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Password</label>
              <input 
                type="password" 
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-base"
              />
            </div>
            {adminError && <p className="text-red-500 text-sm text-center">{adminError}</p>}
            <button type="submit" className="w-full py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition">
              Login
            </button>
          </form>
          <button onClick={() => setView('home')} className="w-full mt-4 text-sm text-stone-500 hover:text-stone-800">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin-dashboard') {
    // --- UPDATED SEARCH FILTER LOGIC ---
    const filteredOrders = adminOrders.filter(order => {
      // 1. Filter by Status (Pending, Done, All)
      if (adminFilterStatus !== 'All') {
        const status = order.status || 'Pending';
        if (status !== adminFilterStatus) return false;
      }

      // 2. Filter by Delivery Location
      if (adminFilterType) {
        if (!order.deliveryType || !order.deliveryType.includes(adminFilterType)) return false;
      }
      
      // 3. Search by Name OR Apartment
      if (adminSearchName) {
        const search = adminSearchName.toLowerCase();
        const name = (order.customerName || '').toLowerCase();
        const apt = (order.aptNumber || '').toLowerCase();
        
        // Return true if EITHER name matches OR apartment matches
        if (!name.includes(search) && !apt.includes(search)) return false;
      }
      return true;
    });

    return (
      <div className="min-h-screen bg-stone-50 pb-12">
        <Modal {...modal} onClose={closeModal} />
        <div className="bg-emerald-800 text-white p-4 shadow-md sticky top-0 z-20">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <Lock size={18} /> Admin Dashboard
            </h1>
            <button onClick={() => setView('home')} className="text-xs bg-emerald-900 px-3 py-1 rounded hover:bg-emerald-700">
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* STATUS FILTER */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Status</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-3 text-stone-400" size={18} />
                  <select 
                    value={adminFilterStatus}
                    onChange={(e) => setAdminFilterStatus(e.target.value)}
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  >
                    <option value="Pending">Pending Orders</option>
                    <option value="Done">Completed Orders</option>
                    <option value="All">All Orders</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-stone-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* LOCATION FILTER */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Delivery Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-stone-400" size={18} />
                  <select 
                    value={adminFilterType}
                    onChange={(e) => setAdminFilterType(e.target.value)}
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  >
                    <option value="">All Locations</option>
                    {DELIVERY_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.label}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-stone-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* SEARCH FILTER */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Search Name or Apt</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={adminSearchName}
                    onChange={(e) => setAdminSearchName(e.target.value)}
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-stone-500">
                Found <strong>{filteredOrders.length}</strong> orders
              </p>
              <button onClick={fetchAdminOrders} className="text-emerald-600 text-sm font-medium hover:underline">
                Refresh Data
              </button>
            </div>
          </div>

          <div className="space-y-4 pb-20"> 
            {adminLoading ? (
              <div className="flex justify-center py-12 text-stone-400">
                <Loader2 className="animate-spin mr-2" /> Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-100">
                No matching orders found.
              </div>
            ) : (
              filteredOrders.map((order, idx) => (
                <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border ${order.status === 'Done' ? 'border-l-4 border-l-emerald-500' : 'border-stone-100'}`}>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="min-w-0 flex-grow">
                      <h3 className="font-bold text-stone-800 text-lg leading-tight break-words">{order.customerName}</h3>
                      <p className="text-sm text-stone-500 flex items-start gap-1 mt-1">
                        <MapPin size={14} className="flex-shrink-0 mt-0.5" /> 
                        <span className="break-words">
                          {order.deliveryType} 
                          {/* FIX: Cleanly display apt number by removing quote if present */}
                          {order.aptNumber && <span className="text-stone-800 font-medium"> • {order.aptNumber.toString().replace(/^'/, '')}</span>}
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                       <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {order.status || 'Pending'}
                       </span>
                       <p className="text-xs text-stone-400 mt-1">
                         {new Date(order.date).toLocaleDateString()}
                       </p>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50 p-3 rounded-lg text-sm text-stone-700 mb-3">
                    <p className="font-medium text-stone-900 mb-1">Items:</p>
                    <p className="break-words leading-relaxed">{order.items}</p>
                    <div className="mt-2 pt-2 border-t border-stone-200 flex justify-between font-bold">
                       <span>Total:</span>
                       <span>₹{order.total}</span>
                    </div>
                  </div>

                  {order.status !== 'Done' && (
                    <button 
                      onClick={() => markAsDelivered(order)}
                      disabled={order.status === 'Updating...'}
                      className="w-full py-3.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 active:bg-emerald-800 transition-colors touch-manipulation disabled:bg-stone-300"
                    >
                      {order.status === 'Updating...' ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                      {order.status === 'Updating...' ? 'Updating...' : 'Mark Delivery Done'}
                    </button>
                  )}
                  {order.status === 'Done' && order.deliveryDate && (
                    <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1">
                      <Check size={12} /> Delivered on {new Date(order.deliveryDate).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-28 relative selection:bg-emerald-100">
      <Modal {...modal} onClose={closeModal} />
      
      {SHOW_HARVESTING_SCREEN ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Harvesting in Progress</h2>
            <p className="text-stone-600 mb-8 leading-relaxed">
              We are currently waiting for the harvesting. Ordering will be enabled once the fresh produce is ready.
            </p>
             <div className="border-t border-stone-100 pt-6">
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">For Enquiries</p>
                <p className="text-emerald-800 font-bold">Mani - 81790 68821</p>
            </div>
            <button onClick={() => setView('admin-login')} className="mt-8 text-xs text-stone-300 hover:text-stone-500">
              Admin
            </button>
          </div>
        </div>
      ) : orderPlaced ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Order Received!</h2>
            <p className="text-stone-600 mb-6">Thank you, {customerName}. We have received your order and payment proof.</p>
            
            <div className="bg-stone-50 rounded-lg p-4 text-left text-sm text-stone-700 mb-6">
              <p className="mb-2 border-b border-stone-200 pb-2">
                <strong className="text-emerald-800">Placed On:</strong><br/> 
                {orderDate?.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <p><strong>Total:</strong> ₹{calculateTotal()}/-</p>
              <p><strong>Delivery:</strong> {DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label}</p>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Place Another Order
            </button>
          </div>
        </div>
      ) : showPayment ? (
        <div className="flex flex-col p-4 max-w-md mx-auto min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-grow flex flex-col">
            <div className="bg-emerald-600 p-4 text-white flex items-center">
              <button onClick={() => setShowPayment(false)} className="mr-3 p-1 hover:bg-emerald-500 rounded-full">
                <ArrowRight className="transform rotate-180" size={24} />
              </button>
              <h2 className="text-xl font-bold">Payment</h2>
            </div>

            <div className="p-6 flex flex-col items-center flex-grow overflow-y-auto">
              <div className="text-center mb-6">
                <p className="text-stone-500 text-sm uppercase tracking-wide font-semibold mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-emerald-800">₹{calculateTotal()}</p>
              </div>

              <div className="bg-blue-500 p-4 rounded-xl shadow-inner mb-6 w-full max-w-[280px] flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg w-full aspect-square flex items-center justify-center relative">
                   <img src={QR_CODE_URL} alt="Payment QR Code" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <p className="text-white text-center mt-3 text-sm font-medium">Scan to pay via UPI</p>
              </div>

              <div className="w-full bg-stone-50 border-2 border-dashed border-emerald-200 rounded-xl p-6 text-center mb-6">
                <label className="cursor-pointer block">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <span className="text-emerald-800 font-medium block">Upload UPI Payment Screenshot</span>
                  <span className="text-stone-500 text-xs block mt-1">{paymentFile ? paymentFile.name : "Tap to select image"}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-stone-100">
              <button 
                onClick={handleFinalizeOrder}
                disabled={!paymentFile || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
                  paymentFile && !isSubmitting
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700' 
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>
                      {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order</span>
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-emerald-700 text-white p-4 pb-6 rounded-b-3xl shadow-lg relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div className="bg-white text-emerald-700 p-1.5 rounded-lg">
                  <Leaf size={20} fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-xl font-bold leading-none">Kanha</h1>
                  <span className="text-emerald-200 text-xs font-light tracking-widest">FARM FRESH</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-emerald-100 text-xs">Natural goodness delivered to your doorstep.</p>
          </div>

          <div className="max-w-md mx-auto px-4 -mt-4 relative z-20">
            {/* Increased top padding from pt-4 to pt-10 for more space */}
            <div ref={productsRef} className="pt-10 scroll-mt-24">
              <h3 className="text-stone-800 font-bold text-lg ml-1 flex items-center mb-3">
                <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2">1</span>
                Fresh Produce 
                <span className="ml-2 h-px bg-stone-300 flex-grow"></span>
              </h3>
              
              <div className="space-y-3">
                {PRODUCTS.map(product => (
                  <div key={product.id} className="bg-white rounded-xl p-3 shadow-sm border border-stone-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-200 relative group">
                        {product.icon}
                        {/* AI Tip Trigger Button Removed */}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 text-base">{product.name}</h4>
                        <p className="text-[10px] text-stone-500 mb-0.5">{product.desc} • {product.unit}</p>
                        <p className="text-emerald-700 font-bold text-sm">₹{product.price}/-</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center bg-stone-50 rounded-lg p-0.5 border border-stone-200">
                      <button 
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-emerald-600 text-white rounded shadow-sm active:scale-95 transition-transform"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="font-bold text-stone-800 py-0.5 w-6 text-center text-xs">
                        {cart[product.id] || 0}
                      </span>
                      <button 
                        onClick={() => updateQuantity(product.id, -1)}
                        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                          !cart[product.id] ? 'bg-stone-200 text-stone-400' : 'bg-white text-emerald-700 border border-emerald-200 active:scale-95'
                        }`}
                        disabled={!cart[product.id]}
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={deliveryRef} className="mt-8 space-y-4 scroll-mt-24">
              <h3 className="text-stone-800 font-bold text-lg ml-1 flex items-center">
                <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2">2</span>
                Delivery Details
                <span className="ml-2 h-px bg-stone-300 flex-grow"></span>
              </h3>
              
              <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Select Location</label>
                    <div className="space-y-2">
                      {DELIVERY_OPTIONS.map(option => (
                        <label 
                          key={option.id} 
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            deliveryType === option.id 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-transparent bg-stone-50 hover:bg-stone-100'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="delivery" 
                            value={option.id}
                            checked={deliveryType === option.id}
                            onChange={(e) => setDeliveryType(e.target.value)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <span className={`ml-3 text-sm font-medium ${deliveryType === option.id ? 'text-emerald-900' : 'text-stone-700'}`}>
                            {option.label}
                          </span>
                          {option.id === 'pickup' && <Store size={16} className="ml-auto text-stone-400" />}
                          {option.requiresApt && <MapPin size={16} className="ml-auto text-stone-400" />}
                        </label>
                      ))}
                    </div>
                  </div>

                  {DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Block & Flat Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. A-101"
                        value={aptNumber}
                        onChange={(e) => setAptNumber(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div ref={infoRef} className="mt-8 space-y-4 mb-4 scroll-mt-24">
              <h3 className="text-stone-800 font-bold text-lg ml-1 flex items-center">
                <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full text-xs flex items-center justify-center mr-2">3</span>
                Your Info
                <span className="ml-2 h-px bg-stone-300 flex-grow"></span>
              </h3>
              
              <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-4 space-y-4">
                <div className="relative">
                  <User className="absolute top-3.5 left-3 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute top-3.5 left-3 text-stone-400" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) setMobileNumber(val);
                    }}
                    className="w-full pl-10 p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
                  />
                </div>
              </div>
            </div>

            <div className="text-center pb-8 pt-4">
               <p className="text-stone-400 text-xs uppercase tracking-widest mb-1">For Enquiries</p>
               <p className="text-emerald-800 font-bold">Mani - 81790 68821</p>
               <button onClick={() => setView('admin-login')} className="mt-4 text-xs text-stone-300 hover:text-stone-500">
                 Admin
               </button>
            </div>
          </div>

          {showScrollCue && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce z-0 opacity-70">
              <span className="text-xs text-stone-500 font-medium mb-1">Scroll Down</span>
              <ChevronDown className="text-stone-400" />
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase">Total</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-emerald-800">₹{calculateTotal()}</p>
                </div>
              </div>
              <button 
                onClick={handleSmartAction}
                className={`px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg text-sm md:text-base ${
                  calculateTotal() > 0 
                    ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 active:scale-95' 
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                <span>{getButtonText().text}</span>
                {getButtonText().icon}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}