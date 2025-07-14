"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

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

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  // Order form state
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    wilaya: '',
    baladia: '',
    address: '',
    deliveryType: 'agency', // 'agency' or 'home'
    productId: null,
    productName: '',
    productPrice: 0,
    deliveryPrice: 200,
    totalPrice: 0,
    notes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    
    if (selectedCategory) {
      const categoryVariations = [
        selectedCategory.toLowerCase(),
        selectedCategory.toLowerCase().replace(/\s+/g, ''),
        selectedCategory.toLowerCase().replace(/\s+/g, '-'),
        selectedCategory.toLowerCase().replace(/\s+/g, '_')
      ];
      
      query = query.in('category', categoryVariations);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    
    setLoading(false);
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        if (!product.category) return false;
        
        const productCategory = product.category.toLowerCase();
        const searchCategory = selectedCategory.toLowerCase();
        
        if (productCategory === searchCategory) return true;
        if (productCategory.replace(/\s+/g, '') === searchCategory.replace(/\s+/g, '')) return true;
        
        const normalizedProduct = productCategory.replace(/\s+/g, '-');
        const normalizedSearch = searchCategory.replace(/\s+/g, '-');
        if (normalizedProduct === normalizedSearch) return true;
        
        return false;
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
      
      // Recalculate total price when delivery type changes
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
      console.log('Submitting order with data:', orderForm);
      
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
      
      console.log('Order data to insert:', orderData);
      
      const { data, error } = await supabase.from('orders').insert([orderData]);

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        alert(`Failed to place order: ${error.message || 'Unknown error'}`);
      } else {
        console.log('Order created successfully:', data);
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
      console.error('Caught error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert(`Failed to place order: ${error.message || 'Unknown error'}`);
    }

    setOrderLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center">
          {selectedCategory
            ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`
            : 'Shop All Products'}
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">
            <div className="mb-4">
              <p>No products found for "{selectedCategory}".</p>
              <p className="text-sm mt-2">Available categories: {[...new Set(products.map(p => p.category))].join(', ')}</p>
            </div>
            <a href="/store" className="text-purple-600 hover:text-purple-800 underline">
              View all products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
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
                    className="mt-auto w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
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
      {orderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Place Order</h2>
                <button 
                  onClick={() => setOrderModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* Product Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Product Details</h3>
                  <p className="text-sm text-gray-600">{orderForm.productName}</p>
                  <p className="text-lg font-bold">{orderForm.productPrice} DZD</p>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={orderForm.customerName}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={orderForm.phone}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={orderForm.email}
                      onChange={handleOrderFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Wilaya *</label>
                    <select
                      name="wilaya"
                      value={orderForm.wilaya}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Wilaya</option>
                      {WILAYAS.map(wilaya => (
                        <option key={wilaya.id} value={wilaya.name}>{wilaya.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Baladia *</label>
                    <input
                      type="text"
                      name="baladia"
                      value={orderForm.baladia}
                      onChange={handleOrderFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <textarea
                      name="address"
                      value={orderForm.address}
                      onChange={handleOrderFormChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Type *</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="agency"
                          checked={orderForm.deliveryType === 'agency'}
                          onChange={handleOrderFormChange}
                          className="mr-2"
                        />
                        <span>Agency Delivery (200 DZD)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="home"
                          checked={orderForm.deliveryType === 'home'}
                          onChange={handleOrderFormChange}
                          className="mr-2"
                        />
                        <span>Home Delivery (400 DZD)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={orderForm.notes}
                      onChange={handleOrderFormChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Product Price:</span>
                    <span>{orderForm.productPrice} DZD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery:</span>
                    <span>{orderForm.deliveryPrice} DZD</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>{orderForm.totalPrice} DZD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={orderLoading}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
