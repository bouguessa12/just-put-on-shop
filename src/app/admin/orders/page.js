"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setOrders(data)
    setLoading(false)
  }

  const updateOrderStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) fetchOrders()
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} />
          <h1 className="text-xl font-semibold">Shop Just Put On</h1>
        </div>
        <nav className="flex gap-6">
          <Link href="/admin" className="hover:underline">🏠 Home</Link>
          <Link href="/admin/dashboard" className="hover:underline">🛍️ Manage Store</Link>
          <Link href="/admin/orders" className="hover:underline font-bold">📦 Orders</Link>
        </nav>
      </header>

      <main className="p-6">
        <h2 className="text-2xl font-bold mb-6">📦 Manage Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-4 rounded shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">Customer: {order.customer_name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Total: {order.total_price || 0} DZD</p>
                    <p className="text-sm text-gray-600">Status: <span className="font-medium text-blue-600">{order.status}</span></p>
                    <p className="text-sm text-gray-400">Placed at: {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
