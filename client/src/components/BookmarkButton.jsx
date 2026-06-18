import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function BookmarkButton({ postId }) {
  const [bookmarks, setBookmarks] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  const load = useCallback(() => {
    api.getBookmarks(postId).then((data) => {
      setBookmarks(data.count)
      setBookmarked(data.bookmarked)
    }).catch(console.error)
  }, [postId])

  useEffect(() => { load() }, [load])

  const handleToggle = async () => {
    try {
      const data = await api.toggleBookmark(postId)
      setBookmarks(data.count)
      setBookmarked(data.bookmarked)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <button
      className={`bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
      onClick={handleToggle}
      title={bookmarked ? '取消收藏' : '收藏文章'}
    >
      <span className="bookmark-icon">{bookmarked ? '⭐' : '☆'}</span>
      <span className="bookmark-count">{bookmarks}</span>
    </button>
  )
}
