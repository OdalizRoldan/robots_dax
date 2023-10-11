const fs = require('fs');

let rawData = fs.readFileSync('data_cameraland.json');
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
fs.writeFileSync('./inputPPU_cameraland_apify.json', JSON.stringify(updater))