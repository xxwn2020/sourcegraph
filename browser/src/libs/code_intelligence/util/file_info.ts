import { Observable, of, zip } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { isPrivateRepoPublicSourcegraphComErrorLike } from '../../../../../shared/src/backend/errors'
import { PlatformContext } from '../../../../../shared/src/platform/context'
import { resolveRepo, resolveRev, retryWhenCloneInProgressError } from '../../../shared/repo/backend'
import {
    FileInfo,
    FileInfoWithRepoNames,
    DiffOrBlobInfo,
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
    diffOrFileInfo: DiffOrBlobInfo,
    requestGraphQL: PlatformContext['requestGraphQL']
): Observable<DiffOrBlobInfo<FileInfoWithRepoNames>> => {
    if (diffOrFileInfo.type === 'blob') {
        return resolveRepoNameForFileInfo(diffOrFileInfo, requestGraphQL).pipe(
            map(fileInfo => ({ ...diffOrFileInfo, ...fileInfo }))
        )
    } else if (diffHasBase(diffOrFileInfo) && diffHasHead(diffOrFileInfo)) {
        const resolvingHeadWithRepoName = resolveRepoNameForFileInfo(diffOrFileInfo.head, requestGraphQL)
        const resolvingBaseWithRepoName = resolveRepoNameForFileInfo(diffOrFileInfo.base, requestGraphQL)

        return zip(resolvingHeadWithRepoName, resolvingBaseWithRepoName).pipe(
            map(([head, base]) => ({
                ...diffOrFileInfo,
                head,
                base,
            }))
        )
    } else if (diffHasHead(diffOrFileInfo)) {
        return resolveRepoNameForFileInfo(diffOrFileInfo.head, requestGraphQL).pipe(
            map(head => ({
                ...diffOrFileInfo,
                head,
            }))
        )
    }
    // Remaining case: diff has only a base.
    return resolveRepoNameForFileInfo(diffOrFileInfo.base, requestGraphQL).pipe(
        map(base => ({
            ...diffOrFileInfo,
            base,
        }))
    )
}

/**
 * Use `rawRepoName` for the value of `repoName`, as a fallback if `repoName` was not available.
 * */
const useRawRepoNameAsFallback = (fileInfo: FileInfo): FileInfoWithRepoNames => ({
    ...fileInfo,
    repoName: fileInfo.rawRepoName,
})

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

export const diffHasHead = <T extends FileInfo>(input: FileDiff<T>): input is AddedFileDiff<T> | ModifiedFileDiff<T> =>
    input.type === 'added' || input.type === 'modified'

export const diffHasBase = <T extends FileInfo>(
    input: FileDiff<T>
): input is RemovedFileDiff<T> | ModifiedFileDiff<T> => input.type === 'removed' || input.type === 'modified'

export const ensureRev = <T extends FileInfo>(fileInfo: T): T & { rev: string } => ({
    ...fileInfo,
    rev: fileInfo.rev || fileInfo.commitID,
})

export const isDiff = <T extends FileInfo>(
    input: DiffOrBlobInfo<T>
): input is AddedFileDiff<T> | ModifiedFileDiff<T> | RemovedFileDiff<T> =>
    input.type === 'added' || input.type === 'modified' || input.type === 'removed'
