import { useState, useEffect } from 'react'
import { api } from '../api'
import FileUpload from './FileUpload'

export default function AdminPanel() {
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadPosts = () => {
    api.getPosts().then(setPosts).catch(console.error)
  }

  useEffect(() => { loadPosts() }, [])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setTags('')
    setImageUrl('')
    setEditingId(null)
  }

  const handleEdit = (post) => {
    setTitle(post.title)
    setContent(post.content)
    setTags(post.tags)
    setImageUrl(post.image_url)
    setEditingId(post.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    try {
      const data = { title: title.trim(), content: content.trim(), tags: tags.trim(), image_url: imageUrl.trim() }
      if (editingId) {
        await api.updatePost(editingId, data)
      } else {
        await api.createPost(data)
      }
      resetForm()
      loadPosts()
    } catch (err) {
      alert('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这篇文章吗？')) return
    try {
      await api.deletePost(id)
      loadPosts()
      if (editingId === id) resetForm()
    } catch (err) {
      alert('删除失败: ' + err.message)
    }
  }

  return (
    <div className="admin-panel">
      <h1 className="page-title">{editingId ? '编辑文章' : '撰写新文章'}</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>标题</label>
          <input
            type="text"
            className="form-input"
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            type="text"
            className="form-input"
            placeholder="例如: 技术, 生活, 前端"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>封面图片</label>
          <FileUpload
            accept="image/*"
            onUpload={(url) => setImageUrl(url)}
          />
          {imageUrl && (
            <div className="image-url-display">
              <input
                type="text"
                className="form-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="图片URL"
              />
              {imageUrl && <img src={imageUrl} alt="封面预览" className="cover-preview" />}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>内容（支持 Markdown）</label>
          <textarea
            className="form-textarea"
            placeholder="在这里写文章内容...&#10;&#10;支持 Markdown 语法：&#10;# 一级标题&#10;## 二级标题&#10;**粗体** *斜体*&#10;[链接](url)&#10;![图片](url)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '保存中...' : editingId ? '更新文章' : '发布文章'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              取消编辑
            </button>
          )}
        </div>
      </form>

      <hr className="admin-divider" />

      <h2 className="admin-subtitle">已发布文章 ({posts.length})</h2>
      <div className="admin-post-list">
        {posts.map((post) => (
          <div key={post.id} className="admin-post-item">
            <div className="admin-post-info">
              <strong>{post.title}</strong>
              <span className="admin-post-date">
                {new Date(post.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div className="admin-post-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(post)}>
                编辑
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id)}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
