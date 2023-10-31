# robots_dax
Robots de scraping web en dax-nuevatel

# Notas Retailer garbarino
## Crawler
 * Change notes:
     * Retailer seems to have gone through many changes. Result count, products and their data are now retrieved from different elements than before.
     * Crawler is now hybrid, as no meaningful data can only be retrieved from the product page except for stock.
     * No product variants seem to exist in the site, nor any trace of the API calls previously used to retrieve their data. Even products of the same model but with a different accesory seem to be treated as completely separate.
     * No sign of the product ID format previously used can be found. Now using product url (minus domain).
     * No meaningful IDs can be found inside or outside the product pages except for the ones occasionally on the product's name.
     * Detecting 0 products no longer throws an error.
         
**Lunes 02/10**
* CITIN Regex y Excluded Keeyboards cuando es necesario?
* Se encontraron APIs que tienen la informacion de todos los productos, se llama shop, los parametos que cambian en postman son: Num de pagina y nombre de brand.
* Se hicieron unas cuantas correcciones al código en Apify, se pondrá configuración de API
* Aún no saca correctamente el numero total de productos por marca.
        
# Notas Retailer ROFU
## Notas de las correcciones de QA - Crawler
- El availability se saca del esquema directamente, no es necesario sacarlo de la API, esta en otro esquema de stock
- Ya se eliminaron duplicados, aunque sigue habiendo uno mas
- Ya se aumento ean code
- Ya se arreglo el numero total de productos por pagina


### RUNs Apify - Correcciones
* Corrida #68, correciones al primer robot de las tres marcas, ahora devuelve tres resultados.
* https://www.rofu.de/l-o-l-surprise/?count=45&offset=0
* En la paginacion, se probó con el producto L.O.L https://www.rofu.de/l-o-l-surprise/?count=45&offset=0, si funciona la paginación, sin embargo, falta arreglar que solo encola los productos de la primera pagina en el caso de esa marca.
*  RUN 58 - Ultima version de Crawler de 3 productos
*  Ya no se esta usando la API que antes se tenia en el pre navigation hooks
*  Hay un error, no puede leer sku de los productos a partir del 45.


### Correcciones Viernes 29/09
- Beast Lab - 2 
- Scruff Luvs - 1
- Trolls - 2(Incluyendo el que es Scruff Luvs)
- LOL Surprise - 45+36=81

Entotal deberia tener 81 resultados:

Test - LOL: Saca los productos de la segunda pagina 
No saca L.O.L. Surprise - Dobble de la primera pagina

Test - Scruf Luvs:  Si funciona
Test - 


{
            "url": "https://www.rofu.de/l-o-l-surprise/",
            "method": "GET",
            "userData": {
                "Manufacturer": "MGA",
                "Brand": "L.O.L. Surprise",
                "Culture Code": "de-DE",
                "ApifyResultType": 0
            }
        },



Corrida 84 ya esta muuuuy bien, con los tres primeras marcas de la primera ficha.
- Beast Lab - 2 *
- Scruff a Luvs - 1 *
- Trolls - 2 * (Tambien se repite el Scruff a Luvs)
Mixies - 11 *
Real%20Littles - 4 *
Moose%20Games - 0
Little%20Live%20Pets - 16 -9(Tambien se repite el Scruff a Luvs)
Octonauts - 0
Akedo%20Warriors - 0
Cookeez%20Makery - 0

Total> 27 the best case
29 con 2 repetidos

### Correcciones Lunes 02 de octubre
* La logica de Rating esta bien, solo que en el caso del producto, no detecta correctamente los valores.
* ¿Cómo debe estar el archivo .txt? -> UK-Rofu-HC-Cheerio

#### En JIRA 
QA fixes:

It was verified that the robot does not lose products => failed = 0.

In the case of the Crawler, the Scruff a Luvs brand has only one product from the manufacturer Moose Toys, but it is on its product page, so a condition was implemented to verify if it is a product type scheme or product list (in the case of the other brands).

The handler message was changed to "404 Error" in both robots.

Required data extraction: The data extraction logic was changed, now both Crawler and Updater extract data from schemas.

Added GTIN Code and Stock of each product (in HC and Updater).

Removed the Image URL in the Updater.

The logic of ratings extraction in the Updater was corrected, in this case the logic was done with DOM data directly, although another way to extract it would be through the schema, but it was not implemented because it did not launch correct data.

It was tested with a product that had a ReviewCount > 0.

The logic for checking repeated products for each brand was corrected, this was simpler once it was changed to extraction by schema.

