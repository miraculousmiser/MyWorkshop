import { useEffect, useState } from 'react'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader, type Route } from './components/SiteHeader'
import { findRoom, type RoomId } from './content'
import { HomePage } from './pages/HomePage'
import { RoomPage } from './pages/RoomPage'

const validRoutes: Route[] = ['/', '/arcade', '/library', '/listening', '/laboratory']

function readRoute(): Route {
  const value = window.location.hash.slice(1) || '/'
  return validRoutes.includes(value as Route) ? (value as Route) : '/'
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)

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
    const roomName = route === '/' ? '' : findRoom(route.slice(1) as RoomId).name
    document.title = roomName ? `${roomName} · The Workshop` : 'The Workshop · A personal playground'
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  return (
    <div className="site-shell">
      <button className="skip-link" type="button" onClick={skipToContent}>Skip to content</button>
      <SiteHeader route={route} />
      <div className="page-transition" key={route}>
        {route === '/' ? <HomePage /> : <RoomPage room={findRoom(route.slice(1) as RoomId)} />}
      </div>
      <SiteFooter />
    </div>
  )
}

export default App
