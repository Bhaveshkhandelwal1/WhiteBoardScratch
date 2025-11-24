import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthChange } from './firebase/auth'
import Auth from './components/Auth'
import RoomManager from './components/RoomManager'
import Whiteboard from './components/Whiteboard'

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

