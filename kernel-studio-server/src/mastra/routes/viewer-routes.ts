import { registerApiRoute } from '@mastra/core/server';

const viewerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artifact Viewer</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; }

    .layout { display: grid; grid-template-columns: 320px 1fr; height: 100vh; }

    /* Sidebar */
    .sidebar { background: #1e293b; border-right: 1px solid #334155; overflow-y: auto; display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px; border-bottom: 1px solid #334155; }
    .sidebar-header h1 { font-size: 18px; color: #f8fafc; margin-bottom: 8px; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }
    .filter-btn { background: #334155; border: none; color: #94a3b8; padding: 4px 10px; border-radius: 12px; font-size: 12px; cursor: pointer; transition: all 0.15s; }
    .filter-btn:hover, .filter-btn.active { background: #3b82f6; color: #fff; }

    .artifact-list { flex: 1; overflow-y: auto; padding: 8px; }
    .artifact-card { padding: 12px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; transition: background 0.15s; }
    .artifact-card:hover { background: #334155; }
    .artifact-card.selected { background: #1e3a5f; border-left: 3px solid #3b82f6; }
    .artifact-card .title { font-size: 14px; font-weight: 500; color: #f1f5f9; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .artifact-card .meta { font-size: 11px; color: #64748b; display: flex; gap: 8px; align-items: center; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .badge-diagram { background: #1e3a5f; color: #60a5fa; }
    .badge-report { background: #1a3329; color: #4ade80; }
    .badge-matrix { background: #3b2a1a; color: #fb923c; }
    .badge-deck { background: #2d1b4e; color: #c084fc; }
    .badge-comparison { background: #3b1a2e; color: #f472b6; }
    .badge-dashboard { background: #1a3333; color: #2dd4bf; }

    /* Main content */
    .main { display: flex; flex-direction: column; overflow: hidden; }

    .toolbar { padding: 12px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; min-height: 52px; }
    .toolbar .artifact-title { font-size: 16px; font-weight: 600; color: #f8fafc; }
    .toolbar-actions { display: flex; gap: 8px; }
    .toolbar-btn { background: #334155; border: none; color: #94a3b8; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.15s; }
    .toolbar-btn:hover { background: #475569; color: #f1f5f9; }
    .toolbar-btn.primary { background: #3b82f6; color: #fff; }
    .toolbar-btn.primary:hover { background: #2563eb; }

    .content-area { flex: 1; overflow: auto; padding: 24px; display: flex; flex-direction: column; align-items: center; }
    .content-area .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; }
    .content-area .empty h2 { font-size: 20px; margin-bottom: 8px; color: #94a3b8; }

    /* Render containers */
    .mermaid-container { background: #fff; border-radius: 12px; padding: 32px; width: 100%; max-width: 1200px; }
    .mermaid-container svg { max-width: 100%; height: auto; }
    .markdown-container { background: #1e293b; border-radius: 12px; padding: 32px; width: 100%; max-width: 900px; color: #e2e8f0; line-height: 1.7; }
    .markdown-container h1, .markdown-container h2, .markdown-container h3 { color: #f8fafc; margin: 24px 0 12px; }
    .markdown-container h1 { font-size: 28px; border-bottom: 1px solid #334155; padding-bottom: 12px; }
    .markdown-container h2 { font-size: 22px; }
    .markdown-container p { margin-bottom: 12px; }
    .markdown-container ul, .markdown-container ol { margin: 12px 0; padding-left: 24px; }
    .markdown-container li { margin-bottom: 6px; }
    .markdown-container blockquote { border-left: 3px solid #3b82f6; padding-left: 16px; margin: 16px 0; color: #94a3b8; font-style: italic; }
    .markdown-container code { background: #334155; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .markdown-container pre { background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; }
    .markdown-container table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .markdown-container th, .markdown-container td { border: 1px solid #334155; padding: 8px 12px; text-align: left; }
    .markdown-container th { background: #334155; color: #f1f5f9; }

    .matrix-container { width: 100%; max-width: 1200px; overflow-x: auto; }
    .matrix-container table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; }
    .matrix-container th { background: #334155; color: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 13px; }
    .matrix-container td { padding: 10px 14px; border-bottom: 1px solid #334155; font-size: 13px; }

    /* Rationale panel */
    .rationale-panel { background: #1e293b; border-top: 1px solid #334155; padding: 16px 24px; max-height: 180px; overflow-y: auto; }
    .rationale-panel h3 { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .rationale-panel p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
    .rationale-panel .meta-info { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #64748b; }

    /* Slide deck */
    .deck-container { width: 100%; max-width: 960px; }
    .slide { background: #1e293b; border-radius: 12px; padding: 40px; margin-bottom: 24px; min-height: 300px; }
    .slide h2 { color: #f8fafc; font-size: 24px; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; }
    .slide-content { color: #e2e8f0; line-height: 1.7; }

    /* Refresh indicator */
    .refresh-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px; }
    .refresh-dot.stale { background: #ef4444; }
  </style>
</head>
<body>
  <div class="layout">
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>Artifact Viewer</h1>
        <div class="filters">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="diagram">Diagrams</button>
          <button class="filter-btn" data-filter="report">Reports</button>
          <button class="filter-btn" data-filter="matrix">Matrices</button>
          <button class="filter-btn" data-filter="deck">Decks</button>
        </div>
      </div>
      <div class="artifact-list" id="artifact-list"></div>
    </div>

    <div class="main">
      <div class="toolbar" id="toolbar">
        <span class="artifact-title" id="toolbar-title">Select an artifact</span>
        <div class="toolbar-actions" id="toolbar-actions" style="display:none">
          <button class="toolbar-btn" id="btn-export-svg" title="Export as SVG">SVG</button>
          <button class="toolbar-btn" id="btn-export-png" title="Export as PNG">PNG</button>
          <button class="toolbar-btn" id="btn-refresh">Refresh</button>
        </div>
      </div>

      <div class="content-area" id="content-area">
        <div class="empty">
          <h2>No artifact selected</h2>
          <p>Choose an artifact from the sidebar to view it</p>
        </div>
      </div>

      <div class="rationale-panel" id="rationale-panel" style="display:none">
        <h3>Design Rationale</h3>
        <p id="rationale-text"></p>
        <div class="meta-info" id="rationale-meta"></div>
      </div>
    </div>
  </div>

  <script>
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

    let artifacts = [];
    let currentArtifact = null;
    let currentFilter = 'all';

    async function loadArtifacts() {
      const res = await fetch('/artifacts');
      const data = await res.json();
      artifacts = data.artifacts || [];
      renderList();
    }

    function renderList() {
      const list = document.getElementById('artifact-list');
      const filtered = currentFilter === 'all'
        ? artifacts
        : artifacts.filter(a => a.artifactType === currentFilter);

      list.innerHTML = filtered.map(a => {
        const badgeClass = 'badge-' + a.artifactType;
        const selected = currentArtifact && currentArtifact.id === a.id ? 'selected' : '';
        const date = a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '';
        return '<div class="artifact-card ' + selected + '" data-id="' + a.id + '">' +
          '<div class="title">' + escapeHtml(a.title) + '</div>' +
          '<div class="meta">' +
            '<span class="badge ' + badgeClass + '">' + a.artifactType + '</span>' +
            '<span>' + a.format + '</span>' +
            (a.stakeholderLens ? '<span>' + a.stakeholderLens.replace('_', ' ') + '</span>' : '') +
            '<span>v' + a.version + '</span>' +
            '<span>' + date + '</span>' +
          '</div>' +
        '</div>';
      }).join('');

      list.querySelectorAll('.artifact-card').forEach(card => {
        card.addEventListener('click', () => selectArtifact(card.dataset.id));
      });
    }

    async function selectArtifact(id) {
      const res = await fetch('/artifacts/' + id);
      currentArtifact = await res.json();
      renderList();
      renderArtifact();
    }

    async function renderArtifact() {
      const area = document.getElementById('content-area');
      const title = document.getElementById('toolbar-title');
      const actions = document.getElementById('toolbar-actions');
      const panel = document.getElementById('rationale-panel');

      if (!currentArtifact) {
        area.innerHTML = '<div class="empty"><h2>No artifact selected</h2></div>';
        actions.style.display = 'none';
        panel.style.display = 'none';
        return;
      }

      title.textContent = currentArtifact.title;
      actions.style.display = 'flex';

      // Show/hide export buttons based on format
      document.getElementById('btn-export-svg').style.display =
        currentArtifact.format === 'mermaid' ? 'block' : 'none';
      document.getElementById('btn-export-png').style.display =
        currentArtifact.format === 'mermaid' ? 'block' : 'none';

      if (currentArtifact.format === 'mermaid') {
        area.innerHTML = '<div class="mermaid-container" id="mermaid-output"></div>';
        try {
          const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), currentArtifact.content);
          document.getElementById('mermaid-output').innerHTML = svg;
        } catch (err) {
          area.innerHTML = '<div class="empty"><h2>Render Error</h2><p>' + escapeHtml(err.message) + '</p><pre style="color:#94a3b8;margin-top:16px;text-align:left;max-width:800px;overflow:auto">' + escapeHtml(currentArtifact.content) + '</pre></div>';
        }
      } else if (currentArtifact.format === 'markdown') {
        if (currentArtifact.artifactType === 'deck') {
          const slides = currentArtifact.content.split('---').filter(s => s.trim());
          area.innerHTML = '<div class="deck-container">' +
            slides.map(s => '<div class="slide"><div class="slide-content">' + marked.parse(s) + '</div></div>').join('') +
            '</div>';
        } else {
          area.innerHTML = '<div class="markdown-container">' + marked.parse(currentArtifact.content) + '</div>';
        }
      } else if (currentArtifact.format === 'json') {
        try {
          const data = JSON.parse(currentArtifact.content);
          if (data.columns && data.rows) {
            let html = '<div class="matrix-container"><table><thead><tr>';
            data.columns.forEach(col => { html += '<th>' + escapeHtml(col.label) + '</th>'; });
            html += '</tr></thead><tbody>';
            data.rows.forEach(row => {
              html += '<tr>';
              data.columns.forEach(col => {
                const val = row[col.key];
                const display = Array.isArray(val) ? val.join(', ') : (val ?? '');
                html += '<td>' + escapeHtml(String(display)) + '</td>';
              });
              html += '</tr>';
            });
            html += '</tbody></table></div>';
            area.innerHTML = html;
          } else {
            area.innerHTML = '<div class="markdown-container"><pre>' + escapeHtml(JSON.stringify(data, null, 2)) + '</pre></div>';
          }
        } catch {
          area.innerHTML = '<div class="markdown-container"><pre>' + escapeHtml(currentArtifact.content) + '</pre></div>';
        }
      } else {
        area.innerHTML = '<div class="markdown-container">' + currentArtifact.content + '</div>';
      }

      // Rationale panel
      if (currentArtifact.designRationale) {
        panel.style.display = 'block';
        document.getElementById('rationale-text').textContent = currentArtifact.designRationale;
        const meta = [];
        if (currentArtifact.sourceBriefType) meta.push('Brief: ' + currentArtifact.sourceBriefType);
        if (currentArtifact.stakeholderLens) meta.push('Lens: ' + currentArtifact.stakeholderLens.replace('_', ' '));
        meta.push('Version: ' + currentArtifact.version);
        if (currentArtifact.createdAt) meta.push('Created: ' + new Date(currentArtifact.createdAt).toLocaleString());
        document.getElementById('rationale-meta').innerHTML = meta.map(m => '<span>' + m + '</span>').join('');
      } else {
        panel.style.display = 'none';
      }
    }

    // Export handlers
    document.getElementById('btn-export-svg').addEventListener('click', () => {
      const svg = document.querySelector('.mermaid-container svg');
      if (!svg) return;
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (currentArtifact?.title || 'diagram') + '.svg';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-export-png').addEventListener('click', async () => {
      const svg = document.querySelector('.mermaid-container svg');
      if (!svg) return;
      const canvas = document.createElement('canvas');
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const img = new Image();
      const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = (currentArtifact?.title || 'diagram') + '.png';
        a.click();
      };
      img.src = url;
    });

    document.getElementById('btn-refresh').addEventListener('click', () => {
      loadArtifacts().then(() => {
        if (currentArtifact) selectArtifact(currentArtifact.id);
      });
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderList();
      });
    });

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Auto-refresh every 10 seconds
    setInterval(() => loadArtifacts(), 10000);

    // Initial load
    loadArtifacts();
  </script>
</body>
</html>`;

export const viewerRoutes = [
  registerApiRoute('/viewer', {
    method: 'GET',
    handler: async (c) => {
      return c.html(viewerHtml);
    },
  }),
];
