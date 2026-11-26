import { RoomGlyph } from '../components/RoomGlyph'
import { deskFragments, rooms } from '../content'

export function HomePage() {
  const scrollToRooms = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('rooms')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <main id="main-content" className="page page--home" tabIndex={-1}>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero__copy">
          <h1 id="home-title">A place for small worlds <em>&amp;</em> unfinished ideas.</h1>
          <p className="hero__lede">
            A long-term creative playground for browser games, economic philosophy,
            interesting books and music, and experiments best understood by touching them.
          </p>
          <button className="text-button hero__button" type="button" onClick={scrollToRooms}>Explore the rooms</button>
        </div>

        <div className="hero-orbits" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section id="rooms" className="section room-index" aria-labelledby="rooms-title">
        <h2 id="rooms-title">The four rooms</h2>

        <div className="room-grid">
          {rooms.map((room) => (
            <a key={room.id} className="room-card" href={`#/${room.id}`}>
              <RoomGlyph room={room.id} />
              <h3>{room.name}</h3>
              <p>{room.summary}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section desk-notes" aria-labelledby="desk-title">
        <div className="desk-notes__intro">
          <p className="eyebrow">Notes from the desk</p>
          <h2 id="desk-title">The shape of a beginning.</h2>
          <p>
            This first release establishes the rooms, the visual language, and a way to add new work
            without rebuilding the house each time.
          </p>
        </div>

        <div className="fragment-list">
          {deskFragments.map((fragment) => (
            <article className="fragment" key={fragment.date}>
              <p>{fragment.date} <span>Placeholder</span></p>
              <h3>{fragment.title}</h3>
              <div>{fragment.text}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section colophon" aria-labelledby="colophon-title">
        <p className="eyebrow">House rules</p>
        <h2 id="colophon-title">Simple on purpose.</h2>
        <div className="colophon__grid">
          <p>Built for the open web, with no account required to wander.</p>
          <p>Made to remain legible, quick, and pleasant on almost any screen.</p>
          <p>Allowed to change slowly as interests deepen and new rooms appear.</p>
        </div>
      </section>
    </main>
  )
}
