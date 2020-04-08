const puppeteer = require("puppeteer");
const BASE_URL = "https://www.premierleague.com/clubs";
const STAT_URL = "https://www.premierleague.com/clubs/4/Chelsea/stats?se=";
function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
const teamStatsCrawler = async (club = "") => {
  const URL = BASE_URL;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  await delay(4500);
  await page.click("div.cookies-notice-accept");
  const clubLinks = await page.$$eval(
    "#mainContent > div.clubIndex > div > div > div.indexSection > div > ul > li > a",
    (data) => data.map((v) => v.href)
  );
  const info = {
    clubs: await getTeamStats(page, clubLinks, club),
    total: clubLinks.length,
  };
  await browser.close();
  console.log(info);
  return info;
};
const getTeamStats = async (page, links, club) => {
  let seasonIds = [];
  let stats = {};
  if (club === "") {
    //전체 수집
    let idx = 0;
    while (idx < links.length) {
      const URL = links[idx];
      const team = URL.slice(30).split("/")[2];
      stats[`${team}`] = {};
      //const page = await browser.newPage();
      await page.goto(URL, { waitUntil: "networkidle2" });
      await delay(4000);
      await page.click("#mainContent > nav > ul > li:nth-child(5) > a");
      await delay(2000);
      if (seasonIds.length === 0) {
        seasonIds = await page.$$eval(
          "#mainContent > div.wrapper.col-12 > div > div > section > div.dropDown.mobile > ul > li",
          (data) => data.map((v) => v.dataset.optionId)
        );
      }
      for (let i = 1; i < seasonIds.length; i++) {
        const stats = {};
        await page.goto(`${STAT_URL}${seasonIds[i]}`);
        await delay(3000);
        //matchplayed,wins,looses,goals,clean sheets,attack,teamplay,defence,discipline
        //stats[`${team}`]
      }
      idx++;
    }
  } else {
    //특정 club 이름 입력시 관련 데이터 만 수집
    const teamName = club.replace(/\b[a-z]/g, (m) => m.toUpperCase());
    for (let i = 0; i < links.length; i++) {
      if (links[i].includes(teamName)) {
        idx = i;
        break;
      }
    }
    const URL = links[idx];
    const team = URL.slice(30).split("/")[2];
    await page.goto(URL, { waitUntil: "networkidle2" });
    await delay(4000);
    await page.click("#mainContent > nav > ul > li:nth-child(2) > a");
    await delay(1200);
  }
  await page.close();
};
teamStatsCrawler();
