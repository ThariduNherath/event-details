const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const { sendVerificationEmail, sendWelcomeEmail, sendAdminNewUserAlert } = require('../lib/mailer')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000,
}

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_TTL_MS,
}

function signAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  )
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

async function issueRefreshToken(userId, userAgent) {
  const rawToken = crypto.randomBytes(40).toString('hex')
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: userAgent || '',
  })
  return rawToken
}

async function setAuthCookies(res, user, userAgent) {
  const accessToken = signAccessToken(user)
  const refreshToken = await issueRefreshToken(user._id, userAgent)
  res.cookie('nexus_token', accessToken, ACCESS_COOKIE_OPTIONS)
  res.cookie('nexus_refresh', refreshToken, REFRESH_COOKIE_OPTIONS)
}

function toUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    authProvider: user.authProvider,
    emailVerified: user.emailVerified,
  }
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
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      emailVerified: false,
      verificationToken,
      verificationExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    })

    // Send emails (User Verification, User Welcome, Admin Alert)
    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
      console.error('Could not send verification email:', err)
    )
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error('Could not send welcome email:', err)
    )
    sendAdminNewUserAlert(user).catch((err) =>
      console.error('Could not send admin new user alert:', err)
    )

    await setAuthCookies(res, user, req.headers['user-agent'])
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

    if (user.authProvider === 'local' && !user.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in', needsVerification: true })
    }

    await setAuthCookies(res, user, req.headers['user-agent'])
    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}

exports.logout = async (req, res) => {
  const rawRefresh = req.cookies?.nexus_refresh
  if (rawRefresh) {
    await RefreshToken.updateOne({ tokenHash: hashToken(rawRefresh) }, { revoked: true }).catch(() => {})
  }
  res.clearCookie('nexus_token', { path: '/' })
  res.clearCookie('nexus_refresh', { path: '/api/auth' })
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
        emailVerified: true,
      })

      // Send Admin Alert & Welcome email for brand new Google Users
      sendWelcomeEmail(user.email, user.name).catch((err) =>
        console.error('Could not send welcome email:', err)
      )
      sendAdminNewUserAlert(user).catch((err) =>
        console.error('Could not send admin alert email:', err)
      )
    } else if (!user.googleId) {
      user.googleId = googleId
      user.avatar = user.avatar || picture
      user.emailVerified = true
      await user.save()
    }

    await setAuthCookies(res, user, req.headers['user-agent'])
    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ error: 'This verification link is invalid or has expired' })
    }

    user.emailVerified = true
    user.verificationToken = undefined
    user.verificationExpires = undefined
    await user.save()

    res.json({ success: true, email: user.email })
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ error: 'Could not verify email' })
  }
}

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || user.emailVerified || user.authProvider !== 'local') {
      return res.json({ success: true })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    user.verificationToken = verificationToken
    user.verificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
    await user.save()

    await sendVerificationEmail(user.email, user.name, verificationToken)

    res.json({ success: true })
  } catch (err) {
    console.error('Resend verification error:', err)
    res.status(500).json({ error: 'Could not resend verification email' })
  }
}

exports.refresh = async (req, res) => {
  try {
    const rawToken = req.cookies?.nexus_refresh
    if (!rawToken) {
      return res.status(401).json({ error: 'No refresh token' })
    }

    const tokenHash = hashToken(rawToken)
    const stored = await RefreshToken.findOne({ tokenHash })

    if (!stored) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    if (stored.revoked) {
      await RefreshToken.updateMany({ userId: stored.userId, revoked: false }, { revoked: true })
      res.clearCookie('nexus_token', { path: '/' })
      res.clearCookie('nexus_refresh', { path: '/api/auth' })
      return res.status(401).json({ error: 'Session invalid — please log in again' })
    }

    if (stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired — please log in again' })
    }

    const user = await User.findById(stored.userId)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    const newRawToken = crypto.randomBytes(40).toString('hex')
    const newTokenHash = hashToken(newRawToken)

    await RefreshToken.create({
      userId: user._id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent: req.headers['user-agent'] || '',
    })
    stored.revoked = true
    stored.replacedByHash = newTokenHash
    await stored.save()

    const accessToken = signAccessToken(user)
    res.cookie('nexus_token', accessToken, ACCESS_COOKIE_OPTIONS)
    res.cookie('nexus_refresh', newRawToken, REFRESH_COOKIE_OPTIONS)

    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Refresh error:', err)
    res.status(500).json({ error: 'Could not refresh session' })
  }
}

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

    const accessToken = signAccessToken(user)
    res.cookie('nexus_token', accessToken, ACCESS_COOKIE_OPTIONS)

    res.json({ user: toUserResponse(user) })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ error: 'Could not update profile' })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Please enter your current password' })
      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await RefreshToken.updateMany({ userId: user._id, revoked: false }, { revoked: true })

    res.json({ success: true })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Could not update password' })
  }
}

exports.deleteMyAccount = async (req, res) => {
  try {
    const { password } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.password) {
      if (!password) {
        return res.status(400).json({ error: 'Please enter your password to confirm' })
      }
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return res.status(401).json({ error: 'Incorrect password' })
      }
    }

    const Booking = require('../models/Booking')
    const Waitlist = require('../models/Waitlist')

    await Booking.deleteMany({ userId: user._id, status: 'cart' })
    await Waitlist.deleteMany({ userId: user._id })
    await RefreshToken.deleteMany({ userId: user._id })
    await User.findByIdAndDelete(user._id)

    res.clearCookie('nexus_token', { path: '/' })
    res.clearCookie('nexus_refresh', { path: '/api/auth' })
    res.json({ success: true })
  } catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ error: 'Could not delete your account' })
  }
}