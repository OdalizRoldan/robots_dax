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
        const { Manufacturer, Brand, Category, Paginated, ExcludedKeyWords } = request.userData;
        var domain = "https://www.appliancecity.co.uk";

        if (!Category) {
            var totalCategories = $(".section_padding_lower-quarter > div > div.quick_links > ul > li > a");
            if (totalCategories.text() == '' && $("ul.products").find("li.product").text() == '') {

                log.info("ESTRUCTURA TIPO 2");
                const selector_level01 = $("div.row > div > div > div > div");
                var url_subcategory, categoryUrl;

                selector_level01.each(async function (index, element) {

                    if ($(element).find("a").attr("href") != undefined) {
                        url_subcategory = $(element).find("a").attr("href");
                        log.info("Este es el link de la subcategoria: " + domain + url_subcategory);
                        log.info("H3 de la subcategoria: " + $(element).find("h3").text());

                        if (url_subcategory.includes(`haier`) && !url_subcategory.includes(`newsletter`) && !url_subcategory.includes(`about-us`)) {
                            var categoryName = $(element).find("h3").text();
                            if (categoryName.includes("I-Pro")) {
                                categoryUrl = url_subcategory;
                                type = 2;
                            } else {
                                categoryUrl = domain + url_subcategory;
                            }
                            log.info("THIS IS OFFICIAL");
                            log.info(categoryName);

                            var categoryRequest = {
                                url: categoryUrl,
                                CategoryName: categoryName,
                                userData: {
                                    Category: true,
                                    Brand,
                                    Manufacturer
                                }
                            };
                            await enqueueRequest(categoryRequest);
                        }
                    } else {
                        log.info("No se encontró atributo a");
                    }
                });

            } else if ($("ul.products").find("li.product").text() !== '') {

                log.info("ESTA ES UNA PAGINA DE PRODUCTOS DIRECTA");
                //var pageUrl = request.url + 'page/1/'; // https://www.appliancecity.co.uk/brand/creda/
                var pageUrl = domain + '/brand/' + Brand + '/';
                var categoryRequest = {
                    url: pageUrl,
                    userData: {
                        Category: true,
                        Brand,
                        Manufacturer
                    }
                };
                await enqueueRequest(categoryRequest);
            } else {
                log.info(`Processing: ${totalCategories.length} categories`);
                const categorytList = [];
                totalCategories.each(async function (index, element) {
                    var categoryUrl = $(element).attr('href');
                    var categoryName = $(element).text();
                    log.info("Category name" + categoryName);
                    log.info("Category url" + categoryUrl);

                    if (Brand == "Bosch") {
                        log.debug(`${categoryName} - Subcategory of Brand: ${totalCategories.length}`);
                        var prohibitedMatch = ExcludedKeyWords ? ExcludedKeyWords || "" : null;
                        log.info(`prohibitedMatch value: ${prohibitedMatch}`);

                        //Search for excluded words
                        var testKeyword = new RegExp(prohibitedMatch).test(categoryName.toUpperCase());

                        if (testKeyword && ExcludedKeyWords) {
                            log.info(`Este es el valor de testKeyword: ${testKeyword}`);
                            log.info(`Este es el category name: ${categoryName.toUpperCase()}`);
                            log.info("Entro, tiene CATEGORIA EXCLUIDA")
                            var excludedCategory = {
                                Handled: true,
                                Message: `Category excluded: ${categoryName}`,
                                Url: categoryUrl
                            }
                            categorytList.push(excludedCategory);
                            log.info(categorytList);

                        } else {
                            var categoryRequest = {
                                url: categoryUrl,
                                userData: {
                                    Category: true,
                                    Brand,
                                    Manufacturer
                                }
                            };
                            await enqueueRequest(categoryRequest);
                        }
                    } else {
                        var categoryRequest = {
                            url: categoryUrl,
                            userData: {
                                Category: true,
                                Brand,
                                Manufacturer
                            }
                        };
                        await enqueueRequest(categoryRequest);
                    }
                })
            }
        }
        if (Category) {
            if (!Paginated) {
                var numberOfProductsSelector = $(".woocommerce-result-count").text();
                var totalProducts = 0;
                if (numberOfProductsSelector.includes("of")) {
                    totalProducts = numberOfProductsSelector.split("of")[2].match(/\d+/)[0];
                } else if (numberOfProductsSelector.includes("all")) {
                    totalProducts = numberOfProductsSelector.match(/\d+/)[0];
                } else {
                    totalProducts = 1;
                }
                var productsPerPage = 12;
                const totalPages = Math.ceil(Number(totalProducts) / productsPerPage);
                log.info(`${Category} TOTAL PRODUCTS: ${Math.ceil(totalProducts)}`);
                log.info(`${Category} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
                log.info(`${Category} TOTAL ITERATIONS: ${totalPages}`);

                for (var index = 2; index <= totalPages; index++) {
                    if (request.url.includes(`haier`)) {
                        const subDomain = request.url.replace(/https:\/\/www\.appliancecity\.co\.uk\//, '');
                        nextPage = domain + "/page/" + index + "/" + subDomain;
                        log.info(`The next page is ${nextPage}`);
                    } else {
                        nextPage = request.url + "page/" + index + "/";
                    }
                    log.info(nextPage);
                    //log.info(`The number of type is: ${type}`);

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

                var listDuplicates = [];
                if (listDuplicates.includes(productId)) {
                    log.info(`Duplicated Product ${title}`);
                } else {
                    listDuplicates.push(productId);
                    var product = {
                        ProductUrl: productUrl,
                        ProductName: title,
                        Price: Number(price),
                        Manufacturer: Manufacturer,
                        ImageUri: imageUri,
                        ProductId: productId,
                        Stock: stock,
                        CTINCode: ctin
                    }
                    results.push(product);
                    log.info(`This is a pushed product: ${productId}`);
                }
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