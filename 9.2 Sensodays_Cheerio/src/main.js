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
        const { Manufacturer } = request.userData;
        if (response.status == 404) {
            return {
                Handled: true,
                Message: "404 error",
                Url: request.url
            }
        }
        if (request.loadedUrl != request.url) {
            return {
                Handled: true,
                Message: "404 error",
                Url: request.url
            }
        }
        //Script
        const script = $('script:contains("Viewed Product")').html();
        const productId = script.match(/ProductID: "(.*?)"/).pop();
        const productName = script.match(/Name: "(.*?)"/).pop();
        const price = Math.round($('[itemprop="price"]').attr('content') * 100) / 100;
        ///const stockSelector = $(`#product_stock_${productId} > div > div.stock-tooltip.stock_info > div.widget.widget-static-block > span`).text();
        const stockSelector = $(`div > div.stock-tooltip.stock_info > div.widget.widget-static-block > span`).text();
        // const stockTest = $('span[itemprop="availability"]').text();

        // const price = $(`span[id="product-price-${productId}"]`).text()

        var stockTest = $(`#product_stock_${productId} > div > div.stock-tooltip.stock_info > div.widget.widget-static-block > span`).text();
        log.info("Stock: " + stockTest);

        const stock = (stockTest == 'in_stock') ? "InStock" : "OutOfStock";
        // Changes
        //const alternativePrice = 
        var product = {
            ProductId: productId,
            Manufacturer,
            ProductName: productName,
            ProductUrl: request.url,
            Price: Number(price),
            Stock: stock
        }
        // Ratings Logic
        var reviewSummary = $('div[itemprop="aggregateRating"]')
        var productReviewCount = reviewSummary ? $('meta[itemprop="ratingCount"]').attr('content') : 0;
        if (productReviewCount > 0) {
            ratingSourceValue = Number($('meta[itemprop="ratingValue"]').attr('content'));
            product.RatingType = '5-star';
            product.RatingSourceValue = Number.isNaN(ratingSourceValue) ? null : ratingSourceValue;
            product.ReviewCount = Number.isNaN(productReviewCount) ? null : Number(productReviewCount);
            product.ReviewLink = request.url + '#product_tabs_reviews'
        }
        await Dataset.pushData(product);

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