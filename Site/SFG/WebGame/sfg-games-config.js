// ============================================================
//  SFG WEB GAMES CONFIG  (used by index.html)
//
//  basePath   - root folder for this page's games
//  categories - which tabs to show, in order
//  games      - games per category
//
//  Per game:
//    name        - display name on the card
//    folder      - exact folder name inside basePath/CATEGORY/
//    description - blurb shown on the card
//    badge       - small corner label: "NEW", "PUZZLE", etc.
//                  Leave "" or remove the line to show no badge.
//    thumbnail   - path to preview image (optional)
//                  Defaults to basePath/CATEGORY/folder/thumbnail.png
// ============================================================
window.GAMES_CONFIG = {
  basePath: "categories/SFGGame/",
  categories: ["Puzzle", "Other"],
  games: {
    "Puzzle": [
      {
        "name": "Bloxorz Reimagined",
        "folder": "Bloxorz Reimagined",
        "description": "A FAN-MADE re-make of the OG Bloxorz Flash game from 2007. Built in Unity.",
        "badge": "PUZZLE",
        "thumbnail": "categories/SFGGame/Puzzle/Bloxorz Reimagined/Cover.png"
      }
    ],
    "Other": [
      /* Add more SFG games here */
    ]
  }
};
