import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import CartDrawer from "../components/Cart/CartDrawer";
import FloatingAIChat from "../components/Chat/FloatingAIChat";

function PublicLayout() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
      <CartDrawer />
      <FloatingAIChat />
    </div>
  );
}

export default PublicLayout;
