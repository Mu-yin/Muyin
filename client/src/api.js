const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Posts
  getPosts: () => request('/posts'),
  getPost: (id) => request(`/posts/${id}`),
  createPost: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id, data) => request(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, data) => request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  // Likes
  getLikes: (postId) => request(`/posts/${postId}/likes`),
  toggleLike: (postId) => request(`/posts/${postId}/likes`, { method: 'POST' }),

  // Bookmarks
  getBookmarks: (postId) => request(`/posts/${postId}/bookmarks`),
  toggleBookmark: (postId) => request(`/posts/${postId}/bookmarks`, { method: 'POST' }),
  getBookmarkedPosts: () => request('/bookmarks'),

  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Upload
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${BASE}/upload`, { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
}
