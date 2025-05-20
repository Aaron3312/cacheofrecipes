/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'spoonacular.com',
      'images.spoonacular.com',
      'img.spoonacular.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'i.pinimg.com',
      'placehold.co'
    ],
  },
  eslint: {
    dirs: ['src'],
  }
};

module.exports = nextConfig;