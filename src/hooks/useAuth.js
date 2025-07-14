// src/hooks/useAuth.js
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data: { user } }) => setUser(user))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
