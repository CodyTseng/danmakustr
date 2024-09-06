import { keyBy, minBy, uniq, uniqBy } from 'lodash'
import { useCallback, useRef, useState } from 'react'
import CommentItem from './components/CommentItem'

export type Comment = {
  id: string
  content: string
  time: number
  videoId: string
  platform?: string
  createdAt: number
  thumbnailUrl?: string
}

export default function History() {
  const [comments, setComments] = useState<Comment[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [until, setUntil] = useState<number>(Math.floor(Date.now() / 1000))
  const observerRef = useRef<IntersectionObserver | null>(null)

  const observer = useCallback(
    (node: any) => {
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchComments(until)
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [until, hasMore, loading],
  )

  const batchUpdateThumbnails = async (videoIds: string[]) => {
    const ids = uniq(videoIds)
    const results = await Promise.allSettled(
      ids.map(async (videoId) => {
        return await fetchVideoInfo(videoId)
      }),
    )

    const infos = results
      .map((result) => {
        if (result.status === 'fulfilled') {
          return result.value
        }
        return null
      })
      .filter(Boolean) as { videoId: string; thumbnail_url: string }[]
    const map = keyBy(infos, 'videoId')

    setComments((oldComments) => {
      const newComments = oldComments.map((comment) => {
        const newInfo = map[comment.videoId]
        if (newInfo) {
          return {
            ...comment,
            thumbnailUrl: newInfo.thumbnail_url,
          }
        }
        return comment
      })
      return newComments
    })
  }

  async function fetchComments(until?: number) {
    setLoading(true)
    const comments = (await chrome.runtime.sendMessage({
      type: 'FETCH_HISTORY_COMMENTS',
      limit: 20,
      until,
    })) as Omit<Comment, 'thumbnailUrl'>[]
    if (comments.length) {
      const newUntil = minBy(comments, (comment) => comment.createdAt)!.createdAt - 1
      setComments((oldComments) => uniqBy([...oldComments, ...comments], (comment) => comment.id))
      setHasMore(!!comments.length)
      setUntil((prev) => Math.min(prev, newUntil))

      const videoIds = comments
        .filter(({ platform }) => platform === 'youtube')
        .map(({ videoId }) => videoId)

      await batchUpdateThumbnails(videoIds)
    } else {
      setHasMore(false)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="text-3xl font-medium text-primary">{chrome.i18n.getMessage('history')}</div>
      <div className="space-y-2">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
      <div ref={observer} className="text-muted-foreground text-center pb-2">
        {hasMore ? chrome.i18n.getMessage('loading') : chrome.i18n.getMessage('no_more_danmaku')}
      </div>
    </div>
  )
}

async function fetchVideoInfo(videoId: string): Promise<{
  videoId: string
  thumbnail_url?: string
}> {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`
  const response = await fetch(url)
  const data = await response.json()
  return {
    ...data,
    videoId,
  }
}
