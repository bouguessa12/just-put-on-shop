"use client";
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OrderForm from '@/app/components/OrderForm';

// Algeria wilayas and baladias
const WILAYAS = [
  { id: 1, name: 'Adrar' },
  { id: 2, name: 'Chlef' },
  { id: 3, name: 'Laghouat' },
  { id: 4, name: 'Oum El Bouaghi' },
  { id: 5, name: 'Batna' },
  { id: 6, name: 'Béjaïa' },
  { id: 7, name: 'Biskra' },
  { id: 8, name: 'Béchar' },
  { id: 9, name: 'Blida' },
  { id: 10, name: 'Bouira' },
  { id: 11, name: 'Tamanrasset' },
  { id: 12, name: 'Tébessa' },
  { id: 13, name: 'Tlemcen' },
  { id: 14, name: 'Tiaret' },
  { id: 15, name: 'Tizi Ouzou' },
  { id: 16, name: 'Alger' },
  { id: 17, name: 'Djelfa' },
  { id: 18, name: 'Jijel' },
  { id: 19, name: 'Sétif' },
  { id: 20, name: 'Saïda' },
  { id: 21, name: 'Skikda' },
  { id: 22, name: 'Sidi Bel Abbès' },
  { id: 23, name: 'Annaba' },
  { id: 24, name: 'Guelma' },
  { id: 25, name: 'Constantine' },
  { id: 26, name: 'Médéa' },
  { id: 27, name: 'Mostaganem' },
  { id: 28, name: "M'Sila" },
  { id: 29, name: 'Mascara' },
  { id: 30, name: 'Ouargla' },
  { id: 31, name: 'Oran' },
  { id: 32, name: 'El Bayadh' },
  { id: 33, name: 'Illizi' },
  { id: 34, name: 'Bordj Bou Arréridj' },
  { id: 35, name: 'Boumerdès' },
  { id: 36, name: 'El Tarf' },
  { id: 37, name: 'Tindouf' },
  { id: 38, name: 'Tissemsilt' },
  { id: 39, name: 'El Oued' },
  { id: 40, name: 'Khenchela' },
  { id: 41, name: 'Souk Ahras' },
  { id: 42, name: 'Tipaza' },
  { id: 43, name: 'Mila' },
  { id: 44, name: 'Aïn Defla' },
  { id: 45, name: 'Naâma' },
  { id: 46, name: 'Aïn Témouchent' },
  { id: 47, name: 'Ghardaïa' },
  { id: 48, name: 'Relizane' },
  { id: 49, name: 'El M\'Ghair' },
  { id: 50, name: 'El Meniaa' },
  { id: 51, name: 'Ouled Djellal' },
  { id: 52, name: 'Bordj Baji Mokhtar' },
  { id: 53, name: 'Béni Abbès' },
  { id: 54, name: 'Timimoun' },
  { id: 55, name: 'Touggourt' },
  { id: 56, name: 'Djanet' },
  { id: 57, name: 'In Salah' },
];

export default function ClientStorePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [categoryParam, setCategoryParam] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    wilaya: '',
    baladia: '',
    address: '',
    deliveryType: 'agency',
    productId: null,
    productName: '',
    productPrice: 0,
    deliveryPrice: 200,
    totalPrice: 0,
    notes: ''
  });

  // Wishlist functions
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  function getCategoryFromURL() {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('category');
    }
    return null;
  }

  useEffect(() => {
    function updateCategoryFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      setCategoryParam(urlParams.get('category'));
    }

    updateCategoryFromURL();

    window.addEventListener('popstate', updateCategoryFromURL);
    window.addEventListener('pushstate', updateCategoryFromURL);

    // Monkey-patch pushState to emit an event
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      window.dispatchEvent(new Event('pushstate'));
    };

    return () => {
      window.removeEventListener('popstate', updateCategoryFromURL);
      window.removeEventListener('pushstate', updateCategoryFromURL);
      window.history.pushState = originalPushState;
    };
  }, []);

  const filteredProducts = categoryParam
    ? products.filter((product) => {
        if (!product.category) return false;
        const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return slugify(product.category) === slugify(categoryParam);
      })
    : products;

  const openOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderForm({
      ...orderForm,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      deliveryPrice: 200,
      totalPrice: product.price + 200
    });
    setOrderModalOpen(true);
  };

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'deliveryType') {
        const deliveryPrice = value === 'home' ? 400 : 200;
        updated.deliveryPrice = deliveryPrice;
        updated.totalPrice = updated.productPrice + deliveryPrice;
      }
      
      return updated;
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);

    try {
      if (!supabase) {
        alert('Database connection not available. Please try again later.');
        setOrderLoading(false);
        return;
      }
      
      const orderData = {
        customer_name: orderForm.customerName,
        phone: orderForm.phone,
        email: orderForm.email,
        wilaya: orderForm.wilaya,
        baladia: orderForm.baladia,
        address: orderForm.address,
        delivery_type: orderForm.deliveryType,
        product_id: orderForm.productId,
        product_name: orderForm.productName,
        product_price: orderForm.productPrice,
        delivery_price: orderForm.deliveryPrice,
        total_price: orderForm.totalPrice,
        notes: orderForm.notes,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('orders').insert([orderData]);

      if (error) {
        alert(`Failed to place order: ${error.message || 'Unknown error'}`);
      } else {
        alert('Order placed successfully! We will contact you soon.');
        setOrderModalOpen(false);
        setOrderForm({
          customerName: '',
          phone: '',
          email: '',
          wilaya: '',
          baladia: '',
          address: '',
          deliveryType: 'agency',
          productId: null,
          productName: '',
          productPrice: 0,
          deliveryPrice: 200,
          totalPrice: 0,
          notes: ''
        });
      }
    } catch (error) {
      alert(`Failed to place order: ${error.message || 'Unknown error'}`);
    }

    setOrderLoading(false);
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        console.error('Supabase client not initialized');
        setProducts([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <main className="min-h-screen bg-white text-gray-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">
          {categoryParam ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Products` : ''}
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">
            <div className="mb-4">
              <p>No products found{categoryParam ? ` for "${categoryParam}"` : ''}.</p>
              <p className="text-sm mt-2">Available categories: {[...new Set(products.map(p => p.category))].join(', ')}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isInWishlist(product.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    )}
                  </button>
                  
                  {product.image_url ? (
                    <Image 
                      src={product.image_url} 
                      alt={product.name} 
                      fill 
                      className="object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', product.image_url);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full uppercase tracking-widest">{product.category}</span>
                    <span className="text-lg font-bold text-black">{product.price} DZD</span>
                  </div>
                  <h2 className="text-lg font-semibold mb-1 truncate">{product.name}</h2>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-2">{product.description}</p>
                  <button 
                    onClick={() => openOrderModal(product)}
                    className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      <OrderForm product={orderProduct} open={orderModalOpen} onClose={() => setOrderModalOpen(false)} onOrderPlaced={() => {/* Optionally show a toast or refresh */}} />
    </main>
  );
} 