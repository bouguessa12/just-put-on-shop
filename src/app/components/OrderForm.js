"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

export default function OrderForm({ product, open, onClose, onOrderPlaced }) {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    wilaya: '',
    baladia: '',
    address: '',
    deliveryType: 'agency',
    notes: '',
    deliveryPrice: 200,
    totalPrice: product ? product.price + 200 : 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'deliveryType') {
        const deliveryPrice = value === 'home' ? 400 : 200;
        updated.deliveryPrice = deliveryPrice;
        updated.totalPrice = (product ? product.price : 0) + deliveryPrice;
      }
      return updated;
    });
  };

  const validate = () => {
    if (!form.customerName.trim()) return 'Full name is required.';
    if (!form.phone.match(/^(05|06|07)[0-9]{8}$/)) return 'Phone must start with 05, 06, or 07 and be 10 digits.';
    if (!form.wilaya) return 'Wilaya is required.';
    if (!form.baladia.trim()) return 'Baladia is required.';
    if (!form.address.trim()) return 'Address is required.';
    if (!selectedColor) return 'Please select a color.';
    if (!selectedSize) return 'Please select a size.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    await supabase.from('orders').insert({
      customer_name: form.customerName,
      phone: form.phone,
      email: form.email,
      wilaya: form.wilaya,
      baladia: form.baladia,
      address: form.address,
      delivery_type: form.deliveryType,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      delivery_price: form.deliveryPrice,
      total_price: form.totalPrice,
      notes: form.notes,
      selected_color: selectedColor?.color,
      selected_color_image_url: selectedColor?.image_url || '',
      selected_size: selectedSize,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    setLoading(false);
    if (onOrderPlaced) onOrderPlaced();
    onClose();
    setForm({
      customerName: '',
      phone: '',
      email: '',
      wilaya: '',
      baladia: '',
      address: '',
      deliveryType: 'agency',
      notes: '',
      deliveryPrice: 200,
      totalPrice: product ? product.price + 200 : 0
    });
  };

  // Before using product.colors and product.sizes, ensure they are arrays:
  const safeColors = Array.isArray(product.colors)
    ? product.colors
    : typeof product.colors === 'string' && product.colors.trim().startsWith('[')
      ? JSON.parse(product.colors)
      : [];
  const safeSizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === 'string' && product.sizes.trim().startsWith('[')
      ? JSON.parse(product.sizes)
      : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full max-h-screen overflow-y-auto shadow-lg mx-2">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Order: {product.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input type="text" name="customerName" value={form.customerName} onChange={handleChange} required className="w-full px-3 py-2 border rounded text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required pattern="^(05|06|07)[0-9]{8}$" title="Phone number must start with 05, 06, or 07 and be 10 digits." className="w-full px-3 py-2 border rounded text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Wilaya *</label>
            <select name="wilaya" value={form.wilaya} onChange={handleChange} required className="w-full px-3 py-2 border rounded text-base">
              <option value="">Select Wilaya</option>
              {WILAYAS.map(wilaya => (
                <option key={wilaya.id} value={wilaya.name}>{wilaya.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Baladia *</label>
            <input type="text" name="baladia" value={form.baladia} onChange={handleChange} required className="w-full px-3 py-2 border rounded text-base" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border rounded text-base"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Type *</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <label className="flex items-center">
                <input type="radio" name="deliveryType" value="agency" checked={form.deliveryType === 'agency'} onChange={handleChange} className="mr-1" />
                <span className="text-base">Agency Pickup (200 DZD)</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="deliveryType" value="home" checked={form.deliveryType === 'home'} onChange={handleChange} className="mr-1" />
                <span className="text-base">Home Delivery (400 DZD)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded text-base"></textarea>
          </div>
          {safeColors && safeColors.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Color *</label>
              <div className="flex flex-wrap gap-3 mb-2">
                {safeColors.map((color, idx) => (
                  <label key={idx} className={`flex flex-col items-center cursor-pointer border rounded-lg p-2 ${selectedColor?.color === color.color ? 'border-green-600' : 'border-gray-300'}`}>
                    <input type="radio" name="color" value={color.color} checked={selectedColor?.color === color.color} onChange={() => setSelectedColor(color)} className="mb-1" />
                    {color.image_url ? (
                      <img src={color.image_url} alt={color.color} className="w-10 h-10 object-cover rounded mb-1" />
                    ) : (
                      <span className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center mb-1">🎨</span>
                    )}
                    <span className="text-xs font-medium">{color.color}</span>
                  </label>
                ))}
              </div>
              {selectedColor && selectedColor.image_url && (
                <div className="mb-2 flex justify-center"><img src={selectedColor.image_url} alt={selectedColor.color} className="w-24 h-24 object-contain rounded-lg" /></div>
              )}
            </div>
          )}
          {safeSizes && safeSizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Size *</label>
              <select name="size" value={selectedSize} onChange={e => setSelectedSize(e.target.value)} required className="w-full px-3 py-2 border rounded text-base">
                <option value="">Select Size</option>
                {safeSizes.map((size, idx) => (
                  <option key={idx} value={size.size}>{size.size}</option>
                ))}
              </select>
            </div>
          )}
          <div className="bg-gray-50 p-4 rounded-lg mt-2 text-base">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Product Price:</span>
                <span>{product.price} DZD</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{form.deliveryPrice} DZD</span>
              </div>
              <div className="border-t pt-1 font-bold">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{form.totalPrice} DZD</span>
                </div>
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold text-lg mt-2" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          <button type="button" onClick={onClose} className="mt-2 text-gray-500 hover:text-black w-full py-3 rounded text-base">Cancel</button>
        </form>
      </div>
    </div>
  );
} 