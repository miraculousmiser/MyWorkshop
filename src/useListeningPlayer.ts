import { useEffect, useRef, useState } from 'react'
import { audioUrl, playlistTracks, type PlaylistTrack } from './recordings'

const selectionKey = 'workshop-listening-excluded'

function readExcluded(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(selectionKey) ?? '[]')
    return Array.isArray(saved) ? playlistTracks.filter(({ id }) => saved.includes(id)).map(({ id }) => id) : []
  } catch {
    return []
  }
}

function nextSelected(id: string | null, direction: -1 | 1, excluded: readonly string[]) {
  const origin = playlistTracks.findIndex((track) => track.id === id)
  if (origin < 0) return playlistTracks.find((track) => !excluded.includes(track.id))

  const count = playlistTracks.length
  for (let offset = 1; offset <= count; offset += 1) {
    const candidate = playlistTracks[(origin + count + offset * direction) % count]
    if (!excluded.includes(candidate.id)) return candidate
  }
  return undefined
}

export function useListeningPlayer() {
  const audio = useRef<HTMLAudioElement>(null)
  const loaded = useRef<string | null>(null)
  const [current, setCurrent] = useState<PlaylistTrack | null>(null)
  const [excluded, setExcluded] = useState(readExcluded)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const selectedCount = playlistTracks.length - excluded.length

  useEffect(() => {
    try {
      localStorage.setItem(selectionKey, JSON.stringify(excluded))
    } catch {
      // Keep the in-memory playlist when browser storage is unavailable.
    }
  }, [excluded])

  function load(track: PlaylistTrack, autoplay: boolean, offset?: number) {
    const player = audio.current
    if (!player) return
    setError('')

    if (loaded.current !== track.id) {
      loaded.current = track.id
      player.src = audioUrl(track.file)
      setCurrent(track)
      setPlaying(false)
    } else if (player.error) {
      player.load()
    }

    if (offset !== undefined) player.currentTime = offset
    if (autoplay) {
      void player.play().catch((failure: unknown) => {
        if (loaded.current !== track.id || (failure instanceof DOMException && failure.name === 'AbortError')) return
        setError('Playback could not start. Try the Play button again.')
      })
    }
  }

  function play(id?: string, offset?: number) {
    const track = id
      ? playlistTracks.find((item) => item.id === id && !excluded.includes(item.id))
      : nextSelected(null, 1, excluded)
    if (track) load(track, true, offset)
  }

  function step(direction: -1 | 1, fromEnd = false) {
    const player = audio.current
    const track = nextSelected(loaded.current, direction, excluded)
    if (player && track) {
      load(track, fromEnd || !player.paused, 0)
    }
  }

  function setIncluded(id: string, checked: boolean) {
    const updated = checked ? excluded.filter((item) => item !== id) : [...excluded, id]
    setExcluded(updated)
    const player = audio.current
    if (checked || id !== loaded.current || !player) return

    const next = nextSelected(id, 1, updated)
    if (next) {
      const continuePlaying = !player.paused
      load(next, continuePlaying)
    } else {
      loaded.current = null
      player.pause()
      player.removeAttribute('src')
      player.load()
      setCurrent(null)
      setPlaying(false)
      setError('')
    }
  }

  return { audio, current, excluded, selectedCount, playing, error, play, step, setIncluded, setPlaying, setError }
}

export type ListeningPlayer = ReturnType<typeof useListeningPlayer>
