"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { supabase } from '@/lib/supabaseClient.js';
import { signUpWithEmail, signInWithEmail, signOut, getCurrentUser } from '@/lib/supabaseClient.js';
import OrderForm from '@/app/components/OrderForm';

const categories = [
  { 
    name: 'Old Money', 
    image: '/categories/oldmoney.jpg', 
    slug: 'oldmoney',
    subcategories: [
      { name: 'Old Money T-Shirts', slug: 'old-money-tshirts' },
      { name: 'Linen Pants', slug: 'linen-pants' }
    ]
  },
  { 
    name: 'Streetwear', 
    image: '/categories/streetwear.jpg', 
    slug: 'streetwear',
    subcategories: [
      { name: 'Baggy Jeans', slug: 'baggy-jeans' },
      { name: 'Oversized T-Shirts', slug: 'oversized-tshirts' }
    ]
  },
  { name: 'Shoes', image: '/categories/shoes.jpg', slug: 'shoes' },
  { name: 'Accessories', image: '/categories/accessories.jpg', slug: 'accessories' },
];

// Premium men's fashion hero images
const heroImages = [
  'https://i.pinimg.com/736x/23/e5/04/23e504c0340715dedd9ee503a55246f7.jpg', // premium men's streetwear
  'https://i.pinimg.com/736x/a6/7d/bf/a67dbf8f2685c775bca6f1961fb057b6.jpg', // sophisticated men's fashion
  'https://i.pinimg.com/736x/86/c8/55/86c8554920e1c30d100b8280ccd0e6a5.jpg', // urban men's style
  'https://i.pinimg.com/736x/6c/03/ce/6c03ce2dc09027ae621eee197c06a64d.jpg', // minimalist men's look
  'https://i.pinimg.com/736x/24/16/fb/2416fbd0f2d587c018d491162c65ac1f.jpg', // premium men's collection
];

