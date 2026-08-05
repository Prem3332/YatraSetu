import { request } from "./client";

export interface ApiUser {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: "devotee" | "temple_admin" | "police" | "medical";
  templeAssigned?: string | null;
  isAccessible: boolean;
  isVerified: boolean;
  language: "en" | "gu" | "hi";
  fcmToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const data = await request<{ success: boolean; user: ApiUser }>("/auth/me");
  return data.user;
}

export interface SignupPayload {
  fullName: string;
  gender: string;
  age: number;
  mobile: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: ApiUser;
}

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  const data = await request<SignupResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: payload.fullName,
      phone: payload.mobile,
      email: payload.email,
      password: payload.password,
      gender: payload.gender,
      age: payload.age,
    }),
  });
  return data;
}

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export async function verifyEmail(email: string, otp: string): Promise<VerifyEmailResponse> {
  const data = await request<VerifyEmailResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  return data;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export async function resendOtp(email: string): Promise<ResendOtpResponse> {
  const data = await request<ResendOtpResponse>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return data;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email: string;
}

export async function forgotPassword(phone: string): Promise<ForgotPasswordResponse> {
  const data = await request<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  return data;
}

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
  resetToken: string;
}

export async function verifyResetOtp(phone: string, otp: string): Promise<VerifyResetOtpResponse> {
  const data = await request<VerifyResetOtpResponse>("/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
  return data;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<ResetPasswordResponse> {
  const data = await request<ResetPasswordResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  });
  return data;
}

