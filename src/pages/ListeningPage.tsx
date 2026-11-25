import { audioUrl, recordings } from '../recordings'
import type { ListeningPlayer } from '../useListeningPlayer'
import './listening.css'

export function ListeningPage({ player, linkedGroup }: { player: ListeningPlayer; linkedGroup?: string }) {
  const { current, excluded, selectedCount } = player

  return (
    <main id="main-content" className="page listening-page" tabIndex={-1}>
      <header className="listening-intro">
        <p className="breadcrumb"><a href="#/">The Workshop</a><span aria-hidden="true">/</span>Listening Room</p>
        <h1>Listening Room</h1>
        <p>Instrumentals for focus, deep work, and winding down. Choose what to include and let your playlist loop as you move around the Workshop.</p>
        <div className="listening-intro__actions">
          <button type="button" className="text-button" disabled={selectedCount === 0} onClick={() => player.play()}>
            Play playlist
          </button>
          <p aria-live="polite">{selectedCount === 1 ? '1 track selected' : `${selectedCount} tracks selected`}</p>
        </div>
      </header>

      <div className="listening-catalog">
        {recordings.map((group) => (
          <section key={group.path} className="listening-group" data-linked={group.path === linkedGroup}>
            <header className="listening-group__header">
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <a href={audioUrl(group.filename)} download={group.downloadFilename ?? group.filename} aria-label={`Download ${group.title} MP3`}>
                Download MP3
              </a>
            </header>
            <ul className="listening-tracks">
              {group.tracks.map((track) => {
                const included = !excluded.includes(track.id)
                return (
                  <li key={track.id} aria-current={current?.id === track.id ? 'true' : undefined}>
                    <div className="listening-track">
                      <label>
                        <input
                          type="checkbox"
                          checked={included}
                          aria-label={`Include ${track.title} in playlist`}
                          onChange={(event) => player.setIncluded(track.id, event.currentTarget.checked)}
                        />
                        <span>
                          <strong>{track.title}</strong>
                          {track.note && <small>{track.note}</small>}
                        </span>
                      </label>
                      <span className="listening-track__duration">{track.duration}</span>
                      <button
                        className="listening-track__play"
                        type="button"
                        aria-label={`Play ${track.title}`}
                        disabled={!included}
                        onClick={() => player.play(track.id)}
                      >
                        Play
                      </button>
                    </div>
                    {track.cues && (
                      <details className="listening-cues">
                        <summary>Listening points</summary>
                        <div>
                          {track.cues.map((cue) => (
                            <button key={cue.title} type="button" disabled={!included} onClick={() => player.play(track.id, cue.offset)}>
                              {cue.time} {cue.title}
                            </button>
                          ))}
                        </div>
                      </details>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
