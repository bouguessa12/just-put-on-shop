"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { name: 'Streetwear', image: '/categories/streetwear.jpg', slug: 'streetwear' },
  { name: 'Old Money', image: '/categories/oldmoney.jpg', slug: 'oldmoney' },
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
  const [heroIndex, setHeroIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef(null);

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

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      {/* Navigation Bar */}
      <header className={`w-full flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'shadow-lg backdrop-blur-md bg-white/95' : ''
      }`}>
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight">
          <Image src="/logo.jpg" alt="Just Put On Logo" width={40} height={40} className="rounded-full" />
          <span>Just Put On</span>
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
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-30">
              <ul className="py-2">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link href={`/store/client?category=${cat.slug}`} className="block px-4 py-2 hover:bg-gray-100 text-gray-700">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
                        <Link href="/store/client" className="hover:text-purple-600 transition">Shop</Link>
          <Link href="mailto:contact@justputon.com" className="hover:text-purple-600 transition">Contact</Link>
          <a href="https://instagram.com" target="_blank" rel="noopener" className="hover:text-purple-600 transition">Instagram</a>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={() => setIsMenuOpen(false)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-4">
              <Link href="/store/client" className="block py-2 hover:text-purple-600 transition">Shop</Link>
              <Link href="mailto:contact@justputon.com" className="block py-2 hover:text-purple-600 transition">Contact</Link>
              <a href="https://instagram.com" target="_blank" rel="noopener" className="block py-2 hover:text-purple-600 transition">Instagram</a>
            </nav>
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
            {/* Linen Collection */}
            <Link href="/store/client?category=linen" className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-900 block focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 hover:scale-105">
              <Image
                src="https://i.pinimg.com/1200x/d2/c9/40/d2c940f7904bdd9f1a0940c34f00ac62.jpg"
                alt="Linen Collection"
                width={800}
                height={600}
                className="w-full h-96 object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif">
                  Linen Collection
                </span>
              </div>
            </Link>
            {/* Old Money 2025 */}
            <Link href="/store/client?category=oldmoney" className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-900 block focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 hover:scale-105">
              <Image
                src="https://i.pinimg.com/736x/3c/19/00/3c1900e596bb71c5935d086aac4ea5d4.jpg"
                alt="Old Money 2025"
                width={800}
                height={600}
                className="w-full h-96 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif">
                  Old Money 2025
                </span>
              </div>
            </Link>
            {/* Streetwear Collection */}
            <Link href="/store/client?category=streetwear" className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-900 block focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 hover:scale-105">
              <Image
                src="https://i.pinimg.com/736x/1c/3e/c6/1c3ec6b8b52f24ace677375d5f2c60b8.jpg"
                alt="Streetwear Collection"
                width={800}
                height={600}
                className="w-full h-96 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif">
                  Streetwear Collection
                </span>
              </div>
            </Link>
            {/* Shoes Collection */}
            <Link href="/store/client?category=shoes" className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-900 block focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 hover:scale-105">
              <Image
                src="https://i.pinimg.com/736x/27/69/34/2769346f88f52c75bfe17064b76d0b2f.jpg"
                alt="Shoes Collection"
                width={800}
                height={600}
                className="w-full h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif">
                  Shoes Collection
                </span>
              </div>
            </Link>
            {/* Accessories Collection */}
            <Link href="/store/client?category=accessories" className="relative group rounded-3xl overflow-hidden shadow-xl bg-gray-900 block focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform duration-200 hover:scale-105">
              <Image
                src="https://i.pinimg.com/736x/31/5b/8e/315b8e7d4e6e5a49879455a6786902c5.jpg"
                alt="Accessories Collection"
                width={800}
                height={600}
                className="w-full h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif">
                  Accessories Collection
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories with Modern Grid */}
      <section className="max-w-7xl mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Premium Categories</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Exclusively designed for the discerning gentleman
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <Link 
              key={cat.name} 
              href={`/store/client?category=${cat.slug}`} 
              className="group block rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors font-serif">{cat.name}</h3>
                <p className="text-gray-600 text-sm font-light">Premium men&apos;s essentials</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About/Brand Section with Modern Design */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
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
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
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
              Just Put On
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
            <div className="text-sm">&copy; {new Date().getFullYear()} Just Put On. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
