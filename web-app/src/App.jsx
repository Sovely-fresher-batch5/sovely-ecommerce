import { Suspense, lazy, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import LoadingScreen from './components/LoadingScreen';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './ErrorBoundary';
const ManageNDR = lazy(() => import('./components/ManageNDR'));

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

// FIX: Added the missing Settings import here!
const Settings = lazy(() => import('./components/Settings'));

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
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/product/:productId" element={<ProductPage />} />
                        <Route path="/search" element={<SearchResults />} />

                        <Route
                            path="/my-account"
                            element={
                                <ProtectedRoute>
                                    <MyAccount />
                                </ProtectedRoute>
                            }
                        />
                        
                        {/* FIX: The Settings Route */}
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/manage-ndr"
                            element={
                                <ProtectedRoute>
                                    <ManageNDR />
                                </ProtectedRoute>
                            }
                        />

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
                    </Route>

                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

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