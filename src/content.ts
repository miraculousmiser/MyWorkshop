export type RoomId = 'arcade' | 'library' | 'listening' | 'laboratory'

export type Entry = {
  title: string
  kind: string
  year: string
  description: string
  note: string
}

export type Room = {
  id: RoomId
  index: string
  name: string
  shortName: string
  eyebrow: string
  summary: string
  introduction: string
  promise: string
  entries: Entry[]
}

export const rooms: Room[] = [
  {
    id: 'arcade',
    index: 'I',
    name: 'Arcade',
    shortName: 'Arcade',
    eyebrow: 'Small worlds & playable ideas',
    summary: 'Browser games made for curiosity, short visits, and the pleasure of discovering a rule.',
    introduction:
      'This room will collect compact games that begin quickly and leave a small afterimage. No accounts, currencies, or endless progress bars—just a premise, a few rules, and room to play.',
    promise: 'Future games will be browser-native, keyboard-friendly, and comfortable on smaller screens.',
    entries: [
      {
        title: 'Orbital Orchard',
        kind: 'Game sketch',
        year: 'Soon',
        description: 'Guide drifting seeds into miniature planetary gardens without disturbing their delicate orbits.',
        note: 'A quiet score-chasing game about timing and gentle interference.',
      },
      {
        title: 'Pocket Weather',
        kind: 'Five-minute toy',
        year: 'Soon',
        description: 'Arrange clouds, wind, and light to make a tiny afternoon feel exactly right.',
        note: 'A tactile weather box with no win state—only changing moods.',
      },
      {
        title: 'Ledger Runner',
        kind: 'Arcade satire',
        year: 'Soon',
        description: 'Balance speed, risk, and reserves while a very small economy gets increasingly strange.',
        note: 'An economic fable disguised as a brisk one-button game.',
      },
    ],
  },
  {
    id: 'library',
    index: 'II',
    name: 'Library',
    shortName: 'Library',
    eyebrow: 'Essays, marginalia & reading notes',
    summary: 'A shelf for economic philosophy, durable questions, and books worth returning to.',
    introduction:
      'The library is for slower thinking: essays about value and the good life, notes from generous books, and arguments still being worked out in public.',
    promise: 'Longer pieces will favor clear language, honest uncertainty, and a printable reading experience.',
    entries: [
      {
        title: 'Notes on Enough',
        kind: 'Economic philosophy',
        year: 'Draft',
        description: 'An unfinished essay about abundance, limits, and what a prosperous life might actually require.',
        note: 'Questions first: where does sufficiency end and accumulation begin?',
      },
      {
        title: 'A Commons in Miniature',
        kind: 'Field note',
        year: 'Draft',
        description: 'Observations on shared spaces, informal stewardship, and the quiet work of maintaining trust.',
        note: 'A short study of the rules people invent before anyone writes rules down.',
      },
      {
        title: 'Reading Shelf No. 01',
        kind: 'Book notes',
        year: 'List',
        description: 'Three books that reward rereading, with a page of notes and one good question from each.',
        note: 'The first of an occasional, deliberately small reading list.',
      },
    ],
  },
  {
    id: 'listening',
    index: 'III',
    name: 'Listening Room',
    shortName: 'Listening',
    eyebrow: 'Records, field notes & useful noise',
    summary: 'Listening notes for albums, patient songs, field recordings, and music that changes a room.',
    introduction:
      'This is a place to write about listening without turning taste into a leaderboard. Expect small sequences, remembered sounds, and notes about when a piece of music becomes useful.',
    promise: 'No autoplay and no embedded trackers—just listening notes and links added with care.',
    entries: [
      {
        title: 'Night Trains',
        kind: 'Fictional sequence',
        year: 'Side A',
        description: 'A sequence imagined for late work, long windows, and stations that arrive before their names do.',
        note: 'Low light, steady motion, one bright interruption near the end.',
      },
      {
        title: 'Three Songs for Working Slowly',
        kind: 'Listening notes',
        year: 'List',
        description: 'Notes on patience, repetition, and music that makes concentration feel less mechanical.',
        note: 'A tiny playlist with room between the tracks.',
      },
      {
        title: 'Tape Loop at Dusk',
        kind: 'Field study',
        year: 'Study',
        description: 'A fictional field-recording exercise built from porch fans, distant traffic, and evening insects.',
        note: 'An experiment in hearing the rhythm inside an ordinary hour.',
      },
    ],
  },
  {
    id: 'laboratory',
    index: 'IV',
    name: 'Laboratory',
    shortName: 'Laboratory',
    eyebrow: 'Models, instruments & odd little systems',
    summary: 'Interactive experiments for seeing an idea move, bend, accumulate, or fall apart.',
    introduction:
      'The laboratory will hold small explainers and playful models: things easier to understand by touching than by reading one more paragraph.',
    promise: 'Every experiment will explain its controls, its assumptions, and what it cannot claim to prove.',
    entries: [
      {
        title: 'Compounding Garden',
        kind: 'Visual model',
        year: 'Prototype',
        description: 'Tune time, growth, and decay in a small visual system that behaves a little like a garden.',
        note: 'A gentler way to develop intuition for exponential change.',
      },
      {
        title: 'Signals in a Small Market',
        kind: 'Toy economy',
        year: 'Prototype',
        description: 'Watch local choices ripple through a tiny market whose participants know only their neighbors.',
        note: 'A model for asking better questions, not predicting the world.',
      },
      {
        title: 'Pendulum of Attention',
        kind: 'Interactive study',
        year: 'Prototype',
        description: 'Adjust rhythm, interruption, and recovery to see how a day’s attention changes shape.',
        note: 'A small instrument for thinking about focus without quantifying a person.',
      },
    ],
  },
]

export const deskFragments = [
  {
    date: 'Note 001',
    title: 'The first room is the doorway',
    text: 'Version 0.1 is intentionally a map before it is a collection.',
  },
  {
    date: 'Note 002',
    title: 'Small enough to tend',
    text: 'The best next addition should be something that can be finished in a few evenings.',
  },
  {
    date: 'Note 003',
    title: 'A useful constraint',
    text: 'Everything here should still make sense when the network is slow and the screen is small.',
  },
]

export const findRoom = (id: RoomId) => rooms.find((room) => room.id === id)!
