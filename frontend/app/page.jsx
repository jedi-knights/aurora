'use client'

import { ArrowRight, BookOpen, Brain, Calendar, Github, Play, Shield, Sparkles, Users, Zap } from 'lucide-react'
import { useState } from 'react'
import Journals from './components/Journals'
import Planning from './components/Planning'
import Thoughts from './components/Thoughts'
import { Button } from './components/ui/button'

export default function Home() {
    const [currentView, setCurrentView] = useState('landing') // 'landing' or 'app'
    const [activeSection, setActiveSection] = useState('thoughts')

    const navItems = [
        { id: 'thoughts', label: 'Thoughts', icon: Brain },
        { id: 'journals', label: 'Journals', icon: BookOpen },
        { id: 'planning', label: 'Planning', icon: Calendar },
    ]

    const features = [
        {
            icon: Brain,
            title: 'Quick Thoughts',
            description: 'Capture fleeting ideas instantly. Never lose a brilliant thought again with our lightning-fast thought capture system.',
            color: 'text-purple-600'
        },
        {
            icon: BookOpen,
            title: 'Digital Journaling',
            description: 'Reflect and grow with structured journaling. Organize entries by date, mood, or topic for deeper self-awareness.',
            color: 'text-blue-600'
        },
        {
            icon: Calendar,
            title: 'Smart Planning',
            description: 'Organize your life with intelligent task management. Set priorities, track progress, and achieve your goals systematically.',
            color: 'text-green-600'
        }
    ]

    const benefits = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Built for speed and efficiency. Get your ideas down in seconds, not minutes.'
        },
        {
            icon: Shield,
            title: 'Privacy First',
            description: 'Your thoughts are yours. All data is encrypted and stored securely with enterprise-grade security.'
        },
        {
            icon: Sparkles,
            title: 'Beautiful Design',
            description: 'Enjoy a clean, modern interface that makes organizing your life a pleasure, not a chore.'
        },
        {
            icon: Users,
            title: 'Open Source',
            description: 'Built by the community, for the community. Transparent, customizable, and always improving.'
        }
    ]

    // Landing Page Component
    const LandingPage = () => (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Your Personal Productivity Suite
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Welcome to{' '}
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Aurora
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            A unified personal space for thought, journaling, and planning — where each mode feels like its own app,
                            yet everything stays connected.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                            onClick={() => setCurrentView('app')}
                        >
                            <Play className="w-5 h-5 mr-2" />
                            Launch Aurora
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3"
                            onClick={() => window.open('https://github.com/jedi-knights/aurora', '_blank')}
                        >
                            <Github className="w-5 h-5 mr-2" />
                            View on GitHub
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Three Powerful Modes
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Aurora adapts to your workflow with three distinct but connected experiences
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 ${feature.color}`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Aurora?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Built with modern technology and user experience in mind
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600 text-sm">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Getting Started Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Aurora is designed to be simple yet powerful. Click the button below to start organizing your thoughts,
                        journaling your experiences, and planning your future.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-8 mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-left">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Launch Aurora</h4>
                                    <p className="text-sm text-gray-600">Click "Launch Aurora" to access the application</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Choose Your Mode</h4>
                                    <p className="text-sm text-gray-600">Select Thoughts, Journals, or Planning to get started</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Start Creating</h4>
                                    <p className="text-sm text-gray-600">Begin capturing your ideas and organizing your life</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                        onClick={() => setCurrentView('app')}
                    >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Launch Aurora Now
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-4">Aurora</h3>
                    <p className="text-gray-400 mb-6">Your personal productivity suite for thoughts, journaling, and planning</p>
                    <div className="flex justify-center space-x-6">
                        <button
                            onClick={() => window.open('https://github.com/jedi-knights/aurora', '_blank')}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <Github className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <p className="text-gray-400 text-sm">
                            Built with ❤️ by the Aurora team • Open Source • MIT License
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )

    // App View Component
    const AppView = () => (
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
                            <Button
                                variant="ghost"
                                className="text-white hover:bg-purple-700 ml-4"
                                onClick={() => setCurrentView('landing')}
                            >
                                ← Back to Landing
                            </Button>
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

    return currentView === 'landing' ? <LandingPage /> : <AppView />
}
