import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Profileverification from "./pages/Profileverification";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";
import Offer from "./pages/Offer";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Connection from "./pages/Connection";
import Like from "./pages/Like";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import OtpVerification from "./pages/OtpVerification";
import Admin from "./pages/Admin";
import Features from "./pages/Features";
import Resources from "./pages/Resources";
import DownloadApp from "./pages/DownloadApp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import AboutUs from "./pages/AboutUs";
import CookiePolicy from "./pages/CookiePolicy";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { hasToken, getProfileStatus } from "./utils/auth";

// Root route component - shows Register if not authenticated, Home if authenticated
const RootRoute = () => {
  const isAuthenticated = hasToken();
  const isProfileComplete = isAuthenticated ? getProfileStatus() : false;

  // If not authenticated, show Register
  if (!isAuthenticated) {
    return <Register />;
  }

  // If authenticated but profile not complete, show profile completion
  if (!isProfileComplete) {
    return <Profileverification />;
  }

  // If authenticated and profile complete, show Home
  return <Home />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="891198943361-e6pu3ag403m4s97gvbiuasgljgfbvcda.apps.googleusercontent.com">
    <Router>
      <Routes>
        {/* Root route - Shows Register if not authenticated, Home if authenticated */}
        <Route
          path="/"
          element={<RootRoute />}
        />
        
        {/* Redirect /Login and /login to / */}
        <Route
          path="/Login"
          element={<Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={<Navigate to="/" replace />}
        />
        
        {/* Public Routes - Redirect to home if already authenticated */}
        <Route
          path="/Register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route 
          path="/profile-complete" 
          element={<Profileverification />} 
        />

        {/* Protected Routes - Require authToken and isProfileComplete === "true" */}
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userprofile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offer"
          element={
            <ProtectedRoute>
              <Offer />
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
          path="/editProfile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/connection"
          element={
            <ProtectedRoute>
              <Connection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/like"
          element={
            <ProtectedRoute>
              <Like />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/features"
          element={
            <ProtectedRoute>
              <Features />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/download-app"
          element={
            <ProtectedRoute>
              <DownloadApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms-of-use"
          element={
            <ProtectedRoute>
              <TermsOfUse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about-us"
          element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cookie-policy"
          element={
            <ProtectedRoute>
              <CookiePolicy />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
