async function pageFunction(context) {
    const { $, json, request, log, enqueueRequest, cheerio, Apify, body } = context;
    const { Manufacturer, Paginated, Brand, ExcludedKeyWords, Product, StockRequest } = request.userData;
    const domain = 'https://www.laptopsdirect.co.uk';

    if (!Paginated) {
        const productsPerPage = 48;
        const totalProductsCount = $('div[class="sr_numresults width-100 margin-bottom-05"]').text().match(/\d+/g).pop();
        const totalPages = Math.ceil(totalProductsCount / productsPerPage);

        log.info(`${Brand} TOTAL PRODUCTS: ${totalProductsCount}`);
        log.info(`${Brand} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
        log.info(`${Brand} TOTAL ITERATIONS: ${totalPages}`);

        for (var i = 2; i <= totalPages; i++) {
            const nextUrl = request.url + `&pageNumber=${i}`
            let nextRequest = {
                url: nextUrl,
                userData: {
                    ...request.userData,
                    Paginated: true,
                },
            }
            await enqueueRequest(nextRequest);
        }
    }

    var results = [];
    var productCards = $('div[class="OfferBox"]');
    log.info(`${Brand} - found: ${productCards.length} in ${request.url}`);
    productCards.each(async function (index, element) {
        var productId = $(element).find('[class="offerImage"]').attr('pid');
        var ctinCode = $(element).find('div.sr_image > a').attr('onclick').split("('").pop().split("',").shift();
        var productName = $(element).find('div[class="sr_image"] > a').attr('title').replace('&amp;', '&').replace(/\s\s+/g, ' ').trim();
        var productUrl = domain + $(element).find('div[class="sr_image"] > a').attr('href');
        var price = $(element).find('span[class="offerprice"]').text().replace(/\r|\n/g, '').trim().replace('&#xA3;', '').replace('£', '');
        var imageSource = domain + $(element).find('[class="offerImage"]').attr('src').split('?')[0].replace('Classic', 'Supersize');
        var match = ExcludedKeyWords ? ExcludedKeyWords || "" : null;
        var testKeyword = new RegExp(match).test(productName.toUpperCase());
        if (testKeyword && ExcludedKeyWords) {
            log.info('Refurbished product ' + productName);
            var excluded = {
                Handled: true,
                Message: `Product excluded`,
                Url: productUrl
            }
            results.push(excluded);
        } else {
            var product = {
                ProductId: productId,
                Manufacturer,
                ProductName: productName,
                ProductUrl: productUrl,
                Price: Number(price) || 0,
                ImageUri: imageSource,
                CTINCode: ctinCode
            }
            results.push(product);
        }
    })
    return results;
}


// ========= INPUT =========
// "startUrls": [
//     {
//         "url": "https://www.laptopsdirect.co.uk/nav/fts/philips/fts/brd/philips?itemsPerPage=48",
//         "userData": {
//             "Manufacturer": "Philips",
//             "Brand": "Philips",
//             "Culture Code": "en-GB",
//             "ExcludedKeyWords": "HUE",
//             "ApifyResultType": 0
//         },
//         "method": "GET"
//     }
// ]