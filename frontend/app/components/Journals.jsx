'use client'

import { useEffect, useState } from 'react'
import '../styles/Journals.css'

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
        <div className="journals-container">
            <div className="journals-sidebar">
                <div className="sidebar-header">
                    <h2>📔 My Journals</h2>
                    <button onClick={() => setShowNewJournal(!showNewJournal)} className="new-journal-btn">
                        +
                    </button>
                </div>

                {showNewJournal && (
                    <div className="new-journal-form">
                        <input
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
                        <div className="form-actions">
                            <button onClick={createJournal}>Create</button>
                            <button onClick={() => setShowNewJournal(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                <div className="journals-list">
                    {journals.length === 0 ? (
                        <p className="empty-message">No journals yet</p>
                    ) : (
                        journals.map(journal => (
                            <div
                                key={journal.id}
                                className={`journal-item ${activeJournal === journal.id ? 'active' : ''}`}
                            >
                                <div onClick={() => setActiveJournal(journal.id)} className="journal-name">
                                    {journal.name}
                                    <span className="entry-count">{journal.entries.length}</span>
                                </div>
                                <button onClick={() => deleteJournal(journal.id)} className="delete-journal-btn">
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="journal-content">
                {currentJournal ? (
                    <>
                        <div className="journal-header">
                            <h1>{currentJournal.name}</h1>
                        </div>

                        <div className="entry-input-section">
                            <textarea
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) addEntry()
                                }}
                                placeholder="Write your journal entry... (Ctrl+Enter to save)"
                                rows={5}
                            />
                            <button onClick={addEntry} className="add-entry-btn">
                                Add Entry
                            </button>
                        </div>

                        <div className="entries-list">
                            {currentJournal.entries.length === 0 ? (
                                <div className="empty-state">
                                    <p>No entries yet. Start writing!</p>
                                </div>
                            ) : (
                                currentJournal.entries.map(entry => (
                                    <div key={entry.id} className="entry-card">
                                        <div className="entry-content">{entry.content}</div>
                                        <div className="entry-footer">
                                            <span className="entry-time">{formatTime(entry.timestamp)}</span>
                                            <button onClick={() => deleteEntry(entry.id)} className="delete-entry-btn">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="no-journal-selected">
                        <p>Select a journal or create a new one to start</p>
                    </div>
                )}
            </div>
        </div>
    )
}

