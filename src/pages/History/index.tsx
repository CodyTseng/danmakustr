import { keyBy, uniq, uniqBy } from 'lodash'
import { Inbox, Loader2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import Layout from '../Layout'
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
      const newUntil = comments[comments.length - 1].createdAt - 1
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

  const isEmpty = !loading && !hasMore && comments.length === 0

  return (
    <Layout title={chrome.i18n.getMessage('history')}>
      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
          <div
            ref={observer}
            className="flex items-center justify-center gap-2 text-muted-foreground text-xs pb-2 pt-6"
          >
            {hasMore ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{chrome.i18n.getMessage('loading')}</span>
              </>
            ) : (
              <span>{chrome.i18n.getMessage('no_more_danmaku')}</span>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Inbox size={32} className="mb-3 opacity-60" />
      <div className="text-sm">{chrome.i18n.getMessage('no_more_danmaku')}</div>
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
