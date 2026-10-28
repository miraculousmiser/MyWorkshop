import type { RoomId } from '../content'

type RoomGlyphProps = {
  room: RoomId
  large?: boolean
}

export function RoomGlyph({ room, large = false }: RoomGlyphProps) {
  return (
    <span className={`room-glyph room-glyph--${room}${large ? ' room-glyph--large' : ''}`} aria-hidden="true">
      <span className="room-glyph__shape room-glyph__shape--one" />
      <span className="room-glyph__shape room-glyph__shape--two" />
      <span className="room-glyph__shape room-glyph__shape--three" />
    </span>
  )
}
