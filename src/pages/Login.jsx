import React, { useState } from "react";
import AuthImage from "../component/AuthImage"
import logo from "../../src/assets/image/connect_logo.png"
import mobileIcon from "../../src/assets/image/mobile.png";
import passwordIcon from "../../src/assets/image/password.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleLogin = () => {
    console.log("Login submitted");
    navigate("/verification");
  };

  return (
    <div className="login-page">
      <AuthImage />
      <div className="login-container">
        <div className="login-header">
          <img src={logo}></img>
        </div>

        <div className="login-content">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Sign in to continue</p>

          <div className="login-form">
            {/* <div className="form-group">
              <input
                type="text"
                className="form-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div> */}
            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <img src={mobileIcon}></img>
                </div>
                <div className="input-content">
                  <label className="input-label">
                    Mobile Number & Email ID
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 96548-20314"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              {/* <div className="password-input-wrapper"> */}
              <div className="input-wrapper">
                <div className="input-icon">
                  <img src={passwordIcon}></img>
                </div>
                <div className="input-content">
                  <label className="input-label">
                    password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                  />
                </div>
              </div>
              {/* </div> */}
            </div>

            <button
              type="button"
              className="login-button"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
          <button type="button" className="google-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M18.1713 8.36785H17.5001V8.33335H10.0001V11.6667H14.7096C14.0225 13.607 12.1763 15 10.0001 15C7.23882 15 5.00008 12.7613 5.00008 10C5.00008 7.23869 7.23882 5.00002 10.0001 5.00002C11.2746 5.00002 12.4342 5.48119 13.3171 6.26627L15.6742 3.90919C14.1859 2.52202 12.1951 1.66669 10.0001 1.66669C5.39758 1.66669 1.66675 5.39752 1.66675 10C1.66675 14.6025 5.39758 18.3334 10.0001 18.3334C14.6026 18.3334 18.3334 14.6025 18.3334 10C18.3334 9.44085 18.2759 8.89552 18.1713 8.36785Z"
                fill="#FFC107"
              />
              <path
                d="M2.62744 6.12119L5.36536 8.12952C6.10619 6.29535 7.90036 5.00002 9.99994 5.00002C11.2744 5.00002 12.4341 5.48119 13.3169 6.26627L15.6741 3.90919C14.1857 2.52202 12.1949 1.66669 9.99994 1.66669C6.79911 1.66669 4.02327 3.47385 2.62744 6.12119Z"
                fill="#FF3D00"
              />
              <path
                d="M10.0001 18.3333C12.1526 18.3333 14.1101 17.5095 15.5871 16.17L13.0079 13.9875C12.1431 14.6452 11.0864 15 10.0001 15C7.83177 15 5.99094 13.6179 5.29844 11.6891L2.58594 13.783C3.96511 16.4816 6.76177 18.3333 10.0001 18.3333Z"
                fill="#4CAF50"
              />
              <path
                d="M18.1713 8.36788H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3334 14.1667 18.3334 10C18.3334 9.44087 18.2758 8.89554 18.1713 8.36788Z"
                fill="#1976D2"
              />
            </svg>
            <span>Continue With Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
