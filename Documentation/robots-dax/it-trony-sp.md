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
Good morning 
This retailer does not have a pagination as such, the data is loaded with an API each time you press the Show more button at the bottom.
On the other hand, the URL of the search page does not change or update any of its parameters when the button is pressed.
How can I define the NumberPage variable in this case or how do I proceed for the SP development?
Greetings!

---
#### 29/11

5 paginas ->>  numPag
40 + 20 + 20 + 20 + 20

TotalProductos ->> 120

TotalProductos                      = 40 + 20(numPag - 1)  
TotalProductos - 40               = 20(numPag - 1)  
(TotalProductos - 40)/20       = numPag - 1
(TotalProductos - 40)/20 + 1 = numPag
                           **numPag    = (TotalProductos - 40)/20 + 1**


**numPag    = (4- 40)/20 + 1**
                     (-36/20) + 1
                     -0.8

- En cuanto a la API:
	- Se esta usando una API dinamica, que carga informacion de nuevos produtos cada vez que se hace clic en "cargar mas", eso quiere decir que no se realiza una paginacion convencional.
	- Ademas de ello la SearchURL en la que estan los productos no cambia cada vez que se cargan nuevos productos.
	- Por los anteriores caracteristicas mencionadas el equipo de CS dio la siguientes indicaciones:
		- You can get the number of products from the first request, determine the total Number of pages and then do the request just for the last page that you need because as it seems right now, all the products from previous pages will be loaded in that api.
	- Se llama a la API de la primera pagina por el preNavigationHooks para extraer el valor del numero total de productos(se extrae a traves de la conversion del body a string y filtrado del valor de count), luego de ello se calcula el numero de paginas que tendra, en base a una ecuacion que toma en cuenta que la primera pagina tiene 40 productos y las siguientes 20, ademas que toma el minimo entre este valor calculado y 5.
	- El pageNumber de este robot seguira la siguiente logica basandonos en el comportamiento de la API y paginacion de usuario:
		- **The logic is as follows (we follow how an user would see the website) :**  **First page contains 40 products.** **All subsequent pages are made of 20 products.**
		- The first page has the limit: 40 , second one has the limit:60 ( first 40 are from page 1), third one has the limit 80 ( first 60 are from page 1+ page 2), etc
	- En la logica de paginacion se usa el SearchKeyWord y LimitPage, este ultimo valor es igual al numero de productos que tendra la ultima pagina, esto para extraer los datos de la API de esa pagina directamente.
	- Los datos se estraen convirtiendo el body en string y extrayendo los valores del objeto productData, que tiene los datos necesarios y ordenados.
	- Se calcula en pageNumber y positionInPage de forma manual e iterativa cada vez que se itera sobre cada producto individualmente.
	