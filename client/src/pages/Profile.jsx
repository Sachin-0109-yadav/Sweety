
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  LoaderCircle,
  RefreshCw,
  Pencil,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user: authUser, updateUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/auth/me");
      const profile = response.data.data.user;

      setUser(profile);
      setName(profile.name);
      updateUser(profile);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Name cannot exceed 100 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/auth/profile", {
        name: trimmedName,
      });

      const updatedUser = response.data.data.user;

      setUser(updatedUser);
      setName(updatedUser.name);
      updateUser(updatedUser);
      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          <span className="profile-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>Profile & Settings</h1>
          <p>Manage your personal account information.</p>
        </div>

        <button
          className="profile-refresh"
          onClick={loadProfile}
          disabled={loading || saving}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="profile-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="profile-success" role="status">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="profile-loading">
          <LoaderCircle size={30} className="loading-spinner" />
          <p>Loading your profile...</p>
        </div>
      ) : user ? (
        <>
          <section className="profile-overview-card">
            <div className="profile-avatar-large">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="profile-overview-details">
              <span>YOUR ACCOUNT</span>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>

            <div className="profile-verified">
              <ShieldCheck size={17} />
              Account active
            </div>
          </section>

          <section className="profile-details-card">
            <div className="profile-section-heading">
              <div>
                <h2>Personal information</h2>
                <p>Update your registered account details.</p>
              </div>

              {!editing && (
                <button
                  className="profile-edit-button"
                  onClick={() => {
                    setName(user.name);
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                >
                  <Pencil size={16} />
                  Edit profile
                </button>
              )}
            </div>

            {editing ? (
              <form className="profile-edit-form" onSubmit={handleSave}>
                <label htmlFor="profile-name">Full name</label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  disabled={saving}
                  autoFocus
                />

                <div className="profile-form-actions">
                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="loading-spinner" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-detail-row">
                  <div className="profile-detail-icon">
                    <UserRound size={19} />
                  </div>
                  <div>
                    <span>Full name</span>
                    <strong>{user.name}</strong>
                  </div>
                </div>

                <div className="profile-detail-row">
                  <div className="profile-detail-icon">
                    <Mail size={19} />
                  </div>
                  <div>
                    <span>Email address</span>
                    <strong>{user.email}</strong>
                  </div>
                </div>

                <div className="profile-detail-row">
                  <div className="profile-detail-icon">
                    <CalendarDays size={19} />
                  </div>
                  <div>
                    <span>Member since</span>
                    <strong>{formatDate(user.created_at)}</strong>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="profile-security-card">
            <div className="profile-security-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h3>Account security</h3>
              <p>
                Your account is protected by secure authentication.
                Only you can access your personal glucose records.
              </p>
            </div>
          </section>

          <p className="profile-disclaimer">
            Keep your login credentials private. Sweety will never
            display your password.
          </p>
        </>
      ) : null}
    </main>
  );
}

export default Profile;