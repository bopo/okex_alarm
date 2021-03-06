const request = require("request");
var sleep = require('sleep');
const base_url =
  "https://www.okex.com/api/v1/future_ticker.do";
var lastPrices = {
    "btc": 10000,
    "ltc": 100,
    "etc": 30,
    "eth": 450,
	"bch": 1700
}

var priceRecords = {
	"btc": [],
	"ltc": [],
	"etc": [],
	"eth": [],
	"bch": []
}
var msgRecords = {
	"btc": [],
	"ltc": [],
	"etc": [],
	"eth": [],
	"bch": []
}
var nextCoin = {
	"btc": "ltc",
	"ltc": "etc",
	"etc": "eth",
	"eth": "bch",
	"bch": "btc"
}

var records_length = 60 / 0.5;
//
function checkFluctuation(array, threshold){
	var min = 99999;
	var max = 0;
	for(var i = 0; i < array.length; i++) {
		if(array[i] > max) {
			max = array[i];
		}
		if(array[i] < min) {
			min = array[i];
		}
	}
	var rate = (max - min) / array[array.length - 1];
	console.log(max, min, array[array.length - 1], rate);
	if(rate >= threshold) {
		// console.log("true");
		return true;
	}
	return false;
}

function checkPrice(coin, contract_type, threshold) {
	var url = base_url + "?symbol=" + coin + "_usd&contract_type=" + contract_type;
	// console.log("checking", coin, contract_type, threshold, url);
	request.get(url, (error, response, body) => {
		if(error) {
			// console.error("error:", error);
			sleep.msleep(200);
			checkPrice(nextCoin[coin], contract_type, threshold);
			return
		}
		msgRecords[coin].push(body);
		body = JSON.parse(body);
		console.log(coin, " last: ", body.ticker.last, " buy: ", body.ticker.buy, " sell: ", body.ticker.sell);
		priceRecords[coin].push(body.ticker.last);
		if(priceRecords[coin].length >= records_length) {
			var flag = checkFluctuation(priceRecords[coin]);
			if(flag) {
				console.log("Alarm: ", coin);
				console.log(priceRecords[coin]);
				console.log(msgRecords[coin]);
			}
			priceRecords[coin].shift();
			msgRecords[coin].shift();
		}
		// body.ticker.last 
		// if((body.ticker.last - lastPrices[coin])/ lastPrices[coin] >= threshold) {
		// 	console.log("Alarm: ", coin, " price has surged!");
		// 	console.log(lastPrices[coin]);
		// 	console.log(body);
		// } else if((body.ticker.last - lastPrices[coin])/ lastPrices[coin] <= -threshold) {
		// 	console.log("Alarm: ", coin, " price has failed!");
		// 	console.log(lastPrices[coin]);
		// 	console.log(body);
		// }
		// lastPrices[coin] = body.ticker.last;
		sleep.msleep(200);
		checkPrice(nextCoin[coin], contract_type, threshold);
	});

}

checkPrice("btc", "quarter", 0.001);
