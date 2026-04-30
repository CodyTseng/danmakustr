import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'

export default function Layout({
  children,
  title,
  action,
}: {
  children: React.ReactNode
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen w-full max-md:pb-16">
      <Header title={title} action={action} />
      <ScrollArea className="flex-grow">
        <div className="px-5 md:px-6 pt-4 pb-6">{children}</div>
      </ScrollArea>
    </div>
  )
}

function Header({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="bg-background border-b border-border/60">
      <div className="flex items-center gap-3 px-5 md:px-6 py-4 md:py-5">
        <div className="text-xl md:text-2xl font-semibold leading-tight tracking-tight truncate flex-1 min-w-0">
          {title}
        </div>
        {action}
      </div>
    </div>
  )
}
