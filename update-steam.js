const fs = require("fs");
const axios = require("axios");

const API_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = "76561198815877199";

async function main() {

    const ownedGames = await axios.get(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${API_KEY}&steamid=${STEAM_ID}&include_appinfo=true`
    );

    const games = ownedGames.data.response.games || [];

    const selectedGames = [
        319630,   // Life is Strange
        960910,   // Heavy Rain
        3527290,  // PEAK
        960990,   // Beyond Two Souls
        3376480   // Delivery Beyond
    ];

    const result = [];

    for (const game of games) {

        if (!selectedGames.includes(game.appid))
            continue;

        try {

            const achievements = await axios.get(
                `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${API_KEY}&steamid=${STEAM_ID}&appid=${game.appid}`
            );

            const list = achievements.data.playerstats.achievements || [];

            const unlocked = list.filter(a => a.achieved === 1).length;
            const total = list.length;

            result.push({
                appid: game.appid,
                name: game.name,
                achieved: unlocked,
                total: total,
                percent: total > 0
                    ? Number(((unlocked / total) * 100).toFixed(1))
                    : 0
            });

        } catch (err) {

            console.log("Erro:", game.name);

        }
    }

    fs.writeFileSync(
        "progress.json",
        JSON.stringify({ games: result }, null, 2)
    );

    console.log("progress.json atualizado");
}

main();