Corrected the pagination logic in the case of HC and tested with a brand that had more than one page. 

Added #rating to the URL of the existing rating.



Last Run:

Crawler:  

Updater:  


No results found for the brand ScopeEyecare.

Main Ticket: https://salamancasolutions.atlassian.net/browse/CS11EXE-5239



JSON Code:

Crawler: 



Updater:


Marcas faltantes:
- Beast Lab - 2 *
- Scruff a Luvs - 1 *
- Trolls - 2 * (Tambien se repite el Scruff a Luvs) *
Mixies - 11 *
Real%20Littles - 4 *
Moose%20Games - 0
Little%20Live%20Pets - 9 * (Tambien se repite el Scruff a Luvs)
Octonauts - 0
Akedo%20Warriors - 0

- Bluey 8 *
- TreasureX 8 *
- MagnaTiles 0

Total Aprox: 46


No hay productos de MagnaTiles

Para el Updater:
- 27 salian antes, mas las marcas faltantes + 16

# Notas Retailer Dragaira
- La pagina de busqueda tiene API
- La pagina de producto tiene esquema con datos
- Al parecer será Methamorph porque necesita tener acceso especial para entrar a la pagina.
- Todos los archivos complementarios los mando Raquel por skype.

### Trabajo 04/10/2023
    Errores a corregir: Reclaiming failed request back to the list or queue. TypeError: page.waitFor is not a function 6:20

    [
    async (crawlingContext) =>
    {
        const { page, request, Apify } = crawlingContext;
        const { OriginalUrl, Index, ProductPage, StockOnly } = request.userData;
        const { RatingPage } = request.userData;

        if (!page && !StockOnly) {
            var cookies = await Apify.getValue("cookies");

            request.headers = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
            "cookie": `${cookies}`
            }
        }
    }
    ]


    2023-10-04T16:22:42.076Z WARN  CheerioCrawler: Reclaiming failed request back to the list or queue. The HTTP/2 stream has been early terminated
    2023-10-04T16:22:42.078Z  {"id":"dMJAmBeWm1H8uq5","url":"https://www.drogaraia.com.br/cetaphil-creme-hidratante-453g-813709.html","retryCount":1}


    2023-10-04T18:00:45.687Z WARN  CheerioCrawler: Reclaiming failed request back to the list or queue. Detected a session error, rotating session...
    2023-10-04T18:00:45.693Z Proxy responded with 590 UPSTREAM503: 0 bytes

    - Puede que esta sea la API que se esta usando: https://www.drogaraia.com.br/api/next/middlewareGraphql


### Trabajo 05/10/2023
* Se cambio el selector de la palabra Drogaraia
* Se cambio a una API especial
* Se subieron ambos robots a JIRA.
* Este es el ajaz que se encontró en el ultimo robot que se asigno:

curl 'https://www.sensodays.ro/ajaxproducts/' \
  -H 'authority: www.sensodays.ro' \
  -H 'accept: */*' \
  -H 'accept-language: es-ES,es;q=0.9,en;q=0.8' \
  -H 'content-type: application/x-www-form-urlencoded' \
  -H 'cookie: custom_form_key=tkfwkyqbpzarrrvu; _vwo_uuid_v2=D955069C67AEB62DF70C748AE9B31EAEE|4e18e88a216655585ceb6c0cd3b439be; frontend=1cd7d356f28e56064883893b4c4a3ffd; consent_cookie={"accept_all":1,"consent_duration":365,"button_id":"accept_all"}; _gid=GA1.2.1316605708.1696534522; _fbp=fb.1.1696534522331.1681956937; twk_idm_key=2jt5iyoqUK8bei3awz2qe; closedBanner=true; _gat_UA-41615440-3=1; __kla_id=eyJjaWQiOiJZVFV5TWpNellqZ3ROVEEzTnkwMFlURTFMV0kzTm1NdE9EWTFNakF4T0dNNFpEZGgiLCIkcmVmZXJyZXIiOnsidHMiOjE2OTY1MzQ1NDMsInZhbHVlIjoiaHR0cHM6Ly93d3cuc2Vuc29kYXlzLnJvLyIsImZpcnN0X3BhZ2UiOiJodHRwczovL3d3dy5zZW5zb2RheXMucm8vY2F0YWxvZ3NlYXJjaC9yZXN1bHQvP3E9VEVLQSJ9LCIkbGFzdF9yZWZlcnJlciI6eyJ0cyI6MTY5NjUzNTQ3MiwidmFsdWUiOiJodHRwczovL3d3dy5zZW5zb2RheXMucm8vIiwiZmlyc3RfcGFnZSI6Imh0dHBzOi8vd3d3LnNlbnNvZGF5cy5yby9jYXRhbG9nc2VhcmNoL3Jlc3VsdC8/cT1URUtBIn19; page_views=6; TawkConnectionTime=0; twk_uuid_538dc74cc3122f590e000017=%7B%22uuid%22%3A%221.SwqOty6q7qxRVJlDijuEA1YtFetLshsGors2Hj3jV0NcrXujoGn359e20VFWMF0Jn2LcC2LAUgGPEcJt0z1lzZTI3JDT4aNlkXAbFmbPuTFKJTzzgKhlo%22%2C%22version%22%3A3%2C%22domain%22%3A%22sensodays.ro%22%2C%22ts%22%3A1696535481199%7D; _ga=GA1.1.1847132893.1696534522; _ga_DT511TP2S8=GS1.1.1696534521.1.1.1696535486.46.0.0' \
  -H 'origin: https://www.sensodays.ro' \
  -H 'referer: https://www.sensodays.ro/chiuveta-teka-centroval-45-inox-microtexturat.html' \
  -H 'sec-ch-ua: "Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36' \
  --data-raw 'is_ajax=true&is_list=true&product_ids=52728,67227,72756,79543,85415,90201,101680,111076,117261,117866,120078,121374,135540,123409,93293,85383,69831&curent_page=catalog&referer=aHR0cHM6Ly93d3cuc2Vuc29kYXlzLnJvL2NoaXV2ZXRhLXRla2EtY2VudHJvdmFsLTQ1LWlub3gtbWljcm90ZXh0dXJhdC5odG1s' \
  --compressed

