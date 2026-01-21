import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import { getCards, createCard, updateCard, deleteCard } from "../../utils/adminApi";

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
    eligibles: []
  });
  const [newFeature, setNewFeature] = useState("");
  const [newEligible, setNewEligible] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Fetch cards from API
  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCards(currentPage, itemsPerPage, searchTerm);
      
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
  }, [currentPage]);

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

  const handleAdd = () => {
    setFormData({ 
      name: "", 
      description: "", 
      url: "", 
      logo_image: null,
      logo_image_preview: null,
      features: [],
      eligibles: []
    });
    setNewFeature("");
    setNewEligible("");
    setIsAddModalOpen(true);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({ 
      name: card.name || "",
      description: card.description || "",
      url: card.url || "",
      logo_image: null,
      logo_image_preview: card.logo_image || null,
      features: card.features && Array.isArray(card.features) ? [...card.features] : [],
      eligibles: card.eligibles && Array.isArray(card.eligibles) ? [...card.eligibles] : []
    });
    setNewFeature("");
    setNewEligible("");
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
      if (isEditModalOpen) {
        // Update existing card
        await updateCard(editingCard._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          url: formData.url.trim(),
          logo_image: formData.logo_image,
          features: formData.features,
          eligibles: formData.eligibles
        });
      } else {
        // Add new card
        await createCard({
          name: formData.name.trim(),
          description: formData.description.trim(),
          url: formData.url.trim(),
          logo_image: formData.logo_image,
          features: formData.features,
          eligibles: formData.eligibles
        });
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
        eligibles: []
      });
      setNewFeature("");
      setNewEligible("");
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
      <div className="admin-section-header">
        <h2 className="section-title">Card Management</h2>
        <div className="admin-actions">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search cards..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={20} />
            Add Card
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Description</th>
              <th>URL</th>
              <th>Features</th>
              <th>Eligibles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="empty-state" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  No cards found
                </td>
              </tr>
            ) : (
              cards.map((card) => (
                <tr key={card._id}>
                  <td>
                    {card.logo_image ? (
                      <img 
                        src={card.logo_image} 
                        alt={card.name} 
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{card.name || "N/A"}</td>
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
                  <td>
                    {card.eligibles && Array.isArray(card.eligibles) && card.eligibles.length > 0 ? (
                      <span>{card.eligibles.length} eligible(s)</span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
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
                    className={`pagination-number ${
                      currentPage === page ? "active" : ""
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
              <h3>Add New Card</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Card Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter card name"
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
                      src={formData.logo_image_preview} 
                      alt="Preview" 
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
              <div className="form-groups">
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
                        {eligible}
                        <button
                          type="button"
                          onClick={() => handleRemoveEligible(index)}
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
              <h3>Edit Card</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-groups">
                <label>Card Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter card name"
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
                      src={formData.logo_image_preview} 
                      alt="Preview" 
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
              <div className="form-groups">
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
                        {eligible}
                        <button
                          type="button"
                          onClick={() => handleRemoveEligible(index)}
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
    </div>
  );
};

export default CardManagement;

