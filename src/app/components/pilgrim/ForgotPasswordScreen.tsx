import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { ArrowLeft, Phone, Loader2, KeyRound, Mail, CheckCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword, verifyResetOtp } from "../../lib/api";

// ── Types ────────────────────────────────────────────────────

interface ForgotPasswordFormData {
  phone: string;
}

// ── Shared styles (consistent with LoginScreen) ──────────────

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

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState<string>("");

  // OTP state
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    mode: "onTouched",
    defaultValues: { phone: "" },
  });

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus first OTP input when OTP section appears
  useEffect(() => {
    if (sentEmail) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [sentEmail]);

  const getOtpString = useCallback(() => otpValues.join(""), [otpValues]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    setOtpError(null);
    setApiError(null);

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 0) return;

    const newValues = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newValues[i] = pastedData[i] || "";
    }
    setOtpValues(newValues);

    const nextEmpty = newValues.findIndex((v) => !v);
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setApiError(null);
    setSentEmail(null);
    setVerificationEmail(null);
    setOtpValues(["", "", "", "", "", ""]);
    setOtpError(null);

    try {
      const trimmedPhone = data.phone.trim();
      setPhoneValue(trimmedPhone);
      const response = await forgotPassword(trimmedPhone);
      setSentEmail(response.email);
      setCooldown(60);
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";

      if (err?.requiresVerification && err?.email) {
        setVerificationEmail(err.email);
      }

      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = getOtpString();

    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    if (isVerifying) return;
    setOtpError(null);
    setApiError(null);
    setIsVerifying(true);

    try {
      const response = await verifyResetOtp(phoneValue, otp);
      toast.success("OTP verified successfully!");
      // Navigate to reset password screen with the token
      setTimeout(() => {
        navigate("/reset-password", { state: { resetToken: response.resetToken } });
      }, 500);
    } catch (err: any) {
      const message = err?.message || "Verification failed. Please try again.";
      setOtpError(message);
      toast.error(message);
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || cooldown > 0) return;
    setIsResending(true);
    setOtpError(null);
    setApiError(null);

    try {
      const response = await forgotPassword(phoneValue);
      setSentEmail(response.email);
      setCooldown(60);
      toast.success("OTP resent successfully!");
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
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          id="forgot-back-btn"
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
          Back to Login
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
            Forgot Password
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
            {sentEmail
              ? "Enter the 6-digit OTP sent to your email"
              : "Enter your registered mobile number and we'll send an OTP to your linked email"}
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
          {/* Success banner — shows the email after OTP is sent */}
          {sentEmail && (
            <div
              style={{
                background: colors.successBg,
                border: `1px solid ${colors.successBorder}`,
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
                animation: "fadeInUp 0.3s ease-out",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <CheckCircle size={18} color={colors.successText} />
                <span style={{ color: colors.successText, fontSize: "13px", fontFamily, fontWeight: 600 }}>
                  OTP Sent Successfully!
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(34, 197, 94, 0.08)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              >
                <Mail size={16} color={colors.successText} />
                <div>
                  <p style={{ fontSize: "12px", color: colors.muted, fontFamily, margin: "0 0 2px" }}>
                    OTP has been sent to
                  </p>
                  <p style={{ fontSize: "14px", color: colors.text, fontFamily, fontWeight: 700, margin: 0, wordBreak: "break-all" }}>
                    {sentEmail}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Error banner */}
          {apiError && !sentEmail && (
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
                  id="forgot-verify-email-btn"
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
                  Verify Email First
                </button>
              )}
            </div>
          )}

          {/* Phone number form — only show when OTP hasn't been sent yet */}
          {!sentEmail && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Mobile Number */}
                <div>
                  <label htmlFor="forgot-phone" style={labelStyle}>
                    Registered Mobile Number <span style={{ color: colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={iconStyle} />
                    <input
                      id="forgot-phone"
                      type="tel"
                      placeholder="Enter your 10-digit mobile number"
                      inputMode="numeric"
                      autoComplete="tel"
                      autoFocus
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

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="forgot-send-otp-btn"
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
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── OTP Verification Section ─────────────────────── */}
          {sentEmail && (
            <div style={{ animation: "fadeInUp 0.4s ease-out" }}>
              {/* OTP Error */}
              {otpError && (
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
                    {otpError}
                  </span>
                </div>
              )}

              {/* OTP Label */}
              <label style={{ ...labelStyle, textAlign: "center", marginBottom: "14px" }}>
                Enter 6-digit OTP <span style={{ color: colors.error }}>*</span>
              </label>

              {/* 6 OTP Input Boxes */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "24px",
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
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    disabled={isVerifying}
                    id={`forgot-otp-input-${index}`}
                    aria-label={`OTP digit ${index + 1}`}
                    style={{
                      width: "50px",
                      height: "56px",
                      textAlign: "center",
                      fontSize: "22px",
                      fontWeight: 700,
                      fontFamily: "'Courier New', monospace",
                      color: colors.text,
                      background: value ? "rgba(200, 75, 49, 0.06)" : colors.inputBg,
                      border: value
                        ? `2px solid ${colors.primary}`
                        : otpError
                          ? `2px solid ${colors.error}`
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
                        e.target.style.borderColor = otpError ? colors.error : colors.border;
                        e.target.style.boxShadow = "none";
                      }
                    }}
                  />
                ))}
              </div>

              {/* Verify OTP Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying || !isOtpComplete}
                id="forgot-verify-otp-btn"
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    isVerifying || !isOtpComplete
                      ? "rgba(200, 75, 49, 0.5)"
                      : colors.primary,
                  color: "#fff",
                  fontFamily,
                  fontSize: "15px",
                  fontWeight: 700,
                  border: "none",
                  cursor: isVerifying || !isOtpComplete ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  opacity: isVerifying || !isOtpComplete ? 0.8 : 1,
                  boxShadow: isOtpComplete ? "0 4px 14px rgba(200, 75, 49, 0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isVerifying && isOtpComplete) {
                    (e.target as HTMLButtonElement).style.background = colors.primaryHover;
                    (e.target as HTMLButtonElement).style.transform = "translateY(-1px)";
                    (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(200, 75, 49, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVerifying && isOtpComplete) {
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
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify OTP
                  </>
                )}
              </button>

              {/* Resend OTP Section */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: colors.muted,
                    fontFamily,
                    margin: "0 0 10px",
                  }}
                >
                  Didn't receive the OTP?
                </p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || cooldown > 0}
                  id="forgot-resend-otp-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: `1.5px solid ${cooldown > 0 ? colors.border : colors.primary}`,
                    borderRadius: "10px",
                    padding: "10px 20px",
                    color: cooldown > 0 ? colors.muted : colors.primary,
                    fontFamily,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: cooldown > 0 || isResending ? "not-allowed" : "pointer",
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
            </div>
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
