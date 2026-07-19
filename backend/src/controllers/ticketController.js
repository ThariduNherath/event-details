const TicketCapacity = require('../models/TicketCapacity')
const Booking = require('../models/Booking')

const TIERS = ['Explorer', 'Architect', 'Visionary']

exports.getAvailability = async (req, res) => {
  try {
    const capacities = await TicketCapacity.find()
    const capacityMap = {}
    capacities.forEach((c) => { capacityMap[c.tier] = c.capacity })

    const result = await Promise.all(
      TIERS.map(async (tier) => {
        const paid = await Booking.aggregate([
          { $match: { tier, status: 'paid', isAdminOrder: { $ne: true } } },
          { $group: { _id: null, total: { $sum: '$quantity' } } },
        ])
        const sold = paid[0]?.total || 0
        const capacity = capacityMap[tier] ?? null

        return {
          tier,
          capacity,
          sold,
          available: capacity === null ? null : Math.max(capacity - sold, 0),
          soldOut: capacity !== null && sold >= capacity,
        }
      })
    )

    res.json({ availability: result })
  } catch (err) {
    console.error('Get availability error:', err)
    res.status(500).json({ error: 'Could not load ticket availability' })
  }
}

exports.setCapacity = async (req, res) => {
  try {
    const { tier } = req.params
    const { capacity } = req.body

    if (!TIERS.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' })
    }
    if (capacity === undefined || capacity < 0) {
      return res.status(400).json({ error: 'Capacity must be a non-negative number' })
    }

    const doc = await TicketCapacity.findOneAndUpdate(
      { tier },
      { capacity },
      { upsert: true, new: true, runValidators: true }
    )

    res.json({ capacity: doc })
  } catch (err) {
    console.error('Set capacity error:', err)
    res.status(500).json({ error: 'Could not update capacity' })
  }
}

exports.removeCapacity = async (req, res) => {
  try {
    const { tier } = req.params
    await TicketCapacity.findOneAndDelete({ tier })
    res.json({ success: true })
  } catch (err) {
    console.error('Remove capacity error:', err)
    res.status(500).json({ error: 'Could not remove capacity limit' })
  }
}