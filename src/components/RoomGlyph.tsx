import type { RoomId } from '../content'

type RoomGlyphProps = {
  room: RoomId
}

export function RoomGlyph({ room }: RoomGlyphProps) {
  return (
    <span className={`room-glyph room-glyph--${room}`} aria-hidden="true">
      <span className="room-glyph__shape room-glyph__shape--one" />
      <span className="room-glyph__shape room-glyph__shape--two" />
      <span className="room-glyph__shape room-glyph__shape--three" />
    </span>
  )
}
