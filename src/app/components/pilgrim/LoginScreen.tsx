import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, Shield, Phone, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "../../lib/api";

// ── Types ────────────────────────────────────────────────────

interface LoginFormData {
  phone: string;
  password: string;
}

// ── Shared styles ────────────────────────────────────────────

const colors = {
  primary: "#C84B31",
  primaryHover: "#b5432c",
  secondary: "#2D4238",
  bg: "#F5F0E6",
  card: "#ffffff",
  inputBg: "#f4f2ee",
  border: "rgba(45, 66, 56, 0.12)",
  text: "#1a1a2e",
  muted: "#6b6b80",
  error: "#EF4444",
  errorBg: "#FEF2F2",
  accent: "#fff3e8",
};

const fontFamily = "Poppins, sans-serif";

// ── Component ────────────────────────────────────────────────

export function LoginScreen() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onTouched",
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    setApiError(null);
    setVerificationEmail(null);
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        phone: data.phone.trim(),
        password: data.password,
      });

      // Store the token
      localStorage.setItem("yatrasetu_token", response.token);

      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err: any) {
      const message = err?.message || "Invalid credentials. Please try again.";

      // Check if the error is a verification requirement
      if (err?.requiresVerification && err?.email) {
        setVerificationEmail(err.email);
      }

      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    height: "44px",
    padding: "10px 12px 10px 40px",
    borderRadius: "10px",
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    fontFamily,
    fontSize: "14px",
    color: colors.text,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
  };

  const inputErrorStyle: React.CSSProperties = {
    borderColor: colors.error,
    boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`,
  };

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = colors.primary;
    e.target.style.boxShadow = `0 0 0 3px rgba(200, 75, 49, 0.15)`;
  };

  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (hasError) {
      e.target.style.borderColor = colors.error;
      e.target.style.boxShadow = `0 0 0 3px rgba(239, 68, 68, 0.1)`;
    } else {
      e.target.style.borderColor = colors.border;
      e.target.style.boxShadow = "none";
    }
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 600,
    fontFamily,
    color: colors.secondary,
    marginBottom: "6px",
    display: "block",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: colors.muted,
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${colors.bg} 0%, #ece5d5 50%, ${colors.accent} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          animation: "fadeInUp 0.5s ease-out",
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: colors.primary,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "0 8px 24px rgba(200, 75, 49, 0.3)",
            }}
          >
            <Shield size={28} color="#fff" />
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              fontFamily,
              color: colors.secondary,
              margin: "0 0 4px",
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: colors.muted,
              fontFamily,
              margin: 0,
            }}
          >
            Login to your YatraSetu account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: colors.card,
            borderRadius: "20px",
            padding: "32px 28px",
            boxShadow: "0 8px 32px rgba(45, 66, 56, 0.08), 0 2px 8px rgba(0,0,0,0.04)",
            border: `1px solid ${colors.border}`,
          }}
        >
          {/* Global API Error */}
          {apiError && (
            <div
              role="alert"
              style={{
                background: verificationEmail ? colors.accent : colors.errorBg,
                border: `1px solid ${verificationEmail ? "rgba(200, 75, 49, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: verificationEmail ? "12px" : 0 }}>
                {verificationEmail && <Mail size={16} color={colors.primary} />}
                <span style={{ color: verificationEmail ? colors.primary : colors.error, fontSize: "13px", fontFamily, fontWeight: verificationEmail ? 600 : 400 }}>
                  {apiError}
                </span>
              </div>
              {verificationEmail && (
                <button
                  type="button"
                  onClick={() => navigate("/verify-email", { state: { email: verificationEmail } })}
                  id="verify-email-btn"
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: colors.primary,
                    color: "#fff",
                    fontFamily,
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(200, 75, 49, 0.25)",
                  }}
                >
                  <Mail size={14} />
                  Verify Email
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Phone */}
              <div>
                <label htmlFor="login-phone" style={labelStyle}>
                  Mobile Number <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={iconStyle} />
                  <input
                    id="login-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    autoComplete="tel"
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    style={{
                      ...inputBaseStyle,
                      ...(errors.phone ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.phone)}
                    {...register("phone", {
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <p role="alert" style={{ color: colors.error, fontSize: "12px", fontFamily, margin: "4px 0 0" }}>
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" style={labelStyle}>
                  Password <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    style={{
                      ...inputBaseStyle,
                      paddingRight: "44px",
                      ...(errors.password ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.password)}
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: colors.muted,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p role="alert" style={{ color: colors.error, fontSize: "12px", fontFamily, margin: "4px 0 0" }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                id="login-submit-btn"
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "12px",
                  background: isSubmitting ? colors.primaryHover : colors.primary,
                  color: "#fff",
                  fontFamily,
                  fontSize: "15px",
                  fontWeight: 700,
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  opacity: isSubmitting ? 0.8 : 1,
                  boxShadow: "0 4px 14px rgba(200, 75, 49, 0.3)",
                  marginTop: "6px",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    (e.target as HTMLButtonElement).style.background = colors.primaryHover;
                    (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(200, 75, 49, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    (e.target as HTMLButtonElement).style.background = colors.primary;
                    (e.target as HTMLButtonElement).style.transform = "none";
                    (e.target as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(200, 75, 49, 0.3)";
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          {/* Signup link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ fontSize: "13px", color: colors.muted, fontFamily, margin: 0 }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.primary,
                  fontWeight: 700,
                  fontFamily,
                  fontSize: "13px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  padding: 0,
                }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
