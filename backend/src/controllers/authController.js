const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

function toUserResponse(user) {
  return { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, authProvider: user.authProvider }
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed })

    const token = signToken(user)
    res.cookie('nexus_token', token, COOKIE_OPTIONS)
    res.status(201).json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please continue with Google.' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user)
    res.cookie('nexus_token', token, COOKIE_OPTIONS)
    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

exports.logout = (req, res) => {
  res.clearCookie('nexus_token', { path: '/' })
  res.json({ success: true })
}

exports.me = async (req, res) => {
  const user = await User.findById(req.user.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: toUserResponse(user) })
}

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Could not verify Google account' })
    }

    const { sub: googleId, email, name, picture } = payload

    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] })

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        authProvider: 'google',
      })
    } else if (!user.googleId) {
      user.googleId = googleId
      user.avatar = user.avatar || picture
      await user.save()
    }

    const token = signToken(user)
    res.cookie('nexus_token', token, COOKIE_OPTIONS)
    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' })
  }
}

// PATCH /api/auth/profile — update name and/or avatar
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty' })
    }

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    user.name = name.trim()
    if (avatar !== undefined) user.avatar = avatar.trim()
    await user.save()

    // Re-sign the JWT so the name embedded in the cookie stays in sync
    const token = signToken(user)
    res.cookie('nexus_token', token, COOKIE_OPTIONS)

    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Could not update profile' })
  }
}

// PATCH /api/auth/password — change or set password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.password) {
      // User already has a password — must confirm the current one
      if (!currentPassword) {
        return res.status(400).json({ error: 'Please enter your current password' })
      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }
    }
    // If user.password is not set (Google-only account), this is the first time
    // they're setting a password — no current-password check needed.

    user.password = await bcrypt.hash(newPassword, 10)
    if (user.authProvider === 'google' && !user.password) {
      // no-op guard, password already set above
    }
    await user.save()

    res.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Could not update password' })
  }
}