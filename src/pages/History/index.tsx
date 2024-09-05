import { uniq } from 'lodash'
import { useState } from 'react'
import CommentItem from './components/CommentItem'

export type Comment = {
  id: string
  content: string
  time: number
  videoId?: string
  platform?: string
  createdAt: number
  thumbnailUrl?: string
}

export default function History() {
  const [comments, setComments] = useState<Comment[]>([])

  async function init() {
    const comments = (await chrome.runtime.sendMessage({
      type: 'FETCH_HISTORY_COMMENTS',
    })) as Omit<Comment, 'thumbnailUrl'>[]
    setComments(comments)

    const videoIds = uniq(
      comments
        .filter(({ platform, videoId }) => platform === 'youtube' && !!videoId)
        .map(({ videoId }) => videoId as string),
    )

    await Promise.allSettled(
      videoIds.map(async (videoId) => {
        const { thumbnail_url } = await fetchVideoInfo(videoId)
        if (!thumbnail_url) return

        setComments((oldComments) => {
          const newComments = oldComments.map((comment) => {
            if (comment.videoId === videoId) {
              return {
                ...comment,
                thumbnailUrl: thumbnail_url,
              }
            }
            return comment
          })
          return newComments
        })
      }),
    )
  }

  useState(() => {
    init()
  })

  return (
    <div className="space-y-4">
      <div className="text-3xl font-medium text-primary">History</div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
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
