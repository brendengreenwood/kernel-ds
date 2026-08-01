# 0055 — Use DSDS-compatible slug identifiers

Date: 2026-08-01
Status: accepted

## Context

Decision 0054 established generated official DSDS artifacts and initially assigned each artifact the canonical dotted Kernel entity ID, such as `component.sidebar`, as its DSDS `identifier`.

The pinned official DSDS 0.15.2 schema restricts identifiers to `^[a-z][a-z0-9-]*$`. Kernel's dotted, kind-prefixed IDs therefore cannot occupy the official field without producing invalid documents. The interoperability layer must satisfy the official schema without weakening Kernel's canonical identity.

## Decision

Generated DSDS artifacts use the stable slug portion of the Kernel entity ID as the official identifier. For example, `component.sidebar` exports as `sidebar`.

The complete canonical Kernel ID and original kind remain authoritative under `$extensions.com.kernel.catalog`, alongside package ownership, portal anchor, source paths, relationships, and the compatibility-contract version. Generators refuse any Kernel ID whose slug portion cannot produce a valid official DSDS identifier rather than sanitizing or guessing.

This supersedes only decision 0054's statement that the official identifier is the complete canonical Kernel entity ID. Decision 0054's kind mapping and generated-compatibility architecture remain authoritative.

## Consequences

- Generated artifacts validate against DSDS 0.15.2's identifier constraint.
- Consumers that need Kernel identity read `entity.$extensions["com.kernel.catalog"].entityId`; the DSDS identifier remains portable and schema-valid.
- Identifier collisions across mapped official kinds must be detected before the full catalog export ships.
- Changing this identifier policy is an architecture change requiring a new decision.
