/** Bids are quoted as BASIS everywhere in this app: cents over or under the
    futures month, never a flat cash price. The sign is the point — it says which
    side of the board the bid sits on — so a positive value keeps its `+`. */
export const basis = (n: number) => (n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2))
