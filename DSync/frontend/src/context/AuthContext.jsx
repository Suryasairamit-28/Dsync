"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const initializeAuth = useCallback(async () => {
    setLoading(true)

    try {
      // Try to get user from server using cookie
      const response = await api.get("/auth/me")
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.log("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      })

      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        return response.data
      } else {
        throw new Error(response.data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      })

      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        return response.data
      } else {
        throw new Error(response.data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData)
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        return response.data
      }
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await api.post("/auth/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        return response.data
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      throw error
    }
  }

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      // Force a clean redirect without causing reload loops
      window.location.replace("/login")
    }
  }, [])

  const value = {
    user,
    login,
    register,
    updateProfile,
    uploadAvatar,
    logout,
    loading,
    initialized,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
