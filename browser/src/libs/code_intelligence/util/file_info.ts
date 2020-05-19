import { Observable, of, zip } from 'rxjs'
import { catchError, map, mapTo } from 'rxjs/operators'

import { isPrivateRepoPublicSourcegraphComErrorLike } from '../../../../../shared/src/backend/errors'
import { PlatformContext } from '../../../../../shared/src/platform/context'
import { resolveRepo, resolveRev, retryWhenCloneInProgressError } from '../../../shared/repo/backend'
import {
    FileInfo,
    FileDiffWithRepoNames,
    FileDiff,
    FileInfoWithRepoNames,
    FileDiffWithHead,
    BaseFileDiff,
    FileDiffWithBase,
} from '../code_intelligence'

export const ensureRevisionsAreCloned = (
    fileDiff: FileDiffWithRepoNames,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<FileDiff<FileInfoWithRepoNames>> => {
    // Although we get the commit SHA's from elsewhere, we still need to
    // use `resolveRev` otherwise we can't guarantee Sourcegraph has the
    // revision cloned.
    const requests: Observable<string>[] = []

    if (diffHasHead(fileDiff)) {
        const { repoName, commitID } = fileDiff.head
        const resolvingHeadRev = resolveRev({
            repoName,
            rev: commitID,
            requestGraphQL,
        }).pipe(retryWhenCloneInProgressError())
        requests.push(resolvingHeadRev)
    }

    if (diffHasBase(fileDiff)) {
        const { repoName, commitID } = fileDiff.base
        const resolvingBaseRev = resolveRev({
            repoName,
            rev: commitID,
            requestGraphQL,
        }).pipe(retryWhenCloneInProgressError())
        requests.push(resolvingBaseRev)
    }

    return zip(...requests).pipe(mapTo(fileDiff))
}

/**
 * Resolve a `FileInfo`'s raw repo names to their Sourcegraph
 * repo names as affected by `repositoryPathPattern`.
 */
export const resolveRepoNames = (
    fileDiff: FileDiff,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<FileDiffWithRepoNames> => {
    if (diffHasBase(fileDiff) && diffHasHead(fileDiff)) {
        const resolvingHeadWithRepoName = resolveFileInfoWithRepoName(fileDiff.head, requestGraphQL)
        const resolvingBaseWithRepoName = resolveFileInfoWithRepoName(fileDiff.base, requestGraphQL)

        return zip(resolvingHeadWithRepoName, resolvingBaseWithRepoName).pipe(
            map(([head, base]) => ({
                ...fileDiff,
                head,
                base,
            }))
        )
    } else if (diffHasHead(fileDiff)) {
        return resolveFileInfoWithRepoName(fileDiff.head, requestGraphQL).pipe(
            map(head => ({
                ...fileDiff,
                head,
            }))
        )
    }
    // Remaining case: diff has only a base.
    return resolveFileInfoWithRepoName(fileDiff.base, requestGraphQL).pipe(
        map(base => ({
            ...fileDiff,
            base,
        }))
    )
}

/**
 * Use `rawRepoName` for the value of `repoName`, as a fallback if `repoName` was not available.
 * */
function useRawRepoNameAsFallback(fileInfo: FileInfo): FileInfoWithRepoNames {
    return {
        ...fileInfo,
        repoName: fileInfo.rawRepoName,
    }
}

function resolveFileInfoWithRepoName(
    fileInfo: FileInfo,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<FileInfoWithRepoNames> {
    return resolveRepo({ rawRepoName: fileInfo.rawRepoName, requestGraphQL }).pipe(
        retryWhenCloneInProgressError(),
        map(repoName => ({ ...fileInfo, repoName })),
        catchError(err => {
            // ERPRIVATEREPOPUBLICSOURCEGRAPHCOM likely means that the user is viewing private code
            // without having pointed his browser extension to a self-hosted Sourcegraph instance that
            // has access to that code. In that case, it's impossible to resolve the repo names,
            // so we keep the repo names inferred from the code host's DOM.
            if (isPrivateRepoPublicSourcegraphComErrorLike(err)) {
                return of(useRawRepoNameAsFallback(fileInfo))
            }
            throw err
        })
    )
}

export function diffHasHead(input: BaseFileDiff): input is FileDiffWithHead {
    return 'head' in input
}

export function diffHasBase(input: BaseFileDiff): input is FileDiffWithBase {
    return 'base' in input
}
