import "../styles/globals.css"; // Sesuaikan dengan nama file css utama kamu
import MainLayout from "../components/Layout";
import { Toaster } from "sonner"; // 1. Import Toaster

export default function App({ Component, pageProps, router }) {
  // Tambahkan halaman verifikasi dan reset password ke daftar "Plain Page"
  // agar tidak muncul sidebar dashboard di halaman tersebut.
  const isPlainPage = 
    router.pathname === '/' || 
    router.pathname === '/login' ||
    router.pathname === '/register' ||
    router.pathname === '/forgot-password' ||
    router.pathname === '/verify-otp' || 
    router.pathname === '/reset-password';

  if (isPlainPage) {
    return (
      <>
        {/* Pasang Toaster di sini agar notifikasi muncul di halaman login/register */}
        <Toaster position="top-center" richColors closeButton />
        <Component {...pageProps} />
      </>
    );
  }

  return (
    <MainLayout>
      {/* Pasang Toaster di sini agar notifikasi muncul di dalam dashboard */}
      <Toaster position="top-center" richColors closeButton />
      <Component {...pageProps} />
    </MainLayout>
  );
}