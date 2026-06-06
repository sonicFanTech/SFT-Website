(function () {
  const header = document.querySelector("[data-aero-header]");
  const menuButton = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (header && menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      const isOpen = header.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  function relativeTimeFromDate(dateString) {
    if (!dateString || dateString === "NA") {
      return "N/A";
    }

    const date = new Date(dateString + "T00:00:00");
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    const now = new Date();
    const days = Math.floor((now - date) / 86400000);

    if (days <= 0) {
      return "today";
    }

    if (days === 1) {
      return "yesterday";
    }

    if (days < 7) {
      return days + " days ago";
    }

    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return weeks + " week" + (weeks === 1 ? "" : "s") + " ago";
    }

    if (days < 365) {
      const months = Math.floor(days / 30);
      return months + " month" + (months === 1 ? "" : "s") + " ago";
    }

    const years = Math.floor(days / 365);
    return years + " year" + (years === 1 ? "" : "s") + " ago";
  }

  document.querySelectorAll(".rel-time").forEach(function (element) {
    const dateString = (element.dataset.date || "").trim();
    const relative = relativeTimeFromDate(dateString);
    element.textContent = dateString && dateString !== "NA" ? relative + " (" + dateString + ")" : relative;
    element.title = dateString;
  });
})();
