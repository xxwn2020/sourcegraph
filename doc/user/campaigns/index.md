# Campaigns

Campaigns let you make large-scale code changes across many repositories.

> NOTE: Campaigns are in beta.

## About campaigns

A campaign streamlines the creation and tracking of pull requests across many repositories and code hosts. After you create a campaign, you tell it what changes to make (by providing a script that will run in each repository). The campaign lets you create pull requests on all affected repositories, and it tracks their progress until they're all merged. You can preview the changes and update them at any time.

People usually use campaigns to make the following kinds of changes:

- Cleaning up common problems using linters
- Updating uses of deprecated library APIs
- Upgrading dependencies
- Patching critical security issues
- Standardizing build, configuration, and deployment files

For step-by-step instructions to create your first campaign, see [Hello Universe Campaign](TODO) in Sourcegraph Guides.

<!-- TODO(sqs): link to about site for "why use campaigns?"

Why use campaigns?

With campaigns, making large-scale changes becomes:

- Simpler: Just provide a script and select the repositories.
- Easier to follow through on: You can track the progress of all pull requests, including checks and review statuses, to see where to help out and to confirm when everything's merged.
- Less scary: You can preview everything, roll out changes gradually, and update all changes even after creation.
- Collaborative: Other people can see all the changes, including those still in preview, in one place.

-->

<!-- TODO(sqs): Add video here, similar to https://www.youtube.com/aqcCrqRB17w (which will need to be updated for the new campaign flow). -->

## Supported code hosts and changeset types

A single campaign can span many repositories and many code hosts. The generic term **changeset** is used to refer to any of the following:

- GitHub pull requests
- Bitbucket Server pull requests
- Bitbucket Cloud pull requests (not yet supported)
- GitLab merge requests (not yet supported)
- Phabricator diffs (not yet supported)
- Gerrit changes (not yet supported)

## Viewing campaigns

You can view a list of all campaigns by clicking the <img src="campaigns-icon.svg" alt="Campaigns icon" /> campaigns icon in the top navigation bar.

Use the filters to switch between showing all campaigns, open campaigns, or closed campaigns.

## Creating a new campaign

> **Creating your first campaign?** See [Hello Universe Campaign](TODO) in Sourcegraph Guides for step-by-step instructions.

1. Click the <img src="campaigns-icon.svg" alt="Campaigns icon" /> campaigns icon in the top navigation bar.
1. Click the **＋ New campaign** button.
1. Type a name for your campaign. The name will be the title of each changeset (e.g., the pull request title).
1. Type an optional description, which will be the description or body of each changeset.
1. Choose a branch name (or use the suggested one). This is the branch on each repository where the campaign's changes will be pushed to.
1. Click the **Create campaign** button.

You've created a new campaign, but it doesn't have any changes yet. Next, you can [add patches to specify what changes to make](#adding-patches-to-specify-what-changes-to-make).

If the changesets were already created (outside of campaigns), you can [track existing changesets](#tracking-existing-changesets) in your campaign.

## Adding patches to specify what changes to make

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

After you've [created a campaign](#creating-a-new-campaign), you can tell it what changes to make by submitting a list of patches. A patch is a change (in diff format) to a specific repository on a specific branch.

Don't worry! The campaign will show you a preview of all changesets (e.g., GitHub pull requests) that will be created from the patches. No repositories will be affected until you're ready and decide to publish the changesets.

To provide a list of patches: <!-- TODO!(sqs) -->

When you're ready, you can [publish the changesets](#publishing-branches-and-changesets-to-the-code-host), which will create commits with your changes, push a branch to each affected repository, and create changesets on the code host for review and merging.

You can update a campaign's changes at any time, even after you've published changesets. For more information, see "[Updating a campaign](#updating-a-campaign)".

### Example campaigns

The [example campaigns](examples/index.md) show how to use campaigns to make useful, real-world changes:

* [Using ESLint to automatically migrate to a new TypeScript version](examples/eslint_typescript_version.md)
* [Adding a GitHub action to upload LSIF data to Sourcegraph](examples/lsif_action.md)
* [Refactoring Go code using Comby](examples/refactor_go_comby.md)

## Publishing branches and changesets to the code host

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

A changeset in a campaign is an unpublished preview until you decide to publish it to the code host.

## Monitoring campaign progress and changeset statuses

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

A campaign monitors all of its changesets for updates to:

- Status (open/merged/closed)
- Checks (green/yellow/red combined check status)
- Review status (approved/TODO)

You can see the overall trend of a campaign in the burndown chart, which shows the proportion of changesets that have been merged over time since the campaign was created.

<!-- TODO(sqs): screenshot -->

In the list of changesets, you can see the detailed status for each changeset.

<!-- TODO(sqs): screenshot -->

If you lack access to view a repository, any changesets in that repository will appear grayed out in the list. Only a subset of information will be shown. For more information, see "[Repository permissions for campaigns](managing_access.md#repository-permissions-for-campaigns)".

## Updating a campaign

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

## Tracking existing changesets

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

## Closing or deleting a campaign

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

## [Managing access to campaigns](managing_access.md)

See "[Managing access to campaigns](managing_access.md)".

## Code host and repository permissions in campaigns

All actions on the code host (such as pushing a branch or opening a changeset) are performed by your individual user account, not by a bot user. For more information, see "[Code host interactions in campaigns](managing_access.md#code-host-interactions-in-campaigns)".

[Repository permissions](../../admin/repo/permission.md) are enforced when campaigns display information. For more information, see "[Repository permissions in campaigns](managing_access.md#repository-permissions-for-campaigns)".

## Site admin configuration for campaigns

Using campaigns requires a [code host connection](../../admin/external_service/index.md) to a supported code host (currently GitHub and Bitbucket Server).

Site admins can also:

- [Allow users to authenticate via the code host](../../admin/auth/index.md#github), which makes it easier for users to authorize [code host interactions in campaigns](managing_access.md#code-host-interactions-in-campaigns)
- [Configure repository permissions](../../admin/repo/permission.md), which campaigns will respect
- [Disable campaigns for all users](managing_access.md#disabling-campaigns-for-all-users)

## Concepts

- A **campaign** is group of related changes to code, along with a title and description.
- You supply a set of **patches** to a campaign. Each patch is a unified diff describing changes to a specific commit and branch in a repository. (To produce the patches, you provide a script that runs in the root of each repository and changes files.)
- The campaign converts the patches into **changesets**, which is a generic term for pull requests, merge requests, or any other reviewable chunk of code. (Code hosts use different terms for this, which is why we chose a generic term.)
- Initially a changeset is just a **preview** and is not actually pushed to or created on the code host.
- You **publish** a changeset when you're ready to push the branch and create the changeset on the code host.

## Roadmap

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

### Known issues

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

- The only supported code hosts are GitHub and Bitbucket Server. Support for [all other code hosts](../../admin/external_service/index.md) is planned.
- It is not yet possible for a campaign to have multiple changesets in a single repository (e.g., to make changes to multiple subtrees in a monorepo).
- Forking a repository and creating a pull request on the fork is not yet supported. Because of this limitation, you need write access to each repository that your campaign will change (in order to push a branch to it).
