import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, LogOut, ArrowLeft, Mail, Phone, Calendar, Shield } from "lucide-react";
import { fetchCurrentUser, type ApiUser } from "../../lib/api";
import { toast } from "sonner";

interface ProfileScreenProps {
  onBack: () => void;
}

const colors = {
  primary: "#C84B31",
  primaryHover: "#b5432c",
  secondary: "#2D4238",
  bg: "#F5F0E6",
  card: "#ffffff",
  border: "rgba(45, 66, 56, 0.12)",
  text: "#1a1a2e",
  muted: "#6b6b80",
  destructive: "#EF4444",
};

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("yatrasetu_token");
    if (token) {
      fetchCurrentUser()
        .then((u) => {
          setUser(u);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user:", err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("yatrasetu_token");
    toast.success("Logged out successfully");
    // Go back to home after logout
    onBack();
    // Using window.location.reload to completely reset the application state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: colors.bg }}>
        <p style={{ fontFamily: "Poppins, sans-serif", color: colors.muted }}>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: colors.bg, padding: "20px" }}>
        <User size={48} color={colors.muted} style={{ marginBottom: "16px", opacity: 0.5 }} />
        <p style={{ fontFamily: "Poppins, sans-serif", color: colors.text, marginBottom: "20px", textAlign: "center" }}>
          You need to be logged in to view your profile.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            background: colors.primary,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 24px",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: colors.bg, fontFamily: "Poppins, sans-serif", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ background: colors.secondary, padding: "20px 20px 30px", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, margin: 0 }}>My Profile</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: 700 }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}>{user.name}</h3>
            <span style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", color: "#fff", fontWeight: 500 }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, color: colors.secondary, margin: "0 0 12px" }}>Account Details</h4>
        
        <div style={{ background: colors.card, borderRadius: "16px", padding: "16px", border: `1px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(45, 66, 56, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: colors.secondary }}>
              <Phone size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: colors.muted, fontWeight: 500 }}>Mobile Number</p>
              <p style={{ margin: "2px 0 0", fontSize: "14px", color: colors.text, fontWeight: 600 }}>+91 {user.phone}</p>
            </div>
          </div>
          
          {user.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(45, 66, 56, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: colors.secondary }}>
                <Mail size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: colors.muted, fontWeight: 500 }}>Email Address</p>
                <p style={{ margin: "2px 0 0", fontSize: "14px", color: colors.text, fontWeight: 600 }}>{user.email}</p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(45, 66, 56, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: colors.secondary }}>
              <Shield size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: colors.muted, fontWeight: 500 }}>Accessibility Options</p>
              <p style={{ margin: "2px 0 0", fontSize: "14px", color: colors.text, fontWeight: 600 }}>{user.isAccessible ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
          
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "32px",
            width: "100%",
            background: "transparent",
            border: `1px solid ${colors.destructive}`,
            color: colors.destructive,
            borderRadius: "12px",
            padding: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.05)";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
