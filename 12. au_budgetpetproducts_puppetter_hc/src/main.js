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
        log.info("Is running...")

    }

    const preNavigationHooks = [];
    preNavigationHooks.push(async (crawlingContext, gotoOptions) => {
        // const { request, ProductPage } = crawlingContext;

        // const urlAPI = `https://www.budgetpetproducts.com.au/hills-science-diet?page=${ProductPage}&sort=best_match&filter=&ajax=1`;

        // request.url = urlAPI;
        // request.method = "GET";
        // request.headers = {
        //     'Accept': 'application/json',
        //     'referer': 'https://www.budgetpetproducts.com.au/brand/hills-science-diet?page=1&sort=best_match&ajax=1',
        //     'cookie': "_ALGOLIA=anonymous-1f1ef31b-ca64-4b01-9e97-a4233e7a40a0; _gid=GA1.3.1483507962.1697204513; _tt_enable_cookie=1; _ttp=xZNKJ1Tl-eZpyih_kky_YtYnQMW; _fbp=fb.2.1697204513491.395430812; scarab.visitor=%2266769212E9ACA4E1%22; _bpp_lcid=eyJpdiI6Imh6cE40N09wUTJ4cjlZaEQ2YTY0NUE9PSIsInZhbHVlIjoiQ2gybjhtWm1tSlRsUlREaU82SFRrV2hpMTBhUEtVRUdqa0l0Um1jaXpDc0hrc3RWcHJpaWhlQ0ZvVVI0c3h5SGJ4eUc4T2xwNXBUREQ3VmducHhxeDFkY3RwMXF0ckhaTVhQcm9LVGNKd0U9IiwibWFjIjoiNWM4N2IzNDQ0MGE1OGUxMGQxZjYzNzE4NDYyODk1ZTg2YWYzZmUwZTYyMWQ2NjA0NTY4Y2U4ZWRjNzNjMzQxNiJ9; _uetsid=47b23ec069ce11eeb5172d2420fc4e33; _uetvid=47b2564069ce11ee80f3876003aa2f68; cto_bundle=wyFRUF9qdjNNbWhab3k1OWJBME9uMjJhMVRKUVlEWnY2bWh1ZGZRNEIycyUyQlglMkJwWUVQMkhQaU5kMjhlUEtsV2VuR09iYjJaNkh0cFhZTGtPOHFVY1Y5NGtpMWJQQ0N3S2lvTzEyY0IxdGxGcDRPYU90NEczbiUyRnEyNUFPTVVrcnpVTEdYTlU0aHVpU2xEUmFuUnduWlJxMWxJb2tFcnlOaHBlRE5zYVBmTDJKaCUyQkRIYyUzRA; _ga=GA1.3.254700491.1697204513; _ga_M1K8N93D8H=GS1.1.1697204513.1.1.1697205372.13.0.0; XSRF-TOKEN=eyJpdiI6Im55K0ZoMnpyOXlCbExBWDZ2ekcrcXc9PSIsInZhbHVlIjoiY2d3d1hMYi8rcGVwZG43VzRBNkFNTXJIeDlzSnBSM2YvTXdXR1JYbHFFT0psdFBEdzBxT09wT3RGcXVOb3NLQXNxeFhiN05aeDBBWiszbDVzR3lCdmFsVG9nck1jK2ZwbWFjYVoyb0RCczdZeFVhMGQ3NlE2dHFlNFlFN1FONzMiLCJtYWMiOiJhYWY0N2U0NzZiZGYzMDZiYTczYTFhNzI4ODVkYWRmZjE2MDY3NjFjY2ZkZGFkYzU2NmZmMjdkZTQxZjUxNWVmIn0%3D; budget_pet_products_session=eyJpdiI6InJQM3Zuakc3NHFHeVlWczh1QTVTQkE9PSIsInZhbHVlIjoiNVFMbW94Vzd6MVMyZStNc2hsWXhIcDlPSlhjQnlxRG1RWkhqODlDRkFEWTN4TjFoRHlkcEloUldCZ0YwOUdSRkhIeGRrNVpObWlnUHg2b2RSR2M5SnJheTFMQnVkbXl0K2x6NGFyTDljVXhQRHA5ZWhvVFVaOUN0emFFeU0wbTUiLCJtYWMiOiJkYzVjN2ZmYmY2MmEzYWE5MzEyYWFjZjgzMjk0YjA4NjFiN2YwNmZlZmZjYmQ0ZDhlZTE1YzUzZjkyODNjNzk0In0%3D; _gat_UA-18961063-1=1",
        //     //'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        //     'x-xsrf-token': 'eyJpdiI6Im55K0ZoMnpyOXlCbExBWDZ2ekcrcXc9PSIsInZhbHVlIjoiY2d3d1hMYi8rcGVwZG43VzRBNkFNTXJIeDlzSnBSM2YvTXdXR1JYbHFFT0psdFBEdzBxT09wT3RGcXVOb3NLQXNxeFhiN05aeDBBWiszbDVzR3lCdmFsVG9nck1jK2ZwbWFjYVoyb0RCczdZeFVhMGQ3NlE2dHFlNFlFN1FONzMiLCJtYWMiOiJhYWY0N2U0NzZiZGYzMDZiYTczYTFhNzI4ODVkYWRmZjE2MDY3NjFjY2ZkZGFkYzU2NmZmMjdkZTQxZjUxNWVmIn0=',
        // }

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
        //proxyConfiguration: proxyConfiguration, //new ProxyConfiguration(input.proxyConfiguration),
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
        //preNavigationHooks,
        requestHandler,
        //postNavigationHooks,
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