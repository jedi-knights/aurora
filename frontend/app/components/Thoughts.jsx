'use client'

import { Brain, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Textarea } from './ui/textarea'

export default function Thoughts() {
    const [thoughts, setThoughts] = useState([])
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
            const thought = {
                id: Date.now().toString(),
                text: newThought,
                timestamp: Date.now(),
            }
            setThoughts([thought, ...thoughts])
            setNewThought('')
        }
    }

    const deleteThought = (id) => {
        setThoughts(thoughts.filter(t => t.id !== id))
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <Brain className="w-8 h-8 text-purple-600" />
                        <h1 className="text-4xl font-bold text-slate-800">Quick Thoughts</h1>
                    </div>
                    <p className="text-slate-600">Capture your ideas as they come</p>
                </div>

                <Card className="shadow-lg border-purple-100">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Textarea
                                value={newThought}
                                onChange={(e) => setNewThought(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        addThought()
                                    }
                                }}
                                placeholder="What's on your mind? (Ctrl+Enter to save)"
                                rows={3}
                                className="resize-none"
                            />
                            <Button
                                onClick={addThought}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                size="lg"
                            >
                                Add Thought
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {thoughts.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-12">
                                <div className="text-center text-slate-500">
                                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No thoughts yet. Start writing!</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        thoughts.map(thought => (
                            <Card key={thought.id} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {thought.text}
                                        </p>
                                        <div className="flex items-center justify-between pt-3 border-t">
                                            <span className="text-sm text-slate-500">
                                                {formatTime(thought.timestamp)}
                                            </span>
                                            <Button
                                                onClick={() => deleteThought(thought.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
