(function () {
  function byId(id) { return document.getElementById(id); }

  window.renderBuildHistory = function renderBuildHistory() {
    if (!window.NFE_BUILDS || !byId('build-history-output')) return;

    const params = new URLSearchParams(window.location.search);
    const qVersion = (params.get('version') || params.get('Version') || '').toLowerCase();
    const qRelease = (params.get('release') || params.get('Release') || '').toLowerCase();
    const qTag = (params.get('tag') || params.get('Tag') || '').toLowerCase();

    let builds = window.NFE_BUILDS.slice();
    if (qVersion || qRelease || qTag) {
      builds = builds.filter(function (b) {
        const versionOk = !qVersion || b.version.toLowerCase() === qVersion;
        const releaseOk = !qRelease || b.release.toLowerCase() === qRelease;
        const tagOk = !qTag || b.tag.toLowerCase() === qTag;
        return versionOk && releaseOk && tagOk;
      });
    }

    const output = byId('build-history-output');
    const title = byId('history-filter-title');
    if (title) {
      if (qVersion || qRelease || qTag) {
        const parts = [];
        if (qVersion) parts.push('Version ' + qVersion);
        if (qRelease) parts.push('Release ' + qRelease);
        if (qTag) parts.push('Tag ' + qTag.toUpperCase());
        title.textContent = 'Filtered build history: ' + parts.join(' / ');
      } else {
        title.textContent = 'All public NFE builds currently listed on this site';
      }
    }

    if (!builds.length) {
      output.innerHTML = '<div class="callout"><strong>No matching build was found.</strong><br>This page supports query parameters such as <span class="code">?version=v2.0&amp;release=R1</span> or <span class="code">?tag=RNR1</span>.</div>';
      return;
    }

    output.innerHTML = builds.map(function (b) {
      const pills = (b.latest ? '<span class="badge">Latest</span>' : '') + '<span class="badge">' + b.channel + '</span>';
      const highlightList = '<ul class="list-tight">' + b.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>';
      return [
        '<div class="box">',
        '  <div class="box-title">' + b.title + '</div>',
        '  <div class="box-body alt">',
        '    <p>' + pills + '</p>',
        '    <div class="kv">',
        '      <div>Published</div><div>' + b.published + '</div>',
        '      <div>Version</div><div>' + b.version + '</div>',
        '      <div>Release</div><div>' + b.release + '</div>',
        '      <div>Release tag</div><div>' + b.tag + '</div>',
        '      <div>Platform</div><div>' + b.platform + '</div>',
        '      <div>Framework</div><div>' + b.framework + '</div>',
        '    </div>',
        '    <p>' + b.summary + '</p>',
        '    <h3 class="section-title">Major highlights</h3>',
        highlightList,
        '    <div class="button-row">',
        '      <a class="win-btn" href="' + b.normalDownload + '">Download normal build</a>',
        '      <a class="win-btn" href="' + b.oneFileDownload + '">Download one-file EXE build</a>',
        '      <a class="win-btn" href="' + b.releaseNotes + '">View release notes</a>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');
  };
})();
