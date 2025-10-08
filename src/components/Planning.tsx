import { useState, useEffect } from 'react'
import './Planning.css'

interface Task {
  id: string
  title: string
  date: string
  completed: boolean
  category: 'todo' | 'event'
}

function Planning() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [taskType, setTaskType] = useState<'todo' | 'event'>('todo')
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    const saved = localStorage.getItem('aurora-planning')
    if (saved) {
      setTasks(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aurora-planning', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        date: selectedDate,
        completed: false,
        category: taskType,
      }
      setTasks([...tasks, task])
      setNewTask('')
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const getTasksForDate = (date: string) => {
    return tasks.filter(t => t.date === date)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getDaysInView = () => {
    const today = new Date(selectedDate + 'T00:00:00')
    const days: string[] = []
    
    if (view === 'day') {
      days.push(selectedDate)
    } else if (view === 'week') {
      const dayOfWeek = today.getDay()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - dayOfWeek)
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        days.push(date.toISOString().split('T')[0])
      }
    } else if (view === 'month') {
      const year = today.getFullYear()
      const month = today.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        days.push(date.toISOString().split('T')[0])
      }
    }
    
    return days
  }

  const goToPrevious = () => {
    const date = new Date(selectedDate + 'T00:00:00')
    if (view === 'day') {
      date.setDate(date.getDate() - 1)
    } else if (view === 'week') {
      date.setDate(date.getDate() - 7)
    } else if (view === 'month') {
      date.setMonth(date.getMonth() - 1)
    }
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToNext = () => {
    const date = new Date(selectedDate + 'T00:00:00')
    if (view === 'day') {
      date.setDate(date.getDate() + 1)
    } else if (view === 'week') {
      date.setDate(date.getDate() + 7)
    } else if (view === 'month') {
      date.setMonth(date.getMonth() + 1)
    }
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="planning-container">
      <div className="planning-header">
        <h1>📅 Planning & Calendar</h1>
        <div className="view-controls">
          <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
          <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
          <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
        </div>
      </div>

      <div className="date-navigation">
        <button onClick={goToPrevious}>←</button>
        <button onClick={goToToday} className="today-btn">Today</button>
        <button onClick={goToNext}>→</button>
      </div>

      <div className="task-input-section">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask()
          }}
          placeholder="Add a task or event..."
        />
        <div className="task-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <select value={taskType} onChange={(e) => setTaskType(e.target.value as 'todo' | 'event')}>
            <option value="todo">To-Do</option>
            <option value="event">Event</option>
          </select>
          <button onClick={addTask} className="add-task-btn">Add</button>
        </div>
      </div>

      <div className="calendar-view">
        {getDaysInView().map(date => {
          const dayTasks = getTasksForDate(date)
          const isToday = date === new Date().toISOString().split('T')[0]
          const isSelected = date === selectedDate
          
          return (
            <div 
              key={date} 
              className={`day-column ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="day-header">
                <div className="day-date">{formatDate(date)}</div>
                <div className="task-count">{dayTasks.length} items</div>
              </div>
              
              <div className="day-tasks">
                {dayTasks.length === 0 ? (
                  <p className="no-tasks">No plans</p>
                ) : (
                  dayTasks.map(task => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''} ${task.category}`}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span className="task-title">{task.title}</span>
                      <button onClick={() => deleteTask(task.id)} className="delete-task-btn">
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Planning
