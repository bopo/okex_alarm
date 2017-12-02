const request = require("request");
var sleep = require('sleep');
const base_url =
  "https://www.okex.com/api/v1/future_ticker.do";
var lastPrices = {
	"btc": 10000,
	"ltc": 100,
	"etc": 30,
	"eth": 450,
}
var nextCoin = {
	"btc": "ltc",
	"ltc": "etc",
	"etc": "eth",
	"eth": "btc"
}

function checkPrice(coin, contract_type, threshold) {

	var url = base_url + "?symbol=" + coin + "_usd&contract_type=" + contract_type;
	console.log("checking", coin, contract_type, threshold, url);
	request.get(url, (error, response, body) => {
		if(error) {
			console.error(error);
			sleep.msleep(200);
			checkPrice(nextCoin[coin], contract_type, threshold);
			return
		}
		body = JSON.parse(body);
		if(coin == "etc") {
			console.log(lastPrices);
			console.log(body);
		}
		if((body.ticker.last - lastPrices[coin])/ lastPrices[coin] >= threshold) {
			console.log("Alarm: ", coin, " price has surged!");
			console.log(lastPrices[coin]);
			console.log(body);
		} else if((body.ticker.last - lastPrices[coin])/ lastPrices[coin] <= -threshold) {
			console.log("Alarm: ", coin, " price has failed!");
			console.log(lastPrices[coin]);
			console.log(body);
		}
		lastPrices[coin] = body.ticker.last;
		sleep.msleep(200);
		checkPrice(nextCoin[coin], contract_type, threshold);
	});

}

checkPrice("btc", "quarter", 0.005);

// function main() {
// 	var threshold = 0.005;
// 	var contract_type = "quarter";
// 	while(1) {
// 		console.log("checking");
// 		checkPrice("btc", contract_type, threshold);
// 		sleep.msleep(150);
// 		checkPrice("ltc", contract_type, threshold);
// 		sleep.msleep(150);
// 		checkPrice("etc", contract_type, threshold);
// 		sleep.msleep(150);
// 		checkPrice("eth", contract_type, threshold);
// 		sleep.msleep(1500);
// 	}
// }
// main();