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
