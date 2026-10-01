import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="site-layout min-h-screen selection:bg-[#d8c5f3] selection:text-[#281b3d]">
      <Navbar />
      <main className={isHome ? '' : 'page-content'}>{children}</main>
      <Footer />
    </div>
  );
}
