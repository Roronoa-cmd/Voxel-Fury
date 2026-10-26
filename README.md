# Voxal Fury — updated build

## Start

1. Install Node.js 18 or newer.
2. Open a terminal in this folder and run `npm start` (or `node server.js`).
3. Open `http://localhost:3000` in a browser.

The game uses Three.js from a CDN, so the browser needs internet access. For friends to connect over the internet, host this folder on a server and set `SERVER_URL` in `index.html.html` to that server's URL. For friends on the same network, open the game using the host computer's LAN address.

## Included changes

- Replaced the revolver slot with a 12-round USP. Damage is 20 to the body and 50 to the head, so five body hits or two head hits defeat a 100-HP player.
- Rebuilt the USP and Desert Eagle as blocky, metallic first- and third-person game models based on the supplied references.
- Added the provided gun, reload, katana, flyby, headshot, and fifth-kill audio. The existing kill sound and non-custom reloads remain in use.
- Added score and K/D columns, distinct kill/headshot banners, points, and an Ace sound on kills 5, 10, 15, and so on.
- Added a four-player private party display, invite accept/decline dialog, leadership transfer, and remote player appearance/weapon sync.
- Made the chat available to every connected player; press Enter during a match to open it.
- Linked weapon-camera FOV to the FOV setting and made crosshair color, gap, and thickness settings visible in gameplay.
- Widened the lobby and separated map and mode sections.

The referenced pistol pictures were used as visual guidance; the models are built from the game's own procedural geometry and textures.
- Chat panel is movable with the grip button in its header; its position is remembered in the browser.
- In a match, Escape opens Pause; Escape again resumes and reacquires pointer lock. The Resume button is at the top of the pause menu.
