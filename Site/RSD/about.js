// year
    document.getElementById("year").textContent = new Date().getFullYear();

    // simple build label (you can replace this later with a real version string)
    const buildLabel = document.getElementById("buildLabel");
    const now = new Date();
    const pad = (n)=> String(n).padStart(2,"0");
    buildLabel.textContent = "Build: WebDemo " + now.getFullYear() + "." + pad(now.getMonth()+1) + "." + pad(now.getDate());

    // reset demo data (safe: only local storage for this site)
    const resetBtn = document.getElementById("resetBtn");
    const resetStatus = document.getElementById("resetStatus");
    resetBtn.addEventListener("click", () => {
      try{
        localStorage.clear();
        sessionStorage.clear();
        resetStatus.textContent = "Reset complete. Refreshing…";
        setTimeout(() => location.reload(), 650);
      }catch(e){
        resetStatus.textContent = "Reset failed (browser blocked storage). Try a normal refresh.";
      }
    });

    // copy link
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    copyLinkBtn.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(location.href);
        copyLinkBtn.textContent = "Copied!";
        setTimeout(()=> copyLinkBtn.textContent = "Copy Page Link", 1200);
      }catch(e){
        alert("Copy failed. Your browser may block clipboard access here.");
      }
    });
