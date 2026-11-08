---
"@kernel/ui": patch
---

Fix CommandDialog: DialogTitle/DialogDescription moved inside DialogContent (Base UI requires them in the popup context) and palette children are wrapped in a Command root so CommandInput/CommandList get their cmdk store. The component crashed on open before this; it was never exercised — the gallery only demos inline Command. Also widens the palette to the lg dialog width.
