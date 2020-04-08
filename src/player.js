const puppeteer = require("puppeteer");
const BASE_URL = "https://www.premierleague.com/clubs";
function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
const clubs = async (club = "") => {
  const URL = BASE_URL;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  await delay(3500);
  await page.click("div.cookies-notice-accept");
  const clubLinks = await page.$$eval(
    "#mainContent > div.clubIndex > div > div > div.indexSection > div > ul > li > a",
    (data) => data.map((v) => v.href)
  );
  const info = {
    clubs: await playerCrawler(page, clubLinks, club),
    total: clubLinks.length,
  };
  await browser.close();
  console.log(info);
  return info;
};
const playerCrawler = async (page, links, club) => {
  let idx = 0,
    clubs = [];
  if (club === "") {
    //전체 수집
    while (idx < links.length) {
      const URL = links[idx];
      const team = URL.slice(30).split("/")[2];
      //const page = await browser.newPage();
      await page.goto(URL, { waitUntil: "networkidle2" });
      await delay(4000);
      await page.click("#mainContent > nav > ul > li:nth-child(2) > a");
      await delay(1200);
      const aTags = await page.$$eval("a.playerOverviewCard", (data) =>
        data.map((v) => v.href)
      );
      const players = [];
      for (let i = 0; i < aTags.length; i++) {
        await page.goto(aTags[i], { waitUntil: "networkidle2" });
        players.push(await getPlayer(page, team));
        //await delay(2500);
      }
      clubs.push({ [team]: players });
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
    //const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2" });
    await delay(4000);
    await page.click("#mainContent > nav > ul > li:nth-child(2) > a");
    await delay(1200);
    const aTags = await page.$$eval("a.playerOverviewCard", (data) =>
      data.map((v) => v.href)
    );
    const players = [];
    for (let i = 0; i < aTags.length; i++) {
      await page.goto(aTags[i], { waitUntil: "networkidle2" });
      players.push(await getPlayer(page, team));
    }
    clubs.push({ [team]: players });
  }
  await page.close();
  return clubs;
};
const getPlayer = async (page, team) => {
  try {
  } catch (e) {
    console.error(e);
  }
  let player = {};
  await delay(2000);
  player.name = await page.$eval(
    //선수 이름
    "#mainContent > section > div.wrapper.playerContainer > div.playerDetails > h1 > div",
    (data) => data.textContent
  );
  player.imgUrl = await page.$eval(
    //선수 이미지
    "#mainContent > section > div.wrapper.playerContainer > div.imgContainer > img",
    (data) => `https:${data.getAttribute("src")}`
  );
  const birth = await page.$$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > div > div.playerInfo > section > div > ul.pdcol2 > li > div.info",
    (data) => (data.length > 0 ? true : false)
  );
  if (birth) {
    player.birth = await page.$eval(
      // 선수 나이 및 생일
      "#mainContent > div.wrapper.hasFixedSidebar > div > div > div.playerInfo > section > div > ul.pdcol2 > li > div.info",
      (data) => data.textContent.trim()
    );
  } else {
    player.birth = "-";
  }

  player.from = await page.$eval(
    // 선수 출신 국가
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
  await delay(4500);
  const info = await page.$$eval(
    "section.sideWidget.playerIntro.-topBorder > div.info",
    (data) => data.map((v) => v.textContent.trim())
  );
  if (info.length === 4) {
    player.position = info[1];
    player.club = info[0];
  } else {
    player.position = info[0];
    player.club = team;
  }
  player.leagueRecord = {};
  player.leagueRecord.appearances = await page.$eval(
    "table > tbody > tr:nth-child(1) > td",
    (data) => data.textContent.trim()
  ); //리그 출전 수
  player.leagueRecord.goals = await page.$eval(
    "table > tbody > tr:nth-child(2) > td",
    (data) => data.textContent.trim()
  ); //리그 골
  player.leagueRecord.assists = await page.$eval(
    "table > tbody > tr:nth-child(3) > td",
    (data) => data.textContent.trim()
  ); //리그 도움
  player.onLoan = player.club === team ? false : true;
  //임대 확인
  return player;
};

clubs();
