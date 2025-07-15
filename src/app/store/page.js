export const dynamic = 'force-dynamic';
export const ssr = false;

export default function StorePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-10 text-center">Shop</h1>
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg mb-4">Store is loading...</p>
          <p className="text-sm text-gray-400">Please wait while we load the products.</p>
          <div className="mt-8">
            <a 
              href="/store/client" 
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Enter Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
