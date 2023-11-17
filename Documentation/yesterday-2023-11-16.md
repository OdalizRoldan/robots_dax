08:43
Mejoras de Apify: https://apify.com/change-log

### Lo que se mando a info
Se tomó la opción de extraer los datos mediante API, ya que tiene la totalidad de los datos, sin embargo, se encontraron las siguientes irregularidades:

1. Sobre el funcionamiento del retailer:
	Algunas URLs con filtros por marca redireccionan a otro retailer:
		Origen: https://www.walmart.com.mx/
		Destino: https://super.walmart.com.mx/
		
	Por ejemplo: Marca Axion:
		- URL que filtra la marca **Axion**: "https://www.walmart.com.mx/search?q=Axion&facet=brand%3AAxion"
		- URL de destino en el retailer Super Walmart: https://super.walmart.com.mx/browse/limpieza-del-hogar/limpieza-de-cocina/lavatrastes/3680090_120113_120409

	- Solución alternativa: Se aplico un control de la URL a la que se redirecciona, lanza un error en caso la URL este en el retailer de super.
		
1. Sobre el funcionamiento de la API:
	* Cuando se filtra la marca en la URL, la API no filtra esos productos en su response(JSON).
			* Solución Alternativa: Se implemento un control en el código para verificar que el atributo "brand" de cada producto coincida con la marca del userData.
	* La API funciona en el caso en que se teste con una sola marca querida, sin embargo no devuelve todos los productos en el caso en que se incluyan la totalidad de los marcas en el INPUT.
		* **Acciones implementadas:**
			* Se añadió proxy residencial -> El error persiste.
			* Se aumentó el **Max request** a 5 -> El error persiste.
			* Se redujo el **Max concurrency** a 1 para reducir la carga en el servidor.
		* Solución alternativa: Se puede realizar el robot sacando los datos mediante schema.
		
1. ¿Sigo con el desarrollo del robot a pesar que hay algunas URLs que redireccionan a otro retailer?
2. Por las inconsistencias de la API, ¿Tomo la opción de extraer los datos mediante schema?
----
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

