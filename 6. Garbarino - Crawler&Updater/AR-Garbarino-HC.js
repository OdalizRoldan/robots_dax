{
  "startUrls": [
    {
      "url": "https://www.garbarino.com/remington",
      "userData": {
        "Manufacturer": "Spectrum",
        "Brand": "Remington",
        "Culture Code": "es-AR",
        "ApifyResultType": 0,
        "CTINRegex": "[A-Z0-9]+/\\d+(?![A-Z])"
      },
      "method": "GET"
    },
    {
      "url": "https://www.garbarino.com/black-decker",
      "userData": {
        "Manufacturer": "Spectrum",
        "Brand": "Black+Decker",
        "Culture Code": "es-AR",
        "ApifyResultType": 0,
        "CTINRegex": "([0-9,A-Z]+\\-)\\w+"
      },
      "method": "GET"
    },
    {
      "url": "https://www.garbarino.com/philips",
      "userData": {
        "Manufacturer": "Philips",
        "Brand": "Philips",
        "Culture Code": "es-AR",
        "ExcludedKeyWords": "HUE|LAMPARA|LÁMPARA",
        "ApifyResultType": 0,
        "CTINRegex": "([0-9,A-Z]+\\/)\\d+|\\w{4,}\\d+\\w+"
      },
      "method": "GET"
    }
  ],
  "keepUrlFragments": false,
  "pageFunction": "async function pageFunction(context) {\n    const { request, log, enqueueRequest, $, response, /*Apify, json*/ } = context;\n    const { Manufacturer, Paginated, CTINRegex, ExcludedKeyWords, Brand } = request.userData; //========= Added shortcuts\n\n    /**\n     * Change notes:\n     * - Retailer seems to have gone through many changes. Result count, products and their data are\n     * now retrieved from different elements than before.\n     * - Crawler is now hybrid, as no meaningful data can only be retrieved from the product page\n     * except for stock.\n     * - No product variants seem to exist in the site, nor any trace of the API calls previously used to\n     * retrieve their data. Even products of the same model but with a different accesory seem to be treated as\n     * completely separate.\n     * - No sign of the product ID format previously used can be found. Now using product url (minus domain).\n     * - No meaningful IDs can be found inside or outside the product pages except for the ones occasionally\n     * on the product's name.\n     * - Detecting 0 products no longer throws an error.\n     */\n\n    if (response.status === 404) {\n        return {\n            Handled: true,\n            Message: '404 error',\n            Url: request.url\n        };\n    }\n\n    const domain = 'https://www.garbarino.com';\n\n    if (!Paginated) {\n        // var items = $('.breadcrumb-item--active').text().match(/\\d+/)[0];\n        var totalNumberOfProducts;\n\n        if ($('.vtex-search-result-3-x-searchNotFoundInfo').length != 0) {\n            totalNumberOfProducts = 0;\n            log.info(`No products found on ${request.url}`)\n        } else {\n            totalNumberOfProducts = Number($('.vtex-search-result-3-x-totalProducts--layout').text().replace(/[^0-9]/g, ''));\n        }\n        \n        var productsPerPage = 9;\n        var totalNumberOfPages = Math.ceil(totalNumberOfProducts / productsPerPage);\n        log.info(`${Brand} TOTAL PRODUCTS: ${totalNumberOfProducts}`);\n        log.info(`${Brand} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);\n        log.info(`${Brand} TOTAL ITERATIONS: ${totalNumberOfPages}`);\n\n        for (var i = 2; i <= totalNumberOfPages; i++) {\n            //var newPage = `_Desde_${(productsPerPage * (i - 1)) + 1}_NoIndex_True`;\n            var newPage = `?page=${i}`;\n            var listUrlToBeEnqueded = request.url + newPage;\n            var nextUrl = { //========== refactored for better lecture\n                url: listUrlToBeEnqueded,\n                userData: {\n                    Paginated: true,\n                    Manufacturer: Manufacturer,\n                    ExcludedKeyWords: ExcludedKeyWords,\n                    CTINRegex: CTINRegex\n                }\n            };\n            await enqueueRequest(nextUrl);\n        }\n    }\n\n    var products = [];\n    var productCards = $(\"a.vtex-product-summary-2-x-clearLink\");\n    log.info(`Founded ${productCards.length} products in  ${request.url}`)\n    productCards.each(async function (index, element) {\n        var url = $(element).attr('href');\n        var name = $(element).find('img.vtex-product-summary-2-x-image').attr('alt');\n\n        var prohibitedMatch = ExcludedKeyWords ? ExcludedKeyWords : null;\n        var testKeyword = new RegExp(prohibitedMatch).test(name.toUpperCase());\n        if (testKeyword) {\n            log.info(\"/==Excluded Product : \" + name);\n            var excludeProduct = {\n                Handled: true,\n                Message: `excluded ${name}`,\n                Url: url\n            }\n            products.push(excludeProduct);\n        } else {\n            var priceText = $(element).find('.vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyInteger').text();\n            var price = parseFloat(priceText);\n            var imageUrl = $(element).find('img.vtex-product-summary-2-x-image').attr('src');\n            imageUrl = imageUrl.split('?')[0];\n            imageUrl = imageUrl.replace(/\\-\\d+\\-\\d+/, '');\n            var id = url.match(/(?<=\\-)\\d+(?=\\/)/)[0];\n\n            var ctinRegex = new RegExp(CTINRegex);\n            var ctinCode = ctinRegex.test(name.toUpperCase()) ? name.toUpperCase().match(ctinRegex)[0] : undefined;\n\n            var product = {\n                ProductId: id,\n                Manufacturer: Manufacturer,\n                ProductName: name,\n                ProductUrl: domain + url,\n                CTINCode: ctinCode,\n                Price: price,\n                Stock: \"InStock\",\n                ImageUri: imageUrl\n            }\n            products.push(product);\n        }\n\n\n    })\n    return products;\n}",
  "proxyConfiguration": {
    "useApifyProxy": true
  },
  "forceResponseEncoding": false,
  "ignoreSslErrors": true,
  "debugLog": false,
  "useRequestQueue": true,
  "maxRequestRetries": 2,
  "maxConcurrency": 5,
  "pageLoadTimeoutSecs": 120,
  "pageFunctionTimeoutSecs": 120,
  "proxyRotation": "RECOMMENDED",
  "maxPagesPerCrawl": 0,
  "maxResultsPerCrawl": 0,
  "maxCrawlingDepth": 0
}