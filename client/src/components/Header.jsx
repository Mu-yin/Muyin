import { Link } from 'react-router-dom'
import { useTheme } from '../App'
import { useAuth } from '../AuthContext'

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { authenticated, logout } = useAuth()

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">M</span>
          <span className="logo-text">Muyinの博客</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/#posts" className="nav-link">博客</Link>
          <Link to="/about" className="nav-link">关于</Link>

          <Link to="/admin" className="nav-admin">撰写</Link>
          {authenticated && (
            <button onClick={logout} className="nav-link nav-logout" title="退出登录">退出</button>
          )}

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="切换主题"
            title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
