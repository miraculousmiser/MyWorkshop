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
          <p className="eyebrow"><span>Personal index</span> Issue 0.1 · Autumn 2026</p>
          <h1 id="home-title">A place for small worlds <em>&amp;</em> unfinished ideas.</h1>
          <p className="hero__lede">
            A long-term creative playground for browser games, economic philosophy,
            interesting books and music, and experiments best understood by touching them.
          </p>
          <div className="hero__actions">
            <button className="text-button" type="button" onClick={scrollToRooms}>
              Enter the four rooms <span aria-hidden="true">↓</span>
            </button>
            <span className="desk-status"><i aria-hidden="true" /> The desk lamp is on.</span>
          </div>
        </div>

        <div className="hero-instrument" aria-label="The four rooms, shown as a decorative index dial">
          <div className="hero-instrument__orbit hero-instrument__orbit--outer" />
          <div className="hero-instrument__orbit hero-instrument__orbit--inner" />
          <span className="hero-instrument__tick hero-instrument__tick--one">I</span>
          <span className="hero-instrument__tick hero-instrument__tick--two">II</span>
          <span className="hero-instrument__tick hero-instrument__tick--three">III</span>
          <span className="hero-instrument__tick hero-instrument__tick--four">IV</span>
          <span className="hero-instrument__center"><i />WORK<br />IN<br />PROGRESS</span>
        </div>
      </section>

      <section id="rooms" className="section room-index" aria-labelledby="rooms-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The index</p>
            <h2 id="rooms-title">Four rooms, with space to grow.</h2>
          </div>
          <p>Each room begins as a promise. The cards below are the shelves future work will fill.</p>
        </div>

        <div className="room-grid">
          {rooms.map((room) => (
            <a key={room.id} className={`room-card room-card--${room.id}`} href={`#/${room.id}`}>
              <div className="room-card__topline">
                <span>{room.index}</span>
                <RoomGlyph room={room.id} />
              </div>
              <div className="room-card__body">
                <p>{room.eyebrow}</p>
                <h3>{room.name}</h3>
                <span>{room.summary}</span>
              </div>
              <div className="room-card__footer">
                <small>{room.entries.length} sample entries</small>
                <b aria-hidden="true">↗</b>
              </div>
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
          <div className="version-stamp" aria-label="Version 0.1, work in progress">
            <span>WORK IN PROGRESS</span>
            <strong>0.1</strong>
            <small>EST. 2026</small>
          </div>
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
          <p><span>01</span>Built for the open web, with no account required to wander.</p>
          <p><span>02</span>Made to remain legible, quick, and pleasant on almost any screen.</p>
          <p><span>03</span>Allowed to change slowly as interests deepen and new rooms appear.</p>
        </div>
      </section>
    </main>
  )
}
