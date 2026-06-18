import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComments = useCallback(() => {
    api.getComments(postId).then(setComments).catch(console.error)
  }, [postId])

  useEffect(() => { loadComments() }, [loadComments])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await api.addComment(postId, {
        author: author.trim() || '匿名',
        content: content.trim(),
      })
      setContent('')
      setAuthor('')
      loadComments()
    } catch (err) {
      alert('评论失败: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="comment-section">
      <h3 className="comment-title">💬 评论 ({comments.length})</h3>

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="comment-input"
          placeholder="你的昵称（可选）"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={30}
        />
        <textarea
          className="comment-textarea"
          placeholder="写下你的想法..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={submitting || !content.trim()}>
          {submitting ? '提交中...' : '发表评论'}
        </button>
      </form>

      <div className="comment-list">
        {comments.length === 0 && (
          <p className="comment-empty">还没有评论，来说两句吧～</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{c.author}</span>
              <span className="comment-time">
                {new Date(c.created_at).toLocaleString('zh-CN')}
              </span>
            </div>
            <p className="comment-content">{c.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
