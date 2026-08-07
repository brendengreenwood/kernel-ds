/** Bids are quoted as BASIS everywhere in this app: cents over or under the
    futures month, never a flat cash price. The sign is the point — it says which
    side of the board the bid sits on — so a positive value keeps its `+`. */
export const basis = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2))

/** Bushels as a headline figure: 113,500 → 113.5k. Full precision belongs in a
    table cell, where the number is being compared to the one under it. In a
    roll-up tile it is being read at a glance, and seven glyphs at that size
    cost more width than the extra three digits are worth. */
export const bushelsShort = (n: number) => {
  if (n < 1000) return `${n}`
  // Whole thousands once there are three of them: at 100k+ the tenth is noise
  // in a figure being read at a glance, and it costs two glyphs of width.
  if (n >= 10000) return `${Math.round(n / 1000)}k`
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
}
