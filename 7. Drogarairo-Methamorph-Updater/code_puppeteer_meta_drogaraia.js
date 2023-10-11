{
    "browserLog": false,
    "closeCookieModals": false,
    "debugLog": false,
    "downloadCss": false,
    "downloadMedia": false,
    "headless": false,
    "ignoreCorsAndCsp": false,
    "ignoreSslErrors": true,
    "keepUrlFragments": true,
    "maxConcurrency": 1,
    "maxCrawlingDepth": 0,
    "maxPagesPerCrawl": 0,
    "maxRequestRetries": 8,
    "maxResultsPerCrawl": 0,
    "pageFunction": "async function pageFunction(context) {\n    const { page, request, log, enqueueRequest, Apify, json, response, $ } = context;\n\n    const { Manufacturer, StockOnly, Product } = request.userData;\n    if (page) {\n        //await page.waitFor(20000);\n        //await page.waitForSelector('#ctl00_ContentPlaceholder1_SearchTitleH1', { timeout: 0 }) // Propuesta\n\n        let cookies = await page.cookies();\n        if (cookies) {\n            var cookieString = \"\";\n            for (let cookie of cookies) {\n                cookieString += `${cookie.name}=${cookie.value};`;\n            }\n            console.log(cookieString)\n\n            await Apify.setValue(\"cookies\", cookieString);\n\n            let input = await Apify.getInput();\n            input.headers = {\n                \"user-agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36\",\n                \"cookie\": `${cookieString}` \n            }\n            input.preNavigationHooks = '[\\n async (crawlingContext) => {\\n const { page, request, Apify } = crawlingContext;\\n const { OriginalUrl, Index, ProductPage,StockOnly } = request.userData;        //  const { RatingPage } = request.userData;\\n if (!page && !StockOnly) {\\n var cookies = await Apify.getValue(\"cookies\");\\n request.headers = {\\n \"user-agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36\",\\n \"cookie\": `${cookies}`\\n }\\n }\\n }\\n ]'\n            input.maxConcurrency = 5;\n            input.maxRequestRetries = 8;\n            input.additionalMimeTypes = [\"application/json\"];\n            let options = {\n                build: \"version-3\",\n            };\n            log.info('Metamorphing to CHEERIO');\n            await Apify.metamorph('YrQuEkowkNCLdk4j2', input, options);\n        }\n    } else {\n\n        if (response.status == 404) {\n            return {\n                Handled: true,\n                Message: \"404 error\",\n                Url: request.url\n            }\n        }\n\n        if (StockOnly) {\n            Product.Stock = json.data.liveStock[0] ? \"InStock\" : \"OutOfStock\";\n            return Product;\n        }\n\n        async function returnProduct(product) {\n            var body = {\n                \"operationName\": \"liveStock\",\n                \"variables\": {\n                    \"skuList\": product.ProductId\n                },\n                \"query\": \"query liveStock($skuList: [String!]!) {\\n  liveStock(input: {skuList: $skuList}) {\\n    sku\\n    qty\\n    dt\\n    __typename\\n  }\\n}\\n\"\n            }\n            await enqueueRequest({\n                url: \"https://www.drogaraia.com.br/api/next/middlewareGraphql\",\n                method: \"POST\",\n                payload: JSON.stringify(body),\n                headers: {\n                    \"content-type\": \"application/json\"\n                },\n                userData: {\n                    Manufacturer,\n                    StockOnly: true,\n                    Product: product\n                }\n            })\n        }\n        const sellerString = $('div[class^=\"SoldAndDelivered\"] > p').text().trim();\n        var sellerRule = {\n            \"Colgate-Palmolive\": [\"DROGA RAIA\"],\n            \"Galderma\": [\"DROGA RAIA\"]\n        }\n\n        var schema = $('[type=\"application/ld+json\"]:contains(\"@type\": \"Product\")').html();\n        if (schema) {\n            var schemaInfo = JSON.parse(schema);\n\n            var availability = schemaInfo.offers.availability;\n            if (availability !== undefined && availability.includes('Discontinued')) {\n                return {\n                    Handled: \"true\",\n                    Message: \"Product discontinued\",\n                    Url: request.url\n                }\n            }\n\n            var productId = schemaInfo.sku;\n            var productName = schemaInfo.name.toUpperCase().trim();\n            productName = productName.replace(/\\s+/g, ' ');\n\n            var price = (Number.isNaN(schemaInfo.offers.price) ? null : Number(schemaInfo.offers.price))\n\n            var product = {\n                ProductId: productId,\n                Manufacturer,\n                ProductName: productName,\n                ProductUrl: request.url,\n                Price: price,\n            }\n            if (schemaInfo.aggregateRating) {\n                var ratingTag = Number(schemaInfo.aggregateRating.ratingValue).toFixed(1);\n                product.RatingSourceValue = Number(ratingTag);\n                product.RatingType = \"5-Star\";\n                product.ReviewCount = Number(schemaInfo.aggregateRating.reviewCount);\n                product.ReviewLink = request.url + \"#trustvox-reviews\";\n            }\n            // seller rule\n            if (sellerRule[Manufacturer]) {\n                var seller = $('div[class^=\"SoldAndDelivered\"] > p').text().match(/(?<=Vendido(\\s+)?e(\\s+)?entregue(\\s+)?por(\\s+)?).*/)[0].replace(/\\s\\s+/, ' ').trim();\n                if (seller !== undefined && sellerRule[Manufacturer].includes(seller.toUpperCase())) {\n                    returnProduct(product);\n\n                } else if (seller == undefined && sellerString.includes(sellerRule[Manufacturer][0])) {\n                    returnProduct(product);\n\n                } else {\n                    log.info(`Invalid seller: ${request.url}`);\n                    return {\n                        Handled: true,\n                        Message: `Invalid seller: ${seller}`,\n                        Url: request.url\n                    }\n                }\n\n            }\n            else {\n                returnProduct(product);\n            }\n\n        } else {\n            log.error('Could not get product JSON')\n            throw (`Could not get product JSON from: ${request.url}`);\n        }\n    }\n\n}",
    "pageFunctionTimeoutSecs": 120,
    "pageLoadTimeoutSecs": 120,
    "proxyConfiguration": {
        "useApifyProxy": true,
        "apifyProxyGroups": [
            "RESIDENTIAL"
        ],
        "apifyProxyCountry": "BR"
    },
    "proxyRotation": "PER_REQUEST",
    "startUrls": [
        {
            "url": "https://www.drogaraia.com.br/advanced-locao-hidratante-473-ml-cetaphil-605940.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-advanced-moisturizer-pump-creme-hidratante-p-pele-seca-e-sensivel-p-o-corpo-e-rosto-473g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-advanced-moistuzier-locao-hidratante-226ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-facial-noturno-48g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-250g-810950.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-453g-813709.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-avancado-en-tubo-de-226ml-226g-810833.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-corporal-pele-seca-453g-634615.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-facial-pro-ar-calm-control-50g-829410.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-para-areas-extremamente-secas-como-cotovelos-joelhos-e-pes-com-250-g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-para-o-corpo-especifico-para-areas-extremamente-secas-com-453-gramas.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-pele-extremamente-seca-e-sensivel-453g-771751.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-hidratante-pro-ureia-10-60g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-noturno-facial-healthy-renew-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-creme-para-as-maos-healthy-hyginie-1-unidade.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-gel-creme-rapida-absorcao-226g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-gel-creme-rapida-absorcao-453g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-healthy-hygiene-creme-para-as-maos-50ml-771151.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-healthy-hyginie-sabonete-liquido-antisseptico-300ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-hidratante-facial-hialuronico-88ml-627555.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-de-limpeza-120ml-627558.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-de-limpeza-pele-seca-e-sensivel-120ml-628958.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-200ml-627554.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-200ml-810834.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-corporal-200ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-corporal-optimal-hydration-237ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-para-o-corpo-especifico-para-areas-extremamente-secas-473-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-pro-ureia-10-120ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-pro-ureia-10-300ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-rosto-e-corpo-473ml-789005.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            },
            "method": "GET"
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-hidratante-travel-size-59ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-limpeza-de-pele-120-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-limpeza-de-pele-300-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-limpeza-travel-size-59ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-locao-pele-normal-a-seca-hidratante-corporal-473ml-810981.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-optimal-hydration-creme-48g-627560.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-optimal-hydration-creme-facial-48g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-optimal-hydration-serum-hidratante-corporal-spray-207ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-optimal-hydration-serum-hidratante-facial-48h-30ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-optimal-hydration-serum-renovador-para-a-area-dos-olhos-15ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ac-control-espuma-de-limpeza-236ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ac-control-locao-hidratante-118ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ad-fast-control-espuma-hidratante-100ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ad-restoraderm-creme-reparador-227g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ad-restoraderm-locao-hidratante-145ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ar-calm-control-espuma-de-limpeza-236ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ar-calm-creme-hidratante-facial-fps30-com-cor.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ar-calm-creme-hidratante-facial-noite-50g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-pro-ureia-10-locao-hidratante-300ml-828305.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-restoraderm-hidratante-para-peles-sensiveis-inclusive-pacientes-atopicos-295ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-restoraderm-locao-hidratante-295ml-605917.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-restoraderm-pro-ad-control-sabonete-liquido-295ml-810810.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-restoraderm-sabonete-liquido-para-peles-sensiveis-e-sensibilizadas-295ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sabonete-barra-pele-seca-127grs-747306.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sabonete-limpeza-profunda-127g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sabonete-liquido-antisseptico-237ml-810831.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sabonete-liquido-para-pele-oleosa-300ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sabonete-pele-sensivel-127g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-serum-facial-healthy-renew-30g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-serum-olhos-healthy-renew-15g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-solucao-micelar-healthy-renew-160ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sun-ligth-fluid-fps-60-com-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sun-ligth-fluid-fps-60-com-cor-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sun-protetor-solar-com-cor-fps-70-ultra-matte-oil-control-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sun-protetor-solar-fps-50-pele-sensivel-150ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/cetaphil-sun-protetor-solar-fps-70-ultra-matte-oil-control-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-facial-noturno-cetaphil-healthy-renew-50g-764877.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-facial-optimal-hydration-48g-cetaphil-829406.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-hidratante-453g-cetaphil-842126.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-hidratante-cetaphil-453g-631668.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-hidratante-facial-noturno-cetaphil-48g-627553.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-hidratante-para-os-pes-cetaphil-pro-ureia-10-60g-823872.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-hidratante-restaurador-para-os-pes-cetaphil-pro-ureia-10-com-60g-810914.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-protetor-para-as-maos-cetaphil-healthy-hygiene-50ml-810809.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-benzac-10-gel-de-tratamento-antiacne-60g-810778.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-benzac-oil-control-hidratante-matificante-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-control-foam-espuma-higienizacao-refrescante-para-pele-muito-oleosa-130-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-control-sabonete-barra-p-pele-muito-oleosa-90g-810789.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-control-sabonete-em-barra-90g-760057.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-control-sabonete-em-barra-para-peles-oleosas-90g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-control-sabonete-liquido-300ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-control-sabonete-liquido-higienizacao-refrescante-para-pele-muito-oleosa-120-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-foam-original-para-pele-mista-com-130ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-gel-creme-benzac-oil-control-microbioma-equilibrado-50ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-gel-tratamento-anti-acne-15g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-liquido-embalagem-pump-original-para-pele-mista-com-300ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-oil-control-pele-oleosa-com-120ml-galderma-xxxxxxxxxxxxxxxxxxxxxxxxx-629189.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-oil-control-sabonete-em-espuma-130ml-810946.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-oil-control-sabonete-liquido-120ml-810948.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-oil-control-sabonete-liquido-70ml-810783.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-foam-espuma-de-limpeza-facial-130ml-810781.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-pele-mista-sabonete-liquido-facial-300ml-808353.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-sab-liq-facial-pele-oleosa-mista-120ml-808350.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-sabonete-facial-em-barra-pele-mista-a-oleosa-com-90g-628762.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-sabonete-liquido-120ml-galderma-628764.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-sabonete-liquido-300g-631160.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-sabonete-liquido-300ml-760056.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-original-sabonete-liquido-70ml-810949.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-antisep-tico-soft-para-pele-normal-ou-seca-90g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-barra-original-para-pele-acneica-oleosa-ou-mista-90g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-benzac-oil-control-cleanser-70ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-control-70ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-facial-original-para-peles-normais-e-mistas-com-120ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-original-70ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-pele-seca-ou-sensibilizada-120ml-830734.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-salix-70ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-liquido-soft-70ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-salix-higienizador-para-pele-oleosa-ou-com-acne-90g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-sabonete-scrub-abrasivo-pele-com-acene-e-cravos-60g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-salix-sabonete-liquido-120ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-salix-sabonete-liquido-300-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-salix-sabonete-liquido-70ml-810947.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-salix-sabonete-liquido-para-pele-acneica-300ml-808354.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-salix-sabonete-para-pele-oleosa-e-acneica-130ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-scrub-esfoliante-facial-60g-813651.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-soft-higienizador-para-peles-normais-ou-secas-130ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-soft-sabonete-em-espuma-130ml-810945.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-soft-sabonete-liquido-300ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-soft-sabonete-liquido-70ml-810782.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/dermotivin-soft-sabonete-liquido-para-peles-normais-ou-secas-120ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-cetaphil-pro-ac-control-236ml-627559.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-cetaphil-pro-ar-calm-control-236ml-828302.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-facial-cetaphil-pro-ac-control-236ml-797132.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-facial-cetaphil-suave.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-facial-para-acne-salix-130ml-dermotivin-808352.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-facial-suave-cetaphil-236ml-810806.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/espuma-de-limpeza-pro-ac-control-236ml-cetaphil-813714.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-advanced-moisturizer-226g-685684.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-advanced-moisturizer-226g-760190.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-advanced-moisturizer-473ml-687353.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-advanced-moisturizer-473ml-840879.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-creme-facial-noturno-48g-val-07-2023-791183.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-creme-hidratante-453g-686180.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-creme-hidratante-453g-760222.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-espuma-de-limpeza-suave-236ml-738679.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-espuma-de-limpeza-suave-236ml-760214.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-gel-creme-rapida-absorcao-226g-760235.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-gel-creme-rapida-absorcao-453g-760236.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-healthy-hygiene-creme-maos-50ml-822052.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-healthy-hygiene-sabonete-antisseptico-237ml-790768.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-de-limpeza-120ml-685634.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-de-limpeza-120ml-760187.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-hidratante-473g-686229.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-hidratante-473g-760223.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-hidratante-facial-com-acido-hialuronico-88ml-644704.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-hidratante-facial-com-acido-hialuronico-88ml-686079.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-locao-hidratante-facial-com-acido-hialuronico-88ml-791062.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-creme-facial-48g-791275.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-hydration-serum-hidratante-corporal-spray-207ml-790805.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-locao-hidratante-corporal-237ml-738684.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-locao-hidratante-corporal-237ml-738686.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-locao-hidratante-corporal-237ml-790806.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-serum-facial-30ml-791274.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-optimal-serum-renovador-para-olhos-15ml-822056.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ac-control-espuma-de-limpeza-facial-236ml-822049.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ac-control-espuma-de-limpeza-facial-236ml-822050.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ac-control-espuma-de-limpeza-facial-236ml-822053.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ac-control-locao-hidratante-fps30-118ml-760213.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ac-control-locao-hidratante-fps30-118ml-791049.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-fast-control-espuma-hidratante-100ml-822059.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-restoraderm-locao-hidratante-295ml-687437.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-restoraderm-locao-hidratante-295ml-760257.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-restoraderm-locao-hidratante-295ml-790834.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-restoraderm-sabonete-liquido-295ml-646463.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-restoraderm-sabonete-liquido-295ml-688134.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ad-restoraderm-sabonete-liquido-295ml-790835.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ar-calm-control-creme-hidratante-facial-50ml-791288.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ar-calm-control-creme-hidratante-facial-fps-30-com-cor-50ml-791286.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ar-calm-control-espuma-de-limpeza-236ml-738687.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ar-calm-control-espuma-de-limpeza-236ml-760233.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ureia-10-creme-hidratante-para-os-pes-60g-688222.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ureia-10-creme-hidratante-para-os-pes-60g-688235.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ureia-10-creme-hidratante-para-os-pes-60g-803460.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ureia-10-locao-hidratante-120ml-760234.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ureia-10-locao-hidratante-300ml-764450.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-pro-ureia-10-locao-hidratante-300ml-822058.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-em-barra-limpeza-profunda-127g-644669.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-em-barra-limpeza-profunda-127g-686064.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-em-barra-limpeza-profunda-127g-790738.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-em-barra-limpeza-suave-127g-790722.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-liquido-300ml-644383.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-liquido-300ml-685758.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sabonete-liquido-300ml-840878.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-fps70-com-cor-pele-oleosa-50ml-760197.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-fps70-com-cor-pele-oleosa-50ml-790883.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-fps70-pele-oleosa-50ml-786306.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-fps70-pele-oleosa-50ml-786307.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-fps70-pele-oleosa-50ml-791572.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-light-fluid-antioxidante-fps60-50ml-760199.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-light-fluid-antioxidante-fps60-50ml-790953.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-light-fluid-com-cor-fps60-50ml-760201.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-light-fluid-com-cor-fps60-50ml-790955.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-locao-lipossomal-pele-sensivel-fps50-150ml-686065.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-spray-locao-lipossomal-fps-30-150ml-687967.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-spray-locao-lipossomal-fps-30-150ml-760217.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-cetaphil-sun-spray-locao-lipossomal-fps-30-150ml-791063.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-benzac-microbioma-gel-creme-50ml-760237.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-benzac-oil-control-hidratante-matificante-50ml-760226.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-benzac-sabonete-liquido-70ml-786314.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-benzac-sabonete-liquido-70ml-804009.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-control-barra-90g-760260.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-control-sabonete-liquido-120ml-765108.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-original-barra-90g-685640.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-original-barra-90g-760188.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-original-foam-130ml-760186.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-original-sabonete-liquido-120ml-645032.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-barra-90g-822046.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-barra-90g-822048.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-foam-130ml-760258.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-sabonete-liquido-120ml-790778.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-sabonete-liquido-300ml-822051.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-sabonete-liquido-70ml-688195.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-sabonete-liquido-70ml-688206.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-salix-sabonete-liquido-70ml-790769.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-scrub-60g-738672.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-scrub-60g-760259.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-soft-foam-130ml-738664.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-soft-foam-130ml-760250.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-soft-sabonete-liquido-120ml-804015.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-soft-sabonete-liquido-70ml-687955.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/galderma-dermotivin-soft-sabonete-liquido-pump-300ml-804008.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/gel-creme-calmante-rapida-absorcao-226g-810832.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/gel-creme-hidratante-de-rapido-de-absorcao-cetaphil-453g-810951.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/gel-creme-hidratante-dermotivin-benzac-oil-control-50ml-810779.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/hidratante-facial-cetaphil-pro-ar-calm-control-50ml-617736.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-cetaphil-473ml-631667.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-cetaphil-advanced-moisturize-226g-627552.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-cetaphil-advanced-moisturize-226g-797133.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-cetaphil-corpo-e-rosto-473ml-630953.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-cetaphil-pro-ad-control-restoraderm-295ml-830340.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-cetaphil-pro-ad-control-restoraderm-com-295ml-678651.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-corporal-cetaphil-optimal-hydration-237ml-647849.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-corporal-cetaphil-optimal-hydration-237ml-828300.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-corporal-cetaphil-pro-ad-restoraderm-295ml-760062.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-facial-cetaphil-rosto-e-corpo-com-acido-hialuronico.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/locao-hidratante-facial-com-acido-hialuronico-88ml-cetaphil-810805.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protetor-cetaphil-light-fluid-antioxidante-sun-fps-60-50m-822522.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protetor-solar-cetaphil-sun-fps70-50ml-627556.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-dermotivin-soft-liquido-300ml-813242.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-em-barra-cetaphil-limpeza-profunda-127g-631658.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-em-barra-dermotivin-salix-90g-810780.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-facial-em-barra-dermotivin-original-pele-mista-a-oleosa-com-90g-631519.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-facial-em-espuma-dermotivin-original-pele-mista-a-oleosa-com-130ml-765455.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-antisseptico-maos-cetaphil-healthy-hygiene-237ml-760041.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-corporal-cetaphil-pro-ad-restoraderm-295ml-765347.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-dermotivin-oil-control-300ml-813243.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-dermotivin-salix-120ml-760068.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-facial-dermotivin-salix-pele-oleosa-e-acneica-70ml-722220.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-area-dos-olhos-optimal-hydration-15ml-cetaphil-810804.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-cetaphil-optimal-30ml-627557.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-facial-cetaphil-healthy-renew-30ml-771154.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-hidratante-corporal-optimal-hydration-spray-207ml-810811.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-hidratante-facial-cetaphil-optimal-hydration-48h-30ml-630869.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-hidratante-facial-optimal-hydration-48h-30ml-cetaphil-817299.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/serum-para-os-olhos-cetaphil-healthy-renew-15g-771158.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/soapex-1-sabonete-80-g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/soapex-1-sabonete-liquido-facial-corporal-com-acao-antisseptica-com-120ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/soapex-sabonete-80-g.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/soapex-sabonete-liquido-cremoso-120-ml.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/solucao-micelar-healthy-renew-tripla-acao-160ml-cetaphil-810808.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/solucao-micelar-tripla-acao-cetaphil-healthy-renew-160ml-764878.html",
            "userData": {
                "Manufacturer": "Galderma",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-antisseptico-bucal-orthogard-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-crem-dental-natural-extracts-carvao-ativado-e-menta-3-unidades-de-90g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-branqueador-luminous-white-lovers-cafe-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-branqueador-luminous-white-lovers-vinho-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-com-fluor-total-12-gengiva-saudavel-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-dare-to-love-130g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-70g-leve-3-pague-2.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-advanced-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-brilhante-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-carvao-ativado-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-carvao-ativado-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-glow-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-luminous-white-instant-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-maxima-protecao-anticaries-neutracucar-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-mpa-maxima-protecao-anti-caries-menta-50-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-mpa-neutraucar-70-gr-leve-3-pague-2.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-my-first-sem-fluor-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-naturals-defesa-reforcada-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-naturals-detox-oleo-de-coco-e-gengibre-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-naturals-extracts-defesa-reforcada-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-naturals-extracts-purificante-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-naturals-extracts-purificante-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-orthogard-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-periogard-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-renew-anti-aging-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-branqueador-100g-706650.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-alivio-50g-leve-3-pague-2.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-alivio-imediato-extreme-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-alivio-imediato-gengiva-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-alivio-imediato-original-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-alivio-imediato-original-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-alivio-repara-esmalte-110-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-pro-relief-white-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-repara-completa-110g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-repara-completa-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-sensitive-repara-esmalte-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-tandy-morango-2-unidades-de-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-advanced-fresh-gel-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-anti-tartaro-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-clean-mint-140g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-clean-mint-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-clean-mint-90g-leve-4-pague-3.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-gum-helth-com-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-professional-whitening-70-gr.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-reparacao-diaria-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-total-12-saude-visivel-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-creme-dental-tripla-acao-90-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-anti-tartaro-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-anti-tartaro-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-luminous-white-carvao-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-luminous-white-xd-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-periogard-extra-mint-sem-alcool-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-plax-fresh-mint-750ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-bucal-plax-ice-glacial-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguante-serum-bucal-colgate-renew-anti-aging-120ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguatorio-bucal-natural-extract-carvao-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguatorio-bucal-natural-extract-citrus-1000ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguatorio-bucal-natural-extract-citrus-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguatorio-bucal-natural-extracts-citrus-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguatorio-bucal-total-12-clean-mint-spray-60ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-enxaguatorio-bucal-total-12-gengiva-reforcada-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-360-black-leve-2-pague-1.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-360-luminous-3-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-360-luminous-white-leve-2-pague-1.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-bamboo.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-classic-clean-3-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-classic-longa-macia.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-classic-longa-media.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-eletrica-refil-kids-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-extra-clean-media-leve-3-pague-2.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-gengiva-comfort-com-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-gengiva-therapy-com-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-gengiva-therapy-com-3-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-gum-therapy-charcoal-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-infantil-extra-suave-e-macia-teen-titans-go-6-ou-mais-anos-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-interdental-retpack-02-mm.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-orthogard-com-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-periogard-extra-macia-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-philips-sonicare-kids-1unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-pro-cuidado-macia-com-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-pro-cuidado-macia-com-4-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-pro-planet-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-refil-infinity-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-renew-anti-aging-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-slimsoft-advanced-creme-dental-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-slim-soft-black-com-3-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-slim-soft-black-leve-2-pague-1.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-slim-soft-cabeca-ultra-limpeza-profunda-e-delicada-leve-2-pague-1.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-smiles-0-2-anos-extra-macia-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-smiles-6-batman-mulher-mararavilha-com-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-twister-cabo-ultra-compacta-leve-3-pague-2.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-ultra-soft.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-ultra-soft-com-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-ultra-soft-com-3-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-whitening-leve-2-pague-1.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-escova-dental-zig-zag-carvao-4-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-espuma-bucal-colgate-renew-anti-aging-48ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-fio-dental-sabor-menta-50-metros.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-kids-zero-3-a-24-meses-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-kids-zero-morango-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-natural-extracts-curcuma-e-hortela-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-smiles-justice-league-100g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-smiles-minions-100g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-teen-titans-60g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-transparente-zero-hortel-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-gel-dental-transparente-zero-menta-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kids-gel-dental-agnes-e-fluffy-60g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kids-gel-dental-colgate-tandy-morango-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kids-gel-dental-colgate-tandy-tutti-frutti-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kids-gel-dental-minions-2-unidades-de-60g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kids-gel-dental-tandy-leve-3-pague-2-com-50g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-2-creme-dental-total-12-clean-mint-90g-com-50-desconto-na-segunda-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-2-escova-dental-smiles-agnes-e-fluffy-2-a-5-anos.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-2-escova-dental-smiles-agnes-e-fluffy-6-ou-mais-anos.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-2-escova-dental-smiles-minions-6-ou-mais-anos.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-creme-dental-total-12-anti-tartaro-6-unidades-90g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-creme-dental-total-12-clean-mint-2-unidades-140g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-escova-dental-360-graus-sensivite-pro-alivio-com-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-escova-dental-minions-gel-dental-minions-100g-preco-especial.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-escova-dental-slim-soft-advanced-3-pack.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-escova-dental-slim-soft-advanced-com-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-escova-dental-slim-soft-black-4-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-escova-interdental-4-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-luminous-white-enxaguante-bucal-com-500ml-gratis-creme-dental-luminous-white-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-kit-viagem-creme-dental-escova-dental-enxaguante-bucal-60ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-luminous-white-creme-dental-3-com-90g-gratis-enxaguante-luminous-white-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-luminous-white-enxaguante-bucal-com-500-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-natural-extracts-creme-dental-carvao-ativado-90g-704826.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-philips-electric-tooth-brusch-s50-refil-deep-clean.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-philips-electric-tooth-brusch-s50-refil-whitening.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-philips-electric-tooth-brusch-series-10-single.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-philips-electric-tooth-brusch-series-30-single.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-philips-electric-tooth-brusch-series-50-single.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-philips-electric-tooth-brusch-series-70-single.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-plax-enxaguante-bucal-minions-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-plax-ice-enxaguante-bucal-infinity-leve-500-pague-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-sensitive-creme-dental-pro-alivio-imediato-original-leve-3-pague-2-90g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-sensitive-enxaguante-bucal-pro-alivio-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-sensitive-pro-alivio-creme-dental-branqueador-110-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-sensitive-pro-alivio-creme-dental-branqueador-110-g-gratis-colgate-total-12-clean.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-sensitive-pro-alivio-creme-dental-branqueador-50-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-sensitive-pro-alivio-regular-creme-dental-110gr.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-tandy-gel-dental-infantil-chiclete-70g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-creme-dental-clear-mint-4x90g-706646.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-enxaguante-bucal-clean-mint-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-enxaguante-bucal-clean-mint-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-enxaguante-bucal-clean-mint-500ml-gratis-creme-dental-total-12-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-enxaguante-bucal-clean-minte-com-1-litro.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-enxaguante-bucal-halito-saudavel-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-enxaguante-bucal-halito-saudavel-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-12-whitening-creme-dental-90g-704663.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-total-fita-dental-25-metros.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-tripla-acao-creme-dental-xtra-fresh-70g-699138.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colgate-tripla-acao-l180p1-40g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colg-plax-enxaguatorio-bucal-ice-fusion-2000ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colg-plax-enxaguatorio-bucal-soft-mint-2000ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/colg-total-12-enxaguatorio-bucal-clean-mint-2000ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-luminous-white-carvao-ativado-70g-819860.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-maxima-protecao-anticaries-180g-promo-tamanho-familia-180g-656052.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-maxima-protecao-anticaries-90g-661622.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-sensitive-pro-alivio-50gr-819878.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-sensitive-pro-alivio-imediato-gengivas-60g-657023.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-total-12-advan-fres-90-632623.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-total-12-carvao-ativado-90g-738134.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-colgate-total-12-carvao-ativado-90g-747949.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/creme-dental-para-dentes-sensiveis-colgate-sensitive-pro-alivio-original-60g-702946.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-creme-dental-anticaries-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-creme-dental-sensitive-110g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-creme-dental-sensitive-professional-75g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-creme-dental-sensitive-whitening-110g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-enxaguante-bucal-anticaries-400ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-enxaguante-bucal-sensitive-400ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-escova-dental-sensitive-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-escova-dental-ultra-soft-1-unidade.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-escova-dental-ultra-soft-2-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-escova-dental-ultra-soft-macia-suave-com-3-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/elmex-fio-dental-30-metros.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/enxaguante-bucal-colgate-total-12-anti-tartaro-250ml-638505.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/escova-de-dentes-classic-clean-media-colgate-821370.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/escova-dental-colgate-luminous-white-advanced-360.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/kit-colgate-tandy-volta-as-aulas-escova-dental-gel-dental.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-antiqueda-shampoo-anticaspa-350ml-704660.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-ceramidas-shampoo-350ml-704662.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-condicionador-cabelo-cacheado-kids-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-condicionador-naturals-kids-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-creme-de-pentear-naturals-kids-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-maciez-prolongada-shampoo-350ml-699130.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-naturals-cuidado-absoluto-shampoo-350ml-699110.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-neutro-shampoo-350ml-699131.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-nutri-milk-sabonete-liquido-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-oleo-nutritivo-sabonete-250ml-707667.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-pretos-shampoo-350ml-781383.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-reparacao-completa-shampoo-350ml-706655.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-barra-natureza-secreta-castanha-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-barra-natureza-secreta-ucuuba-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-barra-sensacao-purificante-carvao-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-barra-sensacao-purificante-carvao-com-6-unidades-85g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-barra-suave-kids-minions-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-liquido-kids-220ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-liquido-natureza-secreta-ucuuba-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-liquido-nutri-milk-200ml-refil.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-liquido-refil-kids-minions-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-liquido-refil-naturals-suavidade-delicada-jasmim-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-sabonete-liquido-refil-natureza-secreta-castanha-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-shampoo-kids-cabelo-cacheado-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/palmolive-turmalina-sabonete-250ml-699101.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/pasta-de-dente-elmex-sensitive-em-creme-110g-elmex-824710.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/periogard-antiseptico-bucal-sem-alcool-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/periogard-enxaguatorio-bucal-antisseptico-colgate-uso-diario-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/periogard-solucao-bucal-250ml-sem-alcool-747254.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-antiseptico-bucal-tutti-frutti-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-anti-septico-fresh-mint-leve-1000-ml-pague-700-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-colgate-total-antiseptico-bucal-fresh-mint-60ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguante-bucal-ice-fusion-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguante-bucal-ice-fusion-clear-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguante-bucal-sem-alcool-odor-control-500ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguante-bucal-sem-alcool-odor-control-750ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguatorio-bucal-ice-leve-500-pague-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguatorio-classic-leve-500-pague-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguatorio-mint-leve-500-pague-350-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-enxaguatorio-mint-leve-500-pague-350-ml-com-preco-promocional.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-ice-enxaguante-bucal-infinity-500-ml-1-99-leve-plax-ice-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-soft-mint-enxaguatorio-bucal-sem-alcool-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/plax-soft-mint-enxaguatorio-bucal-sem-alcool-leve-500-pague-350ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-agua-micelar-city-detox-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-anti-cravos-esfoliante-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-anti-cravos-sabonete-facial-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-body-lotion-delicate-prot-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-lenco-umedecido-wipes-48-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-refil-sabonete-liquido-infantil-glicerina-natural-180ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-refil-sabonete-liquido-infantil-glicerina-natural-380ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-barra-protecao-delicada-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-em-barra-infantil-glicerina-natural-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-liquido-infantil-glicerina-natural-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-liquido-infantil-glicerina-natural-400ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-liquido-shower-gel-delicate-head-to-toe-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-liquido-shower-gel-delicate-protec-refil-180ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-liquido-shower-gel-delicate-protec-refil-380ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-baby-sabonete-liquido-shower-gel-dlicate-protection-400ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-daily-hidratante-facial-50ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-esfoliante-facial-city-detox-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-kit-sabonete-em-barra-antibacteriano-duo-protect-cartucho-510g-leve-6-unidades-pague-menos-cada-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-kit-sabonete-em-barra-limpeza-profunda-8-unidades-85g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-kit-sabonete-em-barra-omega-3-8-unidades-85g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-kit-sabonete-em-barra-vitamina-e-8-unidades-85g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-kit-sabonete-liquido-intimo-delicate-care-2-unidades-de-200ml-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-lenco-umedecido-city-detox-25-unidades.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-men-sport-sabonete-85g-706639.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-oil-control-sabonete-facial-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-pro-hidrata-argan-refil-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-refil-sabonete-liquido-limpeza-profunda-900ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-refil-sabonete-liquido-vitamina-e-900ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-antibacteriano-aveia-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-antibacteriano-aveia-90g-leve-6-pague-5.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-anti-cravos-facial-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-cream-90-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-antibacteriano-duo-protect-cartucho-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-carvao-detox-6x85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-carvao-detox-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-defesa-80g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidrata-90g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidrata-90g-leve-6-pague-5.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidrata-amendoa-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidrata-argan-3-unidades-85g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidrata-argan-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidratacao-80g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-hidrata-oliva-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-regeneracao-4-unidades-de-80g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-regeneracao-80g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-pro-tatoo-80g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-vitamina-e-90-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-em-barra-vitamina-e-90-g-leve-6-pague-5.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-erva-doce-85-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-facial-city-detox-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-intimo-em-barra-delicate-care-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-intimo-em-barra-fresh-equilibrium-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-intimo-fresh-leve-200-ml-pague-150-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-limpeza-profunda-200g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-limpeza-profunda-90-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-limpeza-profunda-90-g-leve-6-pague-5.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-limpeza-profunda-anti-espinhas-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-antibacteriano-para-as-maos-duo-protect-frasco-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-antibacteriano-para-as-maos-duo-protect-frasco-400ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-antibacteriano-para-as-maos-limpeza-profunda-220ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-antibacteriano-para-as-maos-vitamina-e-220ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-balanceador-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-balance-refil-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-carvao-detox-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-cream-650ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-cuidado-intimo-delicate-care-leve-200ml-pague-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-erva-doce-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-erva-doce-pump-400ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-erva-doce-refil-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-facial-city-detox-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-higienizador-spray-antibac-para-as-maos-duo-protect-frasco-300ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-intimo-delicate-care-40ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-intimo-delicate-care-refil-140ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-intimo-soft-floral-leve-200ml-pague-150ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-limpeza-profunda-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-men-sport-650ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-men-triple-action-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-hidrata-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-hidrata-amendoa-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-hidrata-argan-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-hidratacao-230ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-hidrata-refil-200ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-regeneracao-230ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-pro-tatoo-230ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-vitamina-e-200-ml-refil.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-vitamina-e-250-ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-liquido-vitamina-e-650ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-men-energy-90-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-men-triple-action-90-g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-oil-control-85g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-omega-3-leve-mais-pague-menos-com-6-unidades-85g-cada.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-sabonete-vitamina-e-200g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/protex-spray-aerosol-corporal-antibac-duo-protect-185ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-em-barra-protex-erva-doce.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-em-barra-protex-nutri-protect-macadamia-85g-631649.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-antibacteriano-para-as-maos-protex-erva-doce-400ml-647778.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-palmolive-luminous-oil-abacate-e-iris-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-palmolive-luminous-oil-figo-e-orquidea-250ml.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-liquido-protex-limpeza-profunda-250ml-816983.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/sabonete-protex-balance-saudvel-90g-leve-6-pague-5.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.drogaraia.com.br/tandy-creme-dental-em-gel-uva-50g.html",
            "userData": {
                "Manufacturer": "Colgate-Palmolive",
                "ApifyResultType": 0
            },
            "method": "GET"
        }
    ],
    "useChrome": true,
    "waitUntil": [
        "networkidle2"
    ]
}