document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchBar");
    const gameItems = document.querySelectorAll(".game-item");

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();

        gameItems.forEach(game => {
            const gameName = game.textContent.toLowerCase();
            if (gameName.includes(query)) {
                game.style.display = "block";
            } else {
                game.style.display = "none";
            }
        });
    });
});
