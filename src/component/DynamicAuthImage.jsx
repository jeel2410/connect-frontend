import React, { useState, useEffect, useMemo } from "react";
import sideImage from "../../src/assets/image/sideImage.png";
import API_BASE_URL from "../utils/config";

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const useBanners = () => {
  const [desktopBanners, setDesktopBanners] = useState([]);
  const [mobileBanners, setMobileBanners] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/list/auth-banners`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.banners) {
          const all = data.data.banners;
          setDesktopBanners(all.filter((b) => b.type === "desktop"));
          setMobileBanners(all.filter((b) => b.type === "mobile"));
        }
      })
      .catch(() => {});
  }, []);

  return { desktopBanners, mobileBanners };
};

/**
 * DynamicAuthImage — drop-in replacement for the static side-image-container.
 *
 * Desktop: renders the .side-image-container with a randomly picked desktop banner
 *          (or the default sideImage if none exist).
 * Mobile:  the .side-image-container is already hidden via CSS at ≤768px.
 *          When mobile banners exist, also renders a .auth-mobile-banner above the form.
 *
 * Usage: place <DynamicAuthImage /> in the same spot as the old
 *        <div className="side-image-container">...</div>
 *        and it will additionally inject a mobile banner when applicable.
 */
const DynamicAuthImage = () => {
  const { desktopBanners, mobileBanners } = useBanners();

  const desktopSrc = useMemo(
    () => (desktopBanners.length > 0 ? pickRandom(desktopBanners).imageUrl : null),
    [desktopBanners]
  );

  const mobileSrc = useMemo(
    () => (mobileBanners.length > 0 ? pickRandom(mobileBanners).imageUrl : null),
    [mobileBanners]
  );

  return (
    <>
      {/* Desktop side panel */}
      <div className="side-image-container">
        <img
          src={desktopSrc || sideImage}
          alt="Connect illustration"
          className="side-image"
        />
      </div>

      {/* Mobile top banner — only rendered when a mobile banner exists */}
      {mobileSrc && (
        <div className="auth-mobile-banner">
          <img src={mobileSrc} alt="Connect" className="auth-mobile-banner-img" />
        </div>
      )}
    </>
  );
};

export default DynamicAuthImage;
