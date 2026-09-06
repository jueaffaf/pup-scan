import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { StateRow } from './components/StateRow'
import { CameraViewport } from './components/CameraViewport'
import { DetectionOverlay } from './components/DetectionOverlay'
import { AnalysisPanel, IgnoredPanel } from './components/ObjectsPanel'
import { StatusOverlay } from './components/StatusOverlay'
import { Countdown } from './components/Countdown'
import { DebugPanel } from './components/DebugPanel'
import { PrinterModule } from './components/PrinterModule'
import { Receipt } from './components/Receipt'
import { ResultDeck } from './components/ResultDeck'
import { useWebcam } from './hooks/useWebcam'
import { useDogDetection } from './hooks/useDogDetection'
import { useMockDetection } from './hooks/useMockDetection'
import { usePhotoSession } from './hooks/usePhotoSession'
import { exportProfile, exportStrip } from './utils/capture'
import { funRatings } from './utils/session'
import { DOG_PROFILE, PROFILE_ROWS_LONG } from './dogProfile'
import { barsFromSeed } from './utils/barcode'
import { PAW_GRID } from './components/PixelPaw'
import { LOOKS, LOOK_LABEL, readLook, setLook } from './look'

const look = readLook()

export default function App() {
  const params = new URLSearchParams(location.search)
  const mocked = import.meta.env.DEV && params.has('mock')
  const debug = import.meta.env.DEV && params.has('debug')
  const compare = import.meta.env.DEV && params.has('compare')
  const { videoRef, ready: camReady, error: camError } = useWebcam()
  const live = useDogDetection(videoRef, !mocked)
  const mock = useMockDetection(mocked)
  const detection = mocked ? mock : live
  const armed = mocked || (camReady && detection.ready && !camError)

  const session = usePhotoSession(
    videoRef,
    { present: detection.present, stable: detection.stable, score: detection.score },
    armed,
  )
  const { phase, count, cuts, flash, meta } = session

  /** 05 PUP PROFILE is a view over the finished session, not a phase. */
  const [profile, setProfile] = useState(false)
  const autoProfile = import.meta.env.DEV && params.has('profile')
  useEffect(() => {
    // `?profile` lands straight on 05 once the session finishes, so the screen
    // can be looked at (and filmed) without shooting a run every time
    setProfile(phase === 'RESULT' && autoProfile)
  }, [phase, autoProfile])

  const restart = useCallback(() => {
    setProfile(false)
    session.restart()
  }, [session])

  const saveProfile = useCallback(() => {
    if (!meta) return
    const r = funRatings(meta.id)
    exportProfile({
      id: meta.id,
      date: meta.date,
      time: meta.time,
      confidence: meta.confidence,
      rows: PROFILE_ROWS_LONG,
      scores: [
        ['FLUFFINESS', r.fluffiness],
        ['GOODNESS', r.goodness],
        ['ATTITUDE', r.attitude],
      ],
      classification: [...DOG_PROFILE.classification],
      bars: barsFromSeed(meta.id, 312),
      paw: [...PAW_GRID],
    })
  }, [meta])

  const pct = (detection.score * 100).toFixed(1)
  const seed = meta?.id ?? 'PUPSCAN'

  const readout = useMemo(() => {
    if (camError && !mocked) return camError
    if (detection.error) return detection.error
    switch (phase) {
      case 'BOOT': return camReady ? 'LOADING DETECTOR' : 'STARTING CAMERA'
      case 'SEARCHING': return 'SEARCHING FOR PUP'
      case 'DETECTED': return `DOG DETECTED  ${pct}%`
      case 'COUNTDOWN': return 'GET READY'
      case 'CAPTURING': return `CAPTURING  ${cuts.length}/${session.totalCuts}`
      case 'LOST': return 'PUP LOST'
      case 'RESULT': return 'SESSION COMPLETE'
    }
  }, [phase, camError, detection.error, camReady, pct, cuts.length, session.totalCuts, mocked])

  const status = useMemo(() => {
    if (camError && !mocked) return { headline: camError, caption: 'ALLOW CAMERA ACCESS AND RELOAD' }
    if (detection.error) return { headline: detection.error, caption: 'CHECK YOUR CONNECTION AND RELOAD' }
    switch (phase) {
      case 'BOOT':
        return { headline: 'WARMING UP...', caption: camReady ? 'LOADING DETECTOR' : 'STARTING CAMERA' }
      case 'SEARCHING':
        return { headline: 'SEARCHING FOR PUP...', caption: 'DOG REQUIRED TO UNLOCK' }
      case 'DETECTED':
        return { headline: 'PHOTO BOOTH UNLOCKED', caption: `CONFIDENCE ${pct}%` }
      case 'COUNTDOWN':
        return { headline: 'CAPTURING IN...', progress: (3 - count) / 3 }
      case 'CAPTURING':
        return { headline: 'CAPTURING IN...', progress: cuts.length / session.totalCuts }
      case 'LOST':
        return { headline: 'PUP LOST', caption: 'BRING YOUR PUP BACK IN FRAME' }
      default:
        return { headline: 'SESSION COMPLETE', caption: 'THANK YOU!' }
    }
  }, [phase, camError, detection.error, camReady, pct, count, cuts.length, session.totalCuts, mocked])

  const tracking = phase === 'DETECTED' || phase === 'COUNTDOWN' || phase === 'CAPTURING'
  const receiptVariant =
    phase === 'DETECTED' ? 'ready' : phase === 'COUNTDOWN' || phase === 'CAPTURING' ? 'countdown' : 'searching'

  return (
    <div className="ps-app" data-look={look}>
      <Header />
      <StateRow
        phase={phase}
        readout={profile ? 'PROFILE COMPLETE' : readout}
        title={profile ? '05 PUP PROFILE' : undefined}
        onClose={profile ? () => setProfile(false) : undefined}
      />

      {phase === 'RESULT' && meta ? (
        <main className="ps-body ps-body--result">
          <ResultDeck
            cuts={cuts}
            meta={meta}
            look={look}
            profile={profile}
            onOpenProfile={() => setProfile(true)}
            onSave={() => exportStrip(cuts, meta.id)}
            onSaveProfile={saveProfile}
            onRestart={restart}
          />
        </main>
      ) : (
        <main className="ps-body">
          <CameraViewport videoRef={videoRef} flash={flash}>
            <DetectionOverlay
              boxRef={detection.boxRef}
              videoRef={videoRef}
              visible={tracking}
              score={detection.score}
            />
            {tracking && detection.present ? (
              <AnalysisPanel score={detection.score} />
            ) : (
              <IgnoredPanel objects={detection.ignored} />
            )}
            {phase === 'COUNTDOWN' && <Countdown value={count} />}
            <div className="ps-camera__bottom">
              <StatusOverlay {...status} />
              <button
                className="ps-trigger"
                onClick={session.forceStart}
                title="Start a session without waiting for detection"
              >
                <span className="t-caption">SHOOT NOW</span>
                <kbd>SPACE</kbd>
              </button>
            </div>
            {debug && (
              <DebugPanel
                preds={detection.preds}
                misses={detection.misses}
                present={detection.present}
                stable={detection.stable}
                modelBase={detection.modelBase}
              />
            )}
          </CameraViewport>

          <PrinterModule look={look}>
            <Receipt variant={receiptVariant} score={detection.score} count={count} seed={seed} />
          </PrinterModule>
        </main>
      )}

      {compare && (
        <div className="ps-lookswitch">
          {LOOKS.map((l) => (
            <button key={l} className={l === look ? 'is-on' : undefined} onClick={() => setLook(l)}>
              {LOOK_LABEL[l]}
            </button>
          ))}
        </div>
      )}
      <Footer />
    </div>
  )
}
