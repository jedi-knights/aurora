import { useState } from 'react'
import './App.css'
import Thoughts from './components/Thoughts'
import Journals from './components/Journals'
import Planning from './components/Planning'

type Section = 'thoughts' | 'journals' | 'planning'

function App() {
  const [activeSection, setActiveSection] = useState<Section>('thoughts')

  return (
    <div className="app">
      <nav className="main-nav">
        <div className="nav-brand">Aurora</div>
        <div className="nav-links">
          <button
            className={activeSection === 'thoughts' ? 'active' : ''}
            onClick={() => setActiveSection('thoughts')}
          >
            💭 Thoughts
          </button>
          <button
            className={activeSection === 'journals' ? 'active' : ''}
            onClick={() => setActiveSection('journals')}
          >
            📔 Journals
          </button>
          <button
            className={activeSection === 'planning' ? 'active' : ''}
            onClick={() => setActiveSection('planning')}
          >
            📅 Planning
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        {activeSection === 'thoughts' && <Thoughts />}
        {activeSection === 'journals' && <Journals />}
        {activeSection === 'planning' && <Planning />}
      </main>
    </div>
  )
}

export default App
