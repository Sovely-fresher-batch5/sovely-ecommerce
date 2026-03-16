import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout'; // Import our new layout

// Lazy load pages
const LandingPage = lazy(() => import('./components/LandingPage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const MyAccount = lazy(() => import('./components/MyAccount'));
const Checkout = lazy(() => import('./components/Checkout'));
const Orders = lazy(() => import('./components/Orders'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SearchResults = lazy(() => import('./components/SearchResults'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ROUTES WITH STANDARD NAVBAR & FOOTER */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id/track" element={<OrderTracking />} />
          <Route path="/search" element={<SearchResults />} />
        </Route>

        {/* ROUTES WITHOUT THE NAVBAR (Clean slate) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ADMIN ROUTES (Will have their own Admin Layout inside the component) */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
}

export default App;