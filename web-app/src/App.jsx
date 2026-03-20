import { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LoadingScreen from './components/LoadingScreen';
import AdminRoute from './components/AdminRoute';
import ResellerRoute from './components/ResellerRoute'; // Added ResellerRoute import
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './ErrorBoundary';

// Lazy loaded components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const MyAccount = lazy(() => import('./components/MyAccount'));
const Invoices = lazy(() => import('./components/Invoices')); // <-- Added Invoices import
const QuickOrder = lazy(() => import('./components/QuickOrder')); // <-- Added QuickOrder import
const Checkout = lazy(() => import('./components/Checkout'));
const Orders = lazy(() => import('./components/Orders'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
const Wallet = lazy(() => import('./components/Wallet'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SearchResults = lazy(() => import('./components/SearchResults'));

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { user, loading } = useContext(AuthContext);

    if (loading) return <LoadingScreen />;

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {/* Main Layout wraps the navbar and footer around these routes */}
                    <Route element={<MainLayout />}>
                        {/* --- PUBLIC ROUTES --- */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/product/:productId" element={<ProductPage />} />
                        <Route path="/search" element={<SearchResults />} />

                        {/* --- PROTECTED (GENERAL USER) ROUTES --- */}
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders/:id/track"
                            element={
                                <ProtectedRoute>
                                    <OrderTracking />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/wallet"
                            element={
                                <ProtectedRoute>
                                    <Wallet />
                                </ProtectedRoute>
                            }
                        />

                        {/* --- RESELLER ONLY HUB --- */}
                        {/* We use ResellerRoute here to wrap the B2B specific dashboards */}
                        <Route element={<ResellerRoute />}>
                            <Route path="/my-account" element={<MyAccount />} />
                            <Route path="/invoices" element={<Invoices />} />
                            <Route path="/quick-order" element={<QuickOrder />} />
                        </Route>
                    </Route>

                    {/* --- AUTH ROUTES (No Navbar/Footer usually) --- */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* --- ADMIN ROUTING --- */}
                    <Route
                        path="/admin/*"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

export default App;
