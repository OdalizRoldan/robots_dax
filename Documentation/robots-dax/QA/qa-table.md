|**Important changes (Production/QA)**|**State**|**Notes**|
|---|---|---|
|Changed URL domain from production to QA|YES||
|Changed Inputs from production to QA|YES||

**Robot review**

|||||
|---|---|---|---|
|**Type**|**Description**|**State(U)**|**Notes**|
|**Crawler/Updater**  <br>**Into robot last run**  <br>**Run after QA**|Verified that the robot doesn’t lose products => **failed = 0,** into console result|OK||
|**Updater**  <br>**In robot page**|Verified that the robot have handled for **404** error test 404 URL|OK||
|**Crawler/Updater**  <br>**In robot page**|Verify that `enqueueRequest` is used instead of `requestAsBrowser` (if is necessary)|OK||
|**Crawler/Updater**  <br>**Into robot last run**|Verified that the robot extract required **results** [Schema - Supported Properties](https://channelsight.atlassian.net/wiki/spaces/DA/pages/1711276067/Schema+-+Supported+Properties)|OK|The product page has no `ratings`, not even for members.|
|**Crawler**  <br>**Into product page**|Verified that the robot extracts product **variants** if these exist|OK|Most of the products have variants, the dev extracted them all.|
|**Updater**  <br>**Into product page**|Verified that the robot extracts **ratings** required data||The product page has no `ratings`, not even for members.|
|**Crawler/Updater**  <br>**Into product page**|Verified that the results match with **UI** data (`Price`, `Stock`, `ProductName`)|OK|- Priority is given to the discounted prices if the user is a Member, otherwise the prices shown in the UI are taken out.  <br>  <br>- Some `OutOfStock` products are only available on search page, so a handler (404 Error) is deployed.  <br>  <br>- `OutOfStock`products do not include the price value in the UI, so they are obtained from the API.|
|**Crawler**  <br>**Into search page**|Verified that the robot extracts same **quantity** of products than the search page shows|OK|6 handlers are deployed.|
|**Crawler**  <br>**Into search page**|Tested **pagination** (If products are less than limit to paginate, tested with another brand)|||
|**Updater**  <br>**In robot page**|Tested with **production inputs**|OK||
|**Crawler/Updater**  <br>**In robot page**|Tested with automatic or shader **proxy** (if proxy is residential)|OK|Changed proxy rotation to `UNTIL_FAILURE`|
|**Crawler/Updater**  <br>**In robot page**|Tested with more efficient **versions** if robot takes too long|OK|Changed Build version `3.0.13`|
|**Crawler**  <br>**with validation tool**|Verified that the robot have handled to avoid **duplicated** products (if is necessary)|||
|**Crawler/Updater**  <br>**with validation tool**|Verified that the name does not have **double spaces** or extra spaces at the end or beginning of the string|OK||
|**Crawler/Updater**  <br>**with validation tool**|Verified **format**: `price`, `ratingSourceValue`, `ratingCount` => number, `productId`, manufacturer `codes` => string|OK||
|**Crawler/Updater Support or Add brands**  <br>**with comparison tool**|Verified that the results match with **production,** last functional run|OK|The robot returns `146` products, the last successful run of the production robot returns `200`, however the number of products shown in the UI plus its variants add up to `146`.|
|**Crawler/Updater BIN**  <br>**with comparison tool**|Verified that the **Updater** results match with **Crawler,** last functional run|OK||

**Verification with validation robots**

|**Description**|**Crawler**|**Updater**|
|---|---|---|
|Last run|||
|Validation|||
|Comparison|||

**Resume**

||**Production inputs** _(Last successful run)_|**Updater results**|Crawler results|
|---|---|---|---|
|**Successful results**|200|146||
|**Failed**|0|0||
|**Handlers**|200|6||
|**Total tested products**|200|146||

### Normal QA
**QA OK**

**Legend**

|**OK = Passed**|**NOK = not passed**|**W= notes to be considered**|**-= does not apply**|
|---|---|---|---|

**Important**

|**Important changes (Production/QA)**|**State**|**Notes**|
|---|---|---|
|Changed URL domain from production to QA|NOT||
|Changed Inputs from production to QA (Crawler)|NOT||

**Robot review**

|   |   |   |   |
|---|---|---|---|
|**Type**|**Description**|**State(U)**|**Notes**|
|**Crawler/Updater**  <br>**Into robot last run**  <br>**Run after QA**|Verified that the robot doesn’t lose products => **failed = 0,** into console result|OK||
|**Updater**  <br>**In robot page**|Verified that the robot have handled for **404** error test 404 URL|**-=**||
|**Crawler/Updater**  <br>**In robot page**|Verify that `enqueueRequest` is used instead of `requestAsBrowser` (if is necessary)|OK||
|**Crawler/Updater**  <br>**Into robot last run**|Verified that the robot extract required **results** [Schema - Supported Properties](https://channelsight.atlassian.net/wiki/spaces/DA/pages/1711276067/Schema+-+Supported+Properties)|OK||
|**Crawler**  <br>**Into product page**|Verified that the robot extracts product **variants** if these exist|OK|The dev extracted the existing variants.|
|**Updater**  <br>**Into product page**|Verified that the robot extracts **ratings** required data|**-=**||
|**Crawler/Updater**  <br>**Into product page**|Verified that the results match with **UI** data (`Price`, `Stock`, `ProductName`)|OK||
|**Crawler**  <br>**Into search page**|Verified that the robot extracts same **quantity** of products than the search page shows|OK||
|**Crawler**  <br>**Into search page**|Tested **pagination** (If products are less than limit to paginate, tested with another brand)|OK||
|**Updater**  <br>**In robot page**|Tested with **production inputs**|OK||
|**Crawler/Updater**  <br>**In robot page**|Tested with automatic or shader **proxy** (if proxy is residential)|OK|Automatic proxy|
|**Crawler/Updater**  <br>**In robot page**|Tested with more efficient **versions** if robot takes too long|OK|Changed Build version to `3.0.13`|
|**Crawler**  <br>**with validation tool**|Verified that the robot have handled to avoid **duplicated** products (if is necessary)|OK|No duplicate products found.|
|**Crawler/Updater**  <br>**with validation tool**|Verified that the name does not have **double spaces** or extra spaces at the end or beginning of the string|OK||
|**Crawler/Updater**  <br>**with validation tool**|Verified **format**: `price`, `ratingSourceValue`, `ratingCount` => number, `productId`, manufacturer `codes` => string|OK||
|**Crawler/Updater Support or Add brands**  <br>**with comparison tool**|Verified that the results match with **production,** last functional run|OK||
|**Crawler/Updater BIN**  <br>**with comparison tool**|Verified that the **Updater** results match with **Crawler,** last functional run|||

**Verification with validation robots**

|**Description**|**Link**|
|---|---|
|Crawler last run|[Apify Console](https://console.apify.com/organization/GTLDwzJnfTMQqgBR4/actors/tasks/9MVmnXSEe351AIH7W/runs/G4qGjXdeDUUvJAgwg#log)|
|Crawler validation|[Apify Console](https://console.apify.com/organization/GTLDwzJnfTMQqgBR4/actors/tasks/XETtJl5o4ddH0I1Sg/runs/Embiw0LPfxFvZR6aM#log)|

**Resume**

||**Production inputs** _**(Last successful run)**_|**New crawler results**|
|---|---|---|
|**Successful results**|92|164|
|**Failed**|0|0|
|**Handlers**|0|0|
|**Total tested products**|92|164|

