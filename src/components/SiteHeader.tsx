import { rooms, type EntryPath, type RoomId } from '../content'

export type Route = '/' | `/${RoomId}` | EntryPath

type SiteHeaderProps = {
  route: Route
}

export function SiteHeader({ route }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#/" aria-label="The Workshop, home">
        <span className="wordmark__seal" aria-hidden="true">W</span>
        <span className="wordmark__text">
          <strong>The Workshop</strong>
          <small>Personal index · v0.1</small>
        </span>
      </a>

      <nav className="primary-nav" aria-label="Primary navigation">
        <a className={route === '/' ? 'is-active' : ''} href="#/" aria-current={route === '/' ? 'page' : undefined}>
          Home
        </a>
        {rooms.map((room) => {
          const roomRoute = `/${room.id}`
          const isCurrentRoom = route === roomRoute || route.startsWith(`${roomRoute}/`)
          return (
            <a
              key={room.id}
              className={isCurrentRoom ? 'is-active' : ''}
              href={`#/${room.id}`}
              aria-current={route === roomRoute ? 'page' : isCurrentRoom ? 'location' : undefined}
            >
              {room.shortName}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
