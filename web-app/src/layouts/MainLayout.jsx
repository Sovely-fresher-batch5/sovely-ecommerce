import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // or from '../components/Navbar'
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      {/* <Outlet /> is where the child routes (like LandingPage) will be injected */}
      <main>
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;