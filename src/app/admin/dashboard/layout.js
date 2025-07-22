'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/admin/login')
          return
        }
        setUser(user)
        setLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {user && (
              <span className="text-sm text-gray-300 break-all">
                Logged in as: {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

