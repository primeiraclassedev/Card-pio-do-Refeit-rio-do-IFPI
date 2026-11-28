export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://refeitoriodoifpi.vercel.app/sitemap.xml',
  };
}