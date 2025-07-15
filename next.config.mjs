/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  images: {
    domains: [
      'images.unsplash.com',
      'i.pinimg.com',
      'supabase.co',
      '*.supabase.co',
      '*.supabase.in',
      '*.supabase.net',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.net',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
