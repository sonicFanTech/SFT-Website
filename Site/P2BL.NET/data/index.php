<?php
// Custom directory index.
// Put this file in any directory on a PHP-enabled web server.
// It automatically lists the files and folders in the directory being viewed.

function h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function formatBytes(int $bytes): string {
    if ($bytes < 1024) return $bytes . ' B';
    $units = ['KB', 'MB', 'GB', 'TB'];
    $size = (float)$bytes;
    $unit = -1;
    do {
        $size /= 1024;
        $unit++;
    } while ($size >= 1024 && $unit < count($units) - 1);

    return rtrim(rtrim(number_format($size, $size >= 10 ? 0 : 1), '0'), '.') . ' ' . $units[$unit];
}

function relativePath(string $path): string {
    $path = str_replace('\\', '/', $path);
    $parts = [];
    foreach (explode('/', $path) as $part) {
        if ($part === '' || $part === '.') continue;
        if ($part === '..') {
            array_pop($parts);
        } else {
            $parts[] = $part;
        }
    }
    return implode('/', $parts);
}

// ?path= lets this one PHP file browse subfolders without requiring another index file.
$requestedPath = isset($_GET['path']) && is_string($_GET['path']) ? $_GET['path'] : '';
$relative = relativePath(rawurldecode($requestedPath));
$root = __DIR__;
$currentDir = $root . ($relative !== '' ? DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative) : '');

// Keep browsing locked inside the directory containing this script.
$realRoot = realpath($root);
$realCurrent = realpath($currentDir);
if ($realRoot === false || $realCurrent === false || !is_dir($realCurrent) ||
    ($realCurrent !== $realRoot && !str_starts_with($realCurrent, $realRoot . DIRECTORY_SEPARATOR))) {
    http_response_code(404);
    echo 'Directory not found.';
    exit;
}

$items = [];
$scan = scandir($realCurrent);
if ($scan !== false) {
    foreach ($scan as $name) {
        if ($name === '.' || $name === '..') continue;

        $fullPath = $realCurrent . DIRECTORY_SEPARATOR . $name;
        $isDirectory = is_dir($fullPath);
        $itemRelative = $relative === '' ? $name : $relative . '/' . $name;

        $items[] = [
            'name' => $name,
            'type' => $isDirectory ? 'folder' : 'file',
            'href' => $isDirectory
                ? '?path=' . rawurlencode($itemRelative)
                : str_replace('%2F', '/', str_replace('%5C', '/', rawurlencode($itemRelative))),
            'size' => $isDirectory ? null : (int) @filesize($fullPath),
            'modified' => @filemtime($fullPath) ?: null,
        ];
    }
}

// Directories first, then files; case-insensitive natural name order.
usort($items, function (array $a, array $b): int {
    if ($a['type'] !== $b['type']) return $a['type'] === 'folder' ? -1 : 1;
    return strnatcasecmp($a['name'], $b['name']);
});

$currentLabel = $relative === '' ? '/' : '/' . $relative;
$parentHref = null;
if ($relative !== '') {
    $parent = dirname($relative);
    if ($parent === '.') $parent = '';
    $parentHref = $parent === '' ? './' : '?path=' . rawurlencode($parent);
}

