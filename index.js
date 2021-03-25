const venom = require('venom-bot');
require('dotenv').config();

const request = require("request");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const baseurl = 'https://moodle.sertao.ifrs.edu.br';
const username = process.env.MOODLEUSER;
const password = process.env.MOODLEPASS;

const login = (baseurl,username,password)=> new Promise((re,err)=>{
    request(`${baseurl}/login/token.php?username=${username}&password=${password}&service=moodle_mobile_app`, function (error, response, body) {
        console.log(JSON.parse(body))
        re(JSON.parse(body))
    })
})

const core_calendar_get_calendar_upcoming_view = (baseurl,token)=> new Promise((re,err)=>{
    request(`${baseurl}/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_calendar_get_calendar_upcoming_view&moodlewssettingfilter=true&moodlewssettingfileurl=true&wstoken=${token}`, function (error, response, body) {
       // console.log(JSON.parse(body))
        re(JSON.parse(body))
    })
})

function dateformat(int){
  var data = new Date(int),
      dia  = data.getDate().toString(),
      diaF = (dia.length == 1) ? '0'+dia : dia,
      mes  = (data.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
      mesF = (mes.length == 1) ? '0'+mes : mes,
      hr  = (data.getHours()).toString(), //+1 pois no getMonth Janeiro começa com zero.
      hrf = (hr.length == 1) ? '0'+hr : hr,
      mim  = (data.getMinutes()).toString(), //+1 pois no getMonth Janeiro começa com zero.
      mimf = (mim.length == 1) ? '0'+mim : mim

      
  return {diaF, mesF, hrf, mimf }
}

async function a(){
  const { token, privatetoken } = await login(baseurl, username, password)
  

venom
  .create(
    'sessionName',    
    
    (base64Qrimg, asciiQR, attempts, urlCode) => {
    console.log('urlCode (data-ref): ', urlCode);
  },
  (statusSession, session) => {
    console.log('Status Session: ', statusSession); 
    console.log('Session name: ', session);
  },{puppeteerOptions: {args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
}})
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage(async(message) => {
    console.log(message)
    if (message.body === '!atividades') {
      const events = await core_calendar_get_calendar_upcoming_view(baseurl, token)
      var _message = '';
      for (let index = 0; index < events.events.length; index++) {
        var data = dateformat(events.events[index].timesort*1000)
        _message = `${_message} [${data.diaF}/${data.mesF} às ${data.hrf}:${data.mimf}] ${events.events[index].name} de ${events.events[index].course.fullname}\n\n`;
      }
        console.log(_message)

      client
        .sendText(message.from, _message)
        .then((result) => {
         // console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
  });
}
}a()

const http = require("http");

var express = require('express');
var app = express();
const server = http.createServer(app);
app.get('/', function(req, res) {
  res.send('O bot de zap está rodando agora ;)');
});
server.listen(process.env.PORT || 3000)