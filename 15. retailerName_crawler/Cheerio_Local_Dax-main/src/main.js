const Crawlee = require('crawlee');
const Apify = require('apify');


const { RequestQueue, RequestList, log, KeyValueStore, Dataset, CheerioCrawler, CrawlerExtension, ProxyConfiguration } = Crawlee;
const { Actor } = Apify

Actor.main(async () => {

    const input = await KeyValueStore.getInput();
    const requestList = await RequestList.open(null, input.startUrls)
    const requestQueue = await RequestQueue.open();

    log.setLevel(log.LEVELS.DEBUG);

    async function enqueueRequest(request) {
        return requestQueue.addRequest(request)
    };

    const requestHandler = async ({ response, request, body, json, $ }) => {
        const { Manufacturer, Brand, ExcludedKeyWords, Category, ProductPage, Paginated } = request.userData;

    }
    // const failedRequestHandler
    const failedRequestHandler = async ({ request, errorHandler }) => {

        // console.error(error);

    }

    const preNavigationHooks = [
        async (crawlingContext, requestAsBrowserOptions) => {
            const { request } = crawlingContext;

        }
    ]

    const postNavigationHooks = [
        async (crawlingContext) => {
            const { request } = crawlingContext;
            //requestAsBrowserOptions.forceUrlEncoding = true;

        },
    ]

    // const proxyConfiguration = await Actor.createProxyConfiguration({
    //     groups: ['RESIDENTIAL'],
    //     countryCode: 'BE',
    //     // countryCode: 'MX',
    // })

    // Create the crawler and add the queue with our URL
    // and a request handler to process the page.
    const crawler = new CheerioCrawler({
        requestList,
        requestQueue,
        //proxyConfiguration,
        requestHandler,
        // failedRequestHandler,
        preNavigationHooks,
        postNavigationHooks,
        ignoreSslErrors: true,
        maxConcurrency: 5,
        maxRequestRetries: 3,
        additionalMimeTypes: [
            "application/json",
            "text/plain",
            "application/octet-stream"
        ]
    })

    // Start the crawler and wait for it to finish
    await crawler.run();

    if (!Actor.isAtHome()) {
        const dataset = await Dataset.open();
        const mergedDataSet = await dataset.getData();
        await KeyValueStore.setValue('RESULTS', mergedDataSet.items);
    }

    log.info("Crawl complete");

});