async function pageFunction(context) {
    const { request, json, response, log, $, body, enqueueRequest } = context;
    const { Manufacturer, Paginated, Brand } = request.userData;
    if (response.status == 404) {
        return {
            Handled: true,
            Message: "404 error",
            Url: request.url
        }
    }
    const scriptTag = $('script[type="application/ld+json"]');
    const jsonLdScript = scriptTag.html();
    var schemaData = JSON.parse(jsonLdScript);

    if (!Paginated) {
        var productsPerPage = 45;
        var totalNumberOfProducts = schemaData.numberOfItems;
        var totalNumberOfPages = Math.ceil(Number(totalNumberOfProducts) / productsPerPage);

        log.info(`${Brand} TOTAL PRODUCTS: ${totalNumberOfProducts}`);
        log.info(`${Brand} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
        log.info(`${Brand} TOTAL ITERATIONS: ${totalNumberOfPages}`);

        for (var i = 1; i < totalNumberOfPages; i++) {
            var nextUrl; // 
            var nextUrl = request.url + "?count=" + productsPerPage + "&offset=" + (i*productsPerPage);

            var nextRequest = {
                url: nextUrl,
                userData: {
                    Manufacturer: Manufacturer,
                    Paginated: true,
                    Brand: Brand,
                }
            }
            await enqueueRequest(nextRequest); 
        }
    }

    var results = [];
    var type_chema = schemaData["@type"];
    var products;
    list_unique_pid = [];
    list_unique_name = [];

    if (type_chema == "ItemList") {
        products = schemaData.itemListElement;

        for (var i = 0; i < products.length; i++) {
            var productId = products[i].sku;
            var productName = products[i].name;

            if (!list_unique_pid.includes(productId) && !list_unique_name.includes(productName)) {
                list_unique_pid.push(productId);
                list_unique_name.push(productName);
                
                var price = Number(products[i].offers.price);
                var imageUrl = products[i].image;
                var productUrl = products[i].offers.url;
                var gtinCode = products[i].gtin13;
                var stock = (products[i].offers.availability === "https://schema.org/InStock") ? "InStock" : "OutOfStock";
                var manufacturer = products[i].manufacturer;

                if (manufacturer == Manufacturer) {
                    var product = {
                        ProductId: productId,
                        Manufacturer: Manufacturer,
                        ProductUrl: productUrl,
                        ProductName: productName,
                        Price: price,
                        Stock: stock,
                        ImageUri: imageUrl,
                        GTINCode: gtinCode.toString()
                    }
                    results.push(product);
                }
            }
        }
    log.info("Lista de nombres: " + list_unique_name);
    log.info("Lista de PIDs: " + list_unique_pid);

    } else if (type_chema == "Product") {
        products = schemaData;
        var productId = products.sku;
        var productName = products.name;

        if (!list_unique_pid.includes(productId) && !list_unique_name.includes(productName)) {
            list_unique_pid.push(productId);
            list_unique_name.push(productName);
            
            var price = Number(products.offers.price);
            var imageUrl = products.image;
            var productUrl = products.offers.url;
            var gtinCode = products.gtin13;
            var stock = (products.offers.availability === "https://schema.org/InStock") ? "InStock" : "OutOfStock";
            var manufacturer = products.manufacturer;

            if (manufacturer == Manufacturer) {
                var product = {
                    ProductId: productId,
                    Manufacturer: Manufacturer,
                    ProductUrl: productUrl,
                    ProductName: productName,
                    Price: price,
                    Stock: stock,
                    ImageUri: imageUrl,
                    GTINCode: gtinCode.toString()
                };
                results.push(product);
            }
        }
    }
    return results;
}