* Al parecer necesita extraer cookies, su header necesita una cadena con todas las cookies, ¿Habra que cambiarlo a Puppeteer?

### Trabajo 06/10/2023
* Se quitaron varios headers y se verifico que devuelve el mismo output.
* Este código quita doble espacio y espacio al principio y final: $('meta[itemprop="name"]').attr('content').trim().replace(/\s{2,}/g, ' ').trim();

* Verificar duplicados

### Trabajo 09/10/23
* Guinness - 9
* Baileys - 2
* Smirnoff - 12
* Captain Morgan - 4
* Hop House 13 - 5
  
    32
    1ra - 30
    2DA - 13
    43

    Crawler description
    The proxy configuration was changed from automatic to residential by the country of the Retailer (Ireland), because without this change it was not possible to access the page.

    The Prenavigation hooks API was modified, because it did not know correct data in all test cases with other brands.

    Configurations
    Proxy configuration: Shader proxy (Ireland)

    Compilation version: versión-3

    Last execution
    Crawler: Apify Console 

### Trabajo 10/10/23
* Lo trasformaremos a FC porque ahora el detalle de cada producto no esta en la pagina de busqueda.
De la caja 3 a la 7
* Nos quedamos con algunos problemas la URL de categoria.

### Trabajo 11/10/23
* Las APIs con este esquema "https://widget.trustpilot.com/trustbox-data/54d39695764ea907c0f34825?businessUnitId=487cd0e0000064000502f650&locale=en-GB&sku=PIE631BB5E" con numeros por delante, tienen los datos de tating
* 

<img width="324" height="324" src="https://mlvtgiqzoszz.i.optimole.com/Sb3K8mU-E6q8t09s/w:324/h:324/q:90/https://www.appliancecity.co.uk/wp-content/uploads/2023/06/Bosch-hbg7341b1b-1.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" decoding="async" data-opt-lazy-loaded="false">

### Trabajo 12/10/23
Observations:
* The robot can be obtained through Cheerio.
* Using cookies and having it as a Puppeteer-type bot is unnecessary.
* A functional script was found that can retrieve specific product information.
* Price and stock information should be obtained through the DOM.
* An example was provided for the Dev to continue with the structure.
Note: Some scripts do not read the first enqueue, but it eventually works.

* Se arreglo SensoDays
Se trabajó en robot de categorias un poco.

### Trabajo 13/10/23
* #Products of
    * Dishwashers: 36 -Check
    * Cooking: 103 - Check
    * laundry: 30 - Check
    * Refrigeration: 86 - Check
    * Small Appliances: 1 - Check

    * #Total of products: 170 + 86 - 256

* Pets Retailer
    **Modificaciones al Postman**
    * Aumento content*type
    * Accept-Encoding:
