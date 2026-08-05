import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "../../lib/api";

// ── Types ────────────────────────────────────────────────────

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
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
  successBg: "#F0FDF4",
  successBorder: "rgba(34, 197, 94, 0.2)",
  successText: "#15803d",
};

const fontFamily = "Poppins, sans-serif";

// ── Component ────────────────────────────────────────────────

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = (location.state as any)?.resetToken || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    mode: "onTouched",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = watch("newPassword");

  // Redirect if no reset token
  if (!resetToken) {
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
            background: colors.card,
            borderRadius: "20px",
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: "400px",
            boxShadow: "0 8px 32px rgba(45, 66, 56, 0.08)",
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: colors.errorBg,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Lock size={28} color={colors.error} />
          </div>
          <h2 style={{ fontFamily, fontSize: "20px", fontWeight: 700, color: colors.secondary, margin: "0 0 8px" }}>
            Invalid Reset Session
          </h2>
          <p style={{ fontFamily, fontSize: "14px", color: colors.muted, margin: "0 0 24px", lineHeight: 1.5 }}>
            Your password reset session has expired or is invalid. Please start the process again.
          </p>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            style={{
              padding: "12px 28px",
              borderRadius: "12px",
              background: colors.primary,
              color: "#fff",
              fontFamily,
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(200, 75, 49, 0.3)",
              transition: "all 0.2s ease",
            }}
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await resetPassword(resetToken, data.newPassword);
      setSuccessMessage(response.message);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      const message = err?.message || "Failed to reset password. Please try again.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    height: "44px",
    padding: "10px 44px 10px 40px",
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

  const toggleStyle: React.CSSProperties = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.muted,
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPasswordValue || "");
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ["", "#EF4444", "#F59E0B", "#EAB308", "#22C55E", "#15803d"];

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
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          id="reset-back-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: colors.secondary,
            fontFamily,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0 0 16px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = colors.primary; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = colors.secondary; }}
        >
          <ArrowLeft size={16} />
          Back to Forgot Password
        </button>

        {/* Header */}
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
            <KeyRound size={28} color="#fff" />
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
            Reset Password
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: colors.muted,
              fontFamily,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Create a new password for your account
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
          {/* Success message */}
          {successMessage && (
            <div
              style={{
                background: colors.successBg,
                border: `1px solid ${colors.successBorder}`,
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
                textAlign: "center",
                animation: "fadeInUp 0.3s ease-out",
              }}
            >
              <CheckCircle size={32} color={colors.successText} style={{ marginBottom: "8px" }} />
              <p style={{ color: colors.successText, fontSize: "14px", fontFamily, fontWeight: 600, margin: "0 0 4px" }}>
                Password Reset Successfully!
              </p>
              <p style={{ color: colors.muted, fontSize: "12px", fontFamily, margin: 0 }}>
                Redirecting to login...
              </p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div
              role="alert"
              style={{
                background: colors.errorBg,
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
              }}
            >
              <span style={{ color: colors.error, fontSize: "13px", fontFamily }}>
                {apiError}
              </span>
            </div>
          )}

          {/* Reset password form */}
          {!successMessage && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* New Password */}
                <div>
                  <label htmlFor="reset-new-password" style={labelStyle}>
                    New Password <span style={{ color: colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={iconStyle} />
                    <input
                      id="reset-new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      autoFocus
                      aria-required="true"
                      aria-invalid={!!errors.newPassword}
                      style={{
                        ...inputBaseStyle,
                        ...(errors.newPassword ? inputErrorStyle : {}),
                      }}
                      onFocus={inputFocusHandler}
                      onBlur={(e) => inputBlurHandler(e, !!errors.newPassword)}
                      {...register("newPassword", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={toggleStyle}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p role="alert" style={{ color: colors.error, fontSize: "12px", fontFamily, margin: "4px 0 0" }}>
                      {errors.newPassword.message}
                    </p>
                  )}
                  {/* Password strength bar */}
                  {newPasswordValue && (
                    <div style={{ marginTop: "8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          marginBottom: "4px",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            style={{
                              flex: 1,
                              height: "3px",
                              borderRadius: "2px",
                              background: level <= strength ? strengthColors[strength] : "#e5e5e5",
                              transition: "background 0.3s ease",
                            }}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize: "11px", color: strengthColors[strength], fontFamily, margin: 0, fontWeight: 500 }}>
                        {strengthLabels[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="reset-confirm-password" style={labelStyle}>
                    Confirm Password <span style={{ color: colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={iconStyle} />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!errors.confirmPassword}
                      style={{
                        ...inputBaseStyle,
                        ...(errors.confirmPassword ? inputErrorStyle : {}),
                      }}
                      onFocus={inputFocusHandler}
                      onBlur={(e) => inputBlurHandler(e, !!errors.confirmPassword)}
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === newPasswordValue || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={toggleStyle}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p role="alert" style={{ color: colors.error, fontSize: "12px", fontFamily, margin: "4px 0 0" }}>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="reset-password-btn"
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
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={18} />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back to login link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ fontSize: "13px", color: colors.muted, fontFamily, margin: 0 }}>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
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
                Login
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
