# Aurora

A unified personal space for thought, journaling, and planning — where each mode feels like its own app, yet everything stays connected.

## Features

Aurora is a modern web application that helps you organize your life in three distinct yet connected sections:

### 💭 Quick Thoughts
- Capture fleeting ideas and thoughts instantly
- Simple, distraction-free interface
- Automatic timestamping
- Quick keyboard shortcuts (Ctrl+Enter to save)

### 📔 Journals
- Create multiple journals for different aspects of your life
- Each journal maintains its own collection of entries
- Sidebar navigation for easy switching between journals
- Full journal management (create, delete journals and entries)

### 📅 Planning & Calendar
- Daily, weekly, and monthly views
- Create tasks and events
- Check off completed items
- Visual date navigation
- Color-coded task types (To-Do vs Events)

## Technology Stack

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with gradients and animations
- **LocalStorage** - Client-side data persistence

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jedi-knights/aurora.git
cd aurora
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Features in Detail

### Data Persistence
All your data is stored locally in your browser using LocalStorage. Your thoughts, journals, and plans persist across sessions.

### Keyboard Shortcuts
- **Thoughts & Journals**: Press `Ctrl+Enter` to quickly save your entry
- Navigate between sections using the top navigation bar

### Responsive Design
Each section has its own unique color scheme and feel:
- **Thoughts**: Warm peach gradient
- **Journals**: Cool mint-to-pink gradient  
- **Planning**: Calm blue-grey gradient

## Project Structure

```
aurora/
├── src/
│   ├── components/
│   │   ├── Thoughts.tsx       # Quick thoughts component
│   │   ├── Thoughts.css
│   │   ├── Journals.tsx       # Multi-journal component
│   │   ├── Journals.css
│   │   ├── Planning.tsx       # Calendar & planning component
│   │   └── Planning.css
│   ├── App.tsx                # Main app with navigation
│   ├── App.css
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## License

ISC
