const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("yatrasetu_token");
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    // Attach extra fields from the response to the error for downstream handling
    const error = new Error(data.message || "Request failed") as any;
    error.requiresVerification = data.requiresVerification || false;
    error.email = data.email || null;
    throw error;
  }

  return data;
}
