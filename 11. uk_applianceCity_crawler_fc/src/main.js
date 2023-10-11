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
        const { Manufacturer, Brand, Category, ProductPage, Paginated } = request.userData;

        var domain = "https://www.appliancecity.co.uk";
        var productsPerPage = 12;

        if (!Category) {
            const totalCategories = $('div[class="feature_boxes-wrapper"]')
            log.info(`Processing: ${totalCategories.length} categories`);
            totalCategories.each(async function (index, element) {
                categoryUrl = $(`${element} > div > div > p > a`).attr('href')
                var categoryName = $(element).text();
                log.info("Category name" + categoryName);
                log.info("Category url" + categoryUrl);

                var categoryRequest = {
                    url: domain + categoryUrl,
                    userData: {
                        Category: categoryName,
                        // Paginated: true,
                        Brand, //copy the Brand to the next request                                        
                        Manufacturer //copy the manufacturer to the next request 
                    }
                };
                await enqueueRequest(categoryRequest);
            })
        }

        // if (!request.userData.queued) {
        //     var textMatch = $(".woocommerce-result-count").first().text().split("of");
        //     var totalProductsCount = 0;
        //     if (textMatch.length > 1) {
        //         totalProductsCount = $(".woocommerce-result-count").first().text().split("of")[1].match(/\d+/)[0];
        //     }
        //     var totalPages = Math.ceil(totalProductsCount / context.customData.productsPerPage);

        //     for (var i = 2; i <= totalPages; i++) {
        //         var paginationAttributes = request.url.substring(request.url.lastIndexOf("/"), request.url.length);
        //         var pageLink = context.customData.paginationDomain + i + paginationAttributes;
        //         await enqueueRequest({ url: pageLink, userData: { queued: true, Manufacturer: request.userData.Manufacturer, Brand: request.userData.Brand } });
        //     }
        // }

        // var products = [];
        // $("ul.products").find("li.product").each(function (index, element) {

        //     var productId = $(element).find(".acity-product-card-product-more-information").attr("data-product_id");
        //     var productUrl = $(element).find(".acity-product-card-product-more-information").attr("href");
        //     var title = $(element).find(".woocommerce-loop-product__title").text();
        //     var price = $(element).find(".woocommerce-Price-amount").text().replace(",", "").replace(" ", "").replace("£", "");
        //     var imageUri = $(element).find(".size-woocommerce_thumbnail").first().attr("data-lazy-src");
        //     var stockText = $(element).find('.acity-product-availability').text();
        //     var stock = stockText.indexOf("In stock") > -1 ? "InStock" : "OutOfStock";
        //     var ctin = $(element).find(".acity-product-card-product-more-information").attr("data-product_sku");

        //     var product = {
        //         ProductUrl: productUrl,
        //         ProductName: title,
        //         Price: price,
        //         Manufacturer: request.userData.Manufacturer,
        //         ImageUri: imageUri,
        //         ProductId: productId,
        //         Stock: stock,
        //         CTINCode: ctin
        //     }

        //     products.push(product);

        // });

        // return products;


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