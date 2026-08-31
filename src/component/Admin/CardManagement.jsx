import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight, XCircle, Users, Download, Mail, MessageSquare } from "lucide-react";
import { getCards, createCard, updateCard, deleteCard, getPopupSetting, updatePopupSetting, getCities, getPositions, getCardClicks, broadcastCardMailer, broadcastCardSms, getOfferCategories, createOfferCategory, getAllCardClicksCount, broadcastAllCardsMailer, sendTestCardEmail } from "../../utils/adminApi";
import { resolveImageUrl } from "../../utils/avatarHelper";

const DEFAULT_OFFER_MAILER_TEMPLATE = `<h2 style="margin:0 0 8px;color:#081332;font-size:22px;font-weight:700;">Offer of the Day! 🎁</h2>
<p style="margin:0 0 20px;color:#495057;font-size:15px;line-height:1.7;">
  Hi <strong>{name}</strong>,<br/>
  Here is today's exclusive offer handpicked for you on Connect India. Check it out and unlock great benefits today!
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:24px;overflow:hidden;">
  {offerLogo}
  {offerImage}
  <tr>
    <td style="padding:20px 24px;">
      <h3 style="margin:0 0 8px;color:#081332;font-size:18px;font-weight:700;">{offerName}</h3>
      <p style="margin:0 0 16px;color:#495057;font-size:14px;line-height:1.6;">{offerDescription}</p>
      {offerFeatures}
    </td>
  </tr>
</table>`;

