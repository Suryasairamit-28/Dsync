const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
  try {
    let token = req.cookies.token

    // Also check Authorization header as fallback
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Verify user still exists
      const user = await User.findById(decoded.userId).select("-password")
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      req.user = user
      req.userId = decoded.userId
      next()
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError.message)

      // Clear invalid cookie
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      })

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = auth
