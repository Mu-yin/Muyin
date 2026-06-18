import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

export default function LikeButton({ postId }) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)

  const loadLikes = useCallback(() => {
    api.getLikes(postId).then((data) => {
      setLikes(data.count)
      setLiked(data.liked)
    }).catch(console.error)
  }, [postId])

  useEffect(() => { loadLikes() }, [loadLikes])

  const handleToggle = async () => {
    setAnimating(true)
    try {
      const data = await api.toggleLike(postId)
      setLikes(data.count)
      setLiked(data.liked)
    } catch (err) {
      console.error(err)
    } finally {
      setTimeout(() => setAnimating(false), 400)
    }
  }

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''} ${animating ? 'animating' : ''}`}
      onClick={handleToggle}
      title={liked ? '取消点赞' : '点赞'}
    >
      <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
      <span className="like-count">{likes}</span>
    </button>
  )
}
