(function () {
  function UnityProgress(unityInstance, progress) {
    if (!unityInstance || !unityInstance.Module) return;

    var style = unityInstance.Module.splashScreenStyle || "Dark";

    if (!unityInstance.logo) {
      unityInstance.logo = document.createElement("div");
      unityInstance.logo.className = "logo " + style;
      unityInstance.container.appendChild(unityInstance.logo);
    }

    if (!unityInstance.progress) {
      unityInstance.progress = document.createElement("div");
      unityInstance.progress.className = "progress " + style;

      unityInstance.progress.empty = document.createElement("div");
      unityInstance.progress.empty.className = "empty";
      unityInstance.progress.appendChild(unityInstance.progress.empty);

      unityInstance.progress.full = document.createElement("div");
      unityInstance.progress.full.className = "full";
      unityInstance.progress.appendChild(unityInstance.progress.full);

      unityInstance.container.appendChild(unityInstance.progress);
    }

    var full = Math.max(0, Math.min(100, 100 * progress));
    unityInstance.progress.full.style.width = full + "%";
    unityInstance.progress.empty.style.width = (100 - full) + "%";

    if (progress >= 1) {
      unityInstance.logo.style.display = "none";
      unityInstance.progress.style.display = "none";
    }
  }

  window.UnityProgress = UnityProgress;
})();
