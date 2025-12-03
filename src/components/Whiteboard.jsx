import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { logout } from '../firebase/auth'
import {
  subscribeToRoom,
  subscribeToStrokes,
  subscribeToTexts,
  addStroke,
  updateStroke,
  removeStroke,
  addTextAnnotation,
  removeTextAnnotation,
  clearCanvas
} from '../firebase/database'
import './Whiteboard.css'

const Whiteboard = ({ user }) => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [isHost, setIsHost] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connected')
  const [showTextInput, setShowTextInput] = useState(false)
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const [textValue, setTextValue] = useState('')
  
  const strokesRef = useRef({})
  const textsRef = useRef({})
  const lastPointRef = useRef(null)
  const isLocalDrawingRef = useRef(false)
  const currentStrokeIdRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    const resizeCanvas = () => {
      const container = canvas.parentElement
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      redrawCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Subscribe to room metadata
    const unsubscribeRoom = subscribeToRoom(roomId, (roomData) => {
      if (roomData) {
        setIsHost(roomData.hostId === user.uid)
      } else {
        setIsHost(false)
      }
    })

    // Subscribe to strokes collection
    const unsubscribeStrokes = subscribeToStrokes(roomId, (strokes) => {
      strokesRef.current = strokes || {}
      redrawCanvas()
    })

    // Subscribe to text annotations
    const unsubscribeTexts = subscribeToTexts(roomId, (texts) => {
      textsRef.current = texts || {}
      redrawCanvas()
    })

    // Monitor connection status
    const connectionRef = window.addEventListener('online', () => {
      setConnectionStatus('connected')
    })
    
    window.addEventListener('offline', () => {
      setConnectionStatus('disconnected')
    })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      unsubscribeRoom()
      unsubscribeStrokes()
      unsubscribeTexts()
    }
  }, [roomId, user.uid])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all strokes
    Object.entries(strokesRef.current).forEach(([id, stroke]) => {
      if (stroke.points && stroke.points.length > 0) {
        ctx.strokeStyle = stroke.color
        ctx.lineWidth = stroke.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
        
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
        }
        
        ctx.stroke()
      }
    })

    // Draw all text annotations
    Object.entries(textsRef.current).forEach(([id, text]) => {
      ctx.fillStyle = text.color || '#000000'
      ctx.font = `${text.size || 16}px Arial`
      ctx.fillText(text.text, text.x, text.y)
    })
  }

  const getEventPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleStart = async (e) => {
    e.preventDefault()
    const point = getEventPoint(e)

    if (currentTool === 'text') {
      setTextPosition(point)
      setShowTextInput(true)
      return
    }

    if (currentTool === 'pen') {
      setIsDrawing(true)
      isLocalDrawingRef.current = true
      lastPointRef.current = point
      
      const stroke = {
        color: currentColor,
        width: strokeWidth,
        points: [point],
        userId: user.uid,
        timestamp: Date.now()
      }

      const strokeRef = await addStroke(roomId, stroke)
      const strokeId = strokeRef.key
      currentStrokeIdRef.current = strokeId
      
      // Store locally for immediate feedback
      strokesRef.current[strokeId] = stroke
      redrawCanvas()
    }

    if (currentTool === 'eraser') {
      setIsDrawing(true)
      lastPointRef.current = point
      // Erase at the starting point
      await eraseAtPoint(point)
    }
  }

  const handleMove = async (e) => {
    e.preventDefault()
    
    if (!isDrawing) return

    const point = getEventPoint(e)
    const distance = lastPointRef.current
      ? Math.sqrt(
          Math.pow(point.x - lastPointRef.current.x, 2) +
          Math.pow(point.y - lastPointRef.current.y, 2)
        )
      : 0

    if (currentTool === 'pen') {
      // Only add point if moved significantly (optimization)
      if (distance < 2) return

      lastPointRef.current = point

      // Use the current stroke ID we're drawing
      const strokeId = currentStrokeIdRef.current
      if (strokeId && strokesRef.current[strokeId]) {
        const stroke = strokesRef.current[strokeId]
        stroke.points.push(point)
        
        await updateStroke(roomId, strokeId, { points: stroke.points })
        redrawCanvas()
      }
    } else if (currentTool === 'eraser') {
      // Erase continuously as we drag
      if (distance < 2) return

      lastPointRef.current = point
      await eraseAtPoint(point)
    }
  }

  const handleEnd = (e) => {
    e.preventDefault()
    setIsDrawing(false)
    isLocalDrawingRef.current = false
    lastPointRef.current = null
    currentStrokeIdRef.current = null
  }

  const eraseAtPoint = async (point) => {
    const eraserSize = strokeWidth * 3 // Make eraser size relative to stroke width
    
    // Get current strokes snapshot to avoid stale data
    const currentStrokes = { ...strokesRef.current }
    
    // Find strokes that intersect with the eraser point
    const strokesToDelete = Object.entries(currentStrokes).filter(([id, stroke]) => {
      if (!stroke || !stroke.points || stroke.points.length === 0) return false
      
      // Check if any point in the stroke is within eraser range
      return stroke.points.some(p => {
        const dist = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
        return dist < Math.max(eraserSize, stroke.width * 2)
      })
    })

    // Delete all intersecting strokes and update local ref immediately
    for (const [strokeId] of strokesToDelete) {
      delete strokesRef.current[strokeId]
      await removeStroke(roomId, strokeId)
    }
    
    // Redraw immediately after local update
    redrawCanvas()

    // Also check text annotations
    const currentTexts = { ...textsRef.current }
    const textToDelete = Object.entries(currentTexts).find(([id, text]) => {
      if (!text) return false
      const dist = Math.sqrt(Math.pow(text.x - point.x, 2) + Math.pow(text.y - point.y, 2))
      return dist < 50
    })

    if (textToDelete) {
      delete textsRef.current[textToDelete[0]]
      await removeTextAnnotation(roomId, textToDelete[0])
      redrawCanvas()
    }
  }

  const handleAddText = async () => {
    if (!textValue.trim()) {
      setShowTextInput(false)
      return
    }

    try {
      const ref = await addTextAnnotation(roomId, {
        text: textValue,
        x: textPosition.x,
        y: textPosition.y,
        color: currentColor,
        size: strokeWidth * 5,
        userId: user.uid,
        timestamp: Date.now()
      })
      console.log('Text annotation added with key:', ref.key)
    } catch (err) {
      console.error('Failed to add text annotation:', err)
    }

    setTextValue('')
    setShowTextInput(false)
  }

  const handleClearCanvas = async () => {
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      await clearCanvas(roomId)
      // Update local refs immediately
      strokesRef.current = {}
      textsRef.current = {}
      redrawCanvas()
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-header">
        <div className="header-left">
          <h3>Room: {roomId}</h3>
          {isHost && <span className="host-badge">Host</span>}
        </div>
        <div className="header-right">
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢' : '🔴'} {connectionStatus}
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="whiteboard-content">
        <div className="toolbar">
          <div className="tool-group">
            <button
              className={`tool-button ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => setCurrentTool('pen')}
              title="Pen"
            >
              ✏️
            </button>
            <button
              className={`tool-button ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={() => setCurrentTool('eraser')}
              title="Eraser"
            >
              🧹
            </button>
            <button
              className={`tool-button ${currentTool === 'text' ? 'active' : ''}`}
              onClick={() => setCurrentTool('text')}
              title="Text"
            >
              📝
            </button>
          </div>

          {currentTool === 'pen' && (
            <>
              <div className="tool-group">
                <label>Color:</label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="color-picker"
                />
              </div>
              <div className="tool-group">
                <label>Size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="stroke-slider"
                />
                <span className="stroke-value">{strokeWidth}px</span>
              </div>
            </>
          )}

          {isHost && (
            <div className="tool-group">
              <button
                onClick={handleClearCanvas}
                className="tool-button clear-button"
                title="Clear Canvas (Host Only)"
              >
                🗑️ Clear
              </button>
            </div>
          )}
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="whiteboard-canvas"
          />
        </div>
      </div>

      {showTextInput && (
        <div
          className="text-input-overlay"
          style={{
            left: `${textPosition.x}px`,
            top: `${textPosition.y}px`
          }}
        >
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddText()
              } else if (e.key === 'Escape') {
                setShowTextInput(false)
                setTextValue('')
              }
            }}
            onBlur={handleAddText}
            autoFocus
            className="text-input-field"
            placeholder="Enter text..."
          />
        </div>
      )}
    </div>
  )
}

export default Whiteboard

