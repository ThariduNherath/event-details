const Waitlist = require('../models/Waitlist')
const User = require('../models/User')

// POST /api/waitlist — logged-in user joins the waitlist for a sold-out tier
exports.join = async (req, res) => {
  try {
    const { tier } = req.body
    if (!tier || !['Explorer', 'Architect', 'Visionary'].includes(tier)) {
      return res.status(400).json({ error: 'Please choose a valid ticket tier' })
    }

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const existing = await Waitlist.findOne({ userId: user._id, tier })
    if (existing) {
      return res.status(409).json({ error: "You're already on the waitlist for this tier" })
    }

    const entry = await Waitlist.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      tier,
    })

    res.status(201).json({ entry })
  } catch (err) {
    console.error('Join waitlist error:', err)
    res.status(500).json({ error: 'Could not join waitlist' })
  }
}

// GET /api/waitlist/me — check which tiers the current user is already waitlisted for
exports.getMine = async (req, res) => {
  try {
    const entries = await Waitlist.find({ userId: req.user.userId })
    res.json({ tiers: entries.map((e) => e.tier) })
  } catch (err) {
    console.error('Get my waitlist error:', err)
    res.status(500).json({ error: 'Could not load your waitlist status' })
  }
}

// GET /api/waitlist — admin only, all entries
exports.getAll = async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ createdAt: -1 })
    res.json({ entries })
  } catch (err) {
    console.error('Get waitlist error:', err)
    res.status(500).json({ error: 'Could not load waitlist' })
  }
}

// DELETE /api/waitlist/:id — admin only
exports.remove = async (req, res) => {
  try {
    const entry = await Waitlist.findByIdAndDelete(req.params.id)
    if (!entry) return res.status(404).json({ error: 'Entry not found' })
    res.json({ success: true })
  } catch (err) {
    console.error('Delete waitlist entry error:', err)
    res.status(500).json({ error: 'Could not remove entry' })
  }
}