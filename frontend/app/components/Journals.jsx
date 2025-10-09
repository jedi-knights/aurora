'use client'

import { BookOpen, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

export default function Journals() {
    const [journals, setJournals] = useState([])
    const [activeJournal, setActiveJournal] = useState(null)
    const [newJournalName, setNewJournalName] = useState('')
    const [newEntry, setNewEntry] = useState('')
    const [showNewJournal, setShowNewJournal] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('aurora-journals')
        if (saved) {
            const loadedJournals = JSON.parse(saved)
            setJournals(loadedJournals)
            if (loadedJournals.length > 0 && !activeJournal) {
                setActiveJournal(loadedJournals[0].id)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('aurora-journals', JSON.stringify(journals))
    }, [journals])

    const createJournal = () => {
        if (newJournalName.trim()) {
            const journal = {
                id: Date.now().toString(),
                name: newJournalName,
                entries: [],
            }
            setJournals([...journals, journal])
            setActiveJournal(journal.id)
            setNewJournalName('')
            setShowNewJournal(false)
        }
    }

    const addEntry = () => {
        if (newEntry.trim() && activeJournal) {
            const entry = {
                id: Date.now().toString(),
                content: newEntry,
                timestamp: Date.now(),
            }
            setJournals(journals.map(j =>
                j.id === activeJournal
                    ? { ...j, entries: [entry, ...j.entries] }
                    : j
            ))
            setNewEntry('')
        }
    }

    const deleteEntry = (entryId) => {
        if (activeJournal) {
            setJournals(journals.map(j =>
                j.id === activeJournal
                    ? { ...j, entries: j.entries.filter(e => e.id !== entryId) }
                    : j
            ))
        }
    }

    const deleteJournal = (journalId) => {
        setJournals(journals.filter(j => j.id !== journalId))
        if (activeJournal === journalId) {
            const remaining = journals.filter(j => j.id !== journalId)
            setActiveJournal(remaining.length > 0 ? remaining[0].id : null)
        }
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const currentJournal = journals.find(j => j.id === activeJournal)

    return (
        <div className="h-full flex bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r shadow-lg overflow-auto">
                <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-white">
                            <BookOpen className="w-6 h-6" />
                            <h2 className="text-xl font-bold">My Journals</h2>
                        </div>
                        <Button
                            onClick={() => setShowNewJournal(!showNewJournal)}
                            size="icon"
                            variant="secondary"
                            className="bg-white text-purple-600 hover:bg-white/90"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    {showNewJournal && (
                        <Card className="shadow-lg">
                            <CardContent className="pt-4 space-y-3">
                                <Input
                                    type="text"
                                    value={newJournalName}
                                    onChange={(e) => setNewJournalName(e.target.value)}
                                    placeholder="Journal name"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') createJournal()
                                        if (e.key === 'Escape') setShowNewJournal(false)
                                    }}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button onClick={createJournal} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                        Create
                                    </Button>
                                    <Button onClick={() => setShowNewJournal(false)} variant="outline" className="flex-1">
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="p-4 space-y-2">
                    {journals.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No journals yet</p>
                        </div>
                    ) : (
                        journals.map(journal => (
                            <Card
                                key={journal.id}
                                className={`cursor-pointer transition-all ${activeJournal === journal.id
                                        ? 'border-purple-500 border-2 shadow-md'
                                        : 'hover:border-purple-300 hover:shadow'
                                    }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div
                                            onClick={() => setActiveJournal(journal.id)}
                                            className="flex-1 flex items-center justify-between"
                                        >
                                            <span className="font-medium text-slate-700">
                                                {journal.name}
                                            </span>
                                            <Badge variant="secondary">
                                                {journal.entries.length}
                                            </Badge>
                                        </div>
                                        <Button
                                            onClick={() => deleteJournal(journal.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {currentJournal ? (
                    <div className="max-w-4xl mx-auto p-6 space-y-6">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-slate-800">{currentJournal.name}</h1>
                        </div>

                        <Card className="shadow-lg border-purple-100">
                            <CardContent className="pt-6 space-y-4">
                                <Textarea
                                    value={newEntry}
                                    onChange={(e) => setNewEntry(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) addEntry()
                                    }}
                                    placeholder="Write your journal entry... (Ctrl+Enter to save)"
                                    rows={5}
                                    className="resize-none"
                                />
                                <Button
                                    onClick={addEntry}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                    size="lg"
                                >
                                    Add Entry
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {currentJournal.entries.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-12">
                                        <div className="text-center text-slate-500">
                                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No entries yet. Start writing!</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                currentJournal.entries.map(entry => (
                                    <Card key={entry.id} className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500">
                                        <CardContent className="pt-6">
                                            <div className="space-y-3">
                                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                    {entry.content}
                                                </p>
                                                <div className="flex items-center justify-between pt-3 border-t">
                                                    <span className="text-sm text-slate-500">
                                                        {formatTime(entry.timestamp)}
                                                    </span>
                                                    <Button
                                                        onClick={() => deleteEntry(entry.id)}
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
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <Card className="border-dashed max-w-md">
                            <CardContent className="py-12">
                                <div className="text-center text-slate-500">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">Select a journal or create a new one to start</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
