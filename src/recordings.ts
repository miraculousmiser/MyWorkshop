import {
  nightTrainsDescription, nightTrainsPath,
  lastLightDescription, lastLightPath, lastLightTitle,
  summerPorchDescription, summerPorchPath, summerPorchTitle,
  workingSlowlyDescription, workingSlowlyPath, workingSlowlyTitle,
  type EntryPath,
} from './content'

type Track = {
  id: string
  title: string
  file: string
  duration: string
  note?: string
  cues?: readonly { title: string; offset: number; time: string }[]
}

type Recording = {
  path: Extract<EntryPath, `/listening/${string}`>
  title: string
  description: string
  filename: string
  downloadFilename?: string
  tracks: readonly Track[]
}

export const recordings: readonly Recording[] = [
  {
    path: nightTrainsPath,
    title: 'Night Trains',
    description: nightTrainsDescription,
    filename: 'night-trains.mp3',
    tracks: [
      { id: 'window-seat', title: 'Window Seat', file: 'tracks/window-seat.mp3', duration: '0:49' },
      { id: 'passing-signal', title: 'Passing Signal', file: 'tracks/passing-signal.mp3', duration: '0:49' },
      { id: 'before-the-name', title: 'Before the Name', file: 'tracks/before-the-name.mp3', duration: '0:53' },
    ],
  },
  {
    path: workingSlowlyPath,
    title: workingSlowlyTitle,
    description: workingSlowlyDescription,
    filename: 'three-songs-for-working-slowly.mp3',
    tracks: [
      { id: 'open-the-window', title: 'Open the Window', file: 'tracks/open-the-window.mp3', duration: '1:02', note: 'A felt-piano phrase lets the morning in.' },
      { id: 'a-familiar-task', title: 'A Familiar Task', file: 'tracks/a-familiar-task.mp3', duration: '0:54', note: 'Wooden mallets in a gentle three-beat pattern.' },
      { id: 'leave-a-little-room', title: 'Leave a Little Room', file: 'tracks/leave-a-little-room.mp3', duration: '1:00', note: 'Nylon strings and a slow reed melody.' },
    ],
  },
  {
    path: lastLightPath,
    title: lastLightTitle,
    description: lastLightDescription,
    filename: 'tape-loop-at-dusk.mp3',
    downloadFilename: 'last-light-on-the-ridge.mp3',
    tracks: [
      {
        id: 'tape-loop-at-dusk', title: lastLightTitle, file: 'tape-loop-at-dusk.mp3', duration: '2:43',
        cues: [
          { title: 'First Pass', offset: 0, time: '0:00' },
          { title: 'A Turn in the Tune', offset: 48, time: '0:48' },
          { title: 'Settling In', offset: 112, time: '1:52' },
        ],
      },
    ],
  },
  {
    path: summerPorchPath,
    title: summerPorchTitle,
    description: summerPorchDescription,
    filename: 'summer-porch-sessions.mp3',
    tracks: [
      { id: 'lantern-swing', title: 'Lantern Swing', file: 'tracks/lantern-swing.mp3', duration: '1:22', note: 'Mandolin and soft banjo over an easy guitar pulse.' },
      { id: 'one-more-under-the-stars', title: 'One More Under the Stars', file: 'tracks/one-more-under-the-stars.mp3', duration: '1:45', note: 'Gentle fiddle phrases answered by mandolin and fingerpicked guitar.' },
    ],
  },
]

export type PlaylistTrack = Track & { collection: string }
export const playlistTracks: readonly PlaylistTrack[] = recordings.flatMap(({ title, tracks }) =>
  tracks.map((track) => ({ ...track, collection: title })),
)

export function audioUrl(file: string) {
  return `${import.meta.env.BASE_URL}audio/${file}`
}
