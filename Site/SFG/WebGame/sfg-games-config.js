// ============================================================
//  SFG WEB GAMES CONFIG  (for index.html)
//  basePath: where this page's categories folder lives
//  categories: tab order — add new ones here
//  games[CATEGORY]: list of games in that category
//
//  Each game:
//    name        - display name
//    folder      - exact folder name inside basePath/CATEGORY/
//    description - short blurb shown on the card
//    badge       - corner label (optional, e.g. "NEW", "PUZZLE")
//    thumbnail   - override thumbnail path (optional)
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
      /* Add other SFG games here */
    ]
  }
};
