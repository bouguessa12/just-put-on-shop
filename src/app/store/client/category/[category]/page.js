"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OrderForm from '@/app/components/OrderForm';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params.category;
  const [mainCategory, setMainCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '' });
  const [orderLoading, setOrderLoading] = useState(false);

  const toggleWishlist = (productId) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  const isInWishlist = (productId) => wishlist.includes(productId);
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

  useEffect(() => {
    async function fetchCategoryAndSubcategories() {
      setLoading(true);
      setError(null);
      // Fetch main category by slug
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', category)
        .single();
      if (catError || !catData) {
        setError('Category not found');
        setMainCategory(null);
        setSubcategories([]);
        setLoading(false);
        return;
      }
      setMainCategory(catData);
      // Fetch subcategories for this category
      const { data: subcatData, error: subcatError } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', catData.id)
        .order('name', { ascending: true });
      if (subcatError) {
        setError('Failed to load subcategories');
        setSubcategories([]);
      } else {
        setSubcategories(subcatData || []);
      }
      setLoading(false);
    }
    if (category) fetchCategoryAndSubcategories();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <span className="text-lg">Loading category...</span>
        </div>
      </div>
    );
  }

  if (error || !mainCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div>
          <h1 className="text-3xl font-bold mb-4">{error || 'Category Not Found'}</h1>
          <Link href="/" className="text-purple-600 hover:underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900 px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          {mainCategory.image_url && (
            <div className="relative w-full flex justify-center items-center mb-10">
              <div className="absolute inset-0 h-72 w-full z-0">
                <Image
                  src={mainCategory.image_url}
                  alt={mainCategory.name}
                  fill
                  className="object-cover object-center blur-sm scale-110 opacity-70 transition-all duration-700"
                  style={{ filter: 'blur(8px)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <Image
                  src={mainCategory.image_url}
                  alt={mainCategory.name}
                  width={220}
                  height={220}
                  className="rounded-3xl object-cover shadow-2xl border-4 border-white bg-white animate-fade-in"
                />
              </div>
            </div>
          )}
          <h1 className="text-5xl font-extrabold text-center mb-3 tracking-tight leading-tight text-gray-900 drop-shadow-2xl font-serif">
            {mainCategory.name}
          </h1>
          <p className="text-xl text-gray-500 text-center max-w-2xl font-light">
            {mainCategory.description || 'Discover our curated subcategories for this collection.'}
          </p>
        </div>
        {subcategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {subcategories.map((subcat) => (
              <Link
                key={subcat.id}
                href={`/store/client/category/${mainCategory.slug}/${subcat.slug}`}
                className="group block rounded-3xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {subcat.image_url && typeof subcat.image_url === "string" && subcat.image_url.trim() !== "" && /^https?:\/\//.test(subcat.image_url) ? (
                    <Image
                      src={subcat.image_url}
                      alt={subcat.name}
                      fill
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-400 text-5xl">📁</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8">
                    <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg font-serif group-hover:text-purple-300 transition-colors">
                      {subcat.name}
                    </span>
                  </div>
                </div>
                <div className="p-6 text-center">
                  {subcat.description && (
                    <p className="text-gray-500 text-base mt-2 font-light line-clamp-2">{subcat.description}</p>
                  )}
                  <span className="inline-block mt-4 px-5 py-2 rounded-full bg-purple-600 text-white font-semibold text-sm shadow hover:bg-purple-700 transition-all">
                    Explore {subcat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <ProductGrid collectionName={mainCategory.name} wishlist={wishlist} toggleWishlist={toggleWishlist} isInWishlist={isInWishlist} openOrderModal={openOrderModal} />
          </div>
        )}
      </div>
      <OrderForm product={orderProduct} open={orderModalOpen} onClose={() => setOrderModalOpen(false)} onOrderPlaced={() => {/* Optionally show a toast or refresh */}} />
    </main>
  );
}

function ProductGrid({ collectionName, subCategoryName, wishlist, toggleWishlist, isInWishlist, openOrderModal }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from('products').select('*').eq('category', collectionName);
      if (subCategoryName) {
        query = query.eq('subcategory', subCategoryName);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, [collectionName, subCategoryName]);
  if (loading) return <div className="py-8">Loading products...</div>;
  if (products.length === 0) return <div className="py-8">No products found{(subCategoryName ? ` in ${subCategoryName}` : ` in ${collectionName}`)}.</div>;
  return (
    <div>
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
    </div>
  );
} 