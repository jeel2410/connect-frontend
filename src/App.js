import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
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
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect to home if already authenticated */}
        <Route
          path="/Login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/Register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/profile-complete" element={<Profileverification />} />

        {/* Protected Routes - Require authToken and isProfileComplete === "true" */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
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
      </Routes>
    </Router>
  );
}

export default App;
