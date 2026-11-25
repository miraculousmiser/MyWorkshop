import { RoomGlyph } from '../components/RoomGlyph'
import { rooms, type Room } from '../content'

type RoomPageProps = {
  room: Room
}

export function RoomPage({ room }: RoomPageProps) {
  const roomIndex = rooms.findIndex((item) => item.id === room.id)
  const nextRoom = rooms[(roomIndex + 1) % rooms.length]
  const hasPlayableEntry = room.entries.some((entry) => entry.playPath)
  const allPlayable = hasPlayableEntry && room.entries.every((entry) => entry.playPath)

  return (
    <main id="main-content" className={`page room-page room-page--${room.id}`} tabIndex={-1}>
      <section className="room-hero" aria-labelledby="room-title">
        <div className="room-hero__copy">
          <p className="breadcrumb"><a href="#/">The Workshop</a><span>/</span>{room.name}</p>
          <p className="eyebrow">Room {room.index} · {room.eyebrow}</p>
          <h1 id="room-title">{room.name}</h1>
          <p>{room.introduction}</p>
        </div>
        <div className="room-hero__mark">
          <span className="room-hero__number">{room.index}</span>
          <RoomGlyph room={room.id} large />
        </div>
      </section>

      <section className="section collection" aria-labelledby="collection-title">
        <div className="section-heading section-heading--compact">
          <div>
            <p className="eyebrow">On the worktable</p>
            <h2 id="collection-title">{allPlayable ? 'Play in the Arcade.' : hasPlayableEntry ? 'Games and sketches.' : 'Three things taking shape.'}</h2>
          </div>
          <p>
            {allPlayable
              ? 'Try a landscape toy, a gravity puzzle, or a timed delivery.'
              : hasPlayableEntry
              ? 'Play a game or see what else is taking shape in the Arcade.'
              : 'Sample content for layout and direction; none of these entries is published yet.'}
          </p>
        </div>

        <div className="entry-grid">
          {room.entries.map((entry, index) => (
            <article className="entry-card" key={entry.title}>
              <div className="entry-card__meta">
                <span>{entry.playPath ? 'Playable' : 'Placeholder'}</span>
                <small>{String(index + 1).padStart(2, '0')}</small>
              </div>
              <div className="entry-card__copy">
                <p>{entry.kind} · {entry.year}</p>
                <h3>{entry.title}</h3>
                <div>{entry.description}</div>
              </div>
              <footer>
                {entry.playPath
                  ? <a className="text-button" href={`#${entry.playPath}`}>Play {entry.title}</a>
                  : <span>{entry.note}</span>}
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="section room-promise" aria-labelledby="promise-title">
        <div>
          <p className="eyebrow">A note for later</p>
          <h2 id="promise-title">What belongs in this room.</h2>
        </div>
        <blockquote>{room.promise}</blockquote>
      </section>

      <nav className="next-room" aria-label="Continue to another room">
        <span>Continue through the index</span>
        <a href={`#/${nextRoom.id}`}>
          <small>Room {nextRoom.index}</small>
          {nextRoom.name} <b aria-hidden="true">→</b>
        </a>
      </nav>
    </main>
  )
}
