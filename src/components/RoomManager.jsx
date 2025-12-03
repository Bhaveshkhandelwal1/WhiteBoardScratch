import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom, getRoomsByHost, getFirstRoomsByCreatedAt, transformData } from '../firebase/database'
import './RoomManager.css'

const RoomManager = ({ user }) => {
  const [roomId, setRoomId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [myRooms, setMyRooms] = useState([])
  const [oldestRooms, setOldestRooms] = useState([])
  const navigate = useNavigate()

  const generateRoomId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleCreateRoom = async () => {
    setLoading(true)
    setError('')
    
    try {
      const newRoomId = generateRoomId()
      await createRoom(newRoomId, user.uid)
      navigate(`/room/${newRoomId}`)
    } catch (err) {
      setError('Failed to create room. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = () => {
    if (!roomId || roomId.length !== 6) {
      setError('Please enter a valid 6-digit room ID')
      return
    }
    
    navigate(`/room/${roomId}`)
  }

  // Load rooms created by this user (filtering: orderByChild + equalTo)
  // and a small list of oldest rooms (ordering: orderByChild + limitToFirst)
  useEffect(() => {
    const loadRooms = async () => {
      try {
        // Rooms where hostId == current user
        const myRoomsData = await getRoomsByHost(user.uid)
        setMyRooms(transformData(myRoomsData))

        // Oldest 5 rooms overall
        const oldestData = await getFirstRoomsByCreatedAt(5)
        setOldestRooms(transformData(oldestData))
      } catch (err) {
        console.error('Failed to load rooms for dashboard:', err)
      }
    }

    if (user?.uid) {
      loadRooms()
    }
  }, [user?.uid])

  return (
    <div className="room-manager">
      <div className="room-manager-card">
        <h2>Welcome, {user.email}</h2>
        
        <div className="room-actions">
          <div className="action-section">
            <h3>Create a Room</h3>
            <p>Start a new collaborative session</p>
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="action-button create-button"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="action-section">
            <h3>Join a Room</h3>
            <p>Enter a 6-digit room ID to join</p>
            <div className="join-input-group">
              <input
                type="text"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                placeholder="000000"
                maxLength={6}
                className="room-id-input"
              />
              <button
                onClick={handleJoinRoom}
                className="action-button join-button"
              >
                Join
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Demonstration of Firebase ordering + filtering output */}
        <div className="room-lists">
          <div className="room-list-section">
            <h3>My Rooms (orderByChild('hostId') + equalTo)</h3>
            {myRooms.length === 0 ? (
              <p className="room-list-empty">You have not created any rooms yet.</p>
            ) : (
              <ul className="room-list">
                {myRooms.map((room) => (
                  <li key={room.id} className="room-list-item">
                    <span className="room-list-id">ID: {room.id}</span>
                    <span className="room-list-meta">
                      Created at: {new Date(room.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="room-list-section">
            <h3>Oldest Rooms (orderByChild('createdAt') + limitToFirst)</h3>
            {oldestRooms.length === 0 ? (
              <p className="room-list-empty">No rooms found yet.</p>
            ) : (
              <ul className="room-list">
                {oldestRooms.map((room) => (
                  <li key={room.id} className="room-list-item">
                    <span className="room-list-id">ID: {room.id}</span>
                    <span className="room-list-meta">
                      Host: {room.hostId || 'Unknown'} |{' '}
                      {new Date(room.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomManager

