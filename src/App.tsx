
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Buyers from "./pages/Buyers";
import Sellers from "./pages/Sellers";
import Profile from "./pages/Profile";
import StakeholderProfile from "./pages/StakeholderProfile";
import Cart from "./pages/Cart";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  
  if (loading) return null;
  
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
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/items"
              element={
                <ProtectedRoute>
                  <Items />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyers"
              element={
                <ProtectedRoute>
                  <Buyers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sellers"
              element={
                <ProtectedRoute>
                  <Sellers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyers/:id"
              element={
                <ProtectedRoute>
                  <StakeholderProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sellers/:id"
              element={
                <ProtectedRoute>
                  <StakeholderProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
