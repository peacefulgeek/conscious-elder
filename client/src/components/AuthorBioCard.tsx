export default function AuthorBioCard() {
  return (
    <div className="author-bio-card">
      <img
        src="https://conscious-elder.b-cdn.net/images/kalesh-photo.webp"
        alt="Kalesh, author of The Conscious Elder"
        className="author-bio-card__photo"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          // Fallback if photo not yet uploaded to Bunny CDN
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <div>
        <p className="author-bio-card__name">About Kalesh</p>
        <p className="author-bio-card__text">
          Kalesh is a consciousness teacher and writer who has spent decades exploring what it means to age with awareness, purpose, and depth. He writes from direct experience, not theory. His work sits at the intersection of elder wisdom, contemplative practice, and honest inquiry into the second half of life.
        </p>
        <p className="author-bio-card__text" style={{ marginTop: '0.5rem' }}>
          He writes more about consciousness and inner work at{' '}
          <a href="https://kalesh.love" target="_blank" rel="noopener" className="author-bio-card__link">
            kalesh.love
          </a>.
        </p>
      </div>
    </div>
  );
}