export default function LandingPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Initialize wishlist as []
  const [wishlist, setWishlist] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const heroRef = useRef(null);
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Add swipe handlers for hero section
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };
  const handleSwipe = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swipe left
        setHeroIndex((prev) => (prev + 1) % heroImages.length);
      } else {
        // swipe right
        setHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Wishlist functions
  const updateWishlist = (newWishlist) => {
    setWishlist(newWishlist);
  };
  const toggleWishlist = async (productId) => {
    const idStr = String(productId);
    if (user) {
      if (wishlist.includes(idStr)) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', idStr);
        updateWishlist(wishlist.filter(id => id !== idStr));
      } else {
        await supabase.from('wishlists').upsert({ user_id: user.id, product_id: idStr });
        updateWishlist([...wishlist, idStr]);
      }
    } else {
      let updated;
      if (wishlist.includes(idStr)) {
        updated = wishlist.filter((id) => id !== idStr);
      } else {
        updated = [...wishlist, idStr];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlist', JSON.stringify(updated));
      }
      updateWishlist(updated);
    }
  };
  const isInWishlist = (productId) => wishlist.includes(String(productId));

  // Fetch new arrival products
  const fetchNewArrivals = async () => {
    const { data, error } = await supabase.from('products').select('*').eq('is_new_arrival', true).order('created_at', { ascending: false });
    setNewArrivals(data || []);
  };

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 100) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [collections, setCollections] = useState([]);
  useEffect(() => {
    async function fetchCollections() {
      const { data, error } = await supabase.from('categories').select('*').is('parent_id', null).order('name', { ascending: true });
      if (!error) setCollections(data || []);
    }
    fetchCollections();
  }, []);

  // Wishlist section logic
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  useEffect(() => {
    if (!hasMounted) return;
    async function fetchWishlistProducts() {
      setWishlistLoading(true);
      if (!wishlist || wishlist.length === 0) {
        setWishlistProducts([]);
        setWishlistLoading(false);
        return;
      }
      const { data, error } = await supabase.from('products').select('*').in('id', wishlist.map(String));
      setWishlistProducts(data || []);
      setWishlistLoading(false);
    }
    fetchWishlistProducts();
  }, [wishlist, hasMounted]);

  // Load wishlist from DB or localStorage
  useEffect(() => {
    if (!hasMounted) return;
    async function fetchWishlist() {
      if (user) {
        // Fetch from DB
        const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
        const ids = (data || []).map(w => w.product_id);
        setWishlist(ids.map(String));
      } else {
        // Fallback to localStorage
        try {
          setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
        } catch {
          setWishlist([]);
        }
      }
    }
    fetchWishlist();
  }, [user, hasMounted]);
  // Merge localStorage wishlist into DB on login
  useEffect(() => {
    if (!user || !hasMounted) return;
    const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (localWishlist.length === 0) return;
    async function mergeWishlist() {
      for (const productId of localWishlist) {
        await supabase.from('wishlists').upsert({ user_id: user.id, product_id: productId });
      }
      localStorage.removeItem('wishlist');
      // Refresh wishlist from DB
      const { data } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
      setWishlist((data || []).map(w => w.product_id));
    }
    mergeWishlist();
  }, [user, hasMounted]);

  // Add hasMounted state
  // Remove auto-login/session restore on page load
  // Only set user after successful login
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    getCurrentUser().then(({ data }) => setUser(data?.user || null));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '' });
  const [orderLoading, setOrderLoading] = useState(false);
  const openOrderModal = (product) => {
    setOrderProduct(product);
    setOrderModalOpen(true);
  };
  const handleOrderFormChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    await supabase.from('orders').insert({
      customer_name: orderForm.name,
      phone: orderForm.phone,
      address: orderForm.address,
      product_id: orderProduct.id,
      product_name: orderProduct.name,
      product_price: orderProduct.price,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
    setOrderLoading(false);
    setOrderModalOpen(false);
    setOrderForm({ name: '', phone: '', address: '' });
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* Navigation Bar */}
      <header className={`w-full flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'shadow-lg backdrop-blur-md bg-white/95' : ''
      }`}>
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight">
          <Image src="/logo.jpg" alt="Shop Just Put On Logo" width={40} height={40} className="rounded-full" />
          <span>Shop Just Put On</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 text-base font-medium items-center">
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-purple-600 transition focus:outline-none">
              Categories
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/store/client/category/${category.slug}`}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/store/client" className="hover:text-purple-600 transition">Shop</Link>
          <Link href="#about" className="hover:text-purple-600 transition">About</Link>
          <Link href="#contact" className="hover:text-purple-600 transition">Contact</Link>
          
          {/* Wishlist Icon */}
          <button
            onClick={() => setShowWishlist(!showWishlist)}
            className="relative p-2 hover:text-purple-600 transition"
          >
            <HeartIcon className="w-6 h-6" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>
        </nav>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4">
          <nav className="flex flex-col gap-4">
            <Link href="/store/client" className="text-gray-700 hover:text-purple-600 transition">Shop</Link>
            <Link href="#about" className="text-gray-700 hover:text-purple-600 transition">About</Link>
            <Link href="#contact" className="text-gray-700 hover:text-purple-600 transition">Contact</Link>
            <button
              onClick={() => {
                setShowWishlist(!showWishlist);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition"
            >
              <HeartIcon className="w-5 h-5" />
              Wishlist ({wishlist.length})
            </button>
          </nav>
        </div>
      )}

      {/* Wishlist Sidebar */}
      {showWishlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Wishlist</h2>
                <button
                  onClick={() => setShowWishlist(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {wishlistLoading ? (
                <div className="text-center py-8 text-gray-400">Loading wishlist...</div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-8">
                  <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Link href="/store/client" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlistProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 shadow">
                      <img src={product.image_url || '/placeholder.jpg'} alt={product.name} className="w-20 h-20 object-cover rounded-lg border" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                        <p className="text-gray-500 text-sm mb-1">{product.description}</p>
                        <span className="text-purple-600 font-bold">{product.price} DZD</span>
                      </div>
                      <a href={`/store/client?product=${product.id}`} className="text-purple-600 hover:underline font-semibold">View</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Modern Slideshow */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center h-screen overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={heroImages[heroIndex]}
            alt="Hero background"
            fill
            className="object-cover object-center transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
        </div>
        
        {/* Hero Content with Animation */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-4">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight text-white drop-shadow-2xl font-serif">
              <span className="block">PREMIUM</span>
              <span className="block text-purple-400">MEN&apos;S FASHION</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Curated collections for the discerning gentleman. 
              <span className="block mt-2">Where sophistication meets streetwear—exclusively for men.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link 
                href="/store/client" 
                className="inline-block px-8 py-4 rounded-full bg-white text-black font-bold text-lg shadow-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Shop Now
              </Link>
        <Link
                href="#collections" 
                className="inline-block px-8 py-4 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all duration-300"
        >
                New Collection
        </Link>
            </div>
          </div>
        </div>
        {/* Hero Indicators - always at the bottom, not overlapped by buttons */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setHeroIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === heroIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
              New Arrivals
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Fresh from our latest collection. Be the first to discover these exclusive pieces.
            </p>
          </div>
          {newArrivals.length === 0 ? (
            <div className="text-center text-gray-400 py-16">No new arrivals yet.</div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <div
                  ref={sliderRef}
                  className="flex transition-transform duration-700"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {newArrivals.map((product, idx) => (
                    <div key={product.id} className="min-w-full flex flex-col md:flex-row bg-white" style={{ minHeight: '420px' }}>
                      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
                        <img
                          src={product.image_url || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full max-w-xs md:max-w-lg h-[260px] md:h-[400px] object-cover rounded-3xl shadow-2xl border-2 border-gray-200"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center p-4 md:p-12">
                        <h3 className="text-2xl md:text-4xl font-extrabold mb-2 md:mb-4 text-gray-900 drop-shadow font-serif">{product.name}</h3>
                        <p className="text-base md:text-lg text-gray-500 mb-3 md:mb-6 font-light">{product.description}</p>
                        <div className="flex gap-2 md:gap-4 mb-3 md:mb-6">
                          <span className="text-purple-700 font-extrabold text-xl md:text-3xl">{product.price} DZD</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                          <a href={`/store/client?product=${product.id}`} className="px-5 md:px-7 py-2 md:py-3 rounded-full bg-purple-600 text-white font-bold text-base md:text-lg hover:bg-purple-700 transition">Explore</a>
                          <button
                            className={`px-5 md:px-7 py-2 md:py-3 rounded-full font-bold text-base md:text-lg transition ${isInWishlist(product.id) ? 'bg-purple-100 text-purple-700 border border-purple-600' : 'bg-gray-200 text-purple-700 hover:bg-gray-300'}`}
                            onClick={() => toggleWishlist(product.id)}
                            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            {isInWishlist(product.id) ? <HeartSolidIcon className="w-5 h-5 inline mr-2 text-red-500" /> : <HeartIcon className="w-5 h-5 inline mr-2 text-gray-600" />} {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                          </button>
                          <button
                            className="px-5 md:px-7 py-2 md:py-3 rounded-full bg-green-600 text-white font-bold text-base md:text-lg hover:bg-green-700 transition"
                            onClick={() => openOrderModal(product)}
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + newArrivals.length) % newArrivals.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-purple-600 rounded-full shadow p-2 z-10"
                style={{ display: newArrivals.length > 1 ? 'block' : 'none' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % newArrivals.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-purple-600 rounded-full shadow p-2 z-10"
                style={{ display: newArrivals.length > 1 ? 'block' : 'none' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {newArrivals.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full ${idx === currentSlide ? 'bg-purple-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Discover Our Collections Section */}
      <section id="collections" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
              Premium Collections
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Exclusively curated for the modern gentleman. Discover our signature 2025 men&apos;s collections.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((cat) => (
              <Link key={cat.id} href={`/store/client/category/${cat.slug}`} className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-900 block focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 hover:scale-105">
                <Image
                  src={cat.image_url || '/placeholder.jpg'}
                  alt={cat.name}
                  width={800}
                  height={600}
                  className="w-full h-96 object-cover object-top"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                  <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About/Brand Section with Modern Design */}
      <section id="about" className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">Our Story</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Just Put On is more than a brand—it&apos;s a movement for those who want to stand out 
                with confidence and comfort. We blend the edge of streetwear with timeless style, 
                curating collections that empower you to own your look every day.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">500+</div>
                  <div className="text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
                  <div className="text-gray-400">Premium Products</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/store/client" 
                  className="bg-white text-black py-4 px-8 rounded-full font-bold text-center hover:bg-gray-100 transition-colors"
                >
                  Shop Now
                </Link>
                <Link 
                  href="mailto:contact@justputon.com" 
                  className="border-2 border-white text-white py-4 px-8 rounded-full font-bold text-center hover:bg-white hover:text-black transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80" 
                  alt="Brand Story" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-purple-100">
            Get early access to new collections and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-gray-200 text-center text-gray-600 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full" />
              Shop Just Put On
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/store/client" className="hover:text-purple-600 transition">All Products</Link></li>
                <li><Link href="/store/client?category=streetwear" className="hover:text-purple-600 transition">Streetwear</Link></li>
                <li><Link href="/store/client?category=oldmoney" className="hover:text-purple-600 transition">Old Money</Link></li>
                <li><Link href="/store/client?category=shoes" className="hover:text-purple-600 transition">Shoes</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="mailto:contact@justputon.com" className="hover:text-purple-600 transition">Contact</Link></li>
                <li><Link href="#" className="hover:text-purple-600 transition">Shipping</Link></li>
                <li><Link href="#" className="hover:text-purple-600 transition">Returns</Link></li>
                <li><Link href="#" className="hover:text-purple-600 transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-purple-600 transition">About</Link></li>
                <li><Link href="#" className="hover:text-purple-600 transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-purple-600 transition">Press</Link></li>
                <li><Link href="#" className="hover:text-purple-600 transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href="https://instagram.com" target="_blank" rel="noopener" className="hover:text-purple-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-purple-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener" className="hover:text-purple-600 transition">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8">
            <div className="text-sm">&copy; {new Date().getFullYear()} Shop Just Put On. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* User menu floating button */}
      <div className="fixed bottom-4 right-4 z-50">
        {user ? (
          <div className="flex flex-col items-end gap-2">
            <button onClick={async () => { await signOut(); setUser(null); }} className="bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-red-700">Logout</button>
            <span className="bg-white text-gray-700 font-semibold rounded-full shadow px-4 py-2 mt-1">{user.email}</span>
          </div>
        ) : (
          <button onClick={() => { setAuthModal(true); setAuthMode('login'); }} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-purple-700">Login / Signup</button>
        )}
      </div>

      {/* Auth modal UI: */}
      {authModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4 text-center">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            {authError && <div className="text-red-600 mb-2 text-center">{authError}</div>}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthError('');
              if (authMode === 'login') {
                const { data, error } = await signInWithEmail(authEmail, authPassword);
                if (error) setAuthError(error.message);
                else {
                  setUser(data.user);
                  setAuthModal(false);
                }
              } else {
                const { error } = await signUpWithEmail(authEmail, authPassword);
                if (error) setAuthError(error.message);
                else {
                  setAuthError('Signup successful! Please log in.');
                  setAuthMode('login');
                }
              }
            }} className="space-y-4">
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" required />
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" required />
              <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700">{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
            </form>
            <div className="text-center mt-4">
              {authMode === 'login' ? (
                <span>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-purple-600 hover:underline">Sign Up</button></span>
              ) : (
                <span>Already have an account? <button onClick={() => setAuthMode('login')} className="text-purple-600 hover:underline">Login</button></span>
              )}
            </div>
            <button onClick={() => setAuthModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-black"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      )}

      {orderModalOpen && orderProduct && (
        <OrderForm product={orderProduct} open={orderModalOpen} onClose={() => setOrderModalOpen(false)} onOrderPlaced={() => {/* Optionally show a toast or refresh */}} />
      )}
    </main>
  );
}
