import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import BookmarkButton from './BookmarkButton'

function relativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 30) return new Date(dateStr).toLocaleDateString('zh-CN')
  if (diffDay >= 1) return `${diffDay} 天前`
  if (diffHour >= 1) return `${diffHour} 小时前`
  if (diffMin >= 1) return `${diffMin} 分钟前`
  return '刚刚'
}

export default function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPosts()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">🌸 加载中...</div>

  return (
    <>
      {/* --- Hero Section --- */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          博客已上线
        </div>
        <h1 className="hero-title">
          欢迎来到<br />
          <span className="hero-title-accent">Muyinの博客</span>
        </h1>
        <p className="hero-desc">
          这里记录着我的技术探索、项目实践与生活思考。
          <br />欢迎阅读、评论和交流。
        </p>
        <div className="hero-actions">
          <a href="#posts" className="btn btn-primary">📝 阅读文章</a>
          <a href="#about" className="btn btn-secondary">👤 关于我</a>
        </div>
      </section>

      {/* --- Post List --- */}
      <section id="posts">
        <div className="post-list-header">
          <h2 className="section-title">
            📝 最新文章
            <span className="post-count">共 {posts.length} 篇</span>
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>还没有文章</h2>
            <p>去<Link to="/admin">撰写</Link>第一篇博客吧！</p>
          </div>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <article key={post.id} className="post-card">
                <div className="post-card-inner">
                  {post.image_url && (
                    <div className="post-card-image">
                      <img src={post.image_url} alt={post.title} loading="lazy" />
                    </div>
                  )}
                  <div className="post-card-body">
                    {post.tags && (
                      <div className="post-card-tags">
                        {post.tags.split(',').filter(Boolean).map((tag) => (
                          <span key={tag} className="tag">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="post-card-title">
                      <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </h2>
                    <p className="post-card-excerpt">
                      {post.content.replace(/[#*`>\[\]!\-_]/g, '').slice(0, 180)}...
                    </p>
                    <div className="post-card-meta">
                      <span>{relativeTime(post.created_at)}</span>
                      <span>❤️ {post.like_count || 0}</span>
                      <span>💬 {post.comment_count || 0}</span>
                      <BookmarkButton postId={post.id} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* --- About Section --- */}
      <section id="about" className="about-section">
        <h2>👤 关于我</h2>
        <p>
          你好！我是一名热爱技术的开发者，喜欢探索新事物，
          记录学习过程中的思考与收获。这个博客用来分享我的学习笔记和技术心得。
        </p>
        <div className="about-topics">
          <span className="about-topic">🌐 Web 前端开发</span>
          <span className="about-topic">⚡ 全栈开发</span>
          <span className="about-topic">🛠️ 工具与效率提升</span>
          <span className="about-topic">📝 技术笔记与教程</span>
        </div>
      </section>
    </>
  )
}
