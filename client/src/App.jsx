import { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import PostList from './components/PostList'
import PostDetail from './components/PostDetail'
import About from './components/About'
import AdminPanel from './components/AdminPanel'
import Footer from './components/Footer'

// --- Theme Context ---
const ThemeContext = createContext()
export function useTheme() { return useContext(ThemeContext) }

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    window.toggleTheme = toggleTheme
    return () => { delete window.toggleTheme }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  )
}
