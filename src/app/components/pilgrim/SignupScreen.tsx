import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Loader2,
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { signupUser } from "../../lib/api";

// ── Types ────────────────────────────────────────────────────

interface SignupFormData {
  fullName: string;
  gender: string;
  age: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ── Validation helpers ───────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_MIN = 8;

function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < PASSWORD_MIN) errors.push(`At least ${PASSWORD_MIN} characters`);
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) errors.push("One special character");
  return errors;
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

export function SignupScreen() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiErrorField, setApiErrorField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      gender: "",
      age: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const passwordErrors = passwordValue ? getPasswordErrors(passwordValue) : [];

  const onSubmit = async (data: SignupFormData) => {
    if (isSubmitting) return;
    setApiError(null);
    setApiErrorField(null);
    setIsSubmitting(true);

    try {
      await signupUser({
        fullName: data.fullName.trim(),
        gender: data.gender,
        age: parseInt(data.age, 10),
        mobile: data.mobile.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      toast.success("OTP sent to your email. Please verify.");
      navigate("/verify-email", { state: { email: data.email.trim().toLowerCase() } });
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";

      // Map backend errors to specific fields
      if (message.toLowerCase().includes("email")) {
        setApiErrorField("email");
      } else if (message.toLowerCase().includes("phone")) {
        setApiErrorField("mobile");
      }

      setApiError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────

  const renderFieldError = (fieldName: keyof SignupFormData) => {
    const error = errors[fieldName];
    const isApiField = apiErrorField === fieldName;

    if (!error && !isApiField) return null;

    return (
      <p
        role="alert"
        style={{
          color: colors.error,
          fontSize: "12px",
          fontFamily,
          margin: "4px 0 0",
          lineHeight: 1.4,
        }}
      >
        {error?.message || (isApiField ? apiError : "")}
      </p>
    );
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

  const inputFocusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = colors.primary;
    e.target.style.boxShadow = `0 0 0 3px rgba(200, 75, 49, 0.15)`;
  };

  const inputBlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) => {
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
          maxWidth: "480px",
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
            Create Account
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: colors.muted,
              fontFamily,
              margin: 0,
            }}
          >
            Join YatraSetu for a seamless pilgrimage experience
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
          {apiError && !apiErrorField && (
            <div
              role="alert"
              style={{
                background: colors.errorBg,
                border: `1px solid rgba(239, 68, 68, 0.2)`,
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: colors.error, fontSize: "13px", fontFamily }}>
                {apiError}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Full Name */}
              <div>
                <label htmlFor="signup-fullName" style={labelStyle}>
                  Full Name <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={iconStyle} />
                  <input
                    id="signup-fullName"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    style={{
                      ...inputBaseStyle,
                      ...(errors.fullName ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.fullName)}
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                </div>
                {renderFieldError("fullName")}
              </div>

              {/* Gender & Age Row */}
              <div style={{ display: "flex", gap: "12px" }}>
                {/* Gender */}
                <div style={{ flex: 1 }}>
                  <label htmlFor="signup-gender" style={labelStyle}>
                    Gender <span style={{ color: colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <ChevronDown
                      size={16}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: colors.muted,
                        pointerEvents: "none",
                      }}
                    />
                    <select
                      id="signup-gender"
                      aria-required="true"
                      aria-invalid={!!errors.gender}
                      aria-describedby={errors.gender ? "gender-error" : undefined}
                      style={{
                        ...inputBaseStyle,
                        paddingLeft: "12px",
                        paddingRight: "36px",
                        appearance: "none",
                        cursor: "pointer",
                        color: watch("gender") ? colors.text : colors.muted,
                      }}
                      onFocus={(e) => inputFocusHandler(e)}
                      onBlur={(e) => inputBlurHandler(e, !!errors.gender)}
                      {...register("gender", {
                        required: "Please select your gender",
                      })}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {renderFieldError("gender")}
                </div>

                {/* Age */}
                <div style={{ flex: 1 }}>
                  <label htmlFor="signup-age" style={labelStyle}>
                    Age <span style={{ color: colors.error }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={16} style={iconStyle} />
                    <input
                      id="signup-age"
                      type="number"
                      placeholder="Age"
                      inputMode="numeric"
                      min={1}
                      max={120}
                      autoComplete="off"
                      aria-required="true"
                      aria-invalid={!!errors.age}
                      aria-describedby={errors.age ? "age-error" : undefined}
                      style={{
                        ...inputBaseStyle,
                        ...(errors.age ? inputErrorStyle : {}),
                      }}
                      onFocus={inputFocusHandler}
                      onBlur={(e) => inputBlurHandler(e, !!errors.age)}
                      {...register("age", {
                        required: "Age is required",
                        validate: (val) => {
                          const num = parseInt(val, 10);
                          if (isNaN(num)) return "Enter a valid number";
                          if (num < 1 || num > 120) return "Age must be between 1 and 120";
                          return true;
                        },
                      })}
                    />
                  </div>
                  {renderFieldError("age")}
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="signup-mobile" style={labelStyle}>
                  Mobile Number <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={iconStyle} />
                  <input
                    id="signup-mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    autoComplete="tel"
                    aria-required="true"
                    aria-invalid={!!errors.mobile || apiErrorField === "mobile"}
                    aria-describedby={errors.mobile ? "mobile-error" : undefined}
                    style={{
                      ...inputBaseStyle,
                      ...(errors.mobile || apiErrorField === "mobile" ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.mobile)}
                    {...register("mobile", {
                      required: "Mobile number is required",
                      pattern: {
                        value: MOBILE_REGEX,
                        message: "Enter a valid 10-digit Indian mobile number",
                      },
                    })}
                  />
                </div>
                {renderFieldError("mobile")}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signup-email" style={labelStyle}>
                  Email <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={iconStyle} />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!errors.email || apiErrorField === "email"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    style={{
                      ...inputBaseStyle,
                      ...(errors.email || apiErrorField === "email" ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.email)}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: EMAIL_REGEX,
                        message: "Enter a valid email address",
                      },
                    })}
                  />
                </div>
                {renderFieldError("email")}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" style={labelStyle}>
                  Password <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby="password-requirements"
                    style={{
                      ...inputBaseStyle,
                      paddingRight: "44px",
                      ...(errors.password ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.password)}
                    {...register("password", {
                      required: "Password is required",
                      validate: (val) => {
                        const errs = getPasswordErrors(val);
                        if (errs.length > 0) return `Missing: ${errs.join(", ")}`;
                        return true;
                      },
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
                {renderFieldError("password")}

                {/* Password strength indicators */}
                {passwordValue && passwordErrors.length > 0 && !errors.password && (
                  <div
                    id="password-requirements"
                    style={{
                      marginTop: "8px",
                      padding: "10px 12px",
                      background: colors.accent,
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily,
                      color: colors.muted,
                    }}
                  >
                    <p style={{ margin: "0 0 4px", fontWeight: 600, color: colors.secondary, fontSize: "11px" }}>
                      Password needs:
                    </p>
                    {passwordErrors.map((e) => (
                      <span
                        key={e}
                        style={{
                          display: "inline-block",
                          background: "rgba(200,75,49,0.1)",
                          color: colors.primary,
                          borderRadius: "4px",
                          padding: "2px 8px",
                          marginRight: "4px",
                          marginTop: "3px",
                          fontSize: "10px",
                          fontWeight: 500,
                        }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )}

                {passwordValue && passwordErrors.length === 0 && (
                  <p
                    style={{
                      color: "#22C55E",
                      fontSize: "11px",
                      fontFamily,
                      margin: "4px 0 0",
                      fontWeight: 500,
                    }}
                  >
                    ✓ Password meets all requirements
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="signup-confirmPassword" style={labelStyle}>
                  Confirm Password <span style={{ color: colors.error }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={iconStyle} />
                  <input
                    id="signup-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    style={{
                      ...inputBaseStyle,
                      paddingRight: "44px",
                      ...(errors.confirmPassword ? inputErrorStyle : {}),
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={(e) => inputBlurHandler(e, !!errors.confirmPassword)}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val) =>
                        val === passwordValue || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirmPassword((v) => !v)}
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
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {renderFieldError("confirmPassword")}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                id="signup-submit-btn"
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
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <p style={{ fontSize: "13px", color: colors.muted, fontFamily, margin: 0 }}>
              Already have an account?{" "}
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
          By signing up, you agree to YatraSetu's Terms of Service
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

        /* Remove number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
