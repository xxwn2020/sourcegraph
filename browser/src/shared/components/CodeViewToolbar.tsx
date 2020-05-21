import classNames from 'classnames'
import H from 'history'
import * as React from 'react'
import { ActionNavItemsClassProps, ActionsNavItems } from '../../../../shared/src/actions/ActionsNavItems'
import { ContributionScope } from '../../../../shared/src/api/client/context/context'
import { ContributableMenu } from '../../../../shared/src/api/protocol'
import { ExtensionsControllerProps } from '../../../../shared/src/extensions/controller'
import { PlatformContextProps } from '../../../../shared/src/platform/context'
import { TelemetryProps } from '../../../../shared/src/telemetry/telemetryService'
import { DiffOrBlobInfoOrError, FileInfoWithContent } from '../../libs/code_intelligence'
import { OpenDiffOnSourcegraph } from './OpenDiffOnSourcegraph'
import { OpenOnSourcegraph } from './OpenOnSourcegraph'
import { SignInButton } from '../../libs/code_intelligence/SignInButton'
import { failedWithHTTPStatus } from '../../../../shared/src/backend/fetch'
import { isDiff, diffHasHead, diffHasBase, ensureRev } from '../../libs/code_intelligence/util/file_info'

export interface ButtonProps {
    className?: string
}

export interface CodeViewToolbarClassProps extends ActionNavItemsClassProps {
    /**
     * Class name for the `<ul>` element wrapping all toolbar items
     */
    className?: string

    /**
     * The scope of this toolbar (e.g., the view component that it is associated with).
     */
    scope?: ContributionScope
}

export interface CodeViewToolbarProps
    extends PlatformContextProps<'forceUpdateTooltip' | 'settings' | 'requestGraphQL'>,
        ExtensionsControllerProps,
        TelemetryProps,
        CodeViewToolbarClassProps {
    sourcegraphURL: string

    /**
     * Information about the file or diff the toolbar is displayed on.
     */
    fileInfoOrError: DiffOrBlobInfoOrError<FileInfoWithContent>

    buttonProps?: ButtonProps
    onSignInClose: () => void
    location: H.Location
}

export const CodeViewToolbar: React.FunctionComponent<CodeViewToolbarProps> = props => (
    <ul className={classNames('code-view-toolbar', props.className)}>
        <ActionsNavItems
            {...props}
            listItemClass={classNames('code-view-toolbar__item', props.listItemClass)}
            menu={ContributableMenu.EditorTitle}
            extensionsController={props.extensionsController}
            platformContext={props.platformContext}
            location={props.location}
            scope={props.scope}
        />{' '}
        {props.fileInfoOrError.type === 'error' ? (
            failedWithHTTPStatus(props.fileInfoOrError.error, 401) ? (
                <SignInButton
                    sourcegraphURL={props.sourcegraphURL}
                    onSignInClose={props.onSignInClose}
                    className={props.actionItemClass}
                    iconClassName={props.actionItemIconClass}
                />
            ) : null
        ) : (
            <>
            /* TODO: should OpenDiffOnSourcegraph only exist for `modified` diffs? */
                {(isDiff(props.fileInfoOrError) && diffHasHead(props.fileInfoOrError) && diffHasBase(props.fileInfoOrError)) ? (
                    <li className={classNames('code-view-toolbar__item', props.listItemClass)}>
                        <OpenDiffOnSourcegraph
                            ariaLabel="View file diff on Sourcegraph"
                            platformContext={props.platformContext}
                            className={props.actionItemClass}
                            iconClassName={props.actionItemIconClass}
                            openProps={{
                                sourcegraphURL: props.sourcegraphURL,
                                repoName: props.fileInfoOrError.base.repoName,
                                filePath: props.fileInfoOrError.base.filePath,
                                rev: ensureRev(props.fileInfoOrError.base).rev,
                                query: {
                                    diff: {
                                        rev: props.fileInfoOrError.base.commitID,
                                    },
                                },
                                commit: {
                                    baseRev: ensureRev(props.fileInfoOrError.base).rev,
                                    headRev: ensureRev(props.fileInfoOrError.head).rev
                                },
                            }}
                        />
                    </li>
                )}{' '}
                {
                    // Only show the "View file" button if we were able to fetch the file contents
                    // from the Sourcegraph instance
                    props.fileInfoOrError.type === 'blob' && props.fileInfoOrError.content
                    &&
                       (
                            <li className={classNames('code-view-toolbar__item', props.listItemClass)}>
                                <OpenOnSourcegraph
                                    ariaLabel="View file on Sourcegraph"
                                    className={props.actionItemClass}
                                    iconClassName={props.actionItemIconClass}
                                    openProps={{
                                        sourcegraphURL: props.sourcegraphURL,
                                        repoName: props.fileInfoOrError.repoName,
                                        filePath: props.fileInfoOrError.filePath,
                                        rev: ensureRev(props.fileInfoOrError).rev
                                    }}
                                />
                            </li>
                        )
                }
            </>
        )}
    </ul>
)
