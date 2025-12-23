"use client";

import React from "react";
import { Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { login, getAuthUser, getUserById } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignInPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // API key is sent in headers
      const response = await login(formData.email, formData.password);
      
      // Check for network/connection errors
      if (response.status === 0) {
        setError(response.error || "Сервертэй холбогдох боломжгүй. Интернэт холболтоо шалгана уу.");
        return;
      }
      
      // Check for error
      if (response.error) {
        setError(response.error || response.message || "Нэвтрэхэд алдаа гарлаа");
        return;
      }

      // Check response status
      if (response.status !== 200 && response.status !== 201) {
        setError(`Алдаа: HTTP ${response.status}`);
        return;
      }

      // Check if response.data is a string (IP address or other)
      if (typeof response.data === "string") {
        setError(` ${response.data}.`);
        return;
      }
      
      // Check for token in response (try multiple possible locations)
      const token = 
        response.data?.token || 
        response.data?.access_token || 
        response.data?.data?.token ||
        response.data?.data?.access_token ||
        (typeof response.data === "object" && response.data !== null ? (response.data as any).token : null);
      
      if (token && typeof token === "string") {
        // Save token to localStorage
        localStorage.setItem("token", token);
        
        // Fetch current authenticated user (with roles/permissions) using token
        try {
          const userResp = await getAuthUser();
          const authUser = userResp?.data?.data || userResp?.data || null;
          if (authUser) {
            localStorage.setItem("user", JSON.stringify(authUser));
          } else {
            // No user data returned; keep going
          }
        } catch (err) {
          // Ignore fetch error, user stays unauthenticated
        }

        // Redirect to main page
        router.push("/main");
      } else {
        setError("Token хүлээн авсангүй. Response structure: " + JSON.stringify(response.data).substring(0, 300));
      }
    } catch (err) {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 via-white to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center ">
          <div className="flex justify-center py-6">
        <Image
          src="/Sutailogo.jpg"
          alt="Сутайн буянт лого"
          width={160}
          height={160}
          priority
          className="h-28 w-28 rounded-2xl object-cover"
        />
      </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Сутайн буянт
          </h1>
          <p className="text-slate-500">
            Энэ систем нь Сутайн буянт захын дотоод систем юм.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Имэйл хаяг
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Нууц үг
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg "
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <Link
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Нууц үг мартсан уу?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 text-base bg-slate-800 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
