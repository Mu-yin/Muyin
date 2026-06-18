import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { api } from '../api'
import GiscusComment from './GiscusComment'
import LikeButton from './LikeButton'
import BookmarkButton from './BookmarkButton'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPost(Number(id))
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading">🌸 加载中...</div>
  if (!post) return (
    <div className="empty-state">
      <h2>文章不存在</h2>
      <Link to="/">← 返回首页</Link>
    </div>
  )

  return (
    <article className="post-detail">
      <Link to="/" className="back-link">← 返回首页</Link>

      {post.image_url && (
        <div className="post-hero">
          <img src={post.image_url} alt={post.title} />
        </div>
      )}

      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>📅 {new Date(post.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {post.tags && (
            <span className="meta-tags">
              {post.tags.split(',').filter(Boolean).map((tag) => (
                <span key={tag} className="tag">{tag.trim()}</span>
              ))}
            </span>
          )}
        </div>
      </header>

      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="post-actions">
        <LikeButton postId={post.id} />
        <BookmarkButton postId={post.id} />
      </div>

      <GiscusComment postTitle={post.title} />
    </article>
  )
}
