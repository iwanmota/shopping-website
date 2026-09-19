# Separate Codex PR author

Hermes remains the independent advisory reviewer. The Codex App only opens PRs;
it does not approve or merge them. Human approval and existing branch protections remain in place.

## One-time GitHub setup

1. Visit https://github.com/settings/apps/new while signed in as the repository owner.
2. Name the App `iwanmota-codex` (or another available name). Set its homepage to
   `https://github.com/iwanmota/shopping-website`.
3. Leave OAuth callbacks and user authorization disabled. Uncheck **Active** under Webhook.
4. Repository permissions: **Contents: Read-only**, **Pull requests: Read and write**.
   Metadata read access is automatic. No organization/account permissions are needed.
5. Select **Only on this account**, then create the App.
6. On its General page, note the **App ID** and generate a private key. Keep the downloaded
   `.pem` outside the repository; never paste it into chat or commit it.
7. Select **Install App**, install on your account, and select only `shopping-website`.
8. In the repository's Settings → Secrets and variables → Actions, add variable
   `CODEX_APP_ID` and secret `CODEX_APP_PRIVATE_KEY` (the complete PEM contents).

Official instructions: https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app

## Bootstrap before the workflow exists on main

Use the reviewed local script with the downloaded key. It generates a short-lived,
repository-scoped installation token, opens a PR, and revokes the token afterward.
Only the PR URL, author, and branch names are printed. It does not push code or close existing PRs.

```sh
export CODEX_APP_ID=YOUR_APP_ID
export CODEX_APP_PRIVATE_KEY_FILE=/absolute/path/outside/repo/private-key.pem
node scripts/create-bot-pr.mjs codex/example main 'PR title' /absolute/path/body.md
```

Existing PR authors cannot be reassigned. Open replacement PRs on existing branches,
verify authorship and CI, then cross-link and close the superseded PRs. For the About
change, keep its base set to the storefront branch until the storefront merges.

## Ongoing use after merge

Run **Actions → Open Codex pull request → Run workflow**, selecting main and supplying
head branch, base branch, title, and body. The workflow never checks out or executes PR
code with the App credential. GitHub revokes its short-lived token when the job ends.

The GitHub App identity is separate from Git commit authorship. You can still push branches
using your existing account and approve PRs opened by the App. Changing the repository's
last-pusher approval policy in the future may affect that workflow.
