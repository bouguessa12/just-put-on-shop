

export const metadata = {
  title: 'Just Put On Shop',
  description: 'Simple men’s clothing store',
}

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Admin Dashboard</h1>
      {children}
    </div>
  )
}

