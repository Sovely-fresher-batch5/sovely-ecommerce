import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Signup from './components/Signup'
import ForgotPassword from './components/ForgotPassword'
import MyAccount from './components/MyAccount'
import ProductPage from './components/ProductPage'
import LoadingScreen from './components/LoadingScreen'
import Checkout from './components/Checkout'
import Orders from './components/Orders'
import OrderTracking from './components/OrderTracking' // New Component!
import AdminDashboard from './components/AdminDashboard'
import Analytics from './components/Analytics'
import ManageOrders from './components/ManageOrders'
import ManageNDR from './components/ManageNDR'
import WalletPortal from './components/WalletPortal'
import FullCartPage from './components/FullCartPage'
import BulkOrder from './components/BulkOrder'
import Contact from './components/Contact'
import CourierService from './components/CourierService'

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id/track" element={<OrderTracking />} /> {/* New Route */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/manage-orders" element={<ManageOrders />} />
        <Route path="/manage-ndr" element={<ManageNDR />} />
        <Route path="/wallet" element={<WalletPortal />} />
        <Route path="/cart" element={<FullCartPage />} />
        <Route path="/bulk-order" element={<BulkOrder />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/courier-service" element={<CourierService />} />
      </Routes>
    </Suspense>
  )
}

export default App