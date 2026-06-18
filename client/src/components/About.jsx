import { useState, useEffect } from 'react'
import { api } from '../api'

export default function About() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">🌸 加载中...</div>
  if (!profile) return <div className="empty-state"><h2>暂无个人信息</h2></div>

  const { avatar, name, bio, interests, experience, photos, contact } = profile

  return (
    <div className="about-page">
      {/* --- Profile Header --- */}
      <section className="about-hero">
        <div className="about-avatar-wrap">
          {avatar ? (
            <img src={avatar} alt={name} className="about-avatar" />
          ) : (
            <div className="about-avatar-placeholder">{name?.charAt(0) || 'M'}</div>
          )}
        </div>
        <h1 className="about-name">{name || 'Muyin'}</h1>
        <p className="about-bio">{bio || '这个人很懒，还没写自我介绍...'}</p>
        {contact?.email && (
          <div className="about-contact">
            {contact.github && (
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="contact-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>
                {contact.email}
              </a>
            )}
          </div>
        )}
      </section>

      {/* --- Interests --- */}
      {interests && interests.length > 0 && (
        <section className="about-section">
          <h2 className="about-section-title">❤️ 兴趣爱好</h2>
          <div className="interests-grid">
            {interests.map((item, i) => (
              <span key={i} className="interest-tag">{item}</span>
            ))}
          </div>
        </section>
      )}

      {/* --- Photo Gallery --- */}
      {photos && photos.length > 0 && (
        <section className="about-section">
          <h2 className="about-section-title">📸 照片墙</h2>
          <div className="photo-grid">
            {photos.map((url, i) => (
              <div key={i} className="photo-item">
                <img src={url} alt={`照片 ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Experience Timeline --- */}
      {experience && experience.length > 0 && (
        <section className="about-section">
          <h2 className="about-section-title">📅 个人经历</h2>
          <div className="timeline">
            {experience.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-date">{item.date}</span>
                  <h3 className="timeline-title">{item.title}</h3>
                  {item.desc && <p className="timeline-desc">{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Empty state --- */}
      {(!interests || interests.length === 0) && (!photos || photos.length === 0) && (!experience || experience.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">🏗️</div>
          <h2>更多内容即将上线</h2>
          <p>博主正在完善个人资料...</p>
        </div>
      )}
    </div>
  )
}
