import {
  ref,
  set,
  push,
  onValue,
  remove,
  update,
  get,
  query,
  orderByChild,
  orderByKey,
  orderByValue,
  limitToFirst,
  limitToLast,
  startAt,
  endAt,
  equalTo
} from 'firebase/database'
import { database } from './config'

export const createRoom = (roomId, hostId) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  return set(roomRef, {
    hostId,
    createdAt: Date.now(),
    strokes: {}
  })
}

export const joinRoom = (roomId, userId) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  return new Promise((resolve, reject) => {
    onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        resolve(snapshot.val())
      } else {
        reject(new Error('Room not found'))
      }
    }, { onlyOnce: true })
  })
}

export const addStroke = (roomId, stroke) => {
  const strokesRef = ref(database, `rooms/${roomId}/strokes`)
  return push(strokesRef, stroke)
}

// Subscribe only to strokes for a room (used by Whiteboard.jsx)
export const subscribeToStrokes = (roomId, callback) => {
  const strokesRef = ref(database, `rooms/${roomId}/strokes`)
  return onValue(strokesRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback({})
    }
  })
}

export const removeStroke = (roomId, strokeId) => {
  const strokeRef = ref(database, `rooms/${roomId}/strokes/${strokeId}`)
  return remove(strokeRef)
}

// Update an existing stroke (used for adding new points while drawing)
export const updateStroke = (roomId, strokeId, data) => {
  const strokeRef = ref(database, `rooms/${roomId}/strokes/${strokeId}`)
  return update(strokeRef, data)
}

export const clearCanvas = (roomId) => {
  const strokesRef = ref(database, `rooms/${roomId}/strokes`)
  const textsRef = ref(database, `rooms/${roomId}/texts`)
  return Promise.all([
    set(strokesRef, {}),
    set(textsRef, {})
  ])
}

export const subscribeToRoom = (roomId, callback) => {
  const roomRef = ref(database, `rooms/${roomId}`)
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

export const addTextAnnotation = (roomId, textData) => {
  const textsRef = ref(database, `rooms/${roomId}/texts`)
  return push(textsRef, textData)
}

export const removeTextAnnotation = (roomId, textId) => {
  const textRef = ref(database, `rooms/${roomId}/texts/${textId}`)
  return remove(textRef)
}

export const subscribeToTexts = (roomId, callback) => {
  const textsRef = ref(database, `rooms/${roomId}/texts`)
  return onValue(textsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback({})
    }
  })
}

// Helper: convert Firebase object { id: value } to array [{ id, ...value }]
export const transformData = (dataObj) => {
  if (!dataObj) return []
  return Object.entries(dataObj).map(([id, value]) => ({
    id,
    ...value
  }))
}

// Get the first N rooms ordered by createdAt (oldest first)
// Implemented by fetching all rooms once and sorting/filtering on the client
// so it works even if Realtime Database indexes are not configured.
export const getFirstRoomsByCreatedAt = async (limit) => {
  const roomsRef = ref(database, 'rooms')
  const snapshot = await get(roomsRef)
  const allRooms = snapshot.val() || {}

  const sorted = Object.entries(allRooms)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .slice(0, limit)

  // Return back in object form to keep existing transformData usage
  return sorted.reduce((acc, room) => {
    const { id, ...rest } = room
    acc[id] = rest
    return acc
  }, {})
}

export const getRoomsByCreatedAtRange = (startTimestamp, endTimestamp) => {
  const roomsRef = ref(database, 'rooms')
  const q = query(
    roomsRef,
    orderByChild('createdAt'),
    startAt(startTimestamp),
    endAt(endTimestamp)
  )

  return new Promise((resolve) => {
    onValue(
      q,
      (snapshot) => {
        resolve(snapshot.val() || {})
      },
      {
        onlyOnce: true
      }
    )
  })
}

// Get all rooms where hostId matches, by fetching once and filtering client-side.
// This avoids needing .indexOn('hostId') in database rules.
export const getRoomsByHost = async (hostId) => {
  const roomsRef = ref(database, 'rooms')
  const snapshot = await get(roomsRef)
  const allRooms = snapshot.val() || {}

  const filteredEntries = Object.entries(allRooms).filter(
    ([, value]) => value && value.hostId === hostId
  )

  return filteredEntries.reduce((acc, [id, value]) => {
    acc[id] = value
    return acc
  }, {})
}


export const getLastRoomsByKey = (limit) => {
  const roomsRef = ref(database, 'rooms')
  const q = query(roomsRef, orderByKey(), limitToLast(limit))

  return new Promise((resolve) => {
    onValue(
      q,
      (snapshot) => {
        resolve(snapshot.val() || {})
      },
      {
        onlyOnce: true
      }
    )
  })
}

export const getOnlineUsersOrderedByValue = () => {
  const onlineRef = ref(database, 'onlineUsers')
  const q = query(onlineRef, orderByValue())

  return new Promise((resolve) => {
    onValue(
      q,
      (snapshot) => {
        resolve(snapshot.val() || {})
      },
      {
        onlyOnce: true
      }
    )
  })
}


