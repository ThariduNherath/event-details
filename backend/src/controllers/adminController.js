const User = require('../models/User')
const Booking = require('../models/Booking')

exports.getStats = async (req, res) => {
  try {
    // Real revenue/stats exclude admin test purchases
    const paidOrders = await Booking.find({ status: 'paid', isAdminOrder: { $ne: true } }).sort({ updatedAt: 1 })

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.unitPrice * o.quantity, 0)
    const totalTicketsSold = paidOrders.reduce((sum, o) => sum + o.quantity, 0)
    const totalOrders = paidOrders.length
    const totalUsers = await User.countDocuments()

    const byTier = {}
    for (const o of paidOrders) {
      if (!byTier[o.tier]) byTier[o.tier] = { tier: o.tier, quantity: 0, revenue: 0 }
      byTier[o.tier].quantity += o.quantity
      byTier[o.tier].revenue += o.unitPrice * o.quantity
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } })

    const dailyMap = {}
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      dailyMap[key] = { date: key, revenue: 0, tickets: 0, orders: 0 }
    }
    paidOrders.forEach((o) => {
      const key = new Date(o.updatedAt).toISOString().slice(0, 10)
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.unitPrice * o.quantity
        dailyMap[key].tickets += o.quantity
        dailyMap[key].orders += 1
      }
    })
    const dailySales = Object.values(dailyMap)

    let running = 0
    const revenueTrend = dailySales.map((d) => {
      running += d.revenue
      return { date: d.date, revenue: running }
    })

    res.json({
      totalRevenue,
      totalTicketsSold,
      totalOrders,
      totalUsers,
      newUsersThisWeek,
      byTier: Object.values(byTier),
      dailySales,
      revenueTrend,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ error: 'Could not load stats' })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json({ users })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: 'Could not load users' })
  }
}

// Orders table shows EVERYTHING including admin test orders — but tagged, for transparency
exports.getOrders = async (req, res) => {
  try {
    const orders = await Booking.find({ status: 'paid' })
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(200)
    res.json({ orders })
  } catch (err) {
    console.error('Admin orders error:', err)
    res.status(500).json({ error: 'Could not load orders' })
  }
}