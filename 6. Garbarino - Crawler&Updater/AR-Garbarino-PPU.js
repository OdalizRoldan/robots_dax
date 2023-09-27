{
  "startUrls": [
    {
      "url": "https://www.garbarino.com/monitor-philips-24--lcd-fullhd-vga-dvi-d-hdmi-243v5lhsb-55-1173/p",
      "userData": {
        "Manufacturer": "Spectrum"
      }
    },
    {
      "url": "https://www.garbarino.com/plancha-para-el-pelo-philips-essential-hp8325-10-5868/p",
      "method": "GET",
      "userData": {
        "Manufacturer": "Spectrum"
      }
    },
    {
      "url": "https://www.garbarino.com/pack-de-4-pilas-alcalinas-aaa-philips-5110/p",
      "method": "GET",
      "userData": {
        "Manufacturer": "Spectrum"
      }
    },
    {
      "url": "https://www.garbarino.com/MLA-1135465067-_JM"
    },
    {
      "url": "https://www.garbarino.com/smart-tv-4k-uhd-55--philips-7400-55pud7406-77-hdr-android---soporte-de-pared-7266/p"
    },
    {
      "url": "https://www.garbarino.com/parlante-portatil-philips-para-fiestas-tanx20-77-91/p"
    },
    {
      "url": "https://www.garbarino.com/parlante-waterproof-philips-1000-series-tas1505b-00-448/p"
    }
  ],
  "keepUrlFragments": false,
  "pageFunction": "async function pageFunction(context) {\n    const { $, request, response, } = context;\n    const { Manufacturer } = request.userData;\n\n    /**\n     * Change notes:\n     * - Widespread changes on retailer site.\n     * - Most data is now retrieved from a Schema json file.\n     * - No sign of previous ID format. Now using product url as ID (minus domain)\n     * - No sign of variants on the website. Previous process to retrieve data from each one through\n     * an API call has been removed. No sign of previous API call can be found to be in use either.\n     * - Reviews and ratings are also missing from the site. Previous code to retrieve them has been\n     * removed.\n     * - Now avoiding deestrucuration of userData.\n     */\n\n    var errorMessage = $('h4[class*=\"title-not-found\"]').text();\n\n    if (response.status == 404 || errorMessage.includes('encontraron')) {\n        return {\n            Handled: true,\n            Message: `404 error`,\n            Url: request.url\n        }\n    }\n\n    //var domain = \"https://www.garbarino.com\";\n    \n    function getProductJsonSchema() {\n        var filteredScript = $('script[type=\"application/ld+json\"]').toArray().filter(s => $(s).html().includes('\"@type\":\"Product\"'));\n        var json = JSON.parse($(filteredScript).html().replace(/[\\r\\n]/g, ' ').trim());\n        if (json == null) {\n            throw 'Redirected because of website product page not working correctly!'\n        }\n        return json;\n    }\n\n    var productJson = getProductJsonSchema();\n\n    var price = null;\n    var stock = \"OutOfStock\";\n    if (productJson.offers.offerCount > 0) {\n        price = productJson.offers.lowPrice;\n        for (var i = 0; i < productJson.offers.offers.length; i++) {\n            if (stock == \"OutOfStock\") { // If at least one offer is InStock, it stays like that\n                var availability = productJson.offers.offers[i].availability;\n                if (availability.includes('Discontinued')) {\n                    return {\n                        Handled: true,\n                        Message: `Product discontinued`,\n                        Url: request.url\n                    }\n                }\n                //stock = (availability == \"http://schema.org/OutOfStock\" || availability == \"http://schema.org/SoldOut\" || availability == \"http://schema.org/InStoreOnly\" ? \"OutOfStock\" : \"InStock\");\n                stock = availability.match(/OutOfStock|SoldOut|InStoreOnly/i) ? 'OutOfStock' : 'InStock';\n            }\n        }\n    }\n\n    var productName = productJson.name.replace(/&quot;/g, '\"');\n    var id = productJson.mpn;\n\n    var product = {\n        ProductId: id,\n        Manufacturer: Manufacturer,\n        ProductName: productName,\n        ProductUrl: request.url,\n        Price: price,\n        Stock: stock\n    }\n\n    return product;\n}",
  "proxyConfiguration": {
    "useApifyProxy": true
  },
  "forceResponseEncoding": false,
  "ignoreSslErrors": true,
  "debugLog": false,
  "maxRequestRetries": 2,
  "maxConcurrency": 5,
  "pageLoadTimeoutSecs": 120,
  "pageFunctionTimeoutSecs": 120
}