* Se intentará acceder con Puppeteer
 * La mejor opcion es probar si sacando cookies con methamorph funciona porque se intento con Puppeteer normalito y nel, tampoco puede acceder al JSON desde Postman, debe haber algun tipo de atenticacion.
 * Inlcluso nos logueamos a la pagina y nel
 * Lo unico que faltaria intentar seria entrar desde otra IP, es posible que nos hallan bloqueado por intentar entrar muchas veces.
 **Retailer ApplianceCity**
     * Resulta que la marca haier tiene una estructura de datos distinta, lo que significa que la logica actual no funcionara en esa pagina.
### Trabajo 16/10/23
* Hay paginas de categorias que se dividen en:
* Tienen el diseño por defecto que usamos inicialmente
* Tienen un esquema de ficha con boton por categiria - Falta implementar
* Se van directamente a la pagina donde estan todos los productos - Falta implementar

### Verificacion de numero de productos con la nueva logica:
    * Haier American Style Fridge Freezers: 9*
    * Fridge Freezers: 12*
    * Haier Wine Coolers: 1*
    * Washing Machines: 9*
    * Washer Dryers: 5*
    * Tumble Dryers: 7*
    * Search results: “979”: 14*
        * TOTAL: 57


**Bosch**>  Real: 255   
**Brand Siems:** 163
    * Siemens Cooking 81
    * Siemens Refrigeration 44
    * Siemens Laundry 16
    * Siemens Dishwashers 15
    * Siemens Coffee Machines 7
    Real: 163

**Brand Neff:** 222
    * Neff Cooking Appliances 121** 108
    * Neff Dishwashers 14**
    * Neff Extraction 56**
    * Neff Laundry 7**
    * Neff Refrigeration 37**
     Real:222
     Las ultimas dos paginas> 10 y 11 no tienen productos.

**Brand Haier:** 57
    * Haier American Style Fridge Freezers 9
    * Fridge Freezers 12
    * Haier Wine Coolers 1
    * Washing Machines 9
    * Washer Dryers 5
    * Tumble Dryers 7
    * Search results: “979” 14
    Real: 57


    Total de las 4 marcas: 697 - 255(Bosch) 442 + 29 - 471 - 446


### Proximas mejoras: 
* Que acepte las paginas que se van directo al listado de productos
* 

