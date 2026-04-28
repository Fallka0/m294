import Link from 'next/link'

export default function Footer() {
  return (
    <footer id="footer" className="site-footer">
      <div className="footer-content">
        <span className="copyright">
          &copy; {new Date().getFullYear()} Tournament. Built by{' '}
          <a href="https://planary.ch" target="_blank" rel="noreferrer">
            Planary
          </a>
          .
        </span>

        <div className="footer-socials">
          <a href="https://github.com/Fallka0/Tournamount" target="_blank" rel="noreferrer" className="social-link">
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" />
          </a>
        </div>

        <div className="footer-links">
          <Link href="/">Top</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/impressum">Impressum</Link>
        </div>
      </div>
    </footer>
  )
}