$baseUrl = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
$selfUrl = $baseUrl !== false && $baseUrl !== '' ? $baseUrl : basename(__FILE__);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= h($currentLabel) ?> — Directory Index</title>
  <meta name="description" content="Custom directory index for files and folders.">
  <style>
    :root {
      color-scheme: dark light;
      --bg: #0f1115;
      --panel: #171a21;
      --panel-2: #1d212b;
      --border: #2b3140;
      --text: #edf1f7;
      --muted: #98a2b3;
      --accent: #6ea8fe;
      --hover: rgba(255,255,255,.045);
      --shadow: 0 14px 40px rgba(0,0,0,.25);
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f4f6f9;
        --panel: #ffffff;
        --panel-2: #f7f8fa;
        --border: #dce1e8;
        --text: #17202e;
        --muted: #667085;
        --accent: #2f6fed;
        --hover: rgba(23,32,46,.035);
        --shadow: 0 14px 40px rgba(27,41,66,.10);
      }
    }

    * { box-sizing: border-box; }
    html { min-height: 100%; }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at top, rgba(110,168,254,.07), transparent 34%), var(--bg);
      color: var(--text);
      font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    a { color: inherit; text-decoration: none; }

    .shell {
      width: min(1120px, calc(100% - 32px));
      margin: 32px auto 48px;
    }

    .title-wrap { min-width: 0; }
    .title {
      margin: 0;
      font-size: clamp(22px, 3vw, 30px);
      letter-spacing: -.02em;
    }
    .subtitle { color: var(--muted); margin-top: 4px; word-break: break-all; }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 18px 0 14px;
    }

    .search {
      flex: 1 1 260px;
      min-width: 220px;
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 11px;
      padding: 11px 13px;
      outline: none;
      box-shadow: var(--shadow);
    }
    .search:focus { border-color: var(--accent); }

    .button {
      appearance: none;
      border: 1px solid var(--border);
      background: var(--panel);
      color: var(--text);
      border-radius: 11px;
      padding: 10px 13px;
      cursor: pointer;
    }
    .button:hover { background: var(--hover); }

    .crumbs {
      display: flex;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
      color: var(--muted);
      margin: 0 0 12px;
      word-break: break-all;
    }
    .crumbs a:hover { color: var(--text); }
    .crumb-sep { opacity: .5; }

    .card {
      background: color-mix(in srgb, var(--panel) 92%, transparent);
      border: 1px solid var(--border);
      border-radius: 15px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .thead, .item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 150px 190px;
      align-items: center;
    }
    .thead {
      min-height: 44px;
      padding: 0 16px;
      background: var(--panel-2);
      border-bottom: 1px solid var(--border);
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    .item {
      min-height: 58px;
      padding: 0 16px;
      border-bottom: 1px solid var(--border);
      transition: background .12s ease;
    }
    .item:last-child { border-bottom: 0; }
    .item:hover { background: var(--hover); }

    .name-cell {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
    }
    .icon {
      width: 22px;
      height: 22px;
      flex: 0 0 22px;
      display: grid;
      place-items: center;
      color: var(--accent);
    }
    .icon svg { width: 20px; height: 20px; }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 520;
    }
    .meta { color: var(--muted); }
    .right { text-align: right; }

    .empty {
      padding: 44px 20px;
      text-align: center;
      color: var(--muted);
    }

    .footer {
      margin-top: 11px;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 12px;
    }

    @media (max-width: 700px) {
      .shell { width: min(100% - 18px, 1120px); margin-top: 18px; }
      .thead, .item { grid-template-columns: minmax(0, 1fr) 90px; }
      .thead > :last-child, .item > :last-child { display: none; }
      .meta { font-size: 12px; }
      .item { min-height: 54px; padding: 0 12px; }
      .thead { padding: 0 12px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header>
      <div class="title-wrap">
        <h1 class="title">Directory Index</h1>
        <div class="subtitle"><?= h($currentLabel) ?> — files and folders</div>
      </div>
    </header>

    <div class="toolbar">
      <input id="search" class="search" type="search" placeholder="Search files and folders…" autocomplete="off">
      <button id="sortName" class="button" type="button">Sort: Name</button>
      <button id="sortType" class="button" type="button">Sort: Type</button>
      <button id="sortSize" class="button" type="button">Sort: Size</button>
    </div>

    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="<?= h($selfUrl) ?>">Home</a>
      <?php
      if ($relative !== '') {
          $built = '';
          foreach (explode('/', $relative) as $part) {
              if ($part === '') continue;
              echo '<span class="crumb-sep">/</span>';
              $built = $built === '' ? $part : $built . '/' . $part;
              echo '<a href="' . h($selfUrl . '?path=' . rawurlencode($built)) . '">' . h($part) . '</a>';
          }
      }
      ?>
    </nav>

    <section class="card" aria-label="Directory contents">
      <div class="thead">
        <div>Name</div>
        <div>Size</div>
        <div class="right">Modified</div>
      </div>
      <div id="list">
        <?php if ($parentHref !== null): ?>
          <div class="item" data-name=".." data-type="folder" data-size="0">
            <div class="name-cell">
              <span class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m8 12 4-4 4 4M12 8v10"/>
                </svg>
              </span>
              <a class="name" href="<?= h($parentHref) ?>">..</a>
            </div>
            <div class="meta">Folder</div>
            <div class="meta right">—</div>
          </div>
        <?php endif; ?>

        <?php foreach ($items as $item): ?>
          <div class="item"
               data-name="<?= h(mb_strtolower($item['name'])) ?>"
               data-type="<?= h($item['type']) ?>"
               data-size="<?= h((string)($item['size'] ?? 0)) ?>">
            <div class="name-cell">
              <span class="icon">
                <?php if ($item['type'] === 'folder'): ?>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3.5 7.4A1.9 1.9 0 0 1 5.4 5.5h4l1.8 2h7.4a1.9 1.9 0 0 1 1.9 1.9v7.2a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9z"/>
                  </svg>
                <?php else: ?>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M7 3.8h6.4L18.5 9v10.2A1.9 1.9 0 0 1 16.6 21H7a1.9 1.9 0 0 1-1.9-1.9V5.7A1.9 1.9 0 0 1 7 3.8z"/>
                    <path d="M13.2 3.8V9h5.2"/>
                  </svg>
                <?php endif; ?>
              </span>
              <a class="name" href="<?= h($item['href']) ?>"><?= h($item['name']) ?></a>
            </div>
            <div class="meta">
              <?= $item['type'] === 'folder' ? 'Folder' : h(formatBytes((int)$item['size'])) ?>
            </div>
            <div class="meta right">
              <?= $item['modified'] ? h(date('Y-m-d H:i', $item['modified'])) : '—' ?>
            </div>
          </div>
        <?php endforeach; ?>

        <?php if (!$items && $parentHref === null): ?>
          <div class="empty">This directory is empty.</div>
        <?php endif; ?>
      </div>
    </section>

    <footer class="footer">
      <span id="count"><?= count($items) ?> item<?= count($items) === 1 ? '' : 's' ?></span>
      <span>Server-generated directory index</span>
    </footer>
  </main>

  <script>
    const search = document.getElementById('search');
    const list = document.getElementById('list');
    const count = document.getElementById('count');
    const rows = Array.from(list.querySelectorAll('.item'));
    const parentRow = rows.find(row => row.dataset.name === '..');
    const itemRows = rows.filter(row => row !== parentRow);
    let sortMode = 'name';
    let descending = false;

    function render() {
      const query = search.value.trim().toLowerCase();
      let visible = itemRows.filter(row => row.dataset.name.includes(query));

      visible.sort((a, b) => {
        if (sortMode === 'type') {
          const aType = a.dataset.type;
          const bType = b.dataset.type;
          return aType.localeCompare(bType) || a.dataset.name.localeCompare(b.dataset.name, undefined, { numeric: true });
        }
        if (sortMode === 'size') {
          return Number(a.dataset.size) - Number(b.dataset.size) || a.dataset.name.localeCompare(b.dataset.name, undefined, { numeric: true });
        }
        return a.dataset.name.localeCompare(b.dataset.name, undefined, { numeric: true });
      });

      if (descending) visible.reverse();
      itemRows.forEach(row => row.remove());
      visible.forEach(row => list.appendChild(row));

      const empty = list.querySelector('.search-empty');
      if (empty) empty.remove();
      if (!visible.length) {
        const message = document.createElement('div');
        message.className = 'empty search-empty';
        message.textContent = 'No matching items.';
        list.appendChild(message);
      }

      count.textContent = `${visible.length} item${visible.length === 1 ? '' : 's'}`;
    }

    function setSort(mode) {
      if (sortMode === mode) descending = !descending;
      else { sortMode = mode; descending = false; }

      document.getElementById('sortName').textContent = `Sort: Name${sortMode === 'name' && descending ? ' ↓' : ''}`;
      document.getElementById('sortType').textContent = `Sort: Type${sortMode === 'type' && descending ? ' ↓' : ''}`;
      document.getElementById('sortSize').textContent = `Sort: Size${sortMode === 'size' && descending ? ' ↓' : ''}`;
      render();
    }

    document.getElementById('sortName').addEventListener('click', () => setSort('name'));
    document.getElementById('sortType').addEventListener('click', () => setSort('type'));
    document.getElementById('sortSize').addEventListener('click', () => setSort('size'));
    search.addEventListener('input', render);
  </script>
</body>
</html>
