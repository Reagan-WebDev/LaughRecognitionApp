import React, { useRef, useEffect, useState } from 'react'
import '../styles/main.css'

function Main({ user, onLogout }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [status, setStatus] = useState('Initializing...')
  const [isLaughing, setIsLaughing] = useState(false)

  // Load models and start camera
  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        console.error('Camera error:', err)
        setStatus('Camera access denied or not available. Allow camera and reload.')
      }
    }

    const loadModels = async () => {
      try {
        setStatus('Loading face models...')
        const MODEL_URL = 'https://justcdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'

        if (!window.faceapi) throw new Error('face-api.js is not loaded. Check your index.html script tag.')

        await window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)

        if (!mounted) return
        setModelsLoaded(true)
        setStatus('Models loaded — starting camera')
        startCamera()
      } catch (err) {
        console.error('Error loading face-api models:', err)
        setStatus('Failed to load face detection models. Check console.')
      }
    }

    loadModels()

    return () => { mounted = false }
  }, [])

  // Detection loop
  useEffect(() => {
    if (!user) return
    if (!modelsLoaded) return

    let rafId = null

    const detectLoop = async () => {
      try {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || video.readyState !== 4 || !canvas) {
          rafId = requestAnimationFrame(detectLoop)
          return
        }

        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        canvas.width = displaySize.width
        canvas.height = displaySize.height

        const detection = await window.faceapi
          .detectSingleFace(video)
          .withFaceLandmarks()
          .withFaceExpressions()

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (detection) {
          const resized = window.faceapi.resizeResults(detection, displaySize)
          window.faceapi.draw.drawDetections(canvas, resized)
          window.faceapi.draw.drawFaceLandmarks(canvas, resized)

          const happyProb = detection.expressions?.happy || 0
          const LAUGH_THRESHOLD = 0.65

          if (happyProb > LAUGH_THRESHOLD) {
            setIsLaughing(true)
            setStatus(`${user.name} is laughing — joy: ${Math.round(happyProb * 100)}%`)
          } else {
            setIsLaughing(false)
            setStatus('Looking... no strong laughter detected')
          }
        } else {
          setIsLaughing(false)
          setStatus('No face detected')
        }
      } catch (err) {
        console.error('Detection error:', err)
        setStatus('Error detecting face. Try again.')
        setIsLaughing(false)
      }

      rafId = requestAnimationFrame(detectLoop)
    }

    const video = videoRef.current
    const start = () => setTimeout(detectLoop, 300)
    if (video) video.addEventListener('playing', start)

    return () => {
      if (video) video.removeEventListener('playing', start)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [modelsLoaded, user])

  // Logout
  const handleLogout = () => {
    const stream = videoRef.current?.srcObject
    if (stream && stream.getTracks) stream.getTracks().forEach((t) => t.stop())
    onLogout()
  }

  return (
    <div className="main-root">
      <header className="main-header">
        <div className="brand">Laugh Detector</div>
        <div className="user-area">
          <div className="user-name">{user?.name || 'User'}</div>
          <button className="btn btn-small" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <section className="video-panel">
          <div className={`video-wrap ${isLaughing ? 'laughing' : ''}`}>
            <video ref={videoRef} autoPlay muted playsInline className="video-el" />
            <canvas ref={canvasRef} className="overlay-canvas" />
          </div>

          <div className="status-panel">
            <h2>Status</h2>
            <p className="status-text">{status}</p>
            {isLaughing && <div className="detected">{user?.name} is laughing 😄</div>}
            <p className="hint">Tip: smile or laugh clearly facing the camera. Good lighting helps.</p>
          </div>
        </section>

        <section className="info-panel">
          <h3>How it works</h3>
          <ol>
            <li>We use face-api.js to detect face landmarks and expression probabilities.</li>
            <li>When the probability of "happy" exceeds a threshold, we say the user is laughing.</li>
            <li>All user accounts in this demo are stored locally (localStorage).</li>
          </ol>
        </section>
      </main>

      <footer className="main-footer">Built with React • Demo only (no server)</footer>
    </div>
  )
}

export default Main
