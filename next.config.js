/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains:  ['th.bing.com', 'gateway.pinata.cloud/ipfs/']
   },

}

// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         reactStrictMode: true,
//         images: {
//           domains: ['th.bing.com', 'gateway.pinata.cloud/ipfs/']
//         },
//         source: 'http://localhost:3000',
//         destination: 'https://gateway.pinata.cloud/ipfs/:path*'
//       }
//     ]
//   }
// }

module.exports = nextConfig
