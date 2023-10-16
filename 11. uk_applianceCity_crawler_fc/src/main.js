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

    const requestHandler = async ({ response, request, body, json, $, log }) => {
        const { Manufacturer, Brand, Category, Paginated, CategoyName } = request.userData;

        if (!Category) {
            const totalCategories = $(".section_padding_lower-quarter > div > div.quick_links > ul > li > a");

            log.info(`Processing: ${totalCategories.length} categories`);
            totalCategories.each(async function (index, element) {
                var categoryUrl = $(element).attr('href');
                var categoryName = $(element).text();

                log.info("Category name" + categoryName);
                log.info("Category url" + categoryUrl);

                var categoryRequest = {
                    url: categoryUrl,
                    userData: {
                        Category: true,
                        CategoyName: categoryName,
                        Brand,
                        Manufacturer
                    }
                };
                await enqueueRequest(categoryRequest);
            })
        }
        if (Category) {
            if (!Paginated) {
                var numberOfProductsSelector = $(".woocommerce-result-count").text();
                var condicion = numberOfProductsSelector.includes("of");
                var totalProducts = condicion == true ? numberOfProductsSelector.split("of")[2].match(/\d+/)[0] : 12;
                var productsPerPage = 12;
                const totalPages = Math.ceil(Number(totalProducts) / productsPerPage);
                log.info(`${Category} TOTAL PRODUCTS: ${Math.ceil(totalProducts)}`);
                log.info(`${Category} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
                log.info(`${Category} TOTAL ITERATIONS: ${totalPages}`);

                for (var index = 2; index <= totalPages; index++) {
                    nextPage = request.url + "page/" + index + "/"
                    log.info(nextPage);

                    var nextPageRequest = {
                        url: nextPage,
                        userData: {
                            Paginated: true,
                            Category,
                            Brand,
                            Manufacturer
                        }
                    }
                    await enqueueRequest(nextPageRequest);
                }
            }
            var results = [];
            $("ul.products").find("li.product").each(function (index, element) {
                var productId = $(element).find(".acity-product-card-product-more-information").attr("data-product_id");
                var productUrl = $(element).find(".acity-product-card-product-more-information").attr("href");
                var title = $(element).find(".woocommerce-loop-product__title").text().trim().replace(/\s{2,}/g, ' ');
                var price = $(element).find(".woocommerce-Price-amount").text().replace(",", "").replace(" ", "").replace("£", "");
                var imageUri = $(element).find(".size-woocommerce_thumbnail").first().attr("src");
                var stockText = $(element).find('.acity-product-availability').text();
                var stock = stockText.indexOf("In stock") > -1 ? "InStock" : "OutOfStock";
                var ctin = $(element).find(".acity-product-card-product-more-information").attr("data-product_sku");

                var product = {
                    ProductUrl: productUrl,
                    ProductName: title,
                    Price: Number(price),
                    Manufacturer: Manufacturer,
                    ImageUri: imageUri,
                    ProductId: productId,
                    Stock: stock,
                    CTINCode: ctin,
                }
                results.push(product);
            });
            await Dataset.pushData(results);
        }
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