document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchBar");
    const gameCards = document.querySelectorAll(".game-card");

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();

        gameCards.forEach(card => {
            const title = card.querySelector(".game-title").textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});
