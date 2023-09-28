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
*  