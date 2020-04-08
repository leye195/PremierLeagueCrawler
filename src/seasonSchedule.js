const puppeteer = require("puppeteer");
function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
const BASE_URL =
  "https://www.foxsports.com/soccer/schedule?competition=1&season=2019&round=1&week=0&group=0&sequence=1";
/**
 * #wisfoxbox > section.wisbb_body > table > tbody > tr
 */
const scheduleCrawler = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(BASE_URL);
  await delay(4000);
  const gameResult = {};
  const schedules = await page.$$eval(
    "#wisfoxbox > section.wisbb_body > table > tbody > tr",
    (data) =>
      data.map((v) => {
        const home = v
          .querySelector(
            "td.wisbb_team.wisbb_reversed.wisbb_firstTeam > div.wisbb_fullTeamStacked > a > span:nth-child(3)"
          )
          .textContent.trim();
        const homeScore = v.querySelector(
          "td.wisbb_team.wisbb_reversed.wisbb_firstTeam > div.wisbb_score"
        ).textContent;
        const away = v
          .querySelector(
            "td.wisbb_team.wisbb_secondTeam > div.wisbb_fullTeamStacked > a > span:nth-child(3)"
          )
          .textContent.trim();
        const awayScore = v.querySelector(
          "td.wisbb_team.wisbb_secondTeam > div.wisbb_score"
        ).textContent;
        return {
          home,
          away,
          homeScore: parseInt(homeScore, 10),
          awayScore: parseInt(awayScore, 10),
        };
      })
  );
  console.log(schedules);
  schedules.map((v) => {
    if (!Object.keys(gameResult).includes(v.home)) {
      gameResult[`${v.home}`] = [
        {
          home: v.home,
          away: v.away,
          homeScore: v.homeScore === null ? -1 : v.homeScore,
          awayScore: v.awayScore === null ? -1 : v.awayScore,
          result:
            v.homeScore === null && v.awayScore === null
              ? "N" // 경기 미실시
              : v.homeScore > v.awayScore
              ? "W" //승
              : v.homeScore === v.awayScore
              ? "D" //무
              : "L", //패
        },
      ];
    } else {
      gameResult[`${v.home}`].push({
        home: v.home,
        away: v.away,
        homeScore: v.homeScore === null ? -1 : v.homeScore,
        awayScore: v.awayScore === null ? -1 : v.awayScore,
        result:
          v.homeScore === null && v.awayScore === null
            ? "N" // 경기 미실시
            : v.homeScore > v.awayScore
            ? "W" // 승
            : v.homeScore === v.awayScore
            ? "D" // 무
            : "L", //패
      });
    }
    if (!Object.keys(gameResult).includes(v.away)) {
      gameResult[v.away] = [
        {
          home: v.home,
          away: v.away,
          homeScore: v.homeScore === null ? -1 : v.homeScore,
          awayScore: v.awayScore === null ? -1 : v.awayScore,
          result:
            v.homeScore === null && v.awayScore === null
              ? "N" //경기 미실시
              : v.homeScore > v.awayScore
              ? "W" //승
              : v.homeScore === v.awayScore
              ? "D" //무
              : "L", //패
        },
      ];
    } else {
      gameResult[`${v.away}`].push({
        home: v.home,
        away: v.away,
        homeScore: v.homeScore === null ? -1 : v.homeScore,
        awayScore: v.awayScore === null ? -1 : v.awayScore,
        result:
          v.homeScore === null && v.awayScore === null
            ? "N" // 경기 미실시
            : v.homeScore > v.awayScore
            ? "W" // 승
            : v.homeScore === v.awayScore
            ? "D" // 무
            : "L", //패
      });
    }
  });
  console.log(gameResult);
  await page.close();
  await browser.close();
};
scheduleCrawler();
