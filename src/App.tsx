import { useEffect, useRef, useState } from 'react'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader, type Route } from './components/SiteHeader'
import { ListeningBar } from './components/ListeningBar'
import {
  compoundingGardenPath, compoundingGardenTitle, findRoom, ledgerRunnerPath, orbitalOrchardPath,
  pendulumOfAttentionPath, pendulumOfAttentionTitle, pocketWeatherPath, rooms, smallMarketPath, smallMarketTitle,
  type RoomId,
} from './content'
import { CompoundingGarden } from './laboratory/CompoundingGarden'
import { PendulumOfAttention } from './laboratory/PendulumOfAttention'
import { SmallMarket } from './laboratory/SmallMarket'
import { HomePage } from './pages/HomePage'
import { LedgerRunnerPage } from './pages/LedgerRunnerPage'
import { ListeningPage } from './pages/ListeningPage'
import { OrbitalOrchardPage } from './pages/OrbitalOrchardPage'
import { PocketWeatherPage } from './pages/PocketWeatherPage'
import { RoomPage } from './pages/RoomPage'
import { recordings } from './recordings'
import { useListeningPlayer } from './useListeningPlayer'

const entryPages = {
  [pocketWeatherPath]: { title: 'Pocket Weather', Page: PocketWeatherPage },
  [orbitalOrchardPath]: { title: 'Orbital Orchard', Page: OrbitalOrchardPage },
  [ledgerRunnerPath]: { title: 'Ledger Runner', Page: LedgerRunnerPage },
  [compoundingGardenPath]: { title: compoundingGardenTitle, Page: CompoundingGarden },
  [smallMarketPath]: { title: smallMarketTitle, Page: SmallMarket },
  [pendulumOfAttentionPath]: { title: pendulumOfAttentionTitle, Page: PendulumOfAttention },
}
const validRoutes = ['/', ...rooms.map(({ id }) => `/${id}`), ...Object.keys(entryPages), ...recordings.map(({ path }) => path)]

function isEntryPath(route: Route): route is keyof typeof entryPages {
  return Object.hasOwn(entryPages, route)
}

function readRoute(): Route {
  const value = window.location.hash.slice(1) || '/'
  return validRoutes.includes(value as Route) ? (value as Route) : '/'
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const previousRoute = useRef(route)
  const EntryPage = isEntryPath(route) ? entryPages[route].Page : undefined
  const linkedGroup = recordings.find(({ path }) => path === route)
  const isListening = route === '/listening' || !!linkedGroup
  const player = useListeningPlayer()

  const skipToContent = () => {
    const main = document.getElementById('main-content')
    main?.focus()
    main?.scrollIntoView({ block: 'start' })
  }

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onHashChange)
    }
  }, [])

  useEffect(() => {
    const roomName = isListening ? 'Listening Room' : isEntryPath(route) ? entryPages[route].title
      : route === '/' ? '' : findRoom(route.slice(1) as RoomId).name
    document.title = roomName ? `${roomName} · The Workshop` : 'The Workshop · A personal playground'
    const previous = previousRoute.current
    const cameFromListening = previous === '/listening' || recordings.some(({ path }) => path === previous)
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (previous !== route && (isListening || cameFromListening || isEntryPath(route) || isEntryPath(previous))) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
    previousRoute.current = route
  }, [route, isListening])

  return (
    <div className="site-shell">
      <button className="skip-link" type="button" onClick={skipToContent}>Skip to content</button>
      <SiteHeader route={route} />
      <div className="page-transition" key={route}>
        {isListening
          ? <ListeningPage player={player} linkedGroup={linkedGroup?.path} />
          : EntryPage
          ? <EntryPage />
          : route === '/' ? <HomePage /> : <RoomPage room={findRoom(route.slice(1) as RoomId)} />}
      </div>
      <SiteFooter />
      <ListeningBar player={player} />
    </div>
  )
}

export default App
