'use client'

import { BookOpen, Brain, Calendar } from 'lucide-react'
import { useState } from 'react'
import Journals from './components/Journals'
import Planning from './components/Planning'
import Thoughts from './components/Thoughts'
import { Button } from './components/ui/button'

export default function Home() {
    const [activeSection, setActiveSection] = useState('thoughts')

    const navItems = [
        { id: 'thoughts', label: 'Thoughts', icon: Brain },
        { id: 'journals', label: 'Journals', icon: BookOpen },
        { id: 'planning', label: 'Planning', icon: Calendar },
    ]

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50">
            <nav className="bg-purple-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Aurora
                            </h1>
                        </div>
                        <div className="flex gap-2">
                            {navItems.map(({ id, label, icon: Icon }) => (
                                <Button
                                    key={id}
                                    variant={activeSection === id ? "secondary" : "ghost"}
                                    className={
                                        activeSection === id
                                            ? "bg-white text-purple-600 hover:bg-gray-100"
                                            : "text-white hover:bg-purple-700"
                                    }
                                    onClick={() => setActiveSection(id)}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 overflow-hidden bg-white">
                {activeSection === 'thoughts' && <Thoughts />}
                {activeSection === 'journals' && <Journals />}
                {activeSection === 'planning' && <Planning />}
            </main>
        </div>
    )
}
