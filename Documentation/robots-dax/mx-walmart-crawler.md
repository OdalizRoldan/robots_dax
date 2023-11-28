~~~
0:35 min
4.15$ - 4.18 - 4.19$ 4.21 - 4.28 - 4.61 - 4.67 - 4.69 - 4.83 - 4.85 - 4.87 - 4.89 - 4.91
4417 ->>> 0.08
- 4.93
~~~

### Actividades realizadas
- Se cambio la lógica del robot de DOM a API.
- Se configuraron los parámetros necesarios en el Pre-navigation Hooks para acceder a los datos de la API.
- Se añadió lógica de paginación.
- Se añadió eliminación de productos duplicados.
- Se añadieron controles para captar los productos sponsoreados.
- Las marcas: xxx devuelven la misma cantidad de resultados que los que se puede ver en el UI del retailer.
- Las marcas xxx devuelven un numero inferior y superior de productos respectivamente, los siguientes pasos que se tomaran serán:
	- Identificar porque las dos ultimas marcas no devuelven productos esperados.
	- Analizar si se necesita implementar una lógica de extracción de datos dependiendo la categoría del producto.
	- Comparar resultados finales con los de producción.
---
- Changed the robot logic from DOM to API.  
- Configured the necessary parameters in the Pre-navigation Hooks to access the API data.  
- Added pagination logic.  
- Added duplicate product removal.  
- Added controls to capture sponsored products.  
- Brands: Teka, Remington, Suavitel, , Black & Decker and Axion return the same number of results as can be seen in the retailer UI.  
- Brands: Colgate and Caprice return a lower and higher number of products respectively.
- The next steps to be taken will be:  
	- Identify why the last two brands do not return expected products.  
	- Analyze if a data extraction logic needs to be implemented depending on the product category.  
	- Compare final results with production results.  
  
### Actividades realizadas 15/11
 Se añadió filtrado a la URL de todas las marcas, ya que a pesar de la inexistencia de productos de una  marca en especifico, la pagina carga productos de otras marcas. `ok`
- Se añadio un control en el codigo para que solo devuelva los productos que son de las marcas requeridas. `ok`
- Casos especiales:
	- Suavitel: El retailer no tiene ningun producto de esta marca, por lo que no se obtiene ningun resultado.
	- Axion: El retailer no tiene ningun producto de esta marca, anteriormente, cuando se filtraba la URL con esta marca, se redirigia a otro retailer (Super Willper), por lo que tambien se añadio en el codigo una logica para detectar que no se redireccione a ningun otro dominio.
	- Caprice: El retailer no tiene ningun producto de esta marca, tambien se añadio un control para que no se redireccione a super.willper
- Las pruebas del código de forma individual por marca dan resultados correctos, sin embargo, cuando se hace un testeo de los resultados con todas las marcas, los resultados son inconsistentes, esto se debe a que se realizan muchas llamadas al retailer.
- Se revisara como arreglar este ultimo inconveniente antes de mandarlo a QA.
---

~~~
>>>>> Tomar en cuenta
> Acortar la URL de imagen - Pending
> Quitar espacios al final del nombre - Pending

~~~
- Corregir excepción de precio de productos, cuando no encuentra precio, lo setea a 0, una solución es que si no lo encuentra lo saque del DOM o ver porque no lo encuentra, tratar de sacar el dato de otro lado del DOM.
	- 11,17,13
	- Page 11 -> 15-18
- Hay productos que no son de la marca requerida, los filtros por URL no funcionan, entonces se puede controlar la propiedad Brand del JSON
- En caso de paginas que de hecho no contienen ningun producto de esa marca, como Suvitel, a un principio se deberia verificar si esta vacio para no tener que revisar la marca de todos los productos.
- Se agrego un control para ver que no se redirija al retailer super
- Hay un producto con la marca Black + Decker, con espacios, ese es el que faltaba que no se esta mostrando en los resultados
- Se cambio max-currency a 1
- Se cambio max-request a 3
- El robot de produccion estaba con versoin-2 -> Igual sigue sin funcionar
- Se cambio max-xurrency y max-request y aun asi saca una canrtidad menor de productos, el ultimo fue 231

~~~
>>>>> Preguntas
- Como hizo el updater el dev de CS?
~~~

### Comparación con producción

- Teka - 968(UI) - 799(Crawler) + 169 duplicados =  968
> Teka - 169(UI) - 169(Crawler) - 6 duplicados

Remington - 59(UI) - 59(Crawler) - No detecta duplicado
> Remington - 57(UI) - 57(Crawler) - No detecta duplicado

Black & Decker - (725)(UI) - 708(Crawler) + 17 duplicados = 725
> Black+Decker -69 (UI) - 67(Crawler) - 1 duplicado
> Alguno debe tener marca vacia, ese uno que falta

Suavitel 968(UI) - 839(Crawler) + 129 duplicados = 968
> Suavitel - 0(UI) - 0(Crawler) - Ningun duplicado
> No hay ningun producto en el retailer de la marca Caprice, ni tampoco redirecciona a Super

