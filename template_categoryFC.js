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
        const domain = "https://www.expert.be";
        const productsPerPage = 12;

        if (!Category) {
            const totalCategories = $('div[class=" --type-list-item-text"] > a')
            log.info(`Processing: ${totalCategories.length} categories`);
            totalCategories.each(async function (index, element) {
                var categoryUrl = $(element).attr('href');
                var categoryName = $(element).text();
                var categoryRequest = {
                    url: domain + categoryUrl,
                    userData: {
                        Category: categoryName,
                        // Paginated: true,
                        Brand, //copy the Brand to the next request                     
                        ExcludedKeyWords, //copy the ExcludedKeyWords to the next request                     
                        Manufacturer //copy the manufacturer to the next request 
                    }
                };
                await enqueueRequest(categoryRequest);
            })
        }

        if (Category) {
            if (!ProductPage && !Paginated) {
                // Handle pagination
                // const totalProducts = $('b[class="result"]').text();
                var numberOfProductsSelector = $('b[class="result"]').text().trim()
                const totalProducts = numberOfProductsSelector !== "" ? numberOfProductsSelector.match(/\d+/g)[0] : 0;
                const totalPages = Math.ceil(totalProducts / productsPerPage);
                log.info(`${Category} TOTAL PRODUCTS: ${Math.ceil(totalProducts)}`);
                log.info(`${Category} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
                log.info(`${Category} TOTAL ITERATIONS: ${totalPages}"`);
                for (var index = 2; index <= totalPages; index++) {
                    //https://www.expert.be/nl/cat/tvs?2549=led&make=299&page=2
                    // var nextPage = request.url + '&page=' + index;

                    if (request.url.includes("?")) {
                        var nextPage = request.url + '&page=' + index;
                    } else {
                        nextPage = request.url + '?page=' + index;
                    }

                    var nextPageRequest = {
                        url: nextPage,
                        userData: {
                            Paginated: true,
                            Category,
                            Brand, //copy the Brand to the next request                     
                            ExcludedKeyWords, //copy the ExcludedKeyWords to the next request                     
                            Manufacturer//copy the manufacturer to the next request 
                        }
                    }
                    await enqueueRequest(nextPageRequest);
                }

            }

            if (!ProductPage) {
                log.info(`I'm on the page: ${request.url}`);

                const productCards = $('div[class="overview-item"]');
                const productList = [];
                log.debug(`${Category} - Products found in page: ${productCards.length}`);
                var prohibitedMatch = ExcludedKeyWords ? ExcludedKeyWords || "" : null;

                productCards.each(async function (index, element) {
                    var productName = $(element).find('a').first().attr('title').replace(/\s+/g, ' ');
                    var productUrl = domain + $(element).find('a').first().attr('href');

                    //Search for excluded words
                    var testKeyword = new RegExp(prohibitedMatch).test(productName.toUpperCase());
                    if (testKeyword && ExcludedKeyWords) {
                        // There's at least one
                        var excludedProduct = {
                            Handled: true,
                            Message: `Product excluded: ${productName}`,
                            Url: productUrl
                        }
                        productList.push(excludedProduct);
                    } else {
                        //Queue Product for EAN
                        var pageRequest = {
                            url: productUrl,
                            userData: {
                                Category,
                                ProductPage: true, //flag as as a product page                            
                                Manufacturer //copy the Manufacturer to the request
                            }
                        };
                        await enqueueRequest(pageRequest);
                    }
                })
                await Dataset.pushData(productList);
            }


            if (ProductPage) {
                //get the values from JSON
                const productScript = $('[type="application/ld+json"]').toArray().filter(function (x) {
                    return (JSON.parse($(x).html().replace(/[\n\r]/g, '').trim())['@type'] == "Product");
                });
                const productJson = JSON.parse($(productScript).html().replace(/[\n\r]/g, '').trim());

                var stock = productJson.offers.availability;
                var productStock = (stock.includes('Op voorraad') || stock.includes('morgen in huis') ? "InStock" : "OutOfStock");
                var productName = productJson.name.replace(/\s+/g, ' ');
                var price = productJson.offers.price;
                var productImage = productJson.image.replace(domain + "/", '');

                const dataScript = $('div[class="flix-wrapper"]').find("script[type='text/javascript']").html();

                var productId = $('div[class="title-options"]').text().trim().match(/[A-Z0-9]{3,}/g).pop();
                // var productId =  $('div[class="title-options"]').find('span').first().text().trim();
                var productCtin = dataScript.match(/(?<='pn', ')[^']+/) ? dataScript.match(/(?<='pn', ')[^']+/)[0] : undefined;
                var productGtin = dataScript.match(/(?<='upcean', ')[^']+/) ? dataScript.match(/(?<='upcean', ')[^']+/)[0] : undefined;

                //Valid brand                
                var product = {
                    ProductId: productId,
                    Manufacturer,
                    ProductName: productName,
                    ProductUrl: request.url,
                    CTINCode: productCtin,
                    EANCode: productGtin,
                    Price: price ? Number(price) : null,
                    ImageUri: productImage,
                    Stock: productStock
                }

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