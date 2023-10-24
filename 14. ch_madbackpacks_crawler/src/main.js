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
        const { Manufacturer, Brand, Paginated, ProductPage, LastPaginated, PageIndex } = request.userData;
        const domain = 'https://www.madbackpacks.com';

        if (!Paginated || LastPaginated) { // If this is either the first or last page to be paginated so far...
            let pageButtons = $('ul[class="pagination text-primary-color dark-primary"]>li>a');

            if (pageButtons.length > 0) {
                for (let i = 0; i < pageButtons.length; i++) {
                    let a = pageButtons[i];
                    let idx = pageButtons.index(a);
                    if (idx > (PageIndex ? PageIndex : 1)) { // If the button corresponds to a page higher than this one, it is enqueued
                        var nextUrl = domain + $(a).attr('href');
                        log.info("Enqueuing " + nextUrl);
                        await enqueueRequest({
                            url: nextUrl,
                            userData: {
                                ...request.userData,
                                Paginated: true,
                                PageIndex: idx,
                                LastPaginated: i == (pageButtons.length - 1)
                            }
                        })
                    }
                }
            }
        }

        if (!ProductPage) {
            const productCards = $("div.col-md-9.animate-show.product-list-container > div > ul > li > product-item > a");
            log.info(`${Brand} ${productCards.length} products found in: ${request.url}`);

            productCards.each(async (idx, item) => {
                var nextProductUrl = domain + $(item).attr('href');
                log.info("This is the product page url: " + nextProductUrl);
                var productRequest = {
                    url: nextProductUrl,
                    userData: {
                        Manufacturer,
                        Paginated: true,
                        ProductPage: true,
                    },
                };
                await enqueueRequest(productRequest);
            });
        }

        if (ProductPage) {
            if (response.status === 404) {
                return {
                    Handled: true,
                    Message: `404 error`,
                    Url: request.url,
                };
            }
            let data = $('[type="application/ld+json"]').html();
            data = JSON.parse(data);

            const productId = data.sku;
            const productName = data.name.replace(/\s{2,}/g, " ").trim();
            let { price } = data.offers;
            const productUrl = $('meta[property="og:url"]').attr('content');

            let stock = data.offers.availability;
            if (stock.includes('Discontinued')) {
                return {
                    Handled: true,
                    Message: `Product discontinued`,
                    Url: request.url,
                };
            }

            let variationsData;
            const scripts = $('script[type="text/javascript"]');
            scripts.each((idx, script) => {
                if ($(script).html().match(/variations/)) {
                    [variationsData] = $(script).html().match(/(?<=app.value\('product', JSON.parse\(')[^']+/);
                    variationsData = variationsData.replace(/\\"/g, '"');
                }
            });

            variationsData = JSON.parse(variationsData);
            let imageUri = variationsData.media[0].images.original.url.split('?')[0];
            let imageUrl = imageUri.replace("original", "xlarge") ? imageUri.replace("original", "xlarge") : imageUri;
            var productSku = variationsData.sku && variationsData.sku != "" ? variationsData.sku : undefined;
            var gtin = variationsData.gtin && variationsData.gtin.length == 13 ? variationsData.gtin : undefined;
            stock = (stock.includes('OutOfStock') || stock.includes('SoldOut') || stock.includes('InStoreOnly') ? 'OutOfStock' : 'InStock');
            stock = stock == "OutOfStock" && !variationsData.out_of_stock_orderable ? stock : "InStock";

            var products = [];
            if (variationsData.variations.length > 0) {
                variationsData.variations.forEach((item) => {
                    if (item.price.dollars > 0) {
                        price = item.price.dollars;
                    }

                    if (Object.prototype.hasOwnProperty.call(item, 'media')) {
                        imageUri = item.media.images.original.url.split('?')[0];
                    }

                    const variantId = item.key;
                    const variantSpecs = item.fields_translations['zh-hant'].join("-");
                    const variantName = variantSpecs.trim().replace(/\s{2,}/g, ' ');
                    stock = item.quantity === 0 && !variationsData.out_of_stock_orderable ? 'OutOfStock' : 'InStock';
                    let sku = item.sku && item.sku != "" ? item.sku : undefined;

                    const product = {
                        ProductId: variantId,
                        ProductName: `${productName} : ${variantName}`,
                        Manufacturer,
                        Price: price,
                        Stock: stock,
                        ProductUrl: `${productUrl}#${variantId}`,
                        ImageUri: imageUri,
                        OTHERCode: sku,
                        GTINCode: gtin
                    };

                    log.debug(`Saving product with variant ${product.ProductName}`);
                    products.push(product);
                });
                await Dataset.pushData(products);
            } else {
                const product = {
                    ProductId: productId,
                    ProductName: productName,
                    Manufacturer,
                    Price: price,
                    Stock: stock,
                    ProductUrl: productUrl,
                    ImageUri: imageUri,
                    OTHERCode: productSku,
                    GTINCode: gtin
                };
                log.debug(`Saving product ${product.ProductName}`);
                await Dataset.pushData(product);
            }
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