Axion 5(UI) - 5(Crawler)  No detecta duplicado
> No hay resultados para Axion en este retailer, lo manda directamente a super (https://super.walmart.com.mx/browse/limpieza-del-hogar/limpieza-de-cocina/lavatrastes/3680090_120113_120409)

**Colgate 15(UI) - 15(Crawler)  No detecta duplicado
> Colgate - 11(UI) - 11(Crawler) -  No detecta duplicado

**Caprice 968 - UI - 755 Crawler - (213) duplicados** 968
> Caprice - 0(UI) - 0(Crawler) - Ningun duplicado
> No hay ningun producto en el retailer de la marca Caprice, ni tampoco redirecciona a Super

#### Evaluación de resultado
Teka 162 - ok
Remigton 64 - 64
Black+Decker 68 - 66
Colgate 11 - 11
Caprice 0
Suavitel 0
Axion 0 - 30
****
### Input
~~~javascript
{
      "url": "https://www.walmart.com.mx/search?q=Teka&facet=brand%3ATeka",
      "userData": {
        "Manufacturer": "Teka",
        "Brand": "Teka",
        "Culture Code": "es-MX",
        "CTINRegex": "(?<=TEKA)[^*]+",
        "ApifyResultType": 0
      }
    },
    {
      "url": "https://www.walmart.com.mx/search?q=Remington&facet=brand%3ARemington",
      "userData": {
        "Manufacturer": "Spectrum",
        "Brand": "Remington",
        "Culture Code": "es-MX",
        "CTINRegex": "(\\w+-)?[A-Z0-9]+\\d+[A-Z0-9]+(-\\w+)?",
        "ApifyResultType": 0
      }
    },
    {
      "url": "https://www.walmart.com.mx/search?q=Black+%26+Decker&facet=brand%3ABlack%2Bdecker",
      "userData": {
        "Manufacturer": "Spectrum",
        "Brand": "Black+decker",
        "Culture Code": "es-MX",
        "CTINRegex": "(\\w+-)?[A-Z0-9]+\\d+[A-Z0-9]+(-\\w+)?",
        "ApifyResultType": 0
      }
    },
    {
      "url": "https://www.walmart.com.mx/search?q=Suavitel&facet=brand%3ASuavitel",
      "userData": {
        "Manufacturer": "Colgate-Palmolive",
        "Brand": "Suavitel",
        "Culture Code": "es-MX",
        "ApifyResultType": 0
      }
    },
    {
      "url": "https://www.walmart.com.mx/search?q=Axion&facet=brand%3AAxion",
      "userData": {
        "Manufacturer": "Colgate-Palmolive",
        "Brand": "Axion",
        "Culture Code": "es-MX",
        "ApifyResultType": 0
      }
    },
    {
      "url": "https://www.walmart.com.mx/search?q=Colgate&facet=brand%3AColgate",
      "userData": {
        "Manufacturer": "Colgate-Palmolive",
        "Brand": "Colgate",
        "Culture Code": "es-MX",
        "ApifyResultType": 0
      }
    },
    {
      "url": "https://www.walmart.com.mx/search?q=Caprice&facet=brand%3ACaprice", 
      "userData": {
        "Manufacturer": "Colgate-Palmolive",
        "Brand": "Caprice",
        "Culture Code": "es-MX",
        "ApifyResultType": 0
      }
    }
~~~

### Consulta para Daniel
The option of extracting the data through API was taken, since it has the totality of the data, however, the following irregularities were found:

1. About the operation of the retailer:
	Some URLs with filters by brand redirect to another retailer:
		Origin: https://www.walmart.com.mx/
		Destination: https://super.walmart.com.mx/
		
	For example: Axion brand:
		- URL filtering brand **Axion**: "https://www.walmart.com.mx/search?q=Axion&facet=brand%3AAxion"
		- Destination URL in the retailer Super Walmart: https://super.walmart.com.mx/browse/limpieza-del-hogar/limpieza-de-cocina/lavatrastes/3680090_120113_120409

	- Workaround: I applied a check on the URL to redirect to, it throws an error in case the URL is in the super retailer.

1. About the API operation:
	* When filtering the brand in the URL, the API does not filter those products in its response(JSON).
			* Workaround: A control was implemented in the code to verify that the "brand" attribute of each product matches the brand of the userData.
	* The API works in the case of testing with a single desired brand, however it does not return all the products in the case where all the brands are included in the INPUT.
		Actions implemented:** ** ** Residential proxy added
			* Residential proxy was added -> Error persists.
			* Increased **Max request** to 5 -> Error persists.
			* Reduced **Max concurrency** to 1 to reduce the load on the server.
		* Workaround: Robot can be made by pulling data through schema.

1. Do I continue with the development of the robot even though there are some URLs that redirect to another retailer?
2. Because of the API inconsistencies, do I take the option to extract the data via schema?


### Desarrollo 17/11}
- No hay ningún cambio al cambiar el parámetro `fetchMarquee` de la API.
![[Pasted image 20231117093023.png]]
- Se cambio la URL de la API a la original, con todos los parámetros
- Se incluyo la cookie(estático) en los headers
	- Sigue sin filtrar los productos requeridos
	**Teka brand**
	![[Pasted image 20231117113959.png]]
	Y esto es lo que aparece en la pagina:
	![[Pasted image 20231117114256.png]]
	
	- La cookies es dinámica?
		- Test proxy de Argentina - tarda mas, pero lo logra
		- Test proxy de Australia - tarfa mucho mas, pero lo logra
	- Cuando se prueba con todas las marcas, siguen existiendo productos faltantes.
- El error que persistió en las corridas con todos los productos es:
![[Pasted image 20231117111918.png]]
	Que indica que se realizan demasiadas llamadas a a la API
- La única alternativa" Probar con una URL dinámica en Metamorph para ver si funciona para todos los productos
- La otra alternativa es hacerlo por schema, asi que eso se hara
	- El unico error a corregir es que no esta funcionando el control por si se dirige a otro retailer


### After Deploy


Teka> 145
Black+Decker 249
Remington 60 -> Se a;adio otro filtro mas
Colgate 10
Suavitel 0
Caprice 0
Axion 9

Total -> 473
9 deplicados
464 productos oficiales

Black+Decker - 62
Black & Decker 159
Black + Decker 15
Black Decker 1
Blackdecker Herramientas 2
Black&decker


