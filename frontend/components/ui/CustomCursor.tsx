'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const dot = dotRef.current
    if (!cursor || !dot) return

    let mouseX = 0, mouseY = 0
    let curX = 0, curY = 0

    const move = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
    }

    const animate = () => {
      curX += (mouseX - curX) * 0.12
      curY += (mouseY - curY) * 0.12
      cursor.style.transform = `translate(${curX - 20}px, ${curY - 20}px)`
      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', move)
    animate()

    const links = document.querySelectorAll('a, button, [data-hover]')
    links.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('scale-[2.5]', 'opacity-50'))
      el.addEventListener('mouseleave', () => cursor.classList.remove('scale-[2.5]', 'opacity-50'))
    })

    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-ember/60 pointer-events-none z-[9999] transition-transform duration-75 mix-blend-difference hidden md:block"
        style={{ transition: 'transform 0.05s' }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-ember pointer-events-none z-[9999] hidden md:block"
      />
    </>
  )
}
