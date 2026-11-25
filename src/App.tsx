import { useEffect, useRef, useState } from 'react'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader, type Route } from './components/SiteHeader'
import { findRoom, ledgerRunnerPath, orbitalOrchardPath, pocketWeatherPath, rooms, type GamePath, type RoomId } from './content'
import { HomePage } from './pages/HomePage'
import { LedgerRunnerPage } from './pages/LedgerRunnerPage'
import { OrbitalOrchardPage } from './pages/OrbitalOrchardPage'
import { PocketWeatherPage } from './pages/PocketWeatherPage'
import { RoomPage } from './pages/RoomPage'

const gamePages = {
  [pocketWeatherPath]: { title: 'Pocket Weather', Page: PocketWeatherPage },
  [orbitalOrchardPath]: { title: 'Orbital Orchard', Page: OrbitalOrchardPage },
  [ledgerRunnerPath]: { title: 'Ledger Runner', Page: LedgerRunnerPage },
}
const validRoutes = ['/', ...rooms.map(({ id }) => `/${id}`), ...Object.keys(gamePages)]

function isGamePath(route: Route): route is GamePath {
  return Object.hasOwn(gamePages, route)
}

function readRoute(): Route {
  const value = window.location.hash.slice(1) || '/'
  return validRoutes.includes(value as Route) ? (value as Route) : '/'
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const previousRoute = useRef(route)
  const GamePage = isGamePath(route) ? gamePages[route].Page : undefined

  const skipToContent = () => {
    const main = document.getElementById('main-content')
    main?.focus()
    main?.scrollIntoView({ block: 'start' })
  }

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const roomName = isGamePath(route)
      ? gamePages[route].title
      : route === '/' ? '' : findRoom(route.slice(1) as RoomId).name
    document.title = roomName ? `${roomName} · The Workshop` : 'The Workshop · A personal playground'
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (previousRoute.current !== route && (isGamePath(route) || isGamePath(previousRoute.current))) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }
    previousRoute.current = route
  }, [route])

  return (
    <div className="site-shell">
      <button className="skip-link" type="button" onClick={skipToContent}>Skip to content</button>
      <SiteHeader route={route} />
      <div className="page-transition" key={route}>
        {GamePage
          ? <GamePage />
          : route === '/' ? <HomePage /> : <RoomPage room={findRoom(route.slice(1) as RoomId)} />}
      </div>
      <SiteFooter />
    </div>
  )
}

export default App
