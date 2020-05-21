import { Observable, of, zip } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { isPrivateRepoPublicSourcegraphComErrorLike } from '../../../../../shared/src/backend/errors'
import { PlatformContext } from '../../../../../shared/src/platform/context'
import { resolveRepo, resolveRev, retryWhenCloneInProgressError } from '../../../shared/repo/backend'
import {
    FileInfo,
    FileInfoWithRepoNames,
    DiffOrFileInfo,
    FileDiff,
    AddedFileDiff,
    ModifiedFileDiff,
    RemovedFileDiff,
} from '../code_intelligence'

export const ensureRevisionIsClonedForFileInfo = (
    fileInfo: FileInfoWithRepoNames,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<string> => {
    // Although we get the commit SHA's from elsewhere, we still need to
    // use `resolveRev` otherwise we can't guarantee Sourcegraph has the
    // revision cloned.
    const { repoName, commitID } = fileInfo
    return resolveRev({ repoName, rev: commitID, requestGraphQL }).pipe(retryWhenCloneInProgressError())
}

export const resolveRepoNamesForDiffOrFileInfo = (
    diffOrFileInfo: DiffOrFileInfo,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<DiffOrFileInfo<FileInfoWithRepoNames>> => {
    if (diffOrFileInfo.type === 'file') {
        return resolveRepoNameForFileInfo(diffOrFileInfo.fileInfo, requestGraphQL).pipe(
            map(fileInfo => ({ ...diffOrFileInfo, fileInfo }))
        )
    }

    const fileDiff = diffOrFileInfo.fileDiff
    if (diffHasBase(fileDiff) && diffHasHead(fileDiff)) {
        const resolvingHeadWithRepoName = resolveRepoNameForFileInfo(fileDiff.head, requestGraphQL)
        const resolvingBaseWithRepoName = resolveRepoNameForFileInfo(fileDiff.base, requestGraphQL)

        return zip(resolvingHeadWithRepoName, resolvingBaseWithRepoName).pipe(
            map(([head, base]) => ({
                ...diffOrFileInfo,
                fileDiff: {
                    ...fileDiff,
                    head,
                    base,
                },
            }))
        )
    } else if (diffHasHead(fileDiff)) {
        return resolveRepoNameForFileInfo(fileDiff.head, requestGraphQL).pipe(
            map(head => ({
                ...diffOrFileInfo,
                fileDiff: {
                    ...fileDiff,
                    head,
                },
            }))
        )
    }
    // Remaining case: diff has only a base.
    return resolveRepoNameForFileInfo(fileDiff.base, requestGraphQL).pipe(
        map(base => ({
            ...diffOrFileInfo,
            fileDiff: {
                ...fileDiff,
                base,
            },
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

/**
 * Resolve a `FileInfo`'s raw repo names to their Sourcegraph
 * repo names as affected by `repositoryPathPattern`.
 */
const resolveRepoNameForFileInfo = (
    fileInfo: FileInfo,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<FileInfoWithRepoNames> =>
    resolveRepo({ rawRepoName: fileInfo.rawRepoName, requestGraphQL }).pipe(
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

export function diffHasHead<T extends FileInfo>(input: FileDiff<T>): input is AddedFileDiff<T> | ModifiedFileDiff<T> {
    switch (input.diffType) {
        case 'added':
        case 'modified':
            return true
    }
    return false
}

export function diffHasBase<T extends FileInfo>(input: FileDiff<T>): input is RemovedFileDiff<T> | ModifiedFileDiff<T> {
    switch (input.diffType) {
        case 'removed':
        case 'modified':
            return true
    }
    return false
}
