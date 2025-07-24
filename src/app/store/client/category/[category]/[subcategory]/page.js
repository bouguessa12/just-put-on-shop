"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OrderForm from '@/app/components/OrderForm';

export default function SubcategoryPage() {
  const params = useParams();
  const { category: categorySlug, subcategory: subcategorySlug } = params;
  const [parentCategory, setParentCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
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
  const [orderLoading, setOrderLoading] = useState(false);

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

  // Sync wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    }
  }, []);

  // Update localStorage whenever wishlist changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    const idStr = String(productId);
    setWishlist(prev => prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]);
  };
  const isInWishlist = (productId) => wishlist.includes(String(productId));
  const openOrderModal = (product) => {
    setOrderProduct(product);
    setOrderForm((prev) => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      deliveryPrice: 200,
      totalPrice: product.price + 200
    }));
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
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    await supabase.from('orders').insert({
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
    });
    setOrderLoading(false);
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
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch parent category
      const { data: catData } = await supabase.from('categories').select('*').eq('slug', categorySlug).single();
      setParentCategory(catData || null);
      // Fetch subcategory
      const { data: subcatData } = await supabase.from('categories').select('*').eq('slug', subcategorySlug).single();
      setSubcategory(subcatData || null);
      // Fetch products
      if (catData && subcatData) {
        const { data: prodData } = await supabase.from('products').select('*').eq('category', catData.name).eq('subcategory', subcatData.name).order('created_at', { ascending: false });
        setProducts(prodData || []);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }
    if (categorySlug && subcategorySlug) fetchData();
  }, [categorySlug, subcategorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="text-lg">Loading subcategory...</span>
        </div>
      </div>
    );
  }

  if (!subcategory) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div>
          <h1 className="text-3xl font-bold mb-4">Subcategory Not Found</h1>
          <Link href={`/store/client/category/${categorySlug}`} className="text-purple-600 hover:underline">Back to Category</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href={`/store/client/category/${categorySlug}`} className="text-purple-600 hover:underline mb-6 inline-block">← Back to {parentCategory?.name || 'Category'}</Link>
        <div className="flex flex-col items-center mb-12">
          {subcategory.image_url && (
            <div className="relative w-full flex justify-center items-center mb-10">
              <div className="absolute inset-0 h-72 w-full z-0">
                <Image
                  src={subcategory.image_url}
                  alt={subcategory.name}
                  fill
                  className="object-cover object-center blur-sm scale-110 opacity-70 transition-all duration-700"
                  style={{ filter: 'blur(8px)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <Image
                  src={subcategory.image_url}
                  alt={subcategory.name}
                  width={220}
                  height={220}
                  className="rounded-3xl object-cover shadow-2xl border-4 border-white bg-white animate-fade-in"
                />
              </div>
            </div>
          )}
          <h1 className="text-5xl font-extrabold text-center mb-3 tracking-tight leading-tight text-gray-900 drop-shadow-2xl font-serif">
            {subcategory.name}
          </h1>
          <p className="text-xl text-gray-500 text-center max-w-2xl font-light">
            {subcategory.description || 'Discover our curated products for this subcategory.'}
          </p>
        </div>
        <div>
          {products.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No products found in {subcategory.name}.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center relative">
                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isInWishlist(product.id) ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500" />
                    )}
                  </button>
                  {product.image_url && <Image src={product.image_url} alt={product.name} width={240} height={240} className="rounded-xl object-cover mb-4" />}
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{product.description}</p>
                  <span className="text-purple-600 font-bold mb-2">{product.price} DZD</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openOrderModal(product)}
                      className="px-5 py-2 rounded-full bg-green-600 text-white font-bold text-base hover:bg-green-700 transition"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <OrderForm product={orderProduct} open={orderModalOpen} onClose={() => setOrderModalOpen(false)} onOrderPlaced={() => {/* Optionally show a toast or refresh */}} />
    </main>
  );
} 