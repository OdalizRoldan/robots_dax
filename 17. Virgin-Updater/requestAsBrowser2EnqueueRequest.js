// Intentos por conseguir rating por DOM
var rating = $("#reviews > div > div > div > div.tf-header > div.tf-score > div.tf-rating").text(); // Este es el dato del ReviewSsource del DOM
// var test = $("#productDetailDescription > div.product-details > div > div > div > script").text(); // Esto deberia devolver el esquema con datos del rating
log.info(`This is the inner content: ${rating}`);



// Logica de RequestAsBrowser

var keyUrl = request.url.split("/").pop();
var productJSON = await Apify.utils.requestAsBrowser({
    url: "https://d1le22hyhj2ui8.cloudfront.net/onpage/virginmegastore.ae/reviews.json?key=" + keyUrl,
    proxyUrl: "http://auto:FFFR2R3GoH4Fw9pWaZvLsdzyj@proxy.apify.com:8000",
    abortFunction: null,
});
var productData = JSON.parse(productJSON.body);
if (productData.score != null) {
    product.RatingType = "5-star"; //see supported types from version 2.7 of the RDP document 
    product.RatingSourceValue = round((productData.score / 2), 1);
    product.ReviewCount = productData["user_review_count"] + productData["pro_review_count"];
    product.ReviewLink = request.url + '#reviews';
}

// Conversion de RequestAsBrowser por EnqueueRequest

var keyUrl = request.url.split("/").pop();
await enqueueRequest({
    url: "https://d1le22hyhj2ui8.cloudfront.net/onpage/virginmegastore.ae/reviews.json?key=" + keyUrl,
    proxyUrl: "http://auto:FFFR2R3GoH4Fw9pWaZvLsdzyj@proxy.apify.com:8000",
    abortFunction: null,
    userData: {
        label: 'PRODUCT_JSON',
    },
});
if (request.userData.label === 'PRODUCT_JSON') {
    var productData = JSON.parse(request.body);

    if (productData.score != null) {
        product.RatingType = "5-star"; //see supported types from version 2.7 of the RDP document 
        product.RatingSourceValue = round((productData.score / 2), 1);
        product.ReviewCount = productData["user_review_count"] + productData["pro_review_count"];
        product.ReviewLink = request.url + '#reviews';
    }
}