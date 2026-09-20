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

## Scope

This is notification delivery only. It does not start Hermes, replace the existing
AI review, or grant access to the private Hermes/Mattermost network. Automated review
would require a separately implemented listener with event validation and deduplication;
notification titles and PR content must never be treated as executable instructions.
