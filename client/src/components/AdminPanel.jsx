import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import FileUpload from './FileUpload'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      await login(password.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">🔐 管理员登录</h1>
        <p className="login-desc">请输入密码以管理博客内容</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className="form-input login-input"
            placeholder="请输入管理员密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? '验证中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const { authenticated, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Profile state
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const loadPosts = () => {
    api.getPosts().then(setPosts).catch(console.error)
  }

  const loadProfile = () => {
    api.getProfile().then(p => { setProfile(p); setProfileLoaded(true) }).catch(console.error)
  }

  useEffect(() => { if (authenticated) { loadPosts(); loadProfile() } }, [authenticated])

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
    setTab('posts')
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

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateProfile(profile)
      alert('个人信息已更新！')
    } catch (err) {
      alert('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateProfileField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field) => {
    setProfile(prev => ({ ...prev, [field]: [...(prev[field] || []), field === 'experience' ? { date: '', title: '', desc: '' } : ''] }))
  }

  const removeArrayItem = (field, index) => {
    setProfile(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }))
  }

  const updateArrayItem = (field, index, value) => {
    setProfile(prev => {
      const arr = [...(prev[field] || [])]
      arr[index] = value
      return { ...prev, [field]: arr }
    })
  }

  // 加载中
  if (authLoading) {
    return <div className="loading">加载中...</div>
  }

  // 未登录 → 显示登录框
  if (!authenticated) {
    return <LoginForm />
  }

  // 已登录 → 显示管理面板
  return (
    <div className="admin-panel">
      <h1 className="page-title">管理后台</h1>

      {/* Tab Switcher */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
          📝 文章管理
        </button>
        <button className={`admin-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          👤 个人信息
        </button>
      </div>

      {/* === Posts Tab === */}
      {tab === 'posts' && (
        <>
          <h2 className="admin-subtitle" style={{ marginTop: '1.5rem' }}>{editingId ? '编辑文章' : '撰写新文章'}</h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>标题</label>
              <input type="text" className="form-input" placeholder="文章标题" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>标签（用逗号分隔）</label>
              <input type="text" className="form-input" placeholder="例如: 技术, 生活, 前端" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="form-group">
              <label>封面图片</label>
              <FileUpload accept="image/*" onUpload={(url) => setImageUrl(url)} />
              {imageUrl && (
                <div className="image-url-display">
                  <input type="text" className="form-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="图片URL" />
                  {imageUrl && <img src={imageUrl} alt="封面预览" className="cover-preview" />}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>内容（支持 Markdown）</label>
              <textarea className="form-textarea" placeholder="在这里写文章内容..." value={content} onChange={(e) => setContent(e.target.value)} rows={15} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : editingId ? '更新文章' : '发布文章'}
              </button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>取消编辑</button>}
            </div>
          </form>

          <hr className="admin-divider" />
          <h2 className="admin-subtitle">已发布文章 ({posts.length})</h2>
          <div className="admin-post-list">
            {posts.map((post) => (
              <div key={post.id} className="admin-post-item">
                <div className="admin-post-info">
                  <strong>{post.title}</strong>
                  <span className="admin-post-date">{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="admin-post-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(post)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(post.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* === Profile Tab === */}
      {tab === 'profile' && profileLoaded && (
        <>
          <h2 className="admin-subtitle" style={{ marginTop: '1.5rem' }}>编辑个人信息</h2>
          <form className="admin-form" onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>姓名</label>
              <input type="text" className="form-input" value={profile?.name || ''} onChange={(e) => updateProfileField('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>头像 URL</label>
              <input type="text" className="form-input" value={profile?.avatar || ''} onChange={(e) => updateProfileField('avatar', e.target.value)} placeholder="https://..." />
              {profile?.avatar && <img src={profile.avatar} alt="头像预览" className="cover-preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
            </div>
            <div className="form-group">
              <label>个人简介</label>
              <textarea className="form-textarea" value={profile?.bio || ''} onChange={(e) => updateProfileField('bio', e.target.value)} rows={3} placeholder="写一段自我介绍..." style={{ minHeight: '80px' }} />
            </div>

            {/* Interests */}
            <div className="form-group">
              <label>兴趣爱好</label>
              {(profile?.interests || []).map((item, i) => (
                <div key={i} className="array-item">
                  <input type="text" className="form-input" value={item} onChange={(e) => updateArrayItem('interests', i, e.target.value)} placeholder={`兴趣 ${i + 1}`} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeArrayItem('interests', i)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => addArrayItem('interests')} style={{ marginTop: '0.5rem' }}>+ 添加兴趣</button>
            </div>

            {/* Photos */}
            <div className="form-group">
              <label>照片墙 URL</label>
              {(profile?.photos || []).map((url, i) => (
                <div key={i} className="array-item">
                  <input type="text" className="form-input" value={url} onChange={(e) => updateArrayItem('photos', i, e.target.value)} placeholder={`照片 URL ${i + 1}`} />
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => removeArrayItem('photos', i)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => addArrayItem('photos')} style={{ marginTop: '0.5rem' }}>+ 添加照片</button>
            </div>

            {/* Experience */}
            <div className="form-group">
              <label>个人经历</label>
              {(profile?.experience || []).map((item, i) => (
                <div key={i} className="array-item-block">
                  <div className="array-item-row">
                    <input type="text" className="form-input" value={item.date} onChange={(e) => updateArrayItem('experience', i, { ...item, date: e.target.value })} placeholder="日期 (如: 2024-至今)" style={{ flex: 1 }} />
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeArrayItem('experience', i)}>×</button>
                  </div>
                  <input type="text" className="form-input" value={item.title} onChange={(e) => updateArrayItem('experience', i, { ...item, title: e.target.value })} placeholder="标题 (如: 浙江大学 - 计算机科学)" style={{ marginTop: '0.3rem' }} />
                  <input type="text" className="form-input" value={item.desc || ''} onChange={(e) => updateArrayItem('experience', i, { ...item, desc: e.target.value })} placeholder="描述 (可选)" style={{ marginTop: '0.3rem' }} />
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => addArrayItem('experience')} style={{ marginTop: '0.5rem' }}>+ 添加经历</button>
            </div>

            {/* Contact */}
            <div className="form-group">
              <label>联系方式</label>
              <input type="text" className="form-input" value={profile?.contact?.github || ''} onChange={(e) => updateProfileField('contact', { ...profile?.contact, github: e.target.value })} placeholder="GitHub URL" style={{ marginBottom: '0.5rem' }} />
              <input type="email" className="form-input" value={profile?.contact?.email || ''} onChange={(e) => updateProfileField('contact', { ...profile?.contact, email: e.target.value })} placeholder="Email" />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : '更新个人信息'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
