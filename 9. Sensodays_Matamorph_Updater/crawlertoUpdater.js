const fs = require('fs');

let rawData = fs.readFileSync('./data_sensodays.json');
let crawler = JSON.parse(rawData);

const updaterList = []
for (let x of crawler) {
	if (!x.Handled) {
		updaterList.push({
			"url": x.ProductUrl,
			"userData": {
				"Manufacturer": x.Manufacturer,
			}
		});
	}
}
const updater = { "startUrls": updaterList }
console.log(`Total products exported ${updaterList.length}`)
fs.writeFileSync('./inputPPUR_sensodays_apify.json', JSON.stringify(updater))