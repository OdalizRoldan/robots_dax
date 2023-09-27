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

    const requestHandler = async ({ request, log, enqueueRequest, $, response, /*Apify, json*/ }) => {
        const { Manufacturer, Paginated, CTINRegex, ExcludedKeyWords, Brand } = request.userData;
        

        if (response.status === 404) {
            return {
                Handled: true,
                Message: '404 error',
                Url: request.url
            };
        }

        const domain = 'https://www.garbarino.com';

        if (!Paginated) {
            // var items = $('.breadcrumb-item--active').text().match(/\d+/)[0];
            var totalNumberOfProducts;

            if ($('.vtex-search-result-3-x-searchNotFoundInfo').length != 0) {
                totalNumberOfProducts = 0;
                log.info(`No products found on ${request.url}`)
            } else {
                totalNumberOfProducts = Number($('.vtex-search-result-3-x-totalProducts--layout').text().replace(/[^0-9]/g, ''));
            }

            var productsPerPage = 9;
            var totalNumberOfPages = Math.ceil(totalNumberOfProducts / productsPerPage);
            log.info(`${Brand} TOTAL PRODUCTS: ${totalNumberOfProducts}`);
            log.info(`${Brand} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
            log.info(`${Brand} TOTAL ITERATIONS: ${totalNumberOfPages}`);

            for (var i = 2; i <= totalNumberOfPages; i++) {
                //var newPage = `_Desde_${(productsPerPage * (i - 1)) + 1}_NoIndex_True`;
                var newPage = `?page=${i}`;
                var listUrlToBeEnqueded = request.url + newPage;
                var nextUrl = { //========== refactored for better lecture
                    url: listUrlToBeEnqueded,
                    userData: {
                        Paginated: true,
                        Manufacturer: Manufacturer,
                        ExcludedKeyWords: ExcludedKeyWords,
                        CTINRegex: CTINRegex
                    }
                };
                await enqueueRequest(nextUrl);
            }
        }

        var products = [];
        var productCards = $("a.vtex-product-summary-2-x-clearLink");
        log.info(`Founded ${productCards.length} products in  ${request.url}`)
        productCards.each(async function (index, element) {
            var url = $(element).attr('href');
            var name = $(element).find('img.vtex-product-summary-2-x-image').attr('alt');

            var prohibitedMatch = ExcludedKeyWords ? ExcludedKeyWords : null;
            var testKeyword = new RegExp(prohibitedMatch).test(name.toUpperCase());
            if (testKeyword) {
                log.info("/==Excluded Product : " + name);
                var excludeProduct = {
                    Handled: true,
                    Message: `excluded ${name}`,
                    Url: url
                }
                products.push(excludeProduct);
            } else {
                var priceText = $(element).find('.vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyInteger').text();
                var price = parseFloat(priceText);
                var imageUrl = $(element).find('img.vtex-product-summary-2-x-image').attr('src');
                imageUrl = imageUrl.split('?')[0];
                imageUrl = imageUrl.replace(/\-\d+\-\d+/, '');
                var id = url.match(/(?<=\-)\d+(?=\/)/)[0];

                var ctinRegex = new RegExp(CTINRegex);
                var ctinCode = ctinRegex.test(name.toUpperCase()) ? name.toUpperCase().match(ctinRegex)[0] : undefined;

                var product = {
                    ProductId: id,
                    Manufacturer: Manufacturer,
                    ProductName: name,
                    ProductUrl: domain + url,
                    CTINCode: ctinCode,
                    Price: price,
                    Stock: "InStock",
                    ImageUri: imageUrl
                }
                await enqueueRequest(product);
            }
        });
        await Dataset.pushData(products);
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

})