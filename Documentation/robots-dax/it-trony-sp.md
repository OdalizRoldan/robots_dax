~~~


~~~

### Actividades realizadas
- No se encontró API, schema, script, los elementos se pueden sacar del DOM
**Actividades del dia**
- Se esta extrayendo datos de la pagina a traves de una API en JS.
- La logica de paginacion funcionara por el cambio de uno de los parametros de la API, ya que se recarga en la misma pagina inicial.
- Solo se obtendran datos de la >= 5 api ya que tiene los datos de todos los productos.

~~~
>>>>> Tomar en cuenta

~~~

~~~
>>>>> Preguntas
- 
~~~


### Comparación con producción
-  

Buenos dias 
Este retailer no tiene una paginación como tal, se cargan los datos con una API cada vez que se preciona el boton Mostrar mas de la parte inferior, sin embargo la URL de la pagina de busqueda no cambio o actualiza alguno de sus parametros, de que manera puedo definir la variables NumberPage en este caso o como procedo para el desarrollo del SP?
Saludos!

----
Good morning 
This retailer does not have a pagination as such, the data is loaded with an API each time you press the Show more button at the bottom.
On the other hand, the URL of the search page does not change or update any of its parameters when the button is pressed.
How can I define the NumberPage variable in this case or how do I proceed for the SP development?
Greetings!

~~~
{

    "additionalMimeTypes": [

        "application/json",

        "application/javascript",

        "text/csv"

    ],

    "debugLog": false,

    "forceResponseEncoding": false,

    "ignoreSslErrors": true,

    "keepUrlFragments": true,

    "maxConcurrency": 5,

    "maxCrawlingDepth": 0,

    "maxPagesPerCrawl": 0,

    "maxRequestRetries": 3,

    "maxResultsPerCrawl": 0,

    "pageFunction": "async function pageFunction(context) {\n    const { $, request, log, enqueueRequest } = context;\n    const { Brand, Queued, PageNumber } = request.userData;\n    \n\n\n}",

    "pageFunctionTimeoutSecs": 120,

    "pageLoadTimeoutSecs": 120,

    "postNavigationHooks": "// We need to return array of (possibly async) functions here.\r\n// The functions accept a single argument: the \"crawlingContext\" object.\r\n[\r\n    async (crawlingContext) => {\r\n        // ...\r\n    },\r\n]",

    "preNavigationHooks": "[\r\n    async (crawlingContext) => {\r\n        const { request, log } = crawlingContext;\r\n        const { SearchKeyword, SearchUrl } = request.userData;\r\n        if (!SearchUrl) {\r\n            if (!SearchKeyword) {\r\n                log.info(\"SearchKeyword was not found in userData\");\r\n                return;\r\n            }\r\n            const query = encodeURIComponent(SearchKeyword.replace(/\\s{2,}/g, ' '));\r\n            const requestUrl = `${request.url.replace(/\\/$/, '')}/search?iq=${query}`;\r\n            request.userData.SearchUrl = requestUrl;\r\n            request.url = requestUrl;\r\n        }\r\n    }\r\n]",

    "proxyConfiguration": {

        "useApifyProxy": true

    },

    "proxyRotation": "RECOMMENDED",

    "startUrls": [

        {

            "url": "https://www.trony.it/online/",

            "userData": {

                "Manufacturer": "Haier",

                "Brand": "Haier",

                "SearchType": "AllPages",

                "SearchKeyword": "Frigo"

            },

            "method": "GET"

        }

    ]

}
~~~