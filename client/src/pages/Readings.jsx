import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  Clock,
  Droplets,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import api from "../services/api";

const initialForm = {
  reading_date: new Date().toLocaleDateString("en-CA"),
  reading_slot: "Morning fasting",
  glucose_level: "",
};

const readingSlots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner",
];

function Readings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReadings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/readings");
      setReadings(response.data.data.readings || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your glucose readings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  const formatDate = (date) => {
    const value = String(date).slice(0, 10);
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (reading) => {
    setEditingId(reading.id);
    setFormData({
      reading_date: String(reading.reading_date).slice(0, 10),
      reading_slot: reading.reading_slot,
      glucose_level: String(reading.glucose_level),
    });
    setFormError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    setSuccess("");

    const payload = {
      reading_date: formData.reading_date,
      reading_slot: formData.reading_slot,
      glucose_level: Number(formData.glucose_level),
    };

    try {
      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
        setSuccess("Glucose reading updated successfully.");
      } else {
        await api.post("/readings", payload);
        setSuccess("Glucose reading added successfully.");
      }

      setShowForm(false);
      setFormData(initialForm);
      setEditingId(null);
      await loadReadings();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to save your reading. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (readingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this glucose reading?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/readings/${readingId}`);
      setSuccess("Reading deleted successfully.");
      await loadReadings();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete this reading."
      );
    }
  };

  const filteredReadings = readings.filter((reading) => {
    const matchesSlot =
      selectedSlot === "all" ||
      reading.reading_slot === selectedSlot;

    const matchesSearch =
      reading.reading_slot.toLowerCase().includes(search.toLowerCase()) ||
      String(reading.reading_date).includes(search);

    return matchesSlot && matchesSearch;
  });

  return (
    <main className="readings-page">
      <nav className="reports-navigation">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/readings" className="active">
          Glucose readings
        </NavLink>
        <NavLink to="/reports">Health reports</NavLink>
      </nav>
      
      <header className="readings-header">
        <div>
          <span className="readings-eyebrow">HEALTH TRACKING</span>
          <h1>Glucose readings</h1>
          <p>Record and manage your glucose measurements.</p>
        </div>

        <button className="add-reading-button" onClick={openAddForm}>
          <Plus size={18} />
          Add reading
        </button>
      </header>

      {success && (
        <div className="reading-success" role="status">
          {success}
          <button onClick={() => setSuccess("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="reading-error" role="alert">
          {error}
          <button onClick={loadReadings}>Retry</button>
        </div>
      )}

      <section className="readings-summary">
        <div className="readings-summary-icon">
          <Activity size={23} />
        </div>
        <div>
          <span>Total recorded entries</span>
          <strong>{readings.length}</strong>
        </div>
      </section>

      <section className="readings-toolbar">
        <div className="readings-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search date or reading type..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={selectedSlot}
          onChange={(event) => setSelectedSlot(event.target.value)}
          aria-label="Filter by reading type"
        >
          <option value="all">All reading types</option>
          {readingSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <button
          className="readings-refresh"
          onClick={loadReadings}
          disabled={loading}
          aria-label="Refresh readings"
        >
          <RefreshCw size={17} />
        </button>
      </section>

      <section className="readings-table-panel">
        <div className="readings-table-heading">
          <div>
            <h2>Reading history</h2>
            <p>
              {filteredReadings.length}{" "}
              {filteredReadings.length === 1 ? "entry" : "entries"} found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="readings-empty">
            <RefreshCw size={25} />
            <p>Loading your readings...</p>
          </div>
        ) : filteredReadings.length === 0 ? (
          <div className="readings-empty">
            <div className="readings-empty-icon">
              <Droplets size={27} />
            </div>
            <h3>No readings found</h3>
            <p>
              Add a glucose reading to start building your health history.
            </p>
            <button onClick={openAddForm}>
              <Plus size={16} />
              Add your first reading
            </button>
          </div>
        ) : (
          <div className="readings-table-scroll">
            <table className="readings-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reading type</th>
                  <th>Glucose level</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredReadings.map((reading) => (
                  <tr key={reading.id}>
                    <td>
                      <span className="reading-date-cell">
                        <CalendarDays size={15} />
                        {formatDate(reading.reading_date)}
                      </span>
                    </td>

                    <td>
                      <span className="reading-slot-cell">
                        <Clock size={15} />
                        {reading.reading_slot}
                      </span>
                    </td>

                    <td>
                      <strong className="reading-glucose-value">
                        {reading.glucose_level}
                        <small> mg/dL</small>
                      </strong>
                    </td>

                    <td>
                      <div className="reading-actions">
                        <button
                          className="edit-reading-action"
                          onClick={() => openEditForm(reading)}
                          aria-label="Edit reading"
                          title="Edit reading"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className="delete-reading-action"
                          onClick={() => handleDelete(reading.id)}
                          aria-label="Delete reading"
                          title="Delete reading"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="reading-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section
            className="reading-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-modal-title"
          >
            <div className="reading-modal-heading">
              <div>
                <span className="readings-eyebrow">
                  HEALTH RECORD
                </span>
                <h2 id="reading-modal-title">
                  {editingId ? "Edit reading" : "Add glucose reading"}
                </h2>
              </div>

              <button
                className="reading-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="reading-form-group">
                <label htmlFor="reading_date">Reading date</label>
                <input
                  id="reading_date"
                  type="date"
                  name="reading_date"
                  value={formData.reading_date}
                  max={new Date().toLocaleDateString("en-CA")}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="reading-form-group">
                <label htmlFor="reading_slot">Reading type</label>
                <select
                  id="reading_slot"
                  name="reading_slot"
                  value={formData.reading_slot}
                  onChange={handleChange}
                  required
                >
                  {readingSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="reading-form-group">
                <label htmlFor="glucose_level">
                  Glucose level (mg/dL)
                </label>
                <input
                  id="glucose_level"
                  type="number"
                  name="glucose_level"
                  min="40"
                  max="600"
                  step="1"
                  placeholder="Enter glucose level"
                  value={formData.glucose_level}
                  onChange={handleChange}
                  required
                />
                <span className="reading-field-hint">
                  Enter a whole number between 40 and 600.
                </span>
              </div>

              {formError && (
                <div className="reading-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="reading-modal-actions">
                <button
                  type="button"
                  className="reading-cancel-button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="reading-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Save reading"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Readings;
