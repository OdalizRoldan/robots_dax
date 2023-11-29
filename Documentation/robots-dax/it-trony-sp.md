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