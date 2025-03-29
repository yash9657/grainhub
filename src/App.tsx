import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

// Lazy load components
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Items = lazy(() => import("./pages/Items"));
const Buyers = lazy(() => import("./pages/Buyers"));
const Sellers = lazy(() => import("./pages/Sellers"));
const Profile = lazy(() => import("./pages/Profile"));
const StakeholderProfile = lazy(() => import("./pages/StakeholderProfile"));
const Cart = lazy(() => import("./pages/Cart"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="container mx-auto p-4">
    <Skeleton className="h-[500px] w-full rounded-lg" />
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  
  if (loading) return <LoadingFallback />;
  
  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <Suspense fallback={<LoadingFallback />}>
                <Landing />
              </Suspense>
            } />
            <Route path="/login" element={
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            } />
            <Route path="/signup" element={
              <Suspense fallback={<LoadingFallback />}>
                <Signup />
              </Suspense>
            } />
            <Route path="/complete-profile" element={
              <Suspense fallback={<LoadingFallback />}>
                <CompleteProfile />
              </Suspense>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/items" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Items />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/buyers" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Buyers />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/sellers" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Sellers />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/buyers/:id" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <StakeholderProfile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/sellers/:id" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <StakeholderProfile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Cart />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <Suspense fallback={<LoadingFallback />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;