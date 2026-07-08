---
name: kernel-ship
description: Finish a Kernel change — write the docs (worklog, STATE, decision record), commit to the working branch, open a PR, and confirm the Netlify production deploy. Use after /kernel-verify passes, or whenever asked to "ship", "commit and push", or "merge". Encodes the docs discipline and git/deploy flow.
user-invocable: true
---

# Kernel — ship a change

Docs are part of the change, not an afterthought. Do the docs in the **same
commit** as the code.

## 1. Docs (`docs/` is the project's memory — decision 0001)

- **Append** a what/why/verified/touched entry to `docs/worklog/YYYY-MM.md`. Append-only — never rewrite old entries.
- **Edit `docs/STATE.md` in place** so it matches reality (current state, in-flight, experiments, open questions). Bump "Last touched".
- If the change is a **shaping decision** (a convention, dependency, or architecture choice), add an immutable `docs/decisions/NNNN-topic.md` (next number). Supersede old records with new ones; never edit a shipped decision.
- Retire a dead STATE section to `docs/archive/YYYY-MM-DD-topic.md` instead of deleting it.
- Update `kernel-portal/README.md` and `CLAUDE.md` if the change alters file map, conventions, or coverage.

## 2. Commit + branch

Work on the designated branch (currently `claude/local-work-review-2mnbor`); create it from `origin/main` if missing. If its PR was already merged, restart from latest main (`git fetch origin main && git checkout -B <branch> origin/main`) — a merged PR is finished; new work is a **new** PR, never stacked on merged history. If the branch carries unmerged commits beyond merged history, rebase them onto the new base instead of discarding.

Commit message ends with the two trailers the environment requires (Co-Authored-By + Claude-Session). Do **not** put the model id in any committed artifact.

```bash
git add -A && git commit -m "…"
git push -u origin <branch>   # retry with backoff on network errors only
```

## 3. PR (only when asked) + merge

- Don't open a PR unless the user asked. When you do, mirror any `.github/PULL_REQUEST_TEMPLATE` structure; end the body with the Claude Code line.
- The owner's flow: build → PR → they say "merge" → merge via GitHub MCP (`merge_pull_request`, method `merge`) → confirm deploy.

## 4. Confirm the deploy (Netlify)

Netlify builds `main` (site `kernel-design-system`, id `22e1ff2b-5e90-4f3e-8b7b-d45907f8fcf1`). The static preview is NOT deployed — only `kernel-portal/`.

- Direct `curl` to `*.netlify.app` is blocked by the sandbox proxy (403). Use the **Netlify MCP**: `netlify-project-services-reader get-project` for the current deploy, then `netlify-deploy-services-reader get-deploy-for-site` to confirm `state: "ready"` and `commit_ref` matches the merge commit.
- A fresh merge takes ~1 min to build; poll with a background wait, not foreground sleep. Report the live commit + state when green.
