import dayjs from 'dayjs'
import { Comment } from '../index'
import { ExternalLink } from 'lucide-react'

export default function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-center space-x-4">
      <div
        className="bg-cover bg-center aspect-[48/36] w-24 border border-solid border-primary rounded-md"
        style={{ backgroundImage: `url(${comment.thumbnailUrl})` }}
      />
      <div className="w-0 flex-1 space-y-2">
        <div className="truncate ">{comment.content}</div>
        <div className="flex justify-between items-center">
          <div className="text-muted-foreground">
            {dayjs(comment.createdAt * 1000).format('YYYY-MM-DD')}
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${comment.videoId}&t=${Math.floor(comment.time)}s`}
            target="_blank"
          >
            <ExternalLink
              size={16}
              strokeWidth={3}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
