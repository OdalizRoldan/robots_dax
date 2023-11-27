{
    "debugLog": false,
        "forceResponseEncoding": false,
            "ignoreSslErrors": true,
                "keepUrlFragments": false,
                    "maxConcurrency": 5,
                        "maxCrawlingDepth": 0,
                            "maxPagesPerCrawl": 0,
                                "maxRequestRetries": 1,
                                    "maxResultsPerCrawl": 0,
                                        "pageFunction": "async function pageFunction(context) {\n    const { $, request, log, response } = context;\n\n    if (response.status == 404) {\n        return {\n            Handled: true,\n            Message: `404 response`,\n            Url: request.url\n        }\n    }\n\n    var name = $('meta[property=\"og:title\"]').attr(\"content\").replace(/\\s{2,}/g, ' ').trim();\n    var priceSelector = $(\"div.product-info-price > div.price-box.price-final_price > span.special-price\").text();\n    var price = priceSelector ? Number(priceSelector.split('Prix spécial :')[1].split('€')[0].trim().replace(',','.')) : Number($('span.price-wrapper').attr('data-price-amount'));\n    var stock = $('#product-addtocart-button').text().includes('Ajouter au panier') ? 'InStock' : 'OutOfStock'\n    var id = $('div[itemprop=\"sku\"]').text().trim();\n    var reviewCount = $(\"div.product-reviews-summary > a.action.view > span\").first().text();\n    if (reviewCount) {\n        var ratingType = \"5-Star\";\n        var ratingSourceSelector = $(\"div.product-reviews-summary > div > div > span > span > span\").first().text();\n        var ratingSourceValue = ratingSourceSelector != undefined ?  Math.round((Number(ratingSourceSelector) * 0.05)*10)/10 : ratingSourceSelector;\n        var reviewLink = `${request.url}#reviews`;\n    }\n    var product = {\n        ProductId: id,\n        Manufacturer: request.userData.Manufacturer,\n        ProductName: name,\n        ProductUrl: request.url,\n        Price: price,\n        Stock: stock,\n        RatingType: ratingType,\n        RatingSourceValue: ratingSourceValue,\n        ReviewCount: Number(reviewCount),\n        ReviewLink: reviewLink\n    }\n    return product;\n}",
                                            "pageFunctionTimeoutSecs": 60,
                                                "pageLoadTimeoutSecs": 120,
                                                    "proxyConfiguration": {
        "useApifyProxy": true
    },
    "proxyRotation": "RECOMMENDED",
        "startUrls": [
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-canine-treats-no-grain-crunchy-poulet-pommes-227-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-canine-treats-no-grain-soft-baked-poulet-carottes-227-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-dental-care-chews-lamelles-a-macher-pour-chien-sachet-170-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-healthy-mobility-treats-friandises-pour-chien-sachet-220-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-healthy-weight-treats-friandises-pour-chien-sachet-220-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-hypoallergenic-treats-friandises-pour-chien-sachet-220-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-boeuf-12-x-370-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-dinde-12-x-370-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-healthy-cuisine-mijotes-poulet-boeuf-8-x-80-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-healthy-mobility-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-healthy-mobility-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-large-advanced-fitness-au-poulet-18kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-large-light-au-poulet-18-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-large-perfect-weight-poulet-12-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-light-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-light-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-light-poulet-12-x-370-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-light-small-mini-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-light-small-mini-poulet-6-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-medium-advanced-fitness-poulet-2-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-medium-agneau-riz-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-medium-agneau-riz-18-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-medium-agneau-riz-2-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-no-grain-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-no-grain-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-no-grain-thon-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-no-grain-thon-14-kg-dluo-30-11-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-12-x-363-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-large-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-large-14-kg-dluo-31-01-2023.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-medium-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-medium-2-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-small-mini-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-small-mini-3-kg-dluo-31-12-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-small-mini-6-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-digestion-small-mini-6-kg-dluo-31-12-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-weight-medium-poulet-12-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-perfect-weight-small-mini-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-performance-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-poulet-12-x-370-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-sensitive-stomach-skin-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-small-mini-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-small-mini-poulet-1-5-kg-dluo-31-12-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-small-mini-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-adult-small-mini-poulet-6-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-7-small-mini-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-7-small-mini-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-7-small-mini-poulet-6-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-5-active-longevity-large-breed-18-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-5-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-5-youthful-vitality-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-6-senior-vitality-large-breed-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-light-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-medium-poulet-14-kg-dluo-31-10-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-medium-poulet-18-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-medium-poulet-2-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-mini-light-2-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-poulet-12-x-370-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-youthful-vitality-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-7-youthful-vitality-small-mini-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-adult-poulet-12-x-370-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-mature-no-grain-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-au-poulet-en-boites-de-12-x-370-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-medium-agneau-riz-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-medium-agneau-riz-18-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-medium-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-medium-poulet-2-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-no-grain-poulet-14-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-poulet-boites-de-12-x-370-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-small-mini-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-canine-puppy-small-mini-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-chat-young-adult-sterilise-thon-3-kg-dluo-31-12-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-7-youthful-vitality-poulet-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-hairball-indoor-poulet-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-hairball-indoor-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-hairball-indoor-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-pack-mixte-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-poulet-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-poulet-10-kg-31-10-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-poulet-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-thon-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-light-thon-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-no-grain-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-optimal-care-pack-mixte-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-optimal-care-poulet-15-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-optimal-care-poulet-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-digestion-12-x-85-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-digestion-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-digestion-3-kg-dluo-31-12-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-digestion-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-digestion-7-kg-dluo-31-12-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-weight-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-perfect-weight-poulet-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-poulet-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-poulet-15-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-sensitive-stomach-skin-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-sterilised-cat-healthy-cuisine-mijotes-poulet-saumon-8-x-80-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-thon-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-thon-10-kg-dluo-30-11-2022.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-thon-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-adult-thon-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-kitten-healthy-cuisine-mijotes-poulet-poisson-8-x-80-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-kitten-no-grain-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-kitten-poulet-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-light-poulet-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-pack-mixte-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-poulet-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-sterilised-cat-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-sterilised-cat-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-7-thon-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-adult-hairball-control-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-no-grain-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-mature-poulet-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-senior-11-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-canard-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-poulet-15-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-thon-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-thon-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-cat-thon-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-poulet-10-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-feline-young-adult-sterilised-tendres-bouchees-en-sauce-12-x-85-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-kitten-healthy-development-pack-mixte-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-kitten-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-kitten-poulet-300-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-kitten-poulet-3-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-kitten-poulet-sachets-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-kitten-thon-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-perfect-weight-mobility-grand-chien-12-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-perfect-weight-mobility-medium-chien-12-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-perfect-weight-mobility-petit-chien-6-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-puppy-large-healthy-development-poulet-16-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-urinary-health-chat-sterilise-7-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-vetessentials-feline-young-adult-sterilised-poulet-12-x-85-grs.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-youthful-vitality-chat-adult-7-poulet-1-5-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-science-plan-youthful-vitality-chien-mini-adult-7-poulet-6-kg.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/hill-s-soft-baked-biscuits-pour-chien-sachet-220-g.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-bonus-bag-1-sac-hill-s-science-plan-feline-adult-hairball-indoor-poulet-10-kg-1-5-kg-offerts.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-bonus-bag-1-sac-hill-s-science-plan-feline-adult-light-poulet-10-kg-1-5-kg-offerts.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-bonus-bag-1-sac-hill-s-science-plan-feline-adult-poulet-10-kg-1-5-kg-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-bonus-bag-1-sac-hill-s-science-plan-feline-young-adult-sterilised-cat-poulet-10-kg-1-5-kg-offerts.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-hill-s-1-sac-science-plan-canine-adult-healthy-mobility-large-breed-poulet-14-kg-achete-1-sachet-de-friandises-dental-care-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-hill-s-1-sac-science-plan-canine-adult-healthy-mobility-medium-poulet-14-kg-achete-1-sachet-de-friandises-dental-care-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-hill-s-1-sac-science-plan-canine-adult-large-advanced-fitness-au-poulet-18-kg-achete-1-sachet-de-friandises-dental-care-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-hill-s-1-sac-science-plan-canine-adult-large-light-au-poulet-18-kg-achete-1-sachet-de-friandises-dental-care-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-hill-s-1-sac-science-plan-canine-adult-light-medium-poulet-14-kg-achete-1-sachet-de-friandises-dental-care-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            },
            {
                "url": "https://www.lacompagniedesanimaux.com/offre-hill-s-1-sac-science-plan-canine-adult-medium-poulet-14-kg-achete-1-sachet-de-friandises-dental-care-offert.html",
                "userData": {
                    "Manufacturer": "HillsPet",
                    "ApifyResultType": 0
                }
            }
        ]
}