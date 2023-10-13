const Apify = require('apify');
const Crawlee = require('crawlee');

const { Actor } = Apify;
const { RequestQueue, RequestList, log, KeyValueStore, Dataset, PuppeteerCrawler, CrawlerExtension, ProxyConfiguration } = Crawlee;

Actor.main(async () => {

    const input = await KeyValueStore.getInput();

    const startUrls = input.startUrls.map((req) => {
        req.keepUrlFragment = true;
        return req;
    })

    const requestList = await RequestList.open(null, startUrls)
    const requestQueue = await RequestQueue.open();

    if (!input || !input.startUrls) throw new Error('Input must be a JSON object with the "sources" field!');

    if (input.debugLog) {
        log.setLevel(log.LEVELS.DEBUG);
    }

    async function enqueueRequest(request) {
        return requestQueue.addRequest(request)
    }

    const requestHandler = async ({ request, response, page }) => {
        ;
        const { Manufacturer, Brand, CTINRegex, ExcludedKeyWords, SearchKeyWord } = request.userData;
        var currentPage = 1;
        var products = [];
        //word exclusion variable
        var prohibitedMatch = ExcludedKeyWords ? ExcludedKeyWords || "" : null;

        await page.waitForSelector('section.catalog-grid', { timeout: 0 });
        var body = {
            "filters": [{
                "type": "brands",
                "value": `${Brand.toUpperCase()}`,
                "key": "brand.keyword"
            }],
            "term": `${SearchKeyWord || Brand.toLowerCase()}`,
            "perpage": 24,
            "page": 1,
            "sessionkey": "",
            "sort": "score"
        }

        if (Manufacturer == `Philips`) {
            body.filters[0].value = [
                `${Brand != 'Philips' ? Brand.toUpperCase() : undefined}`,
                "PHILIPS",
                `PHILIPS ${Brand != 'Philips' ? Brand.toUpperCase() : 'AUDIO'}`
            ]
        }


        var stringifiedBody = JSON.stringify(body);
        var apiUrl = "https://simple.ripley.cl/api/v2/search";

        const makeAPIRequest = async (apiUrl, stringifiedBody) => {
            const data = await page.evaluate(async (apiUrl, stringifiedBody) => {
                const url = apiUrl;
                const response = await fetch(url, {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "accept-language": "en-US,en;q=0.9",
                        "cache-control": "no-cache",
                        "content-type": "application/json",
                        "dpr": "1"
                    },
                    "body": stringifiedBody,
                    "method": "POST"
                });

                const jsonData = response.json();
                return (jsonData);
            }, apiUrl, stringifiedBody)

            return (data);
        }

        let data = await makeAPIRequest(apiUrl, stringifiedBody);
        log.info(`${Brand} TOTAL PRODUCTS: ${data.totalHits}`);
        log.info(`${Brand} TOTAL ITERATIONS: ${data.nbPages}`);

        while (currentPage <= data.nbPages) {
            for (var productNode of data.products) {

                var productName = productNode.name.replace(/<br>/ig, ' ').replace(/\s\s+/g, ' ').trim();
                var productId = productNode.partNumber;
                var productUrl = productNode.url;
                var brand = productNode.manufacturer;

                var brandRegex = new RegExp(`${Brand.substr(0, Brand.Length / 2)}.*?${Brand.substr(Brand.length / 2, Brand.length - Brand.length / 2)}`, 'i');

                var brandVerificator = brandRegex.test(brand)
                if (Brand.toUpperCase() != 'TEKA') {
                    brandVerificator = brandRegex.test(brand) ? brandRegex.test(brand) : brandRegex.test(productName);
                }

                if (!brandVerificator) {
                    log.info(`${brand} Excluded the brand: ${productName}`);
                } else {

                    var testKeyword = new RegExp(prohibitedMatch, 'i').test(productName.toUpperCase());
                    if (testKeyword && ExcludedKeyWords) {
                        log.info(`${brand} Excluded the product: ${productName}`)
                        var excludedProduct = {
                            Handled: true,
                            Message: `Product excluded: ${productName}`,
                            Url: productUrl
                        }
                        products.push(excludedProduct);

                    } else {
                        var productNameTest = productName.match(/\+/) ? productName.toUpperCase().split('+')[0] : productName.toUpperCase();

                        var eanCodeNode = productNode.attributes.find(item => item.name === "EAN");
                        var eanCode = eanCodeNode ? `${eanCodeNode.value}` : undefined;
                        //CTIN code added            
                        if (CTINRegex) {
                            var regex = new RegExp(CTINRegex, "gi");
                            var match = regex.exec(productNameTest);
                            var ctinCode = match && match[0].length > 4 ? match[0] : undefined;
                        }
                        if (eanCode && eanCode.match(/[A-z]/)) {
                            eanCode = undefined;
                            ctinCode = eanCode;
                        }
                        var imageUri = productNode.fullImage.includes('http') ? decodeURIComponent(productNode.fullImage.replace(/.*(?=http)/, '').replace(/(?=\?).*/, '')) : "https:" + productNode.fullImage;

                        ctinCode = ctinCode !== undefined && Manufacturer === "Philips" ? ctinCode.replace(/\-|_/, "/") : ctinCode;
                        const conditions = ["mirakl", "_1.png"];
                        if (productId == '2000327461636P' || productId == '2000327461377P' || productId == '2000329692663P') {
                            console.log(productNode)
                        }

                        imageUri = conditions.every(el => imageUri.includes(el)) ? 'https://static.ripley.cl/images/no-picture.svg' : imageUri;
                        imageUri = imageUri ? imageUri.split("?")[0].replace(/\s/g, "%20") : imageUri;
                        let stock = productNode.isOutOfStock || productNode.isUnavailable || !productNode.buyable ? "OutOfStock" : "InStock";
                        let offerPrice = productNode.prices.offerPrice;
                        let price = offerPrice ? offerPrice : productNode.prices.listPrice;

                        var product = {
                            ProductId: productId,
                            Manufacturer,
                            ProductName: productName,
                            ProductUrl: productUrl,
                            CTINCode: ctinCode,
                            EANCode: eanCode,
                            ImageUri: imageUri,
                            Stock: stock,
                            Price: Number(price) || 0,
                        }
                        products.push(product);
                    }
                }
            }
            currentPage++;
            log.info(`Going to page ${currentPage} for Brand: ${Brand}`);
            var paginatedBody = stringifiedBody.replace('"page":1', `"page":${currentPage}`);
            data = await makeAPIRequest(apiUrl, paginatedBody)
        }
        await Dataset.pushData(products);
    }

    const preNavigationHooks = [];
    preNavigationHooks.push(async (crawlingContext, gotoOptions) => {
        const { request, page, session } = crawlingContext;



        var includedUrl = request.url

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const url = request.url();

            includedFilters = [
                includedUrl,
                'https://simple.ripley.cl/api/v2/search',
                '.js',
                '.php',
                '.ico',
                '.svg'
            ];

            const shouldAbort = !includedFilters.some((urlPart) => url.includes(urlPart));
            if (shouldAbort) {
                request.abort();
                //  console.log("Aborted: " + url);
            }
            else {
                request.continue()
                // console.log('Not aborted: ' + url);
            };
        });
    });

    const postNavigationHooks = [];
    const SESSION_MAX_USAGE_COUNTS = {
        'UNTIL_FAILURE': 1000,
        'PER_REQUEST': 1,
        'RECOMMENDED': true,
    }

    const proxyConfiguration = await Actor.createProxyConfiguration({
        groups: ['RESIDENTIAL'],
        countryCode: 'CL'
        // countryCode: "MX"
    })

    const puppeteerCrawlerOptions = {
        requestList,
        requestQueue,
        proxyConfiguration: proxyConfiguration, //new ProxyConfiguration(input.proxyConfiguration),
        launchContext: {
            useChrome: true,
            launchOptions: {
                ignoreHTTPSErrors: true,
                headless: true,
                waitUntil: [
                    "networkidle2"
                ]
            }
        },
        preNavigationHooks,
        requestHandler,
        postNavigationHooks,
        maxRequestRetries: 3,
        maxConcurrency: 5,
        requestHandlerTimeoutSecs: 360,
        navigationTimeoutSecs: 360,
        useSessionPool: true,
        persistCookiesPerSession: true,
        sessionPoolOptions: {
            persistStateKeyValueStoreId: input.sessionPoolName ? 'CS-PUPPETEER-SCRAPER-SESSION-STORE' : undefined,
            persistStateKey: input.sessionPoolName,
            sessionOptions: {
                maxUsageCount: SESSION_MAX_USAGE_COUNTS[input.proxyRotation]
            }
        }

    }

    if (input.proxyRotation == 'UNTIL_FAILURE') {
        puppeteerCrawlerOptions.sessionPoolOptions.maxPoolSize = 1;
    }

    const crawler = new PuppeteerCrawler(puppeteerCrawlerOptions);

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');


    // const data = await page.evaluate(() => document.querySelector('*').outerHTML);
    //         log.info(data);
    // if (input.browserLog) page.on('console', (consoleObj) => console.log(consoleObj.text()));

    // gotoOptions.timeout = (input.pageLoadTimeoutSecs) * 1000;
    // gotoOptions.waitUntil = input.waitUntil;
    //	"type": "module",

    if (!Actor.isAtHome()) {
        const dataset = await Dataset.open();
        const mergedDataSet = await dataset.getData();
        await KeyValueStore.setValue('RESULTS', mergedDataSet.items);
    }


});