{
            "url": "https://www.appliancecity.co.uk/?s=bosch&post_type=product",
            "userData": {
                "Manufacturer": "BSH",
                "Brand": "Bosch",
                "Culture Code": "en-GB",
                "ExcludedKeyWords": "COOKING|REFRIGERATION|LAUNDRY|DISHWASHERS|APPLIANCES",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.appliancecity.co.uk/?s=haier&post_type=product",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Haier",
                "Culture Code": "en-GB",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.appliancecity.co.uk/?s=siemens&post_type=product",
            "userData": {
                "Manufacturer": "BSH",
                "Brand": "Siemens",
                "Culture Code": "en-GB",
                "ApifyResultType": 0
            }
        },
        {
            "url": "https://www.appliancecity.co.uk/?s=neff&post_type=product",
            "userData": {
                "Manufacturer": "BSH",
                "Brand": "Neff",
                "Culture Code": "en-GB",
                "ApifyResultType": 0
            }
        }


Hemos sacado esto de Custom Data de Apify
{
    "productsPerPage": 12,
    "paginationDomain": "https://www.appliancecity.co.uk/page/",
    "domain": "https://www.appliancecity.co.uk/"
}

### Trabajo 18/10/23
* Empezando con el nuevo robot, algo pasa con la deteccion de duplicados con el storage de apify, se esperar haber si son temas de la plataforma.
* Despues todo esta funcionanado bastante bien, casi listo para subir a JIRA.
### Trabajo 19/10/23

https://www.laptopsdirect.co.uk/-24e1n5300he-00/version.asp
24E1N5300HE/00

42M2N8900/00
- Todas las letras a minusculas
- guion adelante
- Cambiar / por -
{
            "url": "https://www.laptopsdirect.co.uk/nav/fts/philips/fts/brd/philips?itemsPerPage=48",
            "userData": {
                "Manufacturer": "Philips",
                "Brand": "Philips",
                "Culture Code": "en-GB",
                "ExcludedKeyWords": "REFURBISHED",
                "ApifyResultType": 0
            },
            "method": "GET"
        },

### Trabajo 24/10/23
- Se terminó el robot 14

https://www.planeo.sk/vyhledavani$a1013-search?query=Whirlpool

https://www.planeo.sk/vyhledavani$a1013-search?df_fp_price_MIN=9&df_fp_price_MAX=1639&fp_price_MIN=9&fp_price_MAX=1639&query=Whirlpool&limit=24&sorting=RELEVANCE&offset=24

https://www.planeo.sk/vyhledavani$a1013-search?query=Whirlpool&limit=24&sorting=RELEVANCE&offset=24



https://www.planeo.sk/vyhledavani$a1013-search?df_fp_price_MIN=9&df_fp_price_MAX=1639&fp_price_MIN=9&fp_price_MAX=1639&query=Whirlpool&limit=24&sorting=RELEVANCE&offset=48

https://www.planeo.sk/vyhledavani$a1013-search?query=Whirlpool&limit=24&sorting=RELEVANCE&offset=48

### Paginas clave de LuigisBox
- https://scripts.luigisbox.com/LBX-199881.js
- https://cdn.luigisbox.com/planeo-sk.js
- https://live.luigisbox.com/search?tracker_id=175437-199881&f[]=brand:Philips&f[]=type:item&q=philips&size=24
- **Panel Central** https://app.luigisbox.com/sites/411937-493820/recommenders/analytics

https://mc-static.fast.eu/pics/41/41009006/41009006-threetwenty.webp?2444651719

https://mc-static.fast.eu/pics/41/41009006/41009006-min.jpg?2444651719

https://mc-static.fast.eu/pics/40/40018771/40018771-lim.jpg?1324817955

https://mc-static.fast.eu/pics/40/40018771/40018771-lim.jpg?

"https://mc-static.fast.eu/pics/40/" + productId + "/" + productId + "-lim.jpg"

https://mc-static.fast.eu/pics/40/40046712/40046712-threetwenty.webp?2213592313

- Se encontro una API que devuelve un html que tiene los datos, este script esta en el mismo DOM, tiene datos mas completos que el esquema, ya que este ultimo tiene identificadores que no son los IDs, ver de sacar datos del script del DOM directamente y armar la url de imagen con el product ID

head > script:nth-child(54)


    head > script:nth-child(54)

    <script>
dataLayer.push({
event: &apos;view_item_list&apos;,
items: [

{
item_name: &quot;Whirlpool AKR 62F LT K&quot;,
item_id: &quot;40044763&quot;,
item_category:&apos;Ve&#x13e;k&#xe9; dom&#xe1;ce spotrebi&#x10d;e&apos;,
price: &quot;190.83&quot;,
vat: &quot;39&quot;,
item_brand: &quot;Whirlpool&quot;,
discount: 0.00,
2variant: undefined,
 availability: &apos;Na centr&#xe1;lnom sklade a v predajni&apos;,
item_list_name: &apos;Search&apos;,
item_list_id: undefined,
index: &quot;1&quot;,
}
</script>


https://www.planeo.sk/wpro-chf28-1-filter
Wpro CHF28/1 filter

https://mc-static.fast.eu/pics/43/43002818/43002818-threetwenty.webp?3632458344
https://mc-static.fast.eu/pics/40/43002818/43002818-lim.jpg

43001974 https://mc-static.fast.eu/pics/40/43001974/43001974-lim.jpg
43001988 https://mc-static.fast.eu/pics/40/43001988/43001988-lim.jpg
43001207 https://mc-static.fast.eu/pics/40/43001207/43001207-lim.jpg
43002818 https://mc-static.fast.eu/pics/40/43002818/43002818-lim.jpg
43001907 https://mc-static.fast.eu/pics/40/43001907/43001907-lim.jpg
98034751 https://mc-static.fast.eu/pics/40/98034751/98034751-lim.jpg

https://mc-static.fast.eu/pics/98/98034751/98034751-lim.jpg

item_name: "Whirlpool AKR 749 IX",
                        item_id: "43001207",
                        item_category:'Veľké domáce spotrebiče',
                        price: "99.17",
                        vat: "20",
                        item_brand: "Whirlpool",
                        discount: 0.00,
                        variant: undefined,
                        availability: 'Iba v predajni',
                        item_list_name: 'Search',
                        item_list_id: undefined,
                        index: "2",
                    },


- Ya pusimos todas las URLs modificadas, solo falta implementar logica de palabras excluidas y ver poque no funciona cambiar 43 por 40 en las imagenes, provar que saque todos los productos y si en algun lado hay un eancode o citincode


'https://mc-static.fast.eu/pics/40/40042621/40042621-onesixty.jpg?1956415824'

'https://mc-static.fast.eu/pics/40/40042621/40042621-onesixty.jpg?1956415824, https://mc-static.fast.eu/pics/40/40042621/40042621-threetwenty.jpg?1956415824 2x'

'https://mc-static.fast.eu/pics/40/40045375/40045375-onesixty.jpg?216488214'

{
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Whirlpool&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Whirlpool",
                "Brand": "Whirlpool",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            },
            "method": "GET"
        },

- Brand: Whirlpool
    NumerProducts - Expected: 24+24+24+24+22+1=119
    NumerProducts - Real: 119
    - Los precios de los productos sonmenores que los que estan en la pagina del retailer
- Brand: Philips
    NumerProducts - Expected: 555
    NumerProducts - Real: 546
- Brand: Candy
    NumerProducts - Expected: 57
    NumerProducts - Real: 57
- Brand: Hoover
    NumerProducts - Expected: 24+22+1
    NumerProducts - Real: 46

- Brand: Haier
    NumerProducts - Expected: 21
    NumerProducts - Real: 21
A;adir control que verifique que en el nombre del producto dice la marca tmabien
789
 {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Philips&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Philips",
                "Brand": "Philips",
                "Culture Code": "sk-SK",
                "ExcludedKeyWords": "ŽIAROVKA|HUE|LED PÁSIK|STMIEVACÍ SET|SVIETIDLO|ŽIARIVKA|LED CLASSIC|LAMPA|CHYTRÁ ZÁSTRČKA|OVLÁDAČ STMIEVANIA|REFLEKTOR",
                "ApifyResultType": 0,
                "offsetPage": 0
            }
        },
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Candy&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Candy",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            }
        },
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Hoover&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Hoover",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            }
        },
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Haier&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Haier",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            }
        }

