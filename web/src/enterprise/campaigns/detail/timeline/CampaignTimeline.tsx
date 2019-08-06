import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import React from 'react'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { isErrorLike } from '../../../../../../shared/src/util/errors'
import { Timeline } from '../../../../components/timeline/Timeline'
import { CreateThreadEventTimelineItem } from './events/CreateThreadEventTimelineItem'
import { RequestReviewEventTimelineItem } from './events/RequestReviewEventTimelineItem'
import { ReviewEventTimelineItem } from './events/ReviewEventTimelineItem'
import { useCampaignTimelineItems } from './useCampaignTimelineItems'

interface Props extends ExtensionsControllerProps {
    campaign: Pick<GQL.ICampaign, 'id'>

    className?: string
}

const LOADING = 'loading' as const

/**
 * A timeline of events related to the campaign.
 */
export const CampaignTimeline: React.FunctionComponent<Props> = ({ campaign, className = '' }) => {
    const [timelineItems] = useCampaignTimelineItems(campaign)
    return (
        <div className={`campaign-timeline ${className}`}>
            {timelineItems === LOADING ? (
                <LoadingSpinner className="icon-inline" />
            ) : isErrorLike(timelineItems) ? (
                <div className="alert alert-danger">{timelineItems.message}</div>
            ) : timelineItems.totalCount === 0 ? (
                <span className="text-muted">No events.</span>
            ) : (
                <Timeline tag="ol">
                    {timelineItems.nodes.map(event => {
                        const C = timelineItemComponentForEvent(event.__typename)
                        return C ? <C key={event.id} event={event} className="campaign-timeline__item" /> : null
                    })}
                </Timeline>
            )}
        </div>
    )
}

function timelineItemComponentForEvent(
    event: GQL.Event['__typename']
): React.ComponentType<{
    event: any // TODO!(sqs)
    className?: string
}> | null {
    switch (event) {
        case 'AddThreadToCampaignEvent':
            return CreateThreadEventTimelineItem
        case 'CreateThreadEvent':
            return CreateThreadEventTimelineItem // TODO!(sqs)
        case 'RemoveThreadFromCampaignEvent':
            return CreateThreadEventTimelineItem // TODO!(sqs)
        case 'ReviewEvent':
            return ReviewEventTimelineItem // TODO!(sqs)
        case 'RequestReviewEvent':
            return RequestReviewEventTimelineItem // TODO!(sqs)
        default:
            return null
    }
}