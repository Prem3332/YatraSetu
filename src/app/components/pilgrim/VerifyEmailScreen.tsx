import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { Loader2, Shield, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { verifyEmail, resendOtp } from "../../lib/api";

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
  success: "#22C55E",
  successBg: "#F0FDF4",
  accent: "#fff3e8",
};

const fontFamily = "Poppins, sans-serif";

// ── Component ────────────────────────────────────────────────

export function VerifyEmailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || "";

  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If no email was passed, redirect to signup
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const getOtpString = useCallback(() => otpValues.join(""), [otpValues]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    setApiError(null);
    setSuccessMessage(null);

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;

    const newValues = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pastedData[i] || "";
    }
    setOtpValues(newValues);

    // Focus the next empty input or the last one
    const nextEmpty = newValues.findIndex((v) => !v);
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  };

  const handleVerify = async () => {
    const otp = getOtpString();

    if (otp.length !== 6) {
      setApiError("Please enter all 6 digits.");
      return;
    }

    if (isVerifying) return;
    setApiError(null);
    setSuccessMessage(null);
    setIsVerifying(true);

    try {
      const response = await verifyEmail(email, otp);
      setSuccessMessage(response.message);
      toast.success("Email verified successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      const message = err?.message || "Verification failed. Please try again.";
      setApiError(message);
      toast.error(message);
      // Clear OTP fields on error
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || cooldown > 0) return;
    setApiError(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const response = await resendOtp(email);
      toast.success(response.message);
      setCooldown(60);
      // Clear OTP fields
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const message = err?.message || "Failed to resend OTP. Please try again.";
      setApiError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = getOtpString().length === 6;

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
          maxWidth: "460px",
          animation: "fadeInUp 0.5s ease-out",
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
            Email Verification
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: colors.muted,
              fontFamily,
              margin: 0,
            }}
          >
            Enter the 6-digit OTP sent to your email
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
          {/* Email info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              background: colors.accent,
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            <Mail size={18} color={colors.primary} />
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: colors.muted,
                  fontFamily,
                  margin: "0 0 2px",
                }}
              >
                OTP sent to
              </p>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: colors.text,
                  fontFamily,
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                {email}
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                background: colors.successBg,
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle size={16} color={colors.success} />
              <span style={{ color: colors.success, fontSize: "13px", fontFamily, fontWeight: 500 }}>
                {successMessage}
              </span>
            </div>
          )}

          {/* Error Message */}
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

          {/* OTP Inputs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isVerifying || !!successMessage}
                id={`otp-input-${index}`}
                aria-label={`OTP digit ${index + 1}`}
                style={{
                  width: "52px",
                  height: "58px",
                  textAlign: "center",
                  fontSize: "24px",
                  fontWeight: 700,
                  fontFamily: "'Courier New', monospace",
                  color: colors.text,
                  background: value ? "rgba(200, 75, 49, 0.06)" : colors.inputBg,
                  border: value
                    ? `2px solid ${colors.primary}`
                    : `1.5px solid ${colors.border}`,
                  borderRadius: "12px",
                  outline: "none",
                  transition: "all 0.2s ease",
                  caretColor: colors.primary,
                  boxShadow: value ? "0 2px 8px rgba(200, 75, 49, 0.1)" : "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.boxShadow = "0 0 0 3px rgba(200, 75, 49, 0.15)";
                  e.target.select();
                }}
                onBlur={(e) => {
                  if (value) {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.boxShadow = "0 2px 8px rgba(200, 75, 49, 0.1)";
                  } else {
                    e.target.style.borderColor = colors.border;
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || !isOtpComplete || !!successMessage}
            id="verify-otp-btn"
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "12px",
              background:
                isVerifying || !isOtpComplete || !!successMessage
                  ? "rgba(200, 75, 49, 0.5)"
                  : colors.primary,
              color: "#fff",
              fontFamily,
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              cursor: isVerifying || !isOtpComplete || !!successMessage ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              opacity: isVerifying || !isOtpComplete ? 0.8 : 1,
              boxShadow: isOtpComplete ? "0 4px 14px rgba(200, 75, 49, 0.3)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isVerifying && isOtpComplete && !successMessage) {
                (e.target as HTMLButtonElement).style.background = colors.primaryHover;
                (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(200, 75, 49, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isVerifying && isOtpComplete && !successMessage) {
                (e.target as HTMLButtonElement).style.background = colors.primary;
                (e.target as HTMLButtonElement).style.transform = "none";
                (e.target as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(200, 75, 49, 0.3)";
              }
            }}
          >
            {isVerifying ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Verifying...
              </>
            ) : successMessage ? (
              <>
                <CheckCircle size={18} />
                Verified!
              </>
            ) : (
              "Verify"
            )}
          </button>

          {/* Resend Section */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: colors.muted,
                fontFamily,
                margin: "0 0 12px",
              }}
            >
              Didn't receive the OTP?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || cooldown > 0 || !!successMessage}
              id="resend-otp-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: `1.5px solid ${cooldown > 0 || !!successMessage ? colors.border : colors.primary}`,
                borderRadius: "10px",
                padding: "10px 20px",
                color: cooldown > 0 || !!successMessage ? colors.muted : colors.primary,
                fontFamily,
                fontSize: "13px",
                fontWeight: 600,
                cursor: cooldown > 0 || isResending || !!successMessage ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: cooldown > 0 ? 0.7 : 1,
              }}
            >
              {isResending ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw size={14} />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Resend OTP
                </>
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div
            style={{
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            <p style={{ fontSize: "13px", color: colors.muted, fontFamily, margin: 0 }}>
              Already verified?{" "}
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

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: colors.muted,
            fontFamily,
            marginTop: "20px",
            opacity: 0.7,
          }}
        >
          Check your spam folder if you don't see the email
        </p>
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
