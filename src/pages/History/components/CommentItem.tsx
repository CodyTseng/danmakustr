import dayjs from 'dayjs'
import { ExternalLink } from 'lucide-react'
import { Comment } from '../index'

export default function CommentItem({ comment }: { comment: Comment }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${comment.videoId}&t=${Math.floor(comment.time)}s`}
      target="_blank"
      className="group flex gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/60 transition-colors"
    >
      <div className="relative flex-shrink-0">
        <div
          className="bg-cover bg-center bg-muted aspect-[16/9] w-24 md:w-36 rounded-md ring-1 ring-border"
          style={{ backgroundImage: `url(${comment.thumbnailUrl})` }}
        />
        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center items-center rounded-md">
          <ExternalLink className="text-white" size={18} />
        </div>
      </div>
      <div className="min-w-0 flex-grow py-0.5">
        <div className="line-clamp-2 text-sm leading-snug">{comment.content}</div>
        <div className="text-muted-foreground text-[11px] mt-1">
          {dayjs(comment.createdAt * 1000).format('YYYY-MM-DD')}
        </div>
      </div>
    </a>
  )
}