const CardManagement = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    logo_image: null,
    logo_image_preview: null,
    features: [],
    eligibles: [],
    targetAgeMin: "",
    targetAgeMax: "",
    targetCities: [],
    targetPositions: [],
    offer_image: null,
    offer_image_preview: null,
    isActive: true,
    showInPopup: true,
    showInMailer: true,
    category: "",
    customSubject: "",
    customHtml: ""
  });
  const [offerCategories, setOfferCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newEligible, setNewEligible] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPopupEnabled, setIsPopupEnabled] = useState(true);
  const [availableCities, setAvailableCities] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [isClicksModalOpen, setIsClicksModalOpen] = useState(false);
  const [selectedCardClicks, setSelectedCardClicks] = useState([]);
  const [selectedCardForClicks, setSelectedCardForClicks] = useState(null);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [clicksError, setClicksError] = useState(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastHtml, setBroadcastHtml] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const itemsPerPage = 10;
  const [clickFilterDays, setClickFilterDays] = useState("all");
  const [broadcastScope, setBroadcastScope] = useState("single"); // "single" or "all"
  const [allClickersCount, setAllClickersCount] = useState(0);
  const [loadingAllClickersCount, setLoadingAllClickersCount] = useState(false);

  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [testingMail, setTestingMail] = useState(false);
  const [testMailFeedback, setTestMailFeedback] = useState(null);

  const handleSendTestCardMail = async (e) => {
    if (e) e.preventDefault();
    if (!testEmailAddress) {
      setTestMailFeedback({ type: "error", message: "Please enter a recipient email address" });
      return;
    }

    try {
      setTestingMail(true);
      setTestMailFeedback(null);

      const testData = {
        email: testEmailAddress,
        subject: formData.customSubject ? formData.customSubject.trim() : "",
        customHtml: formData.customHtml,
        name: formData.name,
        description: formData.description,
        url: formData.url,
        logo_image: formData.logo_image_preview,
        offer_image: formData.offer_image_preview,
        features: formData.features
      };

      const result = await sendTestCardEmail(testData);
      setTestMailFeedback({ type: "success", message: result.message || "Test email sent successfully" });
    } catch (err) {
      setTestMailFeedback({ type: "error", message: err.message || "Failed to send test email" });
    } finally {
      setTestingMail(false);
    }
  };

  // Fetch cards and settings from API
  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCards(currentPage, itemsPerPage, searchTerm, null, selectedCategoryFilter);

      if (response.success && response.data) {
        setCards(response.data.cards || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch cards");
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [currentPage, selectedCategoryFilter]);

  const fetchOfferCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getOfferCategories();
      if (response.success && response.data) {
        setOfferCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch offer categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setLoadingCategories(true);
      const response = await createOfferCategory(newCategoryName.trim());
      if (response.success && response.data) {
        setNewCategoryName("");
        await fetchOfferCategories();
        alert("Category created successfully!");
      }
    } catch (err) {
      alert(err.message || "Failed to create category");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch popup setting, cities, positions, and offer categories
  useEffect(() => {
    const fetchSettingAndDropdowns = async () => {
      try {
        const res = await getPopupSetting();
        if (res.success) {
          setIsPopupEnabled(res.data ? res.data.isPopupEnabled : res.isPopupEnabled);
        }
      } catch (err) {
        console.error("Failed to fetch popup setting", err);
      }

      try {
        const cityRes = await getCities(1, 1000, "", true);
        if (cityRes.success && cityRes.data) {
          setAvailableCities(cityRes.data.cities || []);
        }
        const posRes = await getPositions(1, 1000, "", true);
        if (posRes.success && posRes.data) {
          setAvailablePositions(posRes.data.positions || []);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }

      await fetchOfferCategories();
    };
    fetchSettingAndDropdowns();
  }, []);

  const handleTogglePopupSetting = async (e) => {
    const newValue = e.target.checked;
    setIsPopupEnabled(newValue);
    try {
      await updatePopupSetting(newValue);
    } catch (err) {
      alert("Failed to update global popup setting: " + err.message);
      setIsPopupEnabled(!newValue); // revert
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchCards();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const totalPages = pagination.totalPages;
  const totalCards = pagination.totalItems;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewClicks = async (card, days = "all") => {
    setSelectedCardForClicks(card);
    setIsClicksModalOpen(true);
    setLoadingClicks(true);
    setClicksError(null);
    setClickFilterDays(days);
    try {
      const response = await getCardClicks(card._id, days);
      if (response.success && response.data) {
        setSelectedCardClicks(response.data.clicks || []);
      } else {
        setSelectedCardClicks([]);
      }
    } catch (err) {
      setClicksError(err.message || "Failed to load click logs");
      console.error(err);
    } finally {
      setLoadingClicks(false);
    }
  };

  const downloadClicksCSV = () => {
    if (!selectedCardClicks.length) return;

    // Create CSV content
    const headers = ["Name", "Mobile", "Email ID", "Click Count", "Last Clicked At"];
    const rows = selectedCardClicks.map(click => [
      click.fullName || "N/A",
      click.mobile || "N/A",
      click.email || "N/A",
      click.clickCount || 0,
      click.lastClickedAt ? new Date(click.lastClickedAt).toLocaleString() : "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clicks_offer_${selectedCardForClicks?.name || "card"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenBroadcast = () => {
    setBroadcastScope("single");
    setIsClicksModalOpen(false);
    setBroadcastSubject(selectedCardForClicks?.name || "Special Offer");

    // Set a premium styled HTML template pre-filled with the offer information
    const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #EC7523; margin-top: 0;">Hello {{name}},</h2>
  <p>We noticed you were interested in our offer: <strong>${selectedCardForClicks?.name || ''}</strong>.</p>
  
  <div style="background-color: #fff7ed; border-left: 4px solid #EC7523; padding: 15px; margin: 20px 0; border-radius: 4px;">
    <h3 style="margin-top: 0; color: #d45a09;">${selectedCardForClicks?.name || ''}</h3>
    <p style="color: #4b5563; line-height: 1.5; font-size: 14px;">${selectedCardForClicks?.description || ''}</p>
    
    ${selectedCardForClicks?.features && selectedCardForClicks.features.length > 0 ? `
      <h4 style="margin-bottom: 8px; color: #1f2937;">Key Features:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
        ${selectedCardForClicks.features.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join('')}
      </ul>
    ` : ''}
  </div>

  <p style="margin-bottom: 25px; line-height: 1.6;">Don't miss out on this opportunity! Click the button below to get started or view details now.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${selectedCardForClicks?.url || '#'}" target="_blank" style="background-color: #EC7523; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Check Offer Now</a>
  </div>

  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">You received this email because you clicked on this offer in Connect.</p>
</div>
    `.trim();

    setBroadcastHtml(defaultTemplate);
    setIsBroadcastModalOpen(true);
  };

  const handleOpenAllBroadcast = async () => {
    setBroadcastScope("all");
    setBroadcastSubject("Exclusive Offers for Connect Members");

    const defaultTemplate = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #EC7523; margin-top: 0;">Hello {{name}},</h2>
  <p>We noticed you have been exploring our exclusive card offers on Connect.</p>
  
  <p style="margin-bottom: 25px; line-height: 1.6;">Don't miss out on these opportunities! Visit the offers page on Connect to view all personalized deals and partner benefits tailored for you.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://connect.in/offer" target="_blank" style="background-color: #EC7523; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore All Offers</a>
  </div>

  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">You received this email because you clicked on offers in Connect within the last 15 days.</p>
</div>
    `.trim();

    setBroadcastHtml(defaultTemplate);
    setIsBroadcastModalOpen(true);

    setLoadingAllClickersCount(true);
    try {
      const response = await getAllCardClicksCount(15);
      if (response.success && response.data) {
        setAllClickersCount(response.data.count);
      }
    } catch (err) {
      console.error("Failed to load clickers count:", err);
    } finally {
      setLoadingAllClickersCount(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastHtml.trim()) {
      alert("Subject and body cannot be empty");
      return;
    }

    setSendingBroadcast(true);
    try {
      if (broadcastScope === "all") {
        const response = await broadcastAllCardsMailer(broadcastSubject, broadcastHtml, 15);
        if (response.success) {
          alert(`Mailer sent successfully to all offers clickers: ${response.data.sent} users! (${response.data.skipped} skipped)`);
          setIsBroadcastModalOpen(false);
        }
      } else {
        const response = await broadcastCardMailer(selectedCardForClicks._id, broadcastSubject, broadcastHtml, clickFilterDays);
        if (response.success) {
          alert(`Mailer sent successfully to ${response.data.sent} users! (${response.data.skipped} skipped)`);
          setIsBroadcastModalOpen(false);
        }
      }
    } catch (err) {
      alert(err.message || "Failed to send mailer broadcast");
      console.error(err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleSendSmsBroadcast = async () => {
    const activeCount = selectedCardClicks.length;
    const confirmMessage = `Are you sure you want to send the eligibility SMS to the ${activeCount} user(s) who clicked "${selectedCardForClicks?.name}" in the selected timeframe?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSendingSms(true);
    try {
      const response = await broadcastCardSms(selectedCardForClicks._id, clickFilterDays);
      if (response.success) {
        alert(`SMS broadcast successfully initiated for ${response.data?.sent || activeCount} users!`);
      } else {
        alert(response.message || "Failed to send SMS broadcast");
      }
    } catch (err) {
      alert(err.message || "Failed to send SMS broadcast");
    } finally {
      setSendingSms(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      description: "",
      url: "",
      logo_image: null,
      logo_image_preview: null,
      features: [],
      eligibles: [],
      targetAgeMin: "",
      targetAgeMax: "",
      targetCities: [],
      targetPositions: [],
      offer_image: null,
      offer_image_preview: null,
      isActive: true,
      showInPopup: true,
      showInMailer: true,
      category: "",
      customSubject: "",
      customHtml: DEFAULT_OFFER_MAILER_TEMPLATE
    });
    setNewFeature("");
    setNewEligible("");
    setNewCity("");
    setNewPosition("");
    setTestEmailAddress("");
    setTestMailFeedback(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name || "",
      description: card.description || "",
      url: card.url || "",
      logo_image: null,
      logo_image_preview: resolveImageUrl(card.logo_image) || null,
      features: card.features && Array.isArray(card.features) ? [...card.features] : [],
      eligibles: card.eligibles && Array.isArray(card.eligibles) ? [...card.eligibles] : [],
      targetAgeMin: card.targetAgeMin !== null && card.targetAgeMin !== undefined ? card.targetAgeMin : "",
      targetAgeMax: card.targetAgeMax !== null && card.targetAgeMax !== undefined ? card.targetAgeMax : "",
      targetCities: card.targetCities && Array.isArray(card.targetCities) ? [...card.targetCities] : [],
      targetPositions: card.targetPositions && Array.isArray(card.targetPositions) ? [...card.targetPositions] : [],
      offer_image: null,
      offer_image_preview: resolveImageUrl(card.offer_image) || null,
      isActive: card.isActive !== undefined ? card.isActive : true,
      showInPopup: card.showInPopup !== undefined ? card.showInPopup : true,
      showInMailer: card.showInMailer !== undefined ? card.showInMailer : true,
      category: card.category ? (typeof card.category === 'object' ? card.category._id : card.category) : "",
      customSubject: card.customSubject || "",
      customHtml: card.customHtml || ""
    });
    setNewFeature("");
    setNewEligible("");
    setNewCity("");
    setNewPosition("");
    setTestEmailAddress("");
    setTestMailFeedback(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this card?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteCard(cardId);
      await fetchCards(); // Refresh the list
      if (currentPage > 1 && cards.length === 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      alert(err.message || "Failed to delete card");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (card) => {
    try {
      setLoading(true);
      await updateCard(card._id, { isActive: !card.isActive });
      await fetchCards();
    } catch (err) {
      alert(err.message || "Failed to update card status");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShowInPopup = async (card) => {
    try {
      setLoading(true);
      await updateCard(card._id, { showInPopup: card.showInPopup !== undefined ? !card.showInPopup : false });
      await fetchCards();
    } catch (err) {
      alert(err.message || "Failed to update card popup setting");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShowInMailer = async (card) => {
    try {
      setLoading(true);
      await updateCard(card._id, { showInMailer: card.showInMailer !== undefined ? !card.showInMailer : false });
      await fetchCards();
    } catch (err) {
      alert(err.message || "Failed to update card mailer setting");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFormData({
        ...formData,
        logo_image: file,
        logo_image_preview: URL.createObjectURL(file)
      });
    }
  };

  const handleOfferImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setFormData({
        ...formData,
        offer_image: file,
        offer_image_preview: URL.createObjectURL(file)
      });
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleAddEligible = () => {
    if (newEligible.trim()) {
      setFormData({
        ...formData,
        eligibles: [...formData.eligibles, newEligible.trim()]
      });
      setNewEligible("");
    }
  };

  const handleRemoveEligible = (index) => {
    setFormData({
      ...formData,
      eligibles: formData.eligibles.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a card name");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        url: formData.url.trim(),
        logo_image: formData.logo_image,
        features: formData.features,
        eligibles: formData.eligibles,
        targetAgeMin: formData.targetAgeMin !== "" ? Number(formData.targetAgeMin) : null,
        targetAgeMax: formData.targetAgeMax !== "" ? Number(formData.targetAgeMax) : null,
        targetCities: formData.targetCities,
        targetPositions: formData.targetPositions,
        offer_image: formData.offer_image,
        isActive: formData.isActive,
        showInPopup: formData.showInPopup,
        showInMailer: formData.showInMailer,
        category: formData.category || null,
        customSubject: formData.customSubject,
        customHtml: formData.customHtml
      };

      if (isEditModalOpen) {
        await updateCard(editingCard._id, payload);
      } else {
        await createCard(payload);
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        name: "",
        description: "",
        url: "",
        logo_image: null,
        logo_image_preview: null,
        features: [],
        eligibles: [],
        targetAgeMin: "",
        targetAgeMax: "",
        targetCities: [],
        targetPositions: [],
        offer_image: null,
        offer_image_preview: null,
        isActive: true,
        showInPopup: true,
        showInMailer: true,
        category: "",
        customSubject: "",
        customHtml: ""
      });
      setNewFeature("");
      setNewEligible("");
      setNewCity("");
      setNewPosition("");
      setEditingCard(null);
      await fetchCards(); // Refresh the list
    } catch (err) {
      alert(err.message || "Failed to save card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Offer Management</h2>
        <div className="admin-actions" style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
          <div className="popup-toggle-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
              <input
                type="checkbox"
                checked={isPopupEnabled}
                onChange={handleTogglePopupSetting}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="slider round" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: isPopupEnabled ? '#ff6f00' : '#ccc', transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '14px', width: '14px', left: isPopupEnabled ? '22px' : '4px', bottom: '3px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                }} />
              </span>
            </label>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Daily Popup Enabled</span>
          </div>

          <div className="category-adder-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #eee', paddingLeft: '15px', marginRight: '10px' }}>
            <input
              type="text"
              placeholder="New Category Name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '160px',
                outline: 'none'
              }}
              disabled={loadingCategories}
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={loadingCategories || !newCategoryName.trim()}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              + Category
            </button>
          </div>

          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="search offers"
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => {
              setSelectedCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              outline: 'none',
              cursor: 'pointer',
              color: '#333',
              height: '38px',
              minWidth: '150px'
            }}
          >
            <option value="">All Categories</option>
            {offerCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <button
            className="add-btn"
            style={{ backgroundColor: "#EC7523", borderColor: "#EC7523", color: "white" }}
            onClick={handleOpenAllBroadcast}
          >
            <Mail size={20} />
            Bulk Mail All Offers (15d)
          </button>
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={20} />
            Add Offer
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>URL</th>
              <th>Features</th>
              {/* <th>Eligibles</th> */}
              <th>Targeting</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>Offer Active</th>
              <th>Show in Popup</th>
              <th>In Mailer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="13" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="13" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan="13" className="empty-state">
                  No cards found
                </td>
              </tr>
            ) : (
              cards.map((card) => (
                <tr key={card._id}>
                  <td>
                    {card.logo_image ? (
                      <img
                        src={resolveImageUrl(card.logo_image)}
                        alt={card.name}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{card.name || "N/A"}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontWeight: '500', fontSize: '12px' }}>
                      {card.category ? (typeof card.category === 'object' ? card.category.name : card.category) : "Uncategorized"}
                    </span>
                  </td>
                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {card.description || "N/A"}
                  </td>
                  <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {card.url || "N/A"}
                  </td>
                  <td>
                    {card.features && Array.isArray(card.features) && card.features.length > 0 ? (
                      <span>{card.features.length} feature(s)</span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  {/* <td>
                    {card.eligibles && Array.isArray(card.eligibles) && card.eligibles.length > 0 ? (
                      <span>{card.eligibles.length} eligible(s)</span>
                    ) : (
                      "N/A"
                    )}
                  </td> */}
                  <td>
                    <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      <div><strong>Age:</strong> {card.targetAgeMin !== null && card.targetAgeMin !== undefined ? card.targetAgeMin : 'Any'} - {card.targetAgeMax !== null && card.targetAgeMax !== undefined ? card.targetAgeMax : 'Any'}</div>
                      <div><strong>Cities:</strong> {card.targetCities && card.targetCities.length > 0 ? `${card.targetCities.length} targeted` : 'All'}</div>
                      <div><strong>Positions:</strong> {card.targetPositions && card.targetPositions.length > 0 ? `${card.targetPositions.length} targeted` : 'All'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#f3e5f5', color: '#4a148c', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center' }}>
                      {card.views || 0}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewClicks(card)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left"
                      }}
                      title="View Click Details"
                    >
                      <span className="badge" style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} /> {card.clicks || 0}
                      </span>
                    </button>
                  </td>
                  <td>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={card.isActive !== false}
                        onChange={() => handleToggleActive(card)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={loading}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: (card.isActive !== false) ? '#22c55e' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '12px', width: '12px', left: (card.isActive !== false) ? '18px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </td>
                  <td>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={card.showInPopup !== false}
                        onChange={() => handleToggleShowInPopup(card)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={loading}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: (card.showInPopup !== false) ? '#3b82f6' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '12px', width: '12px', left: (card.showInPopup !== false) ? '18px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </td>
                  <td>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={card.showInMailer !== false}
                        onChange={() => handleToggleShowInMailer(card)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={loading}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: card.showInMailer !== false ? '#eab308' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '12px', width: '12px', left: card.showInMailer !== false ? '18px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', cursor: 'pointer' }}
                        onClick={() => handleViewClicks(card)}
                        title="View Click Logs / Send Mailer"
                        disabled={loading}
                      >
                        <Users size={16} />
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(card)}
                        title="Edit"
                        disabled={loading}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(card._id)}
                        title="Delete"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing {cards.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalCards)} of {totalCards} cards
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`pagination-number ${currentPage === page ? "active" : ""
                      }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3>Add New Offer</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Offer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter offer name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows="3"
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="Enter URL"
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={submitting}
                >
                  <option value="">Select Category</option>
                  {offerCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-groups">
                <label>Logo Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={submitting}
                />
                {formData.logo_image_preview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={resolveImageUrl(formData.logo_image_preview)}
                      alt="Preview"
                      style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </div>
              <div className="form-groups">
                <label>Offer Image (For Daily Popup)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOfferImageChange}
                  disabled={submitting}
                />
                {formData.offer_image_preview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={resolveImageUrl(formData.offer_image_preview)}
                      alt="Offer Preview"
                      style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </div>
              <div className="form-groups">
                <label>Features</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Enter feature and press Enter or click Add"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddFeature}
                    disabled={submitting}
                  >
                    Add
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          disabled={submitting}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <XCircle size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Offer Settings Section */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
                <h4 style={{ marginBottom: "12px", color: "#ff6f00" }}>Offer Settings</h4>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={submitting}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: formData.isActive ? '#22c55e' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: formData.isActive ? '22px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Active (Disable/Enable Offer)</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.showInPopup}
                        onChange={(e) => setFormData({ ...formData, showInPopup: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={submitting}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: formData.showInPopup ? '#3b82f6' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: formData.showInPopup ? '22px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Show in Daily Popup</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.showInMailer}
                        onChange={(e) => setFormData({ ...formData, showInMailer: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={submitting}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: formData.showInMailer ? '#eab308' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: formData.showInMailer ? '22px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Enable for Scheduled Mailers</span>
                  </div>
                </div>
              </div>

              {/* Targeting Criteria Section */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
                <h4 style={{ marginBottom: "10px", color: "#ff6f00" }}>Targeting Criteria (Optional)</h4>

                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                  <div className="form-groups" style={{ flex: 1 }}>
                    <label>Min Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.targetAgeMin}
                      onChange={(e) => setFormData({ ...formData, targetAgeMin: e.target.value })}
                      placeholder="e.g. 18"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-groups" style={{ flex: 1 }}>
                    <label>Max Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.targetAgeMax}
                      onChange={(e) => setFormData({ ...formData, targetAgeMax: e.target.value })}
                      placeholder="e.g. 35"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-groups" style={{ marginBottom: "15px" }}>
                  <label>Target Cities</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <select
                      className="form-input"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">-- Select City --</option>
                      {availableCities.map(city => (
                        <option key={city._id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        if (newCity && !formData.targetCities.includes(newCity)) {
                          setFormData({ ...formData, targetCities: [...formData.targetCities, newCity] });
                          setNewCity("");
                        }
                      }}
                      disabled={submitting || !newCity}
                    >
                      Add
                    </button>
                  </div>
                  {formData.targetCities.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {formData.targetCities.map((city, index) => (
                        <span
                          key={index}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: "#ffe0b2",
                            color: "#e65100",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              targetCities: formData.targetCities.filter((_, i) => i !== index)
                            })}
                            disabled={submitting}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#e65100" }}
                          >
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-groups" style={{ marginBottom: "15px" }}>
                  <label>Target Positions</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <select
                      className="form-input"
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">-- Select Position --</option>
                      {availablePositions.map(pos => (
                        <option key={pos._id} value={pos.name}>{pos.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        if (newPosition && !formData.targetPositions.includes(newPosition)) {
                          setFormData({ ...formData, targetPositions: [...formData.targetPositions, newPosition] });
                          setNewPosition("");
                        }
                      }}
                      disabled={submitting || !newPosition}
                    >
                      Add
                    </button>
                  </div>
                  {formData.targetPositions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {formData.targetPositions.map((position, index) => (
                        <span
                          key={index}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: "#e8f5e9",
                            color: "#1b5e20",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {position}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              targetPositions: formData.targetPositions.filter((_, i) => i !== index)
                            })}
                            disabled={submitting}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#1b5e20" }}
                          >
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Temporarily commented out eligibility criteria */}
              {/* <div className="form-groups">
                <label>Eligibles</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={newEligible}
                    onChange={(e) => setNewEligible(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEligible();
                      }
                    }}
                    placeholder="Enter eligible and press Enter or click Add"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddEligible}
                    disabled={submitting}
                  >
                    Add
                  </button>
                </div>
                {formData.eligibles.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {formData.eligibles.map((eligible, index) => (
                      <span key={index} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "#f0f0f0", borderRadius: "4px", fontSize: "14px" }}>
                        {eligible}
                        <button type="button" onClick={() => handleRemoveEligible(index)} disabled={submitting} style={{ background: "none", border: "none", cursor: "pointer", padding: "0", display: "flex", alignItems: "center" }}>
                          <XCircle size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              {/* Custom HTML Template Section */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px", marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: 0, color: "#ff6f00" }}>Custom Email Source Code (Optional)</h4>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, customHtml: DEFAULT_OFFER_MAILER_TEMPLATE })}
                    disabled={submitting}
                    style={{
                      background: "#ff6f00",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "5px 10px",
                      cursor: "pointer"
                    }}
                  >
                    Include Scheduled Mailer Template
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#777E90", textTransform: "uppercase" }}>Custom Email HTML Body</label>
                  <textarea
                    value={formData.customHtml || ""}
                    onChange={(e) => setFormData({ ...formData, customHtml: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E4E6EB",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      minHeight: "150px",
                      resize: "vertical",
                      width: "100%",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter custom HTML source code..."
                    disabled={submitting}
                  />
                  <span style={{ fontSize: "10px", color: "#777E90" }}>
                    Automated email template wrapper will be included to avoid spam issues. Supported Placeholders: <strong>{"{name}"}</strong>, <strong>{"{fullName}"}</strong>, <strong>{"{offerName}"}</strong>, <strong>{"{offerDescription}"}</strong>, <strong>{"{offerLogo}"}</strong>, <strong>{"{offerImage}"}</strong>, <strong>{"{offerFeatures}"}</strong>, <strong>{"{offerImageUrl}"}</strong>, <strong>{"{offerUrl}"}</strong>
                  </span>

                  {/* Test Mail Section inside card modal */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    <input
                      type="text"
                      placeholder="Enter email subject (optional)..."
                      className="form-input"
                      value={formData.customSubject || ""}
                      onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E4E6EB", fontSize: "13px" }}
                      disabled={submitting || testingMail}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="email"
                        placeholder="Enter test email address..."
                        className="form-input"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #E4E6EB", fontSize: "13px" }}
                        disabled={submitting || testingMail}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleSendTestCardMail}
                        style={{ padding: "8px 16px", whiteSpace: "nowrap" }}
                        disabled={submitting || testingMail}
                      >
                        {testingMail ? "Sending..." : "Test Mail"}
                      </button>
                    </div>
                  </div>
                  {testMailFeedback && (
                    <div style={{
                      fontSize: "12px",
                      color: testMailFeedback.type === "success" ? "#16a34a" : "#dc2626",
                      marginTop: "4px"
                    }}>
                      {testMailFeedback.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={16} />
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="modal-header">
              <h3>Edit Offer</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Offer Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter offer name"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows="3"
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="Enter URL"
                  disabled={submitting}
                />
              </div>
              <div className="form-groups">
                <label>Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={submitting}
                >
                  <option value="">Select Category</option>
                  {offerCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-groups">
                <label>Logo Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={submitting}
                />
                {formData.logo_image_preview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={resolveImageUrl(formData.logo_image_preview)}
                      alt="Preview"
                      style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </div>
              <div className="form-groups">
                <label>Offer Image (For Daily Popup)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOfferImageChange}
                  disabled={submitting}
                />
                {formData.offer_image_preview && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={resolveImageUrl(formData.offer_image_preview)}
                      alt="Offer Preview"
                      style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "4px" }}
                    />
                  </div>
                )}
              </div>
              <div className="form-groups">
                <label>Features</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Enter feature and press Enter or click Add"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddFeature}
                    disabled={submitting}
                  >
                    Add
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          disabled={submitting}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <XCircle size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Offer Settings Section */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
                <h4 style={{ marginBottom: "12px", color: "#ff6f00" }}>Offer Settings</h4>
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={submitting}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: formData.isActive ? '#22c55e' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: formData.isActive ? '22px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Active (Disable/Enable Offer)</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.showInPopup}
                        onChange={(e) => setFormData({ ...formData, showInPopup: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={submitting}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: formData.showInPopup ? '#3b82f6' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: formData.showInPopup ? '22px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Show in Daily Popup</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={formData.showInMailer}
                        onChange={(e) => setFormData({ ...formData, showInMailer: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                        disabled={submitting}
                      />
                      <span className="slider round" style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: formData.showInMailer ? '#eab308' : '#ccc', transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: '""', height: '14px', width: '14px', left: formData.showInMailer ? '22px' : '4px', bottom: '3px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#555' }}>Enable for Scheduled Mailers</span>
                  </div>
                </div>
              </div>

              {/* Targeting Criteria Section */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px" }}>
                <h4 style={{ marginBottom: "10px", color: "#ff6f00" }}>Targeting Criteria (Optional)</h4>

                <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                  <div className="form-groups" style={{ flex: 1 }}>
                    <label>Min Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.targetAgeMin}
                      onChange={(e) => setFormData({ ...formData, targetAgeMin: e.target.value })}
                      placeholder="e.g. 18"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-groups" style={{ flex: 1 }}>
                    <label>Max Age</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.targetAgeMax}
                      onChange={(e) => setFormData({ ...formData, targetAgeMax: e.target.value })}
                      placeholder="e.g. 35"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-groups" style={{ marginBottom: "15px" }}>
                  <label>Target Cities</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <select
                      className="form-input"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">-- Select City --</option>
                      {availableCities.map(city => (
                        <option key={city._id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        if (newCity && !formData.targetCities.includes(newCity)) {
                          setFormData({ ...formData, targetCities: [...formData.targetCities, newCity] });
                          setNewCity("");
                        }
                      }}
                      disabled={submitting || !newCity}
                    >
                      Add
                    </button>
                  </div>
                  {formData.targetCities.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {formData.targetCities.map((city, index) => (
                        <span
                          key={index}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: "#ffe0b2",
                            color: "#e65100",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {city}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              targetCities: formData.targetCities.filter((_, i) => i !== index)
                            })}
                            disabled={submitting}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#e65100" }}
                          >
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-groups" style={{ marginBottom: "15px" }}>
                  <label>Target Positions</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <select
                      className="form-input"
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">-- Select Position --</option>
                      {availablePositions.map(pos => (
                        <option key={pos._id} value={pos.name}>{pos.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        if (newPosition && !formData.targetPositions.includes(newPosition)) {
                          setFormData({ ...formData, targetPositions: [...formData.targetPositions, newPosition] });
                          setNewPosition("");
                        }
                      }}
                      disabled={submitting || !newPosition}
                    >
                      Add
                    </button>
                  </div>
                  {formData.targetPositions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {formData.targetPositions.map((position, index) => (
                        <span
                          key={index}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            backgroundColor: "#e8f5e9",
                            color: "#1b5e20",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                        >
                          {position}
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              targetPositions: formData.targetPositions.filter((_, i) => i !== index)
                            })}
                            disabled={submitting}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "#1b5e20" }}
                          >
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Temporarily commented out eligibility criteria */}
              {/* <div className="form-groups">
                <label>Eligibles</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={newEligible}
                    onChange={(e) => setNewEligible(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddEligible();
                      }
                    }}
                    placeholder="Enter eligible and press Enter or click Add"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddEligible}
                    disabled={submitting}
                  >
                    Add
                  </button>
                </div>
                {formData.eligibles.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {formData.eligibles.map((eligible, index) => (
                      <span key={index} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", backgroundColor: "#f0f0f0", borderRadius: "4px", fontSize: "14px" }}>
                        {eligible}
                        <button type="button" onClick={() => handleRemoveEligible(index)} disabled={submitting} style={{ background: "none", border: "none", cursor: "pointer", padding: "0", display: "flex", alignItems: "center" }}>
                          <XCircle size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              {/* Custom HTML Template Section */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px", marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: 0, color: "#ff6f00" }}>Custom Email Source Code (Optional)</h4>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, customHtml: DEFAULT_OFFER_MAILER_TEMPLATE })}
                    disabled={submitting}
                    style={{
                      background: "#ff6f00",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "5px 10px",
                      cursor: "pointer"
                    }}
                  >
                    Include Scheduled Mailer Template
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#777E90", textTransform: "uppercase" }}>Custom Email HTML Body</label>
                  <textarea
                    value={formData.customHtml || ""}
                    onChange={(e) => setFormData({ ...formData, customHtml: e.target.value })}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E4E6EB",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      minHeight: "150px",
                      resize: "vertical",
                      width: "100%",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter custom HTML source code..."
                    disabled={submitting}
                  />
                  <span style={{ fontSize: "10px", color: "#777E90" }}>
                    Automated email template wrapper will be included to avoid spam issues. Supported Placeholders: <strong>{"{name}"}</strong>, <strong>{"{fullName}"}</strong>, <strong>{"{offerName}"}</strong>, <strong>{"{offerDescription}"}</strong>, <strong>{"{offerLogo}"}</strong>, <strong>{"{offerImage}"}</strong>, <strong>{"{offerFeatures}"}</strong>, <strong>{"{offerImageUrl}"}</strong>, <strong>{"{offerUrl}"}</strong>
                  </span>

                  {/* Test Mail Section inside card modal */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    <input
                      type="text"
                      placeholder="Enter email subject (optional)..."
                      className="form-input"
                      value={formData.customSubject || ""}
                      onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E4E6EB", fontSize: "13px" }}
                      disabled={submitting || testingMail}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="email"
                        placeholder="Enter test email address..."
                        className="form-input"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #E4E6EB", fontSize: "13px" }}
                        disabled={submitting || testingMail}
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleSendTestCardMail}
                        style={{ padding: "8px 16px", whiteSpace: "nowrap" }}
                        disabled={submitting || testingMail}
                      >
                        {testingMail ? "Sending..." : "Test Mail"}
                      </button>
                    </div>
                  </div>
                  {testMailFeedback && (
                    <div style={{
                      fontSize: "12px",
                      color: testMailFeedback.type === "success" ? "#16a34a" : "#dc2626",
                      marginTop: "4px"
                    }}>
                      {testMailFeedback.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  <Save size={16} />
                  {submitting ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click Tracking Modal */}
      {isClicksModalOpen && (
        <div className="modal-overlay" onClick={() => setIsClicksModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1f2937" }}>Users Who Clicked</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  Offer: <strong>{selectedCardForClicks?.name}</strong>
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsClicksModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#4b5563" }}>Timeframe:</span>
                  <select
                    value={clickFilterDays}
                    onChange={(e) => handleViewClicks(selectedCardForClicks, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "14px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      outline: "none",
                      cursor: "pointer",
                      color: "#374151"
                    }}
                  >
                    <option value="all">All Time</option>
                    <option value="1">Last 24 Hours</option>
                    <option value="7">Last 7 Days</option>
                    <option value="15">Last 15 Days</option>
                    <option value="30">Last 30 Days</option>
                  </select>
                </div>

                {!loadingClicks && !clicksError && selectedCardClicks.length > 0 && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={downloadClicksCSV}
                      className="btn-secondary"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "8px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}
                    >
                      <Download size={16} /> Download CSV
                    </button>
                    <button
                      onClick={handleOpenBroadcast}
                      disabled={sendingSms || sendingBroadcast}
                      className="btn-primary"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#EC7523", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: (sendingSms || sendingBroadcast) ? "not-allowed" : "pointer", opacity: (sendingSms || sendingBroadcast) ? 0.7 : 1 }}
                    >
                      <Mail size={16} /> Broadcast Mailer
                    </button>
                    <button
                      onClick={handleSendSmsBroadcast}
                      disabled={sendingSms || sendingBroadcast}
                      className="btn-primary"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#0284c7", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: (sendingSms || sendingBroadcast) ? "not-allowed" : "pointer", opacity: (sendingSms || sendingBroadcast) ? 0.7 : 1 }}
                    >
                      <MessageSquare size={16} /> {sendingSms ? "Sending SMS..." : "Broadcast SMS"}
                    </button>
                  </div>
                )}
              </div>

              {loadingClicks ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Loading user clicks...</div>
              ) : clicksError ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#dc2626" }}>{clicksError}</div>
              ) : selectedCardClicks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "45px 0" }}>
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem" }}>No click logs found for this offer matching the selected timeframe.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div className="table-container" style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: 0 }}>
                    <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9fafb" }}>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Name</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Mobile</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Email ID</th>
                          <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Click Count</th>
                          <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#374151" }}>Last Clicked At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCardClicks.map((click, index) => (
                          <tr key={click._id || index} style={{ borderTop: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "10px 12px", fontSize: "14px", color: "#1f2937" }}>{click.fullName || "N/A"}</td>
                            <td style={{ padding: "10px 12px", fontSize: "14px", color: "#4b5563" }}>{click.mobile || "N/A"}</td>
                            <td style={{ padding: "10px 12px", fontSize: "14px", color: "#4b5563" }}>{click.email || "N/A"}</td>
                            <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "14px" }}>
                              <span className="badge" style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                {click.clickCount}
                              </span>
                            </td>
                            <td style={{ padding: "10px 12px", fontSize: "13px", color: "#6b7280" }}>
                              {click.lastClickedAt ? new Date(click.lastClickedAt).toLocaleString() : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsClicksModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Mailer Modal */}
      {isBroadcastModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBroadcastModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1f2937" }}>
                  {broadcastScope === "all" ? "Send Bulk Mail (All Offers - Last 15 Days)" : "Send Broadcast Mailer"}
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.875rem", color: "#EC7523" }}>
                  {broadcastScope === "all" ? (
                    loadingAllClickersCount ? "Loading recipient count..." : `To all users who clicked any offer in the last 15 days (${allClickersCount} users with email)`
                  ) : (
                    `To users who clicked: ${selectedCardForClicks?.name || ''} (${selectedCardClicks.filter(c => !!c.email).length} users with email)`
                  )}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsBroadcastModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div className="form-groups" style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: 0 }}>
                  <label style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>Email Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="Enter email subject"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    disabled={sendingBroadcast}
                  />
                </div>

                <div className="form-groups" style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>Email Body (HTML format)</label>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Use <code>{"{{name}}"}</code> to insert the user's full name</span>
                  </div>
                  <textarea
                    className="form-input"
                    value={broadcastHtml}
                    onChange={(e) => setBroadcastHtml(e.target.value)}
                    placeholder="Enter email HTML body content"
                    rows="12"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: "13px" }}
                    disabled={sendingBroadcast}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: 0 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsBroadcastModalOpen(false);
                    if (broadcastScope === "single") {
                      setIsClicksModalOpen(true); // go back to clicks modal only for single offer scope
                    }
                  }}
                  disabled={sendingBroadcast}
                  style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}
                >
                  {broadcastScope === "all" ? "Cancel" : "Back"}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSendBroadcast}
                  disabled={sendingBroadcast}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#EC7523", color: "white", border: "none", padding: "8px 20px", borderRadius: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
                >
                  {sendingBroadcast ? "Sending Mailer..." : "Send Mailer Broadcast"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardManagement;

