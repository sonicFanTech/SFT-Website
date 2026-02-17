document.getElementById("year").textContent = new Date().getFullYear();

    function fakeLink(e){
      e.preventDefault();
      alert("Replace this with your real link when you're ready!");
      return false;
    }

    // Copy code snippet button
    const copyBtn = document.getElementById("copyBtn");
    const codeBlock = document.getElementById("codeBlock");
    copyBtn?.addEventListener("click", async () => {
      try{
        await navigator.clipboard.writeText(codeBlock.innerText);
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy", 1200);
      }catch(err){
        alert("Copy failed. Your browser may block clipboard access here.");
      }
    });
