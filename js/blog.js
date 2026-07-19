// ===========================
// Load blog listing from static JSON
// ===========================
export async function loadBlogPosts(container) {
  if (!container) return;

  try {
    const res = await fetch('./blog-posts.json');
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div class="blog-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <h3>No posts yet</h3>
          <p>I'm still cooking up my first article. Check back soon — or say hi and I'll write about something you're curious about.</p>
        </div>`;
      return;
    }

    container.innerHTML = posts.map((post, i) => {
      const delay = i > 0 ? ` fade-in-delay-${Math.min(i, 3)}` : '';
      const tags = post.tags || [];
      const tagHtml = tags.length > 0
        ? tags.map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')
        : '';

      const date = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const readTime = post.read_time || 5;

      return `
        <article class="blog-card fade-in${delay}">
          <div class="blog-card-meta">
            ${tagHtml}
            <time datetime="${post.created_at}">${date}</time>
            <span class="blog-card-read">· ${readTime} min read</span>
          </div>
          <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt || '')}</p>
          <a href="${escapeHtml(post.path)}" class="blog-card-link">
            Read article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        </article>`;
    }).join('');
  } catch (err) {
    console.error('Error loading posts:', err);
    container.innerHTML = `
      <div class="blog-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        <h3>Couldn't load posts</h3>
        <p>Something went wrong. Try again later.</p>
      </div>`;
  }
}

// ===========================
// Helpers
// ===========================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}