~~~

~~~

### Actividades realizadas
- 
~~~
>>>>> Tomar en cuenta
> new brand 'Siemens' was added.
> Added ExcludedBrand Logic because the Siemens brand page has many products from other brands
> Changed Inputs from production to QA -> Las URLs son las mismas para
>> Bosh 861(UI) -> 527 + 333 H(ProdExcl) => 860 products
>> Whirpoll 282(UI) -> 282 + O H
>> Indesit 29(UI) -> 29 + O H

> Changed Philips domain from -> Se cambio a la nueva URL porque la anterior tenia una UI con categorias, no la pagina de productos como tal, la nueva URL posee datos de los productos y no de luces.
> 	`https://euronics.hu/search?filter[stockSource][]=central&filter[stockSource][]=external&filter[search]=Philips&filter[specification][manufacturer][]=1594916&filter[order]=relevance&filter[limit]=36`
> 	`https://euronics.hu/search?filter%5BstockSource%5D%5Bstandard%5D=&filter%5Bsearch%5D=productos+philips&filter%5Bspecification%5D%5Bmanufacturer%5D%5B%5D=1594916&filter%5Border%5D=relevance&filter%5Bflags_only_buyable%5D=1&filter%5Blimit%5D=36`
>> Philips 539(UI) -> 504 + 30(ProdExcl) => 534

> Se añade la marca Siems
> QA cambio la URL que no tenia filtro a una que si lo tiene
> From
	`https://euronics.hu/search?search_type[searchText]=siemens`
to `https://euronics.hu/search?search_type[searchText]=siemens`
>> Siemens 1(UI) -> 1 (14 OtherBrands) => 15

>>> 1348 productos en total
>>> 381 Handleds => 1729 - 1720
Faltan 6 productos, 1 Bosch, 5 de Philips
1726

1726 prod UI ->


>>>> Segun UI 1712 productos
>>>> 378 Handleds
>>>> 
>> Changed URL domain from production to QA -> No se cambio, sigue siendo la misma
>> 
~~~

~~~
>>>>> Preguntas
- Tiene variantes?
- 
~~~

#### Configuraciones
    - Version
        - Crawler Cheerio V-3.0.1
    - Proxy
        - Crawler works well with Automatic proxy.
    - Memory
        - 256 MB
### Comparación con producción
~~~
"Other": {
	"Handled": 381,
	"Message": 381,
	"Url": 381
}
{
	"Name": "ProductUrl",
	"Pass": 1348,
	"Fail": 0,
	"Warnings": 0,
	"Duplicates": 381
}


Cantidad de productos -> 1171
Handled -> 35

~~~

Se aumentaron estas palabras en la marca Bosch
~~~
DRILL|SAW|CUTTER|FÚRÓGÉP
~~~