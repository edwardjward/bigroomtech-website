// blog-loader.js
// Reads markdown files from /blogs-data/ and renders them on blogs.html
// Also powers the single post page (post.html?slug=...)

(function() {

  // ── Tiny front-matter parser ──────────────────────────────────────────────
  function parseFrontMatter(text) {
    const match = text.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
    if (!match) return { meta: {}, body: text };
    const meta = {};
    match[1].split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      meta[key] = val;
    });
    return { meta, body: match[2].trim() };
  }

  // ── Tiny markdown → HTML renderer ────────────────────────────────────────
  function mdToHtml(md) {
    return md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .split(/\n\n+/)
      .map(block => {
        if (block.startsWith('<h')) return block;
        return `<p>${block.replace(/\n/g, ' ')}</p>`;
      })
      .join('\n');
  }

  // ── Format date ───────────────────────────────────────────────────────────
  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
    } catch { return dateStr; }
  }

  // ── Slug from filename ────────────────────────────────────────────────────
  function slugFromFilename(filename) {
    return filename.replace(/\.md$/, '');
  }

  // ── Fetch a list of posts from /blogs-data/ ───────────────────────────────
  // Netlify serves the directory and we can fetch individual files
  // We maintain a manifest file (blogs-data/manifest.json) listing all post filenames
  async function fetchManifest() {
    try {
      const res = await fetch('/blogs-data/manifest.json?t=' + Date.now());
      if (!res.ok) return null;
      return await res.json(); // { posts: ["filename.md", ...] }
    } catch { return null; }
  }

  async function fetchPost(filename) {
    const res = await fetch('/blogs-data/' + filename);
    if (!res.ok) return null;
    const text = await res.text();
    return { filename, slug: slugFromFilename(filename), ...parseFrontMatter(text) };
  }

  // ── BLOG LISTING PAGE (blogs.html) ───────────────────────────────────────
  const grid = document.getElementById('blogGrid');
  if (grid) {
    (async () => {
      const manifest = await fetchManifest();

      if (!manifest || !manifest.posts || manifest.posts.length === 0) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:60px 24px;">
            <h3 style="font-family:var(--font-display); margin-bottom:8px;">No posts yet</h3>
            <p style="color:var(--gray-500);">Posts written in the CMS will appear here automatically.</p>
          </div>`;
        return;
      }

      const posts = await Promise.all(manifest.posts.map(fetchPost));
      const valid = posts
        .filter(Boolean)
        .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

      grid.innerHTML = valid.map(post => `
        <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card">
          ${post.meta.coverImage ? `
          <div class="blog-img">
            <img src="${post.meta.coverImage}" alt="${post.meta.title || ''}" loading="lazy" />
          </div>` : `<div class="blog-img" style="background:var(--gray-100);display:flex;align-items:center;justify-content:center;"><span style="color:var(--gray-500);font-size:13px;">No image</span></div>`}
          <div class="blog-body">
            <div class="blog-meta">
              <span class="blog-date">${formatDate(post.meta.date)}</span>
              ${post.meta.category ? `<span class="blog-tag">${post.meta.category}</span>` : ''}
            </div>
            <h2>${post.meta.title || 'Untitled'}</h2>
            <p>${post.meta.excerpt || ''}</p>
          </div>
        </a>
      `).join('');

      // Re-trigger scroll animations
      document.querySelectorAll('.blog-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      });
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.blog-card').forEach(el => obs.observe(el));
    })();
  }

  // ── SINGLE POST PAGE (post.html) ──────────────────────────────────────────
  const postContainer = document.getElementById('postContainer');
  if (postContainer) {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
      postContainer.innerHTML = '<p>Post not found.</p>';
    } else {
      (async () => {
        const post = await fetchPost(slug + '.md');
        if (!post) {
          postContainer.innerHTML = '<p>Post not found.</p>';
          return;
        }
        document.title = (post.meta.title || 'Post') + ' | Big Room Tech';

        const headerEl = document.getElementById('postHeader');
        if (headerEl) {
          headerEl.innerHTML = `
            <div class="blog-meta" style="justify-content:center; margin-bottom:20px;">
              <span class="blog-date">${formatDate(post.meta.date)}</span>
              ${post.meta.category ? `<span class="blog-tag">${post.meta.category}</span>` : ''}
            </div>
            <h1>${post.meta.title || 'Untitled'}</h1>
            ${post.meta.excerpt ? `<p style="color:var(--gray-500); margin-top:16px; font-size:15px;">${post.meta.excerpt}</p>` : ''}
          `;
        }

        const coverEl = document.getElementById('postCover');
        if (coverEl && post.meta.coverImage) {
          coverEl.innerHTML = `<img src="${post.meta.coverImage}" alt="${post.meta.title || ''}" />`;
          coverEl.style.display = 'block';
        } else if (coverEl) {
          coverEl.style.display = 'none';
        }

        postContainer.innerHTML = mdToHtml(post.body);
      })();
    }
  }

})();
