// Setup script to create admin user
// Run this in your browser console on your deployed site or locally

const createAdminUser = async () => {
  const email = prompt('Enter admin email:')
  const password = prompt('Enter admin password (min 6 characters):')
  
  if (!email || !password) {
    alert('Email and password are required')
    return
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters')
    return
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    
    if (error) {
      alert('Error creating user: ' + error.message)
    } else {
      alert('Admin user created successfully! You can now log in at /admin/login')
    }
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

// Instructions for use:
console.log(`
=== ADMIN USER SETUP ===

To create your first admin user:

1. Go to your deployed site (or localhost:3000)
2. Open browser console (F12)
3. Copy and paste this entire script
4. Run: createAdminUser()

This will prompt you for email and password and create the admin user.

Then you can log in at: /admin/login
`)

// Export the function for use
window.createAdminUser = createAdminUser 