'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/ui/Navbar'
import Ticker from '@/components/ui/Ticker'
import HeroBanner from '@/components/sections/HeroBanner'
import CountdownSection from '@/components/sections/CountdownSection'
import TicketSection from '@/components/sections/TicketSection'
import ScheduleSection from '@/components/sections/ScheduleSection'
import SpeakersSection from '@/components/sections/SpeakersSection'
import VenueSection from '@/components/sections/VenueSection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import FooterSection from '@/components/sections/FooterSection'
import AttendeeCount from '@/components/ui/AttendeeCount'
import CustomCursor from '@/components/ui/CustomCursor'

export default function Home() {
  return (
    <main className="relative bg-void min-h-screen overflow-x-hidden">
      <CustomCursor />
      <Navbar />
      <HeroBanner />
      <Ticker />
      <AttendeeCount />
      <CountdownSection />
      <ScheduleSection />
      <SpeakersSection />
      <TicketSection />
      <VenueSection />
      <ReviewsSection />
      <FooterSection />
    </main>
  )
}
