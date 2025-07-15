"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Dialog } from '@headlessui/react'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, PlusIcon, PencilIcon, TrashIcon, HomeIcon, ShoppingBagIcon, UserCircleIcon, CogIcon, ShoppingCartIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL']
const SHOE_SIZES = Array.from({ length: 11 }, (_, i) => (35 + i).toString())
const COLORS = ['Black', 'White', 'Red', 'Green', 'Blue', 'Beige']

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0)
  const [previewProduct, setPreviewProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    image_file: null,
    category: '',
    in_stock: true,
    sizes: CLOTHING_SIZES.map((size) => ({ size, quantity: 0 })),
    colors: COLORS.map((color) => ({ color, quantity: 0, image_file: null, image_url: '' }))
  })

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [editCategoryImageUrl, setEditCategoryImageUrl] = useState('');
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);

  useEffect(() => {
    checkSession()
    fetchProducts()
    fetchCategories();
    fetchOrders();
  }, [filterCategory])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/admin/login')
      return
    }
    setUser(session.user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*')
    if (filterCategory) {
      query = query.eq('category', filterCategory)
    }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    console.log('Fetched categories:', data, 'Error:', error);
    if (!error) setCategories(data || []);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setOrdersLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } else {
      fetchOrders(); // Refresh orders
    }
  };

  const deleteOrder = async (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      } else {
        fetchOrders(); // Refresh orders
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const updatedForm = { ...form, [name]: type === 'checkbox' ? checked : value }

    if (name === 'category') {
      const categoryValue = value.toLowerCase()
      const sizes = categoryValue.includes('shoe') || categoryValue.includes('basket')
        ? SHOE_SIZES.map((size) => ({ size, quantity: 0 }))
        : CLOTHING_SIZES.map((size) => ({ size, quantity: 0 }))
      updatedForm.sizes = sizes
    }

    setForm(updatedForm)
  }

  const handleSizeChange = (index, value) => {
    const updatedSizes = [...form.sizes]
    updatedSizes[index].quantity = parseInt(value) || 0
    setForm({ ...form, sizes: updatedSizes })
  }

  const handleColorChange = (index, field, value) => {
    const updatedColors = [...form.colors]
    if (field === 'quantity') {
      updatedColors[index].quantity = parseInt(value) || 0
    } else if (field === 'image_file') {
      updatedColors[index].image_file = value
    }
    setForm({ ...form, colors: updatedColors })
  }

  const openModal = (product = null) => {
    if (product) {
      setForm({
        ...product,
        image_file: null,
        sizes: product.sizes || CLOTHING_SIZES.map((size) => ({ size, quantity: 0 })),
        colors: product.colors || COLORS.map((color) => ({ color, quantity: 0, image_file: null, image_url: '' }))
      })
      setEditingProduct(product)
    } else {
      setForm({
        name: '',
        description: '',
        price: '',
        image_url: '',
        image_file: null,
        category: filterCategory || '',
        in_stock: true,
        sizes: CLOTHING_SIZES.map((size) => ({ size, quantity: 0 })),
        colors: COLORS.map((color) => ({ color, quantity: 0, image_file: null, image_url: '' }))
      })
      setEditingProduct(null)
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    let uploadedUrl = form.image_url

    if (form.image_file) {
      const fileName = `${Date.now()}-${form.image_file.name}`
      const { data, error: uploadError } = await supabase.storage
        .from('product-image')
        .upload(`products/${fileName}`, form.image_file)

      if (uploadError) {
        alert('Image upload failed')
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-image')
        .getPublicUrl(`products/${fileName}`)

      uploadedUrl = publicUrlData.publicUrl
    }

    const colorUploadPromises = form.colors.map(async (c, i) => {
      if (c.image_file) {
        const colorFileName = `${Date.now()}-${c.color}-${c.image_file.name}`
        const { data, error: colorUploadError } = await supabase.storage
          .from('product-image')
          .upload(`colors/${colorFileName}`, c.image_file)

        if (colorUploadError) {
          console.error(`Color image upload failed for ${c.color}`)
          return { ...c, image_url: '' }
        }

        const { data: publicColorUrl } = supabase.storage
          .from('product-image')
          .getPublicUrl(`colors/${colorFileName}`)

        return { ...c, image_url: publicColorUrl.publicUrl, image_file: undefined }
      }
      return c
    })

    const colorsWithUrls = await Promise.all(colorUploadPromises)

    const dataToSend = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      image_url: uploadedUrl,
      category: form.category,
      in_stock: form.in_stock,
      sizes: form.sizes,
      colors: colorsWithUrls
    }

    let result
    if (editingProduct) {
      result = await supabase.from('products').update(dataToSend).eq('id', editingProduct.id)
    } else {
      result = await supabase.from('products').insert([dataToSend])
    }

    const { error } = result
    if (error) {
      console.error('Insert error:', error)
      alert('Failed to save product')
      return
    }

    setModalOpen(false)
    fetchProducts()
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setCategoryLoading(true);
    let imageUrl = '';
    if (newCategoryImage) {
      const fileName = `${Date.now()}-${newCategoryImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(`categories/${fileName}`, newCategoryImage);
      console.log('Image upload:', uploadData, uploadError);
      if (uploadError) {
        alert('Image upload failed');
        setCategoryLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('category-images')
        .getPublicUrl(`categories/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    }
    const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim().toLowerCase(), slug, image_url: imageUrl }]);
    console.log('Insert category error:', error);
    if (error) {
      alert('Failed to add category');
    } else {
      setNewCategoryName('');
      setNewCategoryImage(null);
      setNewCategoryImageUrl('');
      setCategoryModalOpen(false);
      fetchCategories();
    }
    setCategoryLoading(false);
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (!window.confirm(`WARNING: Deleting the category "${categoryToDelete.name}" will also permanently delete ALL products in this category. This action cannot be undone.\n\nAre you sure you want to proceed?`)) return;
    // Delete all products in this category
    await supabase.from('products').delete().eq('category', categoryToDelete.name);
    // Delete the category
    await supabase.from('categories').delete().eq('id', categoryToDelete.id);
    setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
  };

  const handlePreview = (product) => {
    setPreviewProduct(product)
    setImagePreviewIndex(0)
  }

  const closePreview = () => setPreviewProduct(null)

  // Mock order data
  // const orders = [
  //   { id: 1001, customer: "John Doe", date: "2023-08-15", amount: 12500, status: "Delivered" },
  //   { id: 1002, customer: "Sarah Smith", date: "2023-08-16", amount: 8900, status: "Processing" },
  //   { id: 1003, customer: "Michael Johnson", date: "2023-08-17", amount: 15600, status: "Shipped" },
  //   { id: 1004, customer: "Emily Wilson", date: "2023-08-18", amount: 7500, status: "Pending" },
  //   { id: 1005, customer: "David Brown", date: "2023-08-19", amount: 21000, status: "Delivered" },
  //   { id: 1006, customer: "Jennifer Taylor", date: "2023-08-20", amount: 13450, status: "Processing" },
  // ];

  // Open edit modal and prefill state
  const openEditCategoryModal = (cat) => {
    setEditCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategoryImageUrl(cat.image_url || '');
    setEditCategoryImage(null);
    setEditCategoryModalOpen(true);
  };

  // Handle edit submit
  const handleEditCategory = async (e) => {
    e.preventDefault();
    setEditCategoryLoading(true);
    let imageUrl = editCategory.image_url || '';
    if (editCategoryImage) {
      const fileName = `${Date.now()}-${editCategoryImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(`categories/${fileName}`, editCategoryImage);
      if (uploadError) {
        alert('Image upload failed');
        setEditCategoryLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('category-images')
        .getPublicUrl(`categories/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    }
    const slug = editCategoryName.trim().toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('categories').update({
      name: editCategoryName.trim().toLowerCase(),
      slug,
      image_url: imageUrl
    }).eq('id', editCategory.id);
    if (error) {
      alert('Failed to update category');
    } else {
      setEditCategory(null);
      setEditCategoryName('');
      setEditCategoryImage(null);
      setEditCategoryImageUrl('');
      setEditCategoryModalOpen(false);
      fetchCategories();
    }
    setEditCategoryLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 shadow-xl transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {logoError ? (
                  <span className="font-bold text-purple-400">LOGO</span>
                ) : (
                  <img 
                    src="/logo.jpg" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              <div>
                <h1 className="font-bold">Just Put On</h1>
                <p className="text-xs text-gray-400">Admin Dashboard</p>
              </div>
            </div>
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'home' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('home')}
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'orders' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Orders</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'products' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('products')}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>Products</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'customers' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('customers')}
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>Customers</span>
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'settings' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                <CogIcon className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-x-hidden">
        {/* Top Bar */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-bold capitalize">
              {activeTab === 'home' && 'Dashboard'}
              {activeTab === 'orders' && 'Orders'}
              {activeTab === 'products' && 'Products'}
              {activeTab === 'customers' && 'Customers'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
              </div>
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-purple-400 mb-2">42</div>
                  <h3 className="text-lg font-semibold mb-1">Total Products</h3>
                  <p className="text-gray-400 text-sm">Across all categories</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-green-400 mb-2">28</div>
                  <h3 className="text-lg font-semibold mb-1">Active Orders</h3>
                  <p className="text-gray-400 text-sm">To be processed</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold text-blue-400 mb-2">96%</div>
                  <h3 className="text-lg font-semibold mb-1">Satisfaction</h3>
                  <p className="text-gray-400 text-sm">Customer rating</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-10 border-t border-gray-700">
                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white p-4 rounded-lg transition-all flex items-center gap-3"
                  >
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <ShoppingCartIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">Manage Products</h3>
                      <p className="text-sm text-purple-200">Add, edit or remove products</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white p-4 rounded-lg transition-all flex items-center gap-3"
                  >
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <ShoppingBagIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">View Orders</h3>
                      <p className="text-sm text-green-200">Process customer orders</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Recent Orders</h2>
                  <p className="text-gray-500">Manage and track customer orders</p>
                </div>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl bg-gray-800/50">
                  <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🛍️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Orders Found</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    No orders have been placed yet.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="py-3 px-4 text-left">Order ID</th>
                          <th className="py-3 px-4 text-left">Customer</th>
                          <th className="py-3 px-4 text-left">Phone</th>
                          <th className="py-3 px-4 text-left">Date</th>
                          <th className="py-3 px-4 text-left">Amount</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                            <td className="py-3 px-4">#{order.id}</td>
                            <td className="py-3 px-4">{order.customer_name}</td>
                            <td className="py-3 px-4">{order.phone}</td>
                            <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-bold">{order.total_price?.toLocaleString() || '0'} DZD</td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs ${
                                order.status === 'delivered' ? 'bg-green-900 text-green-300' :
                                order.status === 'shipped' ? 'bg-blue-900 text-blue-300' :
                                order.status === 'confirmed' ? 'bg-yellow-900 text-yellow-300' :
                                order.status === 'pending' ? 'bg-orange-900 text-orange-300' : 'bg-gray-700 text-gray-300'
                              }`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="text-yellow-400 hover:text-yellow-300 mr-2"
                                title="Mark as Confirmed"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="text-blue-400 hover:text-blue-300 mr-2"
                                title="Mark as Shipped"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="text-green-400 hover:text-green-300"
                                title="Mark as Delivered"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-9a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => deleteOrder(order.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Delete Order"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Categories Section */}
              <section className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Categories</h2>
                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    className="flex items-center gap-1 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categories.filter(cat => !!cat.name).map((cat) => (
                    <div 
                      key={cat.id} 
                      className={`relative group rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.03]`}
                    >
                      <button
                        onClick={() => setFilterCategory(cat.name)}
                        className="relative h-40 w-full"
                      >
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover z-0" />
                        ) : (
                          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <span className="text-3xl">📁</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <h3 className="text-xl font-bold capitalize text-white">{cat.name}</h3>
                        </div>
                      </button>
                      <div className="absolute top-2 right-2 z-30 flex gap-1">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          className="bg-blue-600 text-white p-1 rounded-full shadow hover:bg-blue-700 focus:outline-none"
                          tabIndex={0}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 focus:outline-none"
                          tabIndex={0}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    className="border-2 border-dashed border-gray-700 text-gray-400 flex flex-col justify-center items-center rounded-xl h-40 hover:bg-gray-800/50 transition-all"
                  >
                    <div className="bg-gray-800 rounded-full p-3 mb-2">
                      <PlusIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <span className="font-semibold text-gray-300">Add Category</span>
                  </button>
                </div>
              </section>

              {/* Products Section */}
              <section className="mb-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                      {filterCategory ? `${filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)} Products` : 'All Products'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">
                    {/* Category Dropdown */}
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="bg-gray-700 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2 md:mb-0"
                    >
                      <option value="">All Categories</option>
                      {categories.filter(cat => !!cat.name).map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => openModal()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg shadow-lg transition-all w-full md:w-auto"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        <span>Add New Product</span>
                      </div>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl bg-gray-800/50">
                    <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🛍️</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Products Found</h3>
                    <p className="text-gray-500 mb-4 max-w-md mx-auto">
                      {filterCategory 
                        ? `There are no products in the ${filterCategory} category.` 
                        : 'Get started by adding your first product'}
                    </p>
                    <button
                      onClick={() => openModal()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-6 py-2 rounded-lg shadow-lg transition-all"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div 
                        key={product.id} 
                        className="bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => handlePreview(product)}
                      >
                        <div className="relative aspect-square w-full overflow-hidden bg-gray-900">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openModal(product) }} 
                              className="bg-gray-800 hover:bg-blue-600 p-1 rounded"
                            >
                              <PencilIcon className="w-4 h-4 text-blue-400" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(product.id) }} 
                              className="bg-gray-800 hover:bg-red-600 p-1 rounded"
                            >
                              <TrashIcon className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg truncate">{product.name}</h3>
                            <span className="bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded-full">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{product.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="font-bold text-green-400">{product.price} DZD</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${product.in_stock ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                              {product.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* Other Tabs Placeholder */}
          {(activeTab === 'customers' || activeTab === 'settings') && (
            <div className="max-w-4xl mx-auto text-center py-20">
              <div className="bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                {activeTab === 'customers' ? (
                  <UserCircleIcon className="w-12 h-12 text-blue-400" />
                ) : (
                  <CogIcon className="w-12 h-12 text-purple-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {activeTab === 'customers' ? 'Customer Management' : 'Store Settings'}
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                {activeTab === 'customers' 
                  ? 'Manage your customer database and view purchase history' 
                  : 'Configure your store settings and preferences'}
              </p>
              <button className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all">
                Coming Soon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-gray-800 rounded-xl p-6 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
              <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Dialog.Title>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price (DZD) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter price"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => !!cat.name).map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Status</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={form.in_stock}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-purple-500 rounded border-gray-600 bg-gray-700 focus:ring-purple-500"
                    />
                    <label className="ml-3">In Stock</label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Main Product Image</label>
                  {form.image_url ? (
                    <div className="mb-4">
                      <img src={form.image_url} alt="Current product" className="max-h-40 object-contain rounded-lg bg-gray-900" />
                    </div>
                  ) : (
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg w-full h-40 flex items-center justify-center mb-4 bg-gray-900">
                      <span className="text-gray-500">No image selected</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image_file: e.target.files[0] })}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <span>Sizes & Quantities</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{form.sizes.length} sizes</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {form.sizes.map((size, index) => (
                    <div key={size.size} className="bg-gray-700 p-4 rounded-lg">
                      <label className="block text-sm font-medium mb-2">Size {size.size}</label>
                      <input
                        type="number"
                        value={size.quantity}
                        onChange={(e) => handleSizeChange(index, e.target.value)}
                        min="0"
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <span>Colors</span>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{form.colors.length} colors</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {form.colors.map((color, index) => (
                    <div key={color.color} className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">{color.color}</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2">Quantity</label>
                          <input
                            type="number"
                            value={color.quantity}
                            onChange={(e) => handleColorChange(index, 'quantity', e.target.value)}
                            min="0"
                            className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Color Image</label>
                          {color.image_url ? (
                            <div className="mb-2">
                              <img src={color.image_url} alt={`${color.color} variant`} className="h-24 object-contain rounded-lg bg-gray-900" />
                            </div>
                          ) : (
                            <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg w-full h-24 flex items-center justify-center mb-2 bg-gray-900">
                              <span className="text-gray-500 text-sm">No image</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleColorChange(index, 'image_file', e.target.files[0])}
                            className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-lg transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-gray-800 rounded-xl p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
              <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Add New Category
              </Dialog.Title>
              <button onClick={() => setCategoryModalOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category Image</label>
                {newCategoryImageUrl ? (
                  <img src={newCategoryImageUrl} alt="Preview" className="mb-2 max-h-32 rounded-lg object-contain bg-gray-900" />
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    setNewCategoryImage(e.target.files[0]);
                    setNewCategoryImageUrl(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : '');
                  }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-lg transition-all disabled:opacity-50"
                >
                  {categoryLoading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={editCategoryModalOpen} onClose={() => setEditCategoryModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-gray-800 rounded-xl p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
              <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Edit Category
              </Dialog.Title>
              <button onClick={() => setEditCategoryModalOpen(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name *</label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={e => setEditCategoryName(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category Image</label>
                {editCategoryImageUrl ? (
                  <img src={editCategoryImageUrl} alt="Preview" className="mb-2 max-h-32 rounded-lg object-contain bg-gray-900" />
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    setEditCategoryImage(e.target.files[0]);
                    setEditCategoryImageUrl(e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : '');
                  }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setEditCategoryModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editCategoryLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-lg transition-all disabled:opacity-50"
                >
                  {editCategoryLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Product Preview Modal */}
      {previewProduct && (
        <Dialog open={true} onClose={closePreview} className="relative z-50">
          <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-3xl bg-gray-800 rounded-xl p-6 text-white shadow-2xl">
              <button 
                onClick={closePreview} 
                className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <div className="relative w-full max-h-[50vh] mb-6 rounded-xl overflow-hidden bg-gray-900">
                {previewProduct.colors?.[imagePreviewIndex]?.image_url || previewProduct.image_url ? (
                  <img
                    src={previewProduct.colors?.[imagePreviewIndex]?.image_url || previewProduct.image_url}
                    alt={previewProduct.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                
                {previewProduct.colors && previewProduct.colors.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="flex gap-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                      {previewProduct.colors.map((color, idx) => (
                        <button
                          key={color.color}
                          onClick={() => setImagePreviewIndex(idx)}
                          className={`w-3 h-3 rounded-full ${
                            imagePreviewIndex === idx 
                              ? 'bg-purple-500 ring-2 ring-purple-300' 
                              : 'bg-gray-600'
                          }`}
                          title={color.color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold">{previewProduct.name}</h2>
                  <span className="bg-purple-900 text-purple-200 px-3 py-1 rounded-full text-sm">
                    {previewProduct.category}
                  </span>
                </div>
                
                <p className="text-gray-400">{previewProduct.description}</p>
                
                <div className="flex items-center justify-between">
                  <p className="text-green-400 font-bold text-xl">{previewProduct.price} DZD</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${previewProduct.in_stock ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {previewProduct.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="font-bold mb-3">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewProduct.sizes?.filter(s => s.quantity > 0).map((size) => (
                      <span 
                        key={size.size} 
                        className="px-3 py-2 bg-gray-700 rounded-lg text-sm flex items-center gap-1"
                      >
                        <span className="font-semibold">{size.size}</span>
                        <span className="text-gray-400">({size.quantity})</span>
                      </span>
                    ))}
                  </div>
                </div>
                
                {previewProduct.colors && (
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-bold mb-3">Available Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {previewProduct.colors?.filter(c => c.quantity > 0).map((color, idx) => (
                        <button
                          key={color.color}
                          onClick={() => setImagePreviewIndex(idx)}
                          className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                            imagePreviewIndex === idx 
                              ? 'bg-purple-900 ring-2 ring-purple-500' 
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-500" 
                            style={{ backgroundColor: color.color.toLowerCase() }}
                          />
                          <span>{color.color}</span>
                          <span className="text-gray-400">({color.quantity})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  )
}