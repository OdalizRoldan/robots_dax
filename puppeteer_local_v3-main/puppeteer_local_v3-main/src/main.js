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

    const requestHandler = async ({ request, response, page, log, enqueueRequest }) => {
        ;
        const { Manufacturer, Brand, CTINRegex, ExcludedKeyWords, SearchKeyWord } = request.userData;
        await page.waitForSelector('.Searchstyles__SearchStyles-wxhijf-0 cYEghG', { timeout: 0 });
        console.log("Entré a la página");
    }

    const preNavigationHooks = [];
    preNavigationHooks.push(async (crawlingContext, gotoOptions) => {
        const { request, page, session } = crawlingContext;



    });

    const postNavigationHooks = [];
    const SESSION_MAX_USAGE_COUNTS = {
        'UNTIL_FAILURE': 1000,
        'PER_REQUEST': 1,
        'RECOMMENDED': true,
    }

    // const proxyConfiguration = await Actor.createProxyConfiguration({
    //     groups: ['RESIDENTIAL'],
    //     countryCode: 'CL'
    //     // countryCode: "MX"
    // })

    const puppeteerCrawlerOptions = {
        requestList,
        requestQueue,
        // proxyConfiguration: proxyConfiguration, //new ProxyConfiguration(input.proxyConfiguration),
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

    if (!Actor.isAtHome()) {
        const dataset = await Dataset.open();
        const mergedDataSet = await dataset.getData();
        await KeyValueStore.setValue('RESULTS', mergedDataSet.items);
    }


});