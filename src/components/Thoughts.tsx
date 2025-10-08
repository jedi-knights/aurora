import { useState, useEffect } from 'react'
import './Thoughts.css'

interface Thought {
  id: string
  text: string
  timestamp: number
}

function Thoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [newThought, setNewThought] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('aurora-thoughts')
    if (saved) {
      setThoughts(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aurora-thoughts', JSON.stringify(thoughts))
  }, [thoughts])

  const addThought = () => {
    if (newThought.trim()) {
      const thought: Thought = {
        id: Date.now().toString(),
        text: newThought,
        timestamp: Date.now(),
      }
      setThoughts([thought, ...thoughts])
      setNewThought('')
    }
  }

  const deleteThought = (id: string) => {
    setThoughts(thoughts.filter(t => t.id !== id))
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="thoughts-container">
      <div className="thoughts-header">
        <h1>💭 Quick Thoughts</h1>
        <p>Capture your ideas as they come</p>
      </div>
      
      <div className="thought-input-section">
        <textarea
          value={newThought}
          onChange={(e) => setNewThought(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              addThought()
            }
          }}
          placeholder="What's on your mind? (Ctrl+Enter to save)"
          rows={3}
        />
        <button onClick={addThought} className="add-button">
          Add Thought
        </button>
      </div>

      <div className="thoughts-list">
        {thoughts.length === 0 ? (
          <div className="empty-state">
            <p>No thoughts yet. Start writing!</p>
          </div>
        ) : (
          thoughts.map(thought => (
            <div key={thought.id} className="thought-card">
              <div className="thought-content">{thought.text}</div>
              <div className="thought-footer">
                <span className="thought-time">{formatTime(thought.timestamp)}</span>
                <button onClick={() => deleteThought(thought.id)} className="delete-button">
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Thoughts
