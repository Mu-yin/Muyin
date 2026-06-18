import Giscus from '@giscus/react'
import { useTheme } from '../App'

// GitHub Discussions 评论组件
// 用户必须登录 GitHub 才能评论，评论数据存储在仓库 Discussions 中
export default function GiscusComment({ postTitle }) {
  const { theme } = useTheme()

  return (
    <section className="comment-section">
      <h3 className="comment-title">💬 评论</h3>
      <p className="giscus-hint">使用 GitHub 账号登录后即可评论</p>
      <Giscus
        repo="Mu-yin/Muyin"
        repoId="R_kgDOS-Vedg"
        category="General"
        categoryId="DIC_kwDOS-Veds4C_auY"
        mapping="specific"
        term={`Post: ${postTitle}`}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark' : 'light'}
        lang="zh-CN"
        loading="lazy"
      />
    </section>
  )
}
