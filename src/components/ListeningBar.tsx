import type { ListeningPlayer } from '../useListeningPlayer'

export function ListeningBar({ player }: { player: ListeningPlayer }) {
  const { current, playing, error, selectedCount, setPlaying, setError } = player

  return (
    <aside className="listening-bar" aria-label="Listening Room player" hidden={!current}>
      <div className="listening-bar__title">
        <a href="#/listening">Listening Room</a>
        <p aria-live="polite">{current?.title}</p>
      </div>
      <audio
        ref={player.audio}
        controls
        preload="metadata"
        aria-label={current ? `${current.title} playback` : 'Listening Room playback'}
        onPlay={() => { setPlaying(true); setError('') }}
        onPause={() => setPlaying(false)}
        onEnded={() => player.step(1, true)}
        onError={() => { if (current) setError('This track could not load. Try the next track.') }}
      />
      <div className="listening-bar__actions">
        <button type="button" aria-label="Previous track" disabled={selectedCount < 2} onClick={() => player.step(-1)}>
          Previous
        </button>
        <button type="button" aria-label="Next track" disabled={selectedCount < 2} onClick={() => player.step(1)}>
          Next
        </button>
      </div>
      <p className="listening-bar__error" role="status">{error}</p>
      <span className="listening-bar__state" data-playing={playing}>{playing ? 'Playing' : 'Paused'}</span>
    </aside>
  )
}
