// Base pulse block — every other skeleton composes from this
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />
}

// Mimics a TicketSection.tsx tier card
export function TicketCardSkeleton() {
  return (
    <div className="glass border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-3" />
      </div>
      <Skeleton className="w-32 h-10" />
      <Skeleton className="w-24 h-3" />
      <Skeleton className="w-full h-1.5 rounded-full" />
      <div className="flex flex-col gap-2 mt-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-full h-3.5" />
        ))}
      </div>
      <Skeleton className="w-full h-12 rounded-xl mt-4" />
    </div>
  )
}

// Mimics a SpeakersSection.tsx speaker card
export function SpeakerCardSkeleton() {
  return (
    <div className="glass border border-white/8 rounded-2xl overflow-hidden">
      <Skeleton className="w-full h-52 rounded-none" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3" />
        <Skeleton className="w-full h-3 mt-2" />
        <Skeleton className="w-5/6 h-3" />
        <div className="flex gap-1.5 mt-2">
          <Skeleton className="w-16 h-5 rounded" />
          <Skeleton className="w-20 h-5 rounded" />
        </div>
      </div>
    </div>
  )
}

// Mimics a ScheduleSection.tsx timeline row
export function ScheduleRowSkeleton() {
  return (
    <div className="flex gap-4 md:gap-6 items-start">
      <Skeleton className="w-16 md:w-20 h-4 mt-3" />
      <div className="hidden sm:block w-8 pt-4">
        <Skeleton className="w-2 h-2 rounded-full" />
      </div>
      <div className="flex-1 glass rounded-xl p-4 border border-white/8 flex flex-col gap-2">
        <Skeleton className="w-24 h-4 rounded-full" />
        <Skeleton className="w-2/3 h-5" />
        <Skeleton className="w-1/3 h-3" />
      </div>
    </div>
  )
}

// Mimics a cart line item
export function CartItemSkeleton() {
  return (
    <div className="glass border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-16 h-3" />
      </div>
      <Skeleton className="w-24 h-8 rounded-lg" />
      <Skeleton className="w-14 h-5" />
      <Skeleton className="w-4 h-4" />
    </div>
  )
}

// Mimics an admin dashboard stat card
export function StatCardSkeleton() {
  return (
    <div className="glass border border-white/10 rounded-xl p-5 flex flex-col gap-3">
      <Skeleton className="w-4 h-4" />
      <Skeleton className="w-16 h-3" />
      <Skeleton className="w-20 h-6" />
    </div>
  )
}

// Mimics an admin table row
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-white/5">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="w-full h-4" />
        </td>
      ))}
    </tr>
  )
}