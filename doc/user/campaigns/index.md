# Campaigns

Campaigns let you make large-scale code changes. A campaign is like a cross-repository pull request. You create a campaign and tell it what changes to make (by providing a script to run). The campaign then creates pull requests on all affected repositories---and tracks progress until they're all merged.

The changes made by campaigns usually fit into a few general categories:

- Cleaning up common problems using linters
- Updating uses of deprecated library APIs
- Upgrading dependencies
- Patching critical security issues
- Standardizing build, configuration, and deployment files

With campaigns, making large-scale changes becomes:

- Simpler: Just provide a script and select the repositories.
- Easier to follow through on: You can track the progress of all pull requests, including checks and review statuses, to see where to help out and to confirm when everything's merged.
- Less scary: You can preview everything, roll out changes gradually, and update all changes even after creation.
- Collaborative: Other people can see all the changes, including those still in preview, in one place.

> NOTE: Campaigns are in beta. The currently supported code hosts are GitHub and Bitbucket Server.

<!-- TODO(sqs): Add video here, similar to https://www.youtube.com/aqcCrqRB17w (which will need to be updated for the new campaign flow). -->

## Viewing campaigns

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

## Creating a campaign

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

Any user can create a campaign.

## Specifying what changes to make

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

You can update a campaign's changes at any time, even after you've published changesets. For more information, see "[Updating a campaign](#updating-a-campaign)".

## [Example campaigns](examples/index.md)

The [example campaigns](examples/index.md) show how to use campaigns for:

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

## Roadmap

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

### Known issues

<!-- TODO(sqs): This section is rough/incomplete/outline-only. -->

- The only supported code hosts are GitHub and Bitbucket Server. Support for [all other code hosts](../../admin/external_service/index.md) is planned.
- Forking a repository and creating a pull request on the fork is not yet supported. Because of this limitation, you need write access to each repository that your campaign will change (in order to push a branch to it).
