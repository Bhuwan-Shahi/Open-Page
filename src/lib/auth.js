import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Check if OTP is valid
export function isOTPValid(otpExpiresAt) {
  return new Date() < new Date(otpExpiresAt);
}

// Generate OTP expiration time (10 minutes from now)
export function getOTPExpiration() {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic validation)
export function isValidPhone(phone) {
  const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Check if user is admin
export function isAdmin(user) {
  return user && user.role === 'ADMIN';
}

// Sanitize user data for client
export function sanitizeUser(user) {
  const { password, otpCode, otpExpiresAt, otpAttempts, ...sanitized } = user;
  return sanitized;
}
