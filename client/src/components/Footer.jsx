export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-branding">
          <h3>🌸 Muyinの博客</h3>
          <p>记录技术思考与生活感悟</p>
        </div>
        <div className="footer-nav">
          <h4>导航</h4>
          <a href="/">首页</a>
          <a href="/#posts">文章</a>
          <a href="/about">关于</a>
          <a href="/admin">撰写</a>
        </div>
        <div className="footer-social">
          <h4>联系</h4>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
            RSS 订阅
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Muyinの博客 · Powered by React + Express · Deployed with ❤️</p>
      </div>
    </footer>
  )
}
