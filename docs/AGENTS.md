The project's memory. Update in the SAME turn as any meaningful change (see GUIDE.md)

worklog/YYYY-MM.md — append-only what/why/touched entries; never rewrite old entries
STATE.md — current state, in-flight items, open questions; keep it matching reality
decisions/ — immutable shaping-decision records (convention/dependency/architecture); supersede with a new record, never edit an old one
archive/YYYY-MM-DD-topic.md — where a no-longer-active STATE section goes instead of being deleted
a11y/, audit/ — accessibility notes and audit outputs
component-doc-page-playbook.md — the doc-page layout/section/quality reference

Adding a decision: next number continues the sequence in decisions/ (zero-padded, NNNN-slug.md)
Windows note: CRLF + em-dash encoding can break in-place string edits here — a small Node read/replace/write script is the reliable workaround
