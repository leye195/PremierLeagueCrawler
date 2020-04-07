const puppeteer = require("puppeteer");
BASE_URL = "https://www.premierleague.com/clubs/";
//PLAYER_URL ="https://www.premierleague.com/players/11373/Kepa-Arrizabalaga/overview";
function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
const playerCrawler = async (team, id) => {
  const URL = `${BASE_URL}${id}/${team}/squad`; //PLAYER_URL;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  await delay(4500);
  await page.click("div.cookies-notice-accept");
  await delay(1200);
  const aTags = await page.$$eval("a.playerOverviewCard", (data) =>
    data.map((v) => v.href)
  );
  console.log(aTags.length);
  const players = [];
  for (let i = 0; i < aTags.length; i++) {
    await page.goto(aTags[i], { waitUntil: "networkidle2" });
    players.push(await getPlayer(page, team));
    await delay(2500);
  }
  console.log(players);
  browser.close();
};
const getPlayer = async (page, team) => {
  let player = {};
  //player.number = await page.$eval(
  //"#mainContent > section > div.wrapper.playerContainer > div.playerDetails > div",
  //(data) => data.textContent
  //);
  player.name = await page.$eval(
    "#mainContent > section > div.wrapper.playerContainer > div.playerDetails > h1 > div",
    (data) => data.textContent
  );
  //#mainContent > section > div.wrapper.playerContainer > div.imgContainer > img
  player.imgUrl = await page.$eval(
    "#mainContent > section > div.wrapper.playerContainer > div.imgContainer > img",
    (data) => `https:${data.getAttribute("src")}`
  );
  player.birth = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > div > div.playerInfo > section > div > ul.pdcol2 > li > div.info",
    (data) => data.textContent.trim()
  );
  player.from = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > div > div.playerInfo > section > div > ul.pdcol1 > li > div.info > span.playerCountry",
    (data) => data.textContent
  );
  /*player.height = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > div > div.playerInfo > section > div > ul.pdcol3 > li:nth-child(1) > div.info",
    (data) => data.textContent
  );*/

  await page.click(
    "#mainContent > div.wrapper.playerPageLinks > nav > ul > li:nth-child(2) > a"
  );
  await delay(5000);
  player.position = await page.$eval("div.info:nth-child(4)", (data) =>
    data.textContent.trim()
  );
  player.club = await page.$eval("div.info:nth-child(2)", (data) =>
    data.textContent.trim()
  );
  player.leagueRecord = {};
  player.leagueRecord.appearances = await page.$eval(
    "table > tbody > tr:nth-child(1) > td",
    (data) => data.textContent.trim()
  );
  player.leagueRecord.goals = await page.$eval(
    "table > tbody > tr:nth-child(2) > td",
    (data) => data.textContent.trim()
  );
  player.leagueRecord.assists = await page.$eval(
    "table > tbody > tr:nth-child(3) > td",
    (data) => data.textContent.trim()
  );
  player.onLoan = player.club === team ? false : true;
  console.log(player);
  return player;
};
playerCrawler("Chelsea", 4);
