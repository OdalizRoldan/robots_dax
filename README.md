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