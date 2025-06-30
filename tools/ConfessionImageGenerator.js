const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generateImage = async ({ residence, confessionText, submissionDate, outputPath }) => {
  const colors = {
    PlaceVanier: { background: "#FFDAD5", accent: "#D65A4E" },
    TotemPark: { background: "#DDEEDF", accent: "#5C8C66" },
    OrchardCommons: { background: "#E8DFFB", accent: "#7A5CA0" },
  };

  const { background, accent } = colors[residence] || colors.TotemPark;
  const titleMap = {
    PlaceVanier: "Place Vanier Confessions",
    TotemPark: "Totem Park Confessions",
    OrchardCommons: "Orchard Commons Confessions",
  };
  const title = titleMap[residence] || "UBC Confessions";

  const html = `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Arial&display=swap');
          body {
            margin: 0;
            width: 1080px;
            height: 1080px;
            background: ${background};
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .box {
            width: 90%;
            background: white;
            margin: 20px 0;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .accent-bar {
            height: 10px;
            width: 100%;
            background: ${accent};
            margin-bottom: 20px;
          }
          .title {
            font-size: 40px;
            font-weight: bold;
          }
          .desc {
            margin-top: 20px;
            font-size: 20px;
            white-space: pre-wrap;
          }
          .sub-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .confession {
            font-size: 24px;
            white-space: pre-wrap;
          }
          .date {
            font-size: 18px;
            position: absolute;
            bottom: 40px;
            right: 60px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <div class="accent-bar"></div>
          <div class="title">${title}</div>
          <div class="desc">Treat this as an intrusive thought dump, or confess something you would never have the balls to say in person.\nAll confessions are anonymous.</div>
        </div>
        <div class="box">
          <div class="sub-title">Insert Confession Below</div>
          <div class="confession">${confessionText}</div>
        </div>
        <div class="date">Submitted ${submissionDate}</div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath });
  await browser.close();
};

// Example usage:
generateImage({
  residence: 'TotemPark',
  confessionText: 'leopard hair guy just proved their point 😭😭😭😭',
  submissionDate: '4/1/25, 12:39 PM',
  outputPath: path.join(__dirname, 'confession_output.png')
}).then(() => console.log('Image created successfully.'));