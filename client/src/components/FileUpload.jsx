import { useState, useRef } from 'react'
import { api } from '../api'

export default function FileUpload({ onUpload, accept = 'image/*' }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    // Show preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
    setUploading(true)
    try {
      const data = await api.uploadFile(file)
      if (onUpload) onUpload(data.url)
    } catch (err) {
      alert('上传失败: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner" />
            <p>上传中...</p>
          </div>
        ) : preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📁</span>
            <p>拖拽文件到此处或点击上传</p>
            <p className="upload-hint">支持图片、文档等文件</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}
