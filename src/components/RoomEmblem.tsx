import type { RoomId } from '../content'
import './room-emblem.css'

const illustrations = {
  arcade: (
    <span className="emblem-joystick">
      <span className="emblem-joystick__deck" />
      <span className="emblem-joystick__stick" />
      <span className="emblem-joystick__grip" />
    </span>
  ),
  library: (
    <span className="emblem-book">
      <span className="emblem-book__page" />
      <span className="emblem-book__page" />
      <span className="emblem-book__bookmark" />
    </span>
  ),
  listening: (
    <span className="emblem-turntable">
      <span className="emblem-turntable__deck" />
      <span className="emblem-turntable__record" />
      <span className="emblem-turntable__arm" />
    </span>
  ),
  laboratory: (
    <span className="emblem-flask">
      <span className="emblem-flask__glass" />
      <span className="emblem-flask__bubble" />
      <span className="emblem-flask__bubble" />
    </span>
  ),
}

export function RoomEmblem({ room }: { room: RoomId }) {
  return (
    <div className={`room-emblem room-emblem--${room}`} aria-hidden="true">
      <span className="room-emblem__orbit" />
      <span className="room-emblem__spark" />
      <span className="room-emblem__spark room-emblem__spark--small" />
      {illustrations[room]}
    </div>
  )
}
