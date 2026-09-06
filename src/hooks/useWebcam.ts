import { useEffect, useRef, useState } from 'react'

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    // Dev harness: `?feed=/dev-feed.jpg` plays a still image as the camera so
    // the detector and the whole session can be exercised without a dog.
    const feed = import.meta.env.DEV ? new URLSearchParams(location.search).get('feed') : null
    const timers: number[] = []
    if (feed) {
      const img = new Image()
      img.onload = () => {
        if (cancelled) return
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const redraw = window.setInterval(() => ctx.drawImage(img, 0, 0), 100)
        timers.push(redraw)
        stream = canvas.captureStream(30)
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.play().then(() => setReady(true)).catch(() => setReady(true))
      }
      img.onerror = () => !cancelled && setError('DEV FEED NOT FOUND')
      img.src = feed
      return () => {
        cancelled = true
        timers.forEach(window.clearInterval)
        stream?.getTracks().forEach((t) => t.stop())
      }
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        const video = videoRef.current
        if (!video) return
        video.srcObject = s
        video.onloadedmetadata = () => {
          video.play().then(() => setReady(true)).catch(() => setReady(true))
        }
      })
      .catch((e: DOMException) => {
        if (cancelled) return
        setError(
          e.name === 'NotAllowedError'
            ? 'CAMERA ACCESS DENIED'
            : e.name === 'NotFoundError'
              ? 'NO CAMERA FOUND'
              : 'CAMERA UNAVAILABLE',
        )
      })

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { videoRef, ready, error }
}
