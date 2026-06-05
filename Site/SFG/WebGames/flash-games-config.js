// ============================================================
//  FLASH ARCADE CONFIG  (used by flash.html)
//  ruffle: true  shows the ⚡ RUFFLE badge on the card
// ============================================================
window.GAMES_CONFIG = {
  basePath: "categories/FlashOGS/",
  categories: ["Puzzle", "Fighting"],
  games: {
    "Puzzle": [
      {
        "name": "Bloxorz (Original)",
        "folder": "OG Bloxorz",
        "description": "The original Bloxorz Flash game from 2007. Guide the block to the hole!",
        "badge": "CLASSIC",
        "ruffle": true
      },
      {
        "name": "Portal: Flash Version",
        "folder": "portal-the-flash-version",
        "path": "categories/FlashOGS/Puzzle/portal-the-flash-version/portal-index.html",
        "description": "The fan-made 2D Flash port of Valve's Portal. Think with portals!",
        "badge": "CLASSIC",
        "ruffle": true
      }
    ],
    "Fighting": [
      {
        "name": "Electric Man",
        "folder": "electric man",
        "path": "categories/FlashOGS/Fighting/electric man/electricman-index.html",
        "description": "Electrifying stick-figure fighting game. Battle through the Tournament of Voltagen!",
        "badge": "CLASSIC",
        "ruffle": true
      }
    ]
  }
};