- The robot's data extraction logic was changed almost 100%, since initially data was extracted from an external API (app.luigisbox.com), which allows the retailer's search engine to recommend AI products to the user, once the user uses the search engine.
- Not finding the original call to luigisbox within the code of the robot, we changed both the input data (URLs) and the logic of data extraction by an external API that returns a script that contains 4/6 required data, the other 2/6 data are built from the others that we have.
- Since the number of products per brand is extracted from the DOM, a control is implemented that verifies that the required data is first extracted from the DOM and when DataEnable == True it calls the API that has the data in the script mentioned above.}
- In the case of the API, it does not require any payload or header.
- The function const $$ = cheerio.load(body) is used to access the data inside the script, since it is inside an XML type file.
- Excluded word detection logic is implemented (which works in the case of the Philips brand).

## Avances 30/10
,
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Philips&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Philips",
                "Brand": "Philips",
                "Culture Code": "sk-SK",
                "ExcludedKeyWords": "ŽIAROVKA|HUE|LED PÁSIK|LED|STMIEVACÍ SET|SVIETIDLO|ŽIARIVKA|LED CLASSIC|LAMPA|CHYTRÁ ZÁSTRČKA|OVLÁDAČ STMIEVANIA|REFLEKTOR",
                "ApifyResultType": 0,
                "offsetPage": 0
            },
            "method": "GET"
        },
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Candy&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Candy",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            },
            "method": "GET"
        },
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Hoover&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Hoover",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            },
            "method": "GET"
        },
        {
            "url": "https://www.planeo.sk/vyhledavani$a1013-search?query=Haier&limit=24&sorting=RELEVANCE&offset=0",
            "userData": {
                "Manufacturer": "Candy",
                "Brand": "Haier",
                "Culture Code": "sk-SK",
                "ApifyResultType": 0,
                "offsetPage": 0
            },
            "method": "GET"
        }



https://www.planeo.sk/katalog/40048030-whirlpool-w7f-hs31.html
https://www.planeo.sk/katalog/1040665-philips-hr2744-40-lis-na-citrusy.html

https://www.planeo.sk/katalog/43001988-whirlpool-akp-745-wh-vstavana-rura.html

QA Fixes

About productURLs:

Cannot get the production URL directly, either by DOM, schema, or API script.

An attempt was made to assemble the production productURL with the required parameters, but one of them (the number in the middle) is not the productID, nor can it be obtained from the script, schema or DOM, so the alternative was taken to keep the shortened product URL.

Production URL: https://www.planeo.sk/katalog/1024057-philips-sdv5120-12-antena.html

Short URL: https://www.planeo.sk/philips-sdv5120-12

Added manufacturer.

Changed the price format to int.



Last execution

Crawler:


