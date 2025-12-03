import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from './firebase/auth'
import Auth from './components/Auth'
import RoomManager from './components/RoomManager'
import Whiteboard from './components/Whiteboard'
import {
  getFirstRoomsByCreatedAt,
  getRoomsByCreatedAtRange,
  getRoomsByHost,
  getLastRoomsByKey,
  getOnlineUsersOrderedByValue
} from './firebase/database'

// Small helper component that only logs query outputs to the console
// so you can demonstrate ordering and filtering.
function DebugQueries() {
  useEffect(() => {
    console.log('DebugQueries mounted – running Firebase queries...')

    // 1) First 3 rooms by createdAt
    getFirstRoomsByCreatedAt(3)
      .then((rooms) => {
        console.log('First 3 rooms by createdAt:', rooms)
      })
      .catch((err) => console.error('Error in getFirstRoomsByCreatedAt:', err))

    // 2) Rooms created in the last hour
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    getRoomsByCreatedAtRange(oneHourAgo, now)
      .then((rooms) => {
        console.log('Rooms created in last hour:', rooms)
      })
      .catch((err) => console.error('Error in getRoomsByCreatedAtRange:', err))

    // 3) Rooms by a specific host (change this UID to one that exists in your data)
    const hostId = 'PUT_SOME_HOST_UID_HERE'
    getRoomsByHost(hostId)
      .then((rooms) => {
        console.log(`Rooms for host ${hostId}:`, rooms)
      })
      .catch((err) => console.error('Error in getRoomsByHost:', err))

    // 4) Last 5 rooms by key
    getLastRoomsByKey(5)
      .then((rooms) => {
        console.log('Last 5 rooms by key:', rooms)
      })
      .catch((err) => console.error('Error in getLastRoomsByKey:', err))

    // 5) Online users (if you have this node in your DB)
    getOnlineUsersOrderedByValue()
      .then((users) => {
        console.log('Online users ordered by value:', users)
      })
      .catch((err) => console.error('Error in getOnlineUsersOrderedByValue:', err))
  }, [])

  // This component does not render anything on the page
  return null
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <Router>
      {/* This will run once and print query results in the browser console */}
      <DebugQueries />
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/rooms" replace /> : <Auth />}
        />
        <Route
          path="/rooms"
          element={user ? <RoomManager user={user} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/room/:roomId"
          element={user ? <Whiteboard user={user} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  )
}

export default App