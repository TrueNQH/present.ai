"use client"
import { useState } from "react";
import axios from "axios";
import type { AxiosError } from "axios";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      name: string;
      email: string;
      avatar: string | null;
      balance: string;
      free_trial_expiry: string;
    };
    token: string;
  };
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await axios.post<LoginResponse>(
        "https://www.aiscanner.tech/api/auth/logingoogle",
        { email, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        setSuccess("Đăng nhập thành công!");
        localStorage.setItem("aiscanner_token", response.data.data?.token ?? "");
      } else {
        setError(response.data.message ?? "Đăng nhập thất bại");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Lỗi đăng nhập");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        Đăng nhập
      </button>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </form>
  );
}