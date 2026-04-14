import "../styles/index.css"; // Naik satu tingkat ke src, lalu ke styles
import MainLayout from "../components/Layout"; // Naik satu tingkat ke src, lalu ke components

export default function App({ Component, pageProps, router }) {
  // Jika rute adalah '/' (landing page) atau '/login', jangan pakai layout dashboard
  const isPlainPage = 
  router.pathname === '/' || 
  router.pathname === '/login' ||
  router.pathname === '/register' ||
  router.pathname === '/forgot-password';
  if (isPlainPage) {
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}