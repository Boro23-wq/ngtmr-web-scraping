require('dotenv').config();
const sendGridMail = require('@sendgrid/mail');
const nightmare = require('nightmare')();
const args = process.argv.slice(2);
const url = args[0];
const minPrice = args[1];

sendGridMail.setApiKey(process.env.SG_API_KEY);

checkPrice();

async function checkPrice() {
  try {
    const priceString = await nightmare
      .goto(url)
      .wait('#priceblock_ourprice')
      .evaluate(() => document.getElementById('priceblock_ourprice').innerText)
      .end();

    const priceNumber = parseFloat(
      priceString.replace(',', '').replace('₹', '')
    );
    if (priceNumber < minPrice) {
      // console.log(priceNumber);
      await sendMail(
        'Low Price, Grab em...',
        `The price for ${url} dropped below ${minPrice} INR.!`
      );
    }
  } catch (err) {
    await sendMail('Amazon Price Tracker Error!', err.message);
    throw err;
  }
}

function sendMail(subject, body) {
  const email = {
    to: 'tomail',
    from: 'frommail',
    subject: subject,
    text: body,
    html: body,
  };

  return sendGridMail.send(email);
}