## Codigo anterior a modificaciones
async function pageFunction(context) {
    const { $, request, log, json, enqueueRequest, body, cheerio, axios } = context;
    const { Manufacturer, Brand, Paginated, offsetPage, DataEnable, ExcludedKeyWords } = request.userData;
    var domain = 'https://www.planeo.sk/';
    if (!DataEnable) {
        if (!Paginated) {
            var productsPerPage = 24;
            var totalProducts = $("#accordion-panel-producer > div > div > div:nth-child(2) > label > span > span").text().replace(/^\s*\(|\)\s*$/g, "");
            const totalPages = Math.ceil(Number(totalProducts) / productsPerPage);
            log.info(`${Brand} TOTAL PRODUCTS: ${Math.ceil(totalProducts)}`);
            log.info(`${Brand} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
            log.info(`${Brand} TOTAL ITERATIONS: ${totalPages}`);

            for (var index = 1; index < totalPages; index++) {
                var nextPage = "https://www.planeo.sk/vyhledavani" + encodeURIComponent("$") + `a1013-search?query=${Brand}&limit=24&sorting=RELEVANCE&offset=` + (index * productsPerPage);
                log.info(`This is the next page ${nextPage}`);

                var nextPageRequest = {
                    url: nextPage,
                    userData: {
                        Paginated: true,
                        Brand,
                        ExcludedKeyWords,
                        offsetPage: Number(index * productsPerPage)
                    }
                }
                await enqueueRequest(nextPageRequest);
            }
        }

        const apiRequest = `https://www.planeo.sk/vyhledavani` + encodeURIComponent("$") + `a1013-search.xml?query=${Brand}&limit=24&sorting=RELEVANCE&offset=${offsetPage}`;
        await enqueueRequest({
            url: apiRequest,
            method: 'GET',
            userData: {
                DataEnable: true,
                ExcludedKeyWords
            }
        })

    }
    if (DataEnable) {
        var results = [];
        var match = null;

        const $$ = cheerio.load(body);
        var scriptTag = $$("script").first();
        var jsonLdScript = scriptTag.html();
        cleanScript = jsonLdScript.replace(/&apos;/g, "'").replace(/&quot;/g, '"');

        let dataLayer = {
            push: function (obj) {
                for (let item of obj.items) {
                    var productId = item.item_id;
                    var productName = item.item_name;
                    var stock = item.availability == "Iba v predajni" ? "InStock" : "OutOfStock";

                    productDecode = productName.replace(/&#(x[0-9a-fA-F]+);/g, function (match, grp) {
                        return String.fromCharCode(parseInt(grp.substr(1), 16));
                    });
                    var productNameDecode = productDecode.replace(/&amp;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

                    var price = item.price;
                    var productUrl = domain + productDecode.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-').replace('.', '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    var imageUri = "https://mc-static.fast.eu/pics/" + productId.match(/^(\d{2})/)[0] + "/" + productId + "/" + productId + "-lim.jpg";

                    if (ExcludedKeyWords) {
                        match = ExcludedKeyWords;
                    }

                    var testKeyword = new RegExp(match).test(productNameDecode.toUpperCase());
                    if (testKeyword && ExcludedKeyWords) {
                        log.info('Refurbished product ' + productNameDecode);
                        var excluded = {
                            Handled: true,
                            Message: `Product excluded`,
                            Url: productUrl
                        }
                        results.push(excluded);
                    }

                    else {
                        var product = {
                            ProductId: productId,
                            ProductName: productNameDecode,
                            ProductUrl: productUrl,
                            Price: Number(price),
                            Manufacturer,
                            ImageUri: imageUri,
                            Stock: stock
                        }
                        results.push(product);
                    }
                }
            }
        };
        eval(cleanScript);
    }
    return results;
}

"""""""""""""""""""""" Segunda version del codigo °°°°°°°°°°°°°°°°

async function pageFunction(context) {
    const { $, request, log, json, enqueueRequest, body, cheerio } = context;
    const { Manufacturer, Brand, Paginated, offsetPage, DataEnable, ExcludedKeyWords, Product } = request.userData;
    var domain = 'https://www.planeo.sk/';

    if (!DataEnable) {
        if (!Paginated) {
            var productsPerPage = 24;
            var totalProducts = $("#accordion-panel-producer > div > div > div:nth-child(2) > label > span > span").text().replace(/^\s*\(|\)\s*$/g, "");
            const totalPages = Math.ceil(Number(totalProducts) / productsPerPage);
            log.info(`${Brand} TOTAL PRODUCTS: ${Math.ceil(totalProducts)}`);
            log.info(`${Brand} TOTAL PRODUCTS PER PAGE: ${productsPerPage}`);
            log.info(`${Brand} TOTAL ITERATIONS: ${totalPages}`);

            for (var index = 1; index < totalPages; index++) {
                var nextPage = "https://www.planeo.sk/vyhledavani" + encodeURIComponent("$") + `a1013-search?query=${Brand}&limit=24&sorting=RELEVANCE&offset=` + (index * productsPerPage);
                log.info(`This is the next page ${nextPage}`);
                var nextPageRequest = {
                    url: nextPage,
                    userData: {
                        Manufacturer,
                        Brand,
                        ExcludedKeyWords,
                        Paginated: true,
                        offsetPage: Number(index * productsPerPage)
                    },
                }
                await enqueueRequest(nextPageRequest);
            }
        }
        var productsGrid = $("#product-filter-product-tiles > div").toArray();
        for (let element of productsGrid){
            let price = $(element).find(".c-product__price-action-box > div > div > strong").text().replace(/€/g, '').trim();
            log.info("This is the correct price: " + price);
            let product = {
                Price: price
            }
            var apiRequest = `https://www.planeo.sk/vyhledavani` + encodeURIComponent("$") + `a1013-search.xml?query=${Brand}&limit=24&sorting=RELEVANCE&offset=${offsetPage}`;
            await enqueueRequest({
                url: apiRequest,
                method: 'GET',
                userData: {
                    DataEnable: true,
                    ExcludedKeyWords,
                    Product: product
                }
            })
        }
    }
    var match = null;
    results = [];
    if (DataEnable) {
        const $$ = cheerio.load(body);
        var scriptTag = $$("script").first();
        var jsonLdScript = scriptTag.html();
        cleanScript = jsonLdScript.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
        let dataLayer = {
            push: function (obj) {
                for (let item of obj.items) {
                    var productId = item.item_id;
                    Product.ProductId = productId;
                    var productName = item.item_name;
                    var stock = item.availability == "Iba v predajni" ? "InStock" : "OutOfStock";
                    Product.Stock = stock;

                    var productDecode = productName.replace(/&#(x[0-9a-fA-F]+);/g, function (match, grp) {
                        return String.fromCharCode(parseInt(grp.substr(1), 16));
                    });
                    var productNameDecode = productDecode.replace(/&amp;/g, "'").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
                    Product.ProductName = productNameDecode;

                    var productUrl = domain + productDecode.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-').replace('.', '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    Product.ProductUrl = productUrl;
                    var imageUri = "https://mc-static.fast.eu/pics/" + productId.match(/^(\d{2})/)[0] + "/" + productId + "/" + productId + "-lim.jpg";
                    Product.ImageUri = imageUri;

                    let product = {
                        ProductId: productId,
                        ProductName: productNameDecode,
                        ProductUrl: productUrl,
                        Price: price,
                        Manufacturer,
                        ImageUri: imageUri,
                        Stock: stock
                    }
                    results.push(product);
                }
            }
        };
        eval(cleanScript);
    }
    return results;
}


https://www.planeo.sk/vyhledavani$a1013-search?fp_producer=644bb8677ff932078206b4f8&df_fp_price_MIN=9&df_fp_price_MAX=1689&fp_price_MIN=9&fp_price_MAX=1689&query=Whirlpool&limit=72&sorting=RELEVANCE



https://www.planeo.sk/vyhledavani$a1013-search?query=Whirlpool&limit=24&sorting=RELEVANCE&offset=0

https://www.planeo.sk/vyhledavani$a1013-search?fp_producer=644bb8677ff932078206b4f8&query=Whirlpool&limit=24&sorting=RELEVANCE&offset=96



https://www.planeo.sk/vyhledavani$a1013-search?query=Philips&limit=24&sorting=RELEVANCE&offset=0"

https://www.planeo.sk/vyhledavani$a1013-search?fp_producer=644bb83d7ff9320782067c64&query=Philips&limit=24&sorting=RELEVANCE


https://www.planeo.sk/vyhledavani$a1013-search?query=Candy&limit=24&sorting=RELEVANCE&offset=0

https://www.planeo.sk/vyhledavani$a1013-search?fp_producer=644bb7f57ff932078206194d&query=Candy&limit=24&sorting=RELEVANCE



https://www.planeo.sk/vyhledavani$a1013-search?fp_producer=644bb8157ff932078206463e&query=Hoover&limit=24&sorting=RELEVANCE


https://www.planeo.sk/vyhledavani$a1013-search?fp_producer=644bb8127ff932078206412b&query=Haier&limit=24&sorting=RELEVANCE