'use client'

import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Circle, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export default function Planning() {
    const [tasks, setTasks] = useState([])
    const [newTask, setNewTask] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [taskType, setTaskType] = useState('todo')
    const [view, setView] = useState('day')

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
            const task = {
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

    const toggleTask = (id) => {
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ))
    }

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id))
    }

    const getTasksForDate = (date) => {
        return tasks.filter(t => t.date === date)
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const getDaysInView = () => {
        const today = new Date(selectedDate + 'T00:00:00')
        const days = []

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
        <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold text-slate-800">Planning & Calendar</h1>
                    </div>
                    <div className="flex gap-2">
                        {['day', 'week', 'month'].map((v) => (
                            <Button
                                key={v}
                                variant={view === v ? "default" : "outline"}
                                onClick={() => setView(v)}
                                className={view === v ? "bg-purple-600 hover:bg-purple-700" : ""}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Date Navigation */}
                <Card className="shadow-lg border-purple-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-4">
                            <Button onClick={goToPrevious} variant="outline" size="icon">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button onClick={goToToday} variant="secondary" className="min-w-[100px]">
                                Today
                            </Button>
                            <Button onClick={goToNext} variant="outline" size="icon">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Input */}
                <Card className="shadow-lg border-purple-100">
                    <CardContent className="pt-6 space-y-4">
                        <Input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addTask()
                            }}
                            placeholder="Add a task or event..."
                            className="text-lg"
                        />
                        <div className="flex gap-3">
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={taskType}
                                onChange={(e) => setTaskType(e.target.value)}
                                className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="todo">To-Do</option>
                                <option value="event">Event</option>
                            </select>
                            <Button
                                onClick={addTask}
                                className="bg-purple-600 hover:bg-purple-700 px-8"
                            >
                                Add
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar View */}
                <div className={`grid gap-4 ${view === 'day' ? 'grid-cols-1' :
                        view === 'week' ? 'grid-cols-7' :
                            'grid-cols-7'
                    }`}>
                    {getDaysInView().map(date => {
                        const dayTasks = getTasksForDate(date)
                        const isToday = date === new Date().toISOString().split('T')[0]
                        const isSelected = date === selectedDate

                        return (
                            <Card
                                key={date}
                                className={`cursor-pointer transition-all ${isToday ? 'border-purple-500 border-2' : ''
                                    } ${isSelected ? 'shadow-lg ring-2 ring-purple-300' : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedDate(date)}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <span className={isToday ? 'text-purple-600 font-bold' : ''}>
                                            {formatDate(date)}
                                        </span>
                                        <Badge variant={dayTasks.length > 0 ? "default" : "secondary"} className={dayTasks.length > 0 ? "bg-purple-600" : ""}>
                                            {dayTasks.length}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {dayTasks.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-4">No plans</p>
                                    ) : (
                                        dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${task.completed
                                                        ? 'bg-green-50 text-green-700'
                                                        : task.category === 'event'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-slate-50 text-slate-700'
                                                    }`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleTask(task.id)
                                                    }}
                                                    className="flex-shrink-0"
                                                >
                                                    {task.completed ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Circle className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <span className={`flex-1 truncate ${task.completed ? 'line-through' : ''}`}>
                                                    {task.title}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        deleteTask(task.id)
                                                    }}
                                                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
