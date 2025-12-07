import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Phone, User, Upload, CheckCircle, ChevronDown, Minus, Plus, Leaf, ArrowRight, Store, Loader2 } from 'lucide-react';

const PRODUCTS = [
  { id: 1, name: 'Strawberry', unit: 'Box (200g)', price: 100, icon: '🍓', desc: 'Sweet & Red' },
  { id: 2, name: 'Tender Coconut', unit: 'Piece', price: 80, icon: '🥥', desc: 'Refreshing' },
  { id: 3, name: 'Coriander Leaves', unit: 'Bunch (300g)', price: 50, icon: '🌿', desc: 'Aromatic' },
  { id: 4, name: 'Lettuce', unit: 'Bunch (300g)', price: 100, icon: '🥬', desc: 'Crunchy' },
];

const DELIVERY_OPTIONS = [
  { id: 'vihanga', label: 'My Home Vihanga', requiresApt: true },
  { id: 'krishe', label: 'My Home Krishe', requiresApt: true },
  { id: 'pickup', label: 'Store pick up (Malabar Natives)', requiresApt: false },
];

// Placeholder for the uploaded QR Code. 
const QR_CODE_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=paytm.s18fahk@pty&pn=KanhaFarmFresh"; 

// YOUR GOOGLE APPS SCRIPT WEB APP URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby4hqoeKuiVttVtnglcxvzYBLiH71Sm-mw3Kc65SH-VBsI-37_mb4RlyH6Y6ygFmAxH/exec"; 

export default function App() {
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollCue(false);
      } else {
        setShowScrollCue(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Helpers ---
  
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
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

  const isFormValid = () => {
    const hasItems = calculateTotal() > 0;
    const hasContact = customerName.trim().length >= 2 && mobileNumber.length >= 10;
    const hasDelivery = deliveryType !== '';
    const hasAptIfNeeded = DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.requiresApt ? aptNumber.trim().length > 0 : true;

    return hasItems && hasContact && hasDelivery && hasAptIfNeeded;
  };

  const handleCheckout = () => {
    if (isFormValid()) {
      setShowPayment(true);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalizeOrder = async () => {
    if (!paymentFile) {
      alert("Please upload the payment screenshot to confirm your order.");
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('uploading');

    try {
      // 1. Convert Image to Base64 (Text)
      const base64Image = await convertToBase64(paymentFile);

      // 2. Prepare Data 
      const itemsString = Object.entries(cart).map(([id, qty]) => {
        const product = PRODUCTS.find(p => p.id === parseInt(id));
        return `${product.name} (${qty})`;
      }).join(", ");

      const orderData = {
        customerName,
        mobileNumber,
        deliveryType: DELIVERY_OPTIONS.find(d => d.id === deliveryType)?.label,
        aptNumber,
        items: itemsString,
        total: calculateTotal(),
        image: base64Image,       // Sending image data
        imageName: paymentFile.name
      };

      // 3. Send to Google Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // 4. Success Handling
      setUploadStatus('success');
      setOrderDate(new Date());
      setOrderPlaced(true);
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Error submitting order", error);
      setUploadStatus('error');
      alert("Error placing order. Please try a smaller image or check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Basic size check (optional: warn if > 5MB)
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please select an image under 5MB.");
        return;
      }
      setPaymentFile(file);
    }
  };

  // --- Render Views ---

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-6 text-center">
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
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col p-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex-grow flex flex-col">
          {/* Header */}
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

            {/* QR Code */}
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
                <span className="text-emerald-800 font-medium block">Upload Screenshot</span>
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
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-24 relative selection:bg-emerald-100">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-6 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="bg-white text-emerald-700 p-2 rounded-lg">
              <Leaf size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-none">Kanha</h1>
              <span className="text-emerald-200 text-sm font-light tracking-widest">FARM FRESH</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-emerald-100 text-sm">Organic goodness delivered to your doorstep.</p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 relative z-20">
        
        {/* Products Section */}
        <div className="space-y-4 pt-6">
          <h3 className="text-stone-800 font-bold text-lg ml-1 flex items-center">
            Fresh Produce 
            <span className="ml-2 h-px bg-stone-300 flex-grow"></span>
          </h3>
          
          {PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl w-16 h-16 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-200">
                  {product.icon}
                </div>
                <div>
                  <h4 className="font-bold text-stone-800 text-lg">{product.name}</h4>
                  <p className="text-xs text-stone-500 mb-1">{product.desc} • {product.unit}</p>
                  <p className="text-emerald-700 font-bold">₹{product.price}/-</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center bg-stone-50 rounded-lg p-1 border border-stone-200">
                <button 
                  onClick={() => updateQuantity(product.id, 1)}
                  className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-md shadow-sm active:scale-95 transition-transform"
                >
                  <Plus size={16} />
                </button>
                <span className="font-bold text-stone-800 py-1 w-8 text-center text-sm">
                  {cart[product.id] || 0}
                </span>
                <button 
                  onClick={() => updateQuantity(product.id, -1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                    !cart[product.id] ? 'bg-stone-200 text-stone-400' : 'bg-white text-emerald-700 border border-emerald-200 active:scale-95'
                  }`}
                  disabled={!cart[product.id]}
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-stone-800 font-bold text-lg ml-1 flex items-center">
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
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Apartment Number</label>
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

        {/* Customer Details */}
        <div className="mt-8 space-y-4 mb-24">
          <h3 className="text-stone-800 font-bold text-lg ml-1 flex items-center">
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

      </div>

      {showScrollCue && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce z-0 opacity-70">
          <span className="text-xs text-stone-500 font-medium mb-1">Scroll Down</span>
          <ChevronDown className="text-stone-400" />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-lg z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase">Total</p>
            <p className="text-2xl font-bold text-emerald-800">₹{calculateTotal()}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={!isFormValid()}
            className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg ${
              isFormValid() 
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 active:transform active:scale-95' 
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <span>Checkout</span>
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

    </div>
  );
}