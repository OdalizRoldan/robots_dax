// const fs = from('fs');
const fs = require('fs');
// import fs from 'fs';

let rawData = fs.readFileSync('data/crawler.json');
let crawler = JSON.parse(rawData);
// const updaterList = crawler.map(x => {
//    // console.log(x.Handled)
//    if(!x.Handled){

// 	return {
// 		"url": x.ProductUrl,
// 		"userData": { 
// 			"Manufacturer": x.Manufacturer,
// 		//	"SupportedSellers":x.Manufacturer=="Duracell"?"'107036(Duracell)'":"'106320(Kolaysepet)','4513(Denkel)', '106446(Hızlıgitti)', '106394(Dukkan35)', '104683(Nethouse)', '158172(Ligorin)', '116771(DECİDE)', '107175(Arestrendy)', '138098(Phaksesuar)', '107870(Teknosa)', '108574(Kraft)', 'TECHNOSTORE', '105330(hesaplimagaza)'"
// 			// "ProductId": x.ProductId,
//            // "ProductName": x.ProductName
// 		 //  "ProductName":x.ProductName
// 		}
// 	}
// } 
// })
const updaterList = []
for (let x of crawler) {
	// console.log(x.Handled)
	if (!x.Handled) {
		// if (!x.ProductName.includes('Dynalite')) {
		// 	updaterList.push({
		// 		"url": x.ProductUrl,
		// 		"userData": {
		// 			"Manufacturer": x.Manufacturer,
		// 			"Manufacturers":"Signify,Signify B2B"
		// 			//	"SupportedSellers":x.Manufacturer=="Duracell"?"'107036(Duracell)'":"'106320(Kolaysepet)','4513(Denkel)', '106446(Hızlıgitti)', '106394(Dukkan35)', '104683(Nethouse)', '158172(Ligorin)', '116771(DECİDE)', '107175(Arestrendy)', '138098(Phaksesuar)', '107870(Teknosa)', '108574(Kraft)', 'TECHNOSTORE', '105330(hesaplimagaza)'"
		// 			// "ProductId": x.ProductId,
		// 			// "ProductName": x.ProductName
		// 			//  "Merchant": "Carrefour"
		// 		}
		// 	});
		// } else {
			updaterList.push({
				"url": x.ProductUrl,
				"userData": {
					"Manufacturer": x.Manufacturer,
					//	"SupportedSellers":x.Manufacturer=="Duracell"?"'107036(Duracell)'":"'106320(Kolaysepet)','4513(Denkel)', '106446(Hızlıgitti)', '106394(Dukkan35)', '104683(Nethouse)', '158172(Ligorin)', '116771(DECİDE)', '107175(Arestrendy)', '138098(Phaksesuar)', '107870(Teknosa)', '108574(Kraft)', 'TECHNOSTORE', '105330(hesaplimagaza)'"
					"ProductId": x.ProductId,
					// "ProductName": x.ProductName
					//  "Merchant": "Carrefour"
				}
			});
		// }


		// if (!x.Handled) {
		// 	if (x.Manufacturer == "Philips") {
		// 		updaterList.push({
		// 			"url": x.ProductUrl,
		// 			"userData": {
		// 				"Manufacturer": x.Manufacturer,
		// 				"SupportedSellers": "'106320(Kolaysepet)','4513(Denkel)', '106446(Hızlıgitti)', '106394(Dukkan35)', '104683(Nethouse)', '158172(Ligorin)', '116771(DECİDE)', '107175(Arestrendy)', '138098(Phaksesuar)', '107870(Teknosa)', '108574(Kraft)', 'TECHNOSTORE', '105330(hesaplimagaza)'",
		// 				//	"SupportedSellers":x.Manufacturer=="Duracell"?"'107036(Duracell)'":"'106320(Kolaysepet)','4513(Denkel)', '106446(Hızlıgitti)', '106394(Dukkan35)', '104683(Nethouse)', '158172(Ligorin)', '116771(DECİDE)', '107175(Arestrendy)', '138098(Phaksesuar)', '107870(Teknosa)', '108574(Kraft)', 'TECHNOSTORE', '105330(hesaplimagaza)'"
		// 				// "ProductId": x.ProductId,
		// 				// "ProductName": x.ProductName
		// 				//  "ProductName":x.ProductName
		// 			}
		// 		});
		// 	}
		// 	if (x.Manufacturer == "Duracell") {
		// 		updaterList.push({
		// 			"url": x.ProductUrl,
		// 			"userData": {
		// 				"Manufacturer": x.Manufacturer,
		// 				"SupportedSellers": "'107036(Duracell)'",
		// 				//	"SupportedSellers":x.Manufacturer=="Duracell"?"'107036(Duracell)'":"'106320(Kolaysepet)','4513(Denkel)', '106446(Hızlıgitti)', '106394(Dukkan35)', '104683(Nethouse)', '158172(Ligorin)', '116771(DECİDE)', '107175(Arestrendy)', '138098(Phaksesuar)', '107870(Teknosa)', '108574(Kraft)', 'TECHNOSTORE', '105330(hesaplimagaza)'"
		// 				// "ProductId": x.ProductId,
		// 				// "ProductName": x.ProductName
		// 				//  "ProductName":x.ProductName
		// 			}
		// 		});
		// 	}


	}
}
const updater = { "startUrls": updaterList }
console.log(`Total products exported ${updaterList.length}`)
fs.writeFileSync('data/inputPPUF.json', JSON.stringify(updater))