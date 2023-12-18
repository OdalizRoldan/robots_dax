### GR Electro Crawler | Support ticket

### Input

`[ { "url": "https://www.electronet.gr/instant-search?text=Bosch", "userData": { "Manufacturer": "BSH", "Brand": "Bosch", "Culture Code": "el-GR", "CTINRegex": "[A-Z]+\\d+[A-Z0-9]{2,}|[A-Z]{2,}\\s[A-Z0-9]{4,}|[A-Z0-9]{6,}", "ApifyResultType": 0 } }, { "url": "https://www.electronet.gr/instant-search?text=Siemens", "userData": { "Manufacturer": "BSH", "Brand": "Siemens", "Culture Code": "el-GR", "CTINRegex": "[A-Z]+\\d+[A-Z0-9]{2,}|[A-Z]{2,}\\s[A-Z0-9]{4,}|[A-Z0-9]{6,}", "ApifyResultType": 0 } }, { "url": "https://www.electronet.gr/instant-search?text=Neff", "userData": { "Manufacturer": "BSH", "Brand": "Neff", "Culture Code": "el-GR", "CTINRegex": "[A-Z]+\\d+[A-Z0-9]{2,}|[A-Z]{2,}\\s[A-Z0-9]{4,}|[A-Z0-9]{6,}", "ApifyResultType": 0 }, "method": "GET" }, { "url": "https://www.electronet.gr/instant-search?text=Pitsos", "userData": { "Manufacturer": "BSH", "Brand": "Pitsos", "Culture Code": "el-GR", "CTINRegex": "[A-Z]+\\d+[A-Z0-9]{2,}|[A-Z]{2,}\\s[A-Z0-9]{4,}|[A-Z0-9]{6,}", "ApifyResultType": 0 } }, { "url": "https://www.electronet.gr/instant-search?text=Philips", "userData": { "Manufacturer": "Philips", "Brand": "Philips", "Culture Code": "el-GR", "CTINRegex": "([0-9,A-Z]+\\/)\\d+", "ApifyResultType": 0 } } ]`

### Description

|**Changes (Production/QA)**|**State**|**Notes**|
|---|---|---|
|Changed URL domain.|`Not`||
|Changed Inputs|`Not`||
|Changed `product ID`|`Not`||

- Logic was increased to eliminate duplicate products, but not many were detected.
    
- No products to exclude (`HUE`) were found for the `Philips` brand.
    
- The name of the `Pitsos`brand was changed in the User Data, since it was incorrectly spelled in the production robot.
    
- I did not change the overall logic of the robot, as it works quite well, it pulls the data through the JSON content of the page with selectors for each attribute, as well as pulls the `CTINCode` from the name of each product.
    

### Configuration details

- **Proxy and HTTP Configuration:**
    
    - **Proxy configuration:** Changed from `Automatic` to `Residencial (Grecee)`.
        
    - **Proxy rotation**: Recommended
        
- **Run options:**
    
    - **Builder:** Changer version `0.1.23` to `3.0.13`
        
    - **Memory:** 256 MB
        

### Crawler robot in CS_QA environment

|**Test**|**Result**|
|---|---|
|Crawler robot|[Apify Console](https://console.apify.com/organization/GTLDwzJnfTMQqgBR4/actors/tasks/1D9dIYbnJciXGg09g/console)|
|Las run|[Apify Console](https://console.apify.com/organization/GTLDwzJnfTMQqgBR4/actors/tasks/1D9dIYbnJciXGg09g/runs/Y0KVUo6ZAXStbQyaL#log)|
|Validation|[Apify Console](https://console.apify.com/organization/GTLDwzJnfTMQqgBR4/actors/tasks/XETtJl5o4ddH0I1Sg/runs/NfDZ9BFWj1I2oiIQK#log)|