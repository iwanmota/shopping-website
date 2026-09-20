# GitHub → ntfy notification PoC

The `GitHub notifications to ntfy` workflow publishes pull-request notifications
from `iwanmota/shopping-website` through the existing Cloudflare tunnel to
`https://ntfy.pilotstack.me`, on the shared `github` topic.

Events: opened, reopened, new commits, ready for review, closed, and merged.
Notifications include repository, PR number/title, event, head commit and a clickable
PR link. Draft PRs are included. Fork PRs are skipped because their runs cannot access
the repository publishing secret.

## Access

- Repository secret: `NTFY_PUBLISH_TOKEN`.
- Dedicated ntfy user: `github-shopping-website`, with write-only access to `github`.
- Requests send the token in an Authorization header, never in the URL or payload.
- Anonymous read/write access stays denied. The existing `ntfy` user can subscribe.
- Other repositories can share the topic using separate, individually revocable publishers.

In the ntfy app, use server `https://ntfy.pilotstack.me`, topic `github`, and your
existing ntfy login. Topic URL: https://ntfy.pilotstack.me/github.

No new GitHub repository webhook or server listener is required. The workflow runs
on GitHub-hosted runners and does not check out or execute PR code. It has a two-minute
job timeout and bounded HTTP timeouts. Failed delivery fails this notification job;
it is not a required merge check. There is no automatic retry to avoid duplicate
notifications after ambiguous network failures; a failed run can be rerun manually.

## Operation and recovery

To pause notifications, disable this workflow in GitHub Actions. To revoke its
publishing access, remove the `github-shopping-website` ntfy user with the server's
ntfy administration CLI. This leaves other publishers and the shared topic intact.
To rotate access, create a new token for that user, update the GitHub secret, verify
a delivery, then revoke the old token. Never paste tokens into PRs, logs or chat.

The ACL/user/token records reside in ntfy's existing auth database mounted from
`/mnt/app_config/ntfy/config`; include that location in infrastructure recovery.

## Hermes server reviewer

An outbound-only listener on the home server now consumes this topic. It checks
allowlisted PRs against GitHub and invokes the owner Hermes container using
`openai-codex` / `gpt-5.6-terra-900k`. It posts advisory COMMENT reviews through
`hermes-iwanmota-app[bot]`; human approval remains required. The timer polls 60 seconds
after each previous run finishes. There is no public Hermes callback endpoint.

The former `hermes-pr-review.yml` workflow called OpenRouter directly from GitHub
Actions. It is removed to avoid duplicate reviews and that workflow's API costs.
The new reviewer uses the owner's existing Hermes provider authentication. Existing
Actions secrets are retained for rollback; this change does not revoke them.

The server skips draft, closed and fork PRs, deduplicates head/base revisions, and
rechecks the revision before publication. The model has no tools and receives only
PR metadata and a bounded diff. Notifications are wake-up hints; titles and PR
content are untrusted. Only frontend/backend CI are required status checks; the
reviewer is advisory and its absence is not approval.

Operational details, input limits, retry handling, credentials and manual enqueue:
[media-server reviewer runbook](https://github.com/iwanmota/media-server/blob/main/docs/runbooks/hermes-github-review.md).
The disposable [acceptance PR #13](https://github.com/iwanmota/shopping-website/pull/13)
exercises draft skipping, duplicate suppression and review delivery for a new commit.

If the server is unavailable, queued notifications are limited by ntfy cache retention;
after a prolonged outage, manually enqueue eligible PRs. Retargeting a PR or requesting
a re-review does not currently emit a supported automatic event. To roll back, restore
the previous Actions workflow from Git and disable the server's review timer.
