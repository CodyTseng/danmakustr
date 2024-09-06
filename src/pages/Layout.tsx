import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useEffect, useRef, useState } from 'react'

export default function Layout({ children, title }: { children: React.ReactNode; title: string }) {
  const [isHeaderSmall, setIsHeaderSmall] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const scrollTop = scrollAreaRef.current.scrollTop
        setIsHeaderSmall(scrollTop > 50)
      }
    }

    const scrollAreaElement = scrollAreaRef.current
    scrollAreaElement?.addEventListener('scroll', handleScroll)

    return () => {
      scrollAreaElement?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen w-full max-md:pb-14 md:pl-20 px-6">
      <Header title={title} isSmall={isHeaderSmall} />
      <ScrollArea ref={scrollAreaRef} className="flex-grow">
        {children}
      </ScrollArea>
    </div>
  )
}

function Header({ title, isSmall }: { title: string; isSmall: boolean }) {
  return (
    <div
      className={`transition-all duration-300 ${isSmall ? 'text-xl py-2' : 'text-3xl py-4'} font-medium text-primary`}
    >
      {title}
    </div>
  )
}
