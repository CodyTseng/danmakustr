import dayjs from 'dayjs'
import { ExternalLink } from 'lucide-react'
import { Comment } from '../index'

export default function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex space-x-2">
      <a
        href={`https://www.youtube.com/watch?v=${comment.videoId}&t=${Math.floor(comment.time)}s`}
        target="_blank"
        className="relative group cursor-pointer flex-shrink-0"
      >
        <div
          className="bg-cover bg-center aspect-[48/36] w-24 md:w-36 border border-solid border-primary/80 rounded-md"
          style={{ backgroundImage: `url(${comment.thumbnailUrl})` }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center rounded-md">
          <ExternalLink className="text-white/80" />
        </div>
      </a>
      <div className="w-0 flex-grow py-1">
        <div className="line-clamp-2">{comment.content}</div>
        <div className="text-muted-foreground text-xs">
          {dayjs(comment.createdAt * 1000).format('YYYY-MM-DD')}
        </div>
      </div>
    </div>
  )
}
