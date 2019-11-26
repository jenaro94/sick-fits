const nodeMailer = require('nodemailer')

const transport = nodeMailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

const makeANiceEmail = text => `
  <div class="email" style="
    border: solid 1px black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
    <h1>Hello There!</h1>
    <p>${text}</p>

    <p>😘, Jenaro</p>
  </div>
`

exports.transport = transport
exports.makeANiceEmail = makeANiceEmail