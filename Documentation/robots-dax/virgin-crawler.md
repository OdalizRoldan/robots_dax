~~~
0:35 min
4.15$ - 4.18 - 4.19$ 4.21 - 4.28
CS 27$
~~~

### Actividades realizadas
- Se cambio el selector del nombre
- Se cambio el selector de stock de producto
- Se quitaron algunod logs innecesarios
- Se conservaron las URLs por idioma.
- Se quitaron dos tipos de productUrl ya que solo se requieren en updater>
- Se acorto el product URL, no se puede acortar el imageUrl
~~~
"ProductUrl_en-AE": request.url,

"ProductUrl_ar-AE": request.url.replace("/en/", "/ar/") + "#ar-AE",
~~~


~~~
>>>>> Tomar en cuenta

~~~

~~~
>>>>> Preguntas
- 0.90$ -> 
~~~

~~~javascript
{

            "url": "https://www.virginmegastore.ae/en/brands/SONY%20COMPUTER%20ENTERTAINMENT%20EUROPE",

            "userData": {

                "Manufacturer": "Sony",

                "Brand": "Sony",

                "Culture Code": "en-AE",

                "ExcludedKeyWords": "PLAYSTATION 4|PLAYSTATION 5|DIGITAL CODE|SONY MUSIC ENTERTAINMENT",

                "ApifyResultType": 0

            },

            "method": "GET"

        },

        {

            "url": "https://www.virginmegastore.ae/en/brands/PHILIPS",

            "userData": {

                "Manufacturer": "Philips",

                "Brand": "Philips",

                "Culture Code": "en-AE",
                "ExcludedKeyWords": "HUE|LIGHT|LED",

                "ApifyResultType": 0

            },

            "method": "GET"

        },

        {

            "url": "https://www.virginmegastore.ae/en/brands/SONY",

            "userData": {

                "Manufacturer": "Sony",

                "Brand": "Sony",

                "Culture Code": "en-AE",

                "ExcludedKeyWords": "PLAYSTATION 4|PLAYSTATION 5|DIGITAL CODE|SONY MUSIC ENTERTAINMENT",

                "ApifyResultType": 0

            }

        }
~~~
### Comparación con producción
-  Computer Entertaiment Europe -> 65
- Philips -> 96 - 95
- Sony -> 29 - 71
Excluded: 24
Total ->190


24 excluidos 
166 priductos