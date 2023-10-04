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
