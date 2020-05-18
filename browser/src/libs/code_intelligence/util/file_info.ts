import { Observable, of, zip } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { isPrivateRepoPublicSourcegraphComErrorLike } from '../../../../../shared/src/backend/errors'
import { PlatformContext } from '../../../../../shared/src/platform/context'
import { resolveRepo, resolveRev, retryWhenCloneInProgressError } from '../../../shared/repo/backend'
import { DiffFileInfo, FileInfo, FileInfoWithRepoNames } from '../code_intelligence'

export const ensureRevisionsAreCloned = <T extends FileInfo>(
    diffFileInfo: DiffFileInfo<T & { repoName: string }>,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<DiffFileInfo<T & { repoName: string }>> => {
    // Although we get the commit SHA's from elsewhere, we still need to
    // use `resolveRev` otherwise we can't guarantee Sourcegraph has the
    // revision cloned.
    const requests = []

    // Head
    if (diffFileInfo.head) {
        const resolvingHeadRev = resolveRev({
            repoName: diffFileInfo.head.repoName,
            rev: diffFileInfo.head.commitID,
            requestGraphQL,
        }).pipe(retryWhenCloneInProgressError())
        requests.push(resolvingHeadRev)
    }

    // If theres a base, resolve it as well.
    if (diffFileInfo.base) {
        const resolvingBaseRev = resolveRev({
            repoName: diffFileInfo.base.repoName,
            rev: diffFileInfo.base.commitID,
            requestGraphQL,
        }).pipe(retryWhenCloneInProgressError())
        requests.push(resolvingBaseRev)
    }

    // TODO: not sure about this, can it be rewritten?
    // The intent is to return just a copy of the original diffFileInfo
    return zip(...requests).pipe(map(() => ({ ...diffFileInfo })))
}

/**
 * Resolve a `FileInfo`'s raw repo names to their Sourcegraph
 * repo names as affected by `repositoryPathPattern`.
 */
export const resolveRepoNames = <T extends FileInfo>(
    diffFileInfo: DiffFileInfo<T>,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<DiffFileInfo<T & { repoName: string }>> => {
    const resolvingHeadRepoName = diffFileInfo.head
        ? resolveRepo({ rawRepoName: diffFileInfo.head.rawRepoName, requestGraphQL }).pipe(
              retryWhenCloneInProgressError()
          )
        : of(undefined)
    const resolvingBaseRepoName = diffFileInfo.base
        ? resolveRepo({ rawRepoName: diffFileInfo.base.rawRepoName, requestGraphQL }).pipe(
              retryWhenCloneInProgressError()
          )
        : of(undefined)

    return zip(resolvingHeadRepoName, resolvingBaseRepoName).pipe(
        map(([headRepoName, baseRepoName]) => {
            return {
                ...diffFileInfo,
                head: diffFileInfo.head && { ...diffFileInfo.head, repoName: headRepoName || '' },
                base: diffFileInfo.base && { ...diffFileInfo.base, repoName: baseRepoName || '' },
            }
        }),

        // ERPRIVATEREPOPUBLICSOURCEGRAPHCOM likely means that the user is viewing private code
        // without having pointed his browser extension to a self-hosted Sourcegraph instance that
        // has access to that code. In that case, it's impossible to resolve the repo names,
        // so we keep the repo names inferred from the code host's DOM.
        catchError(err => {
            if (isPrivateRepoPublicSourcegraphComErrorLike(err)) {
                return [
                    {
                        head: diffFileInfo.head && { ...diffFileInfo.head, repoName: diffFileInfo.head.rawRepoName },
                        base: diffFileInfo.base && { ...diffFileInfo.base, repoName: diffFileInfo.base.rawRepoName },
                    },
                ]
            }
            throw err
        })
    )
}
