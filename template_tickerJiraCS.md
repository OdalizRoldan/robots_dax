Crawler

The following fixes and improvements were made

Fixed logic to get number of products per page (website contains different number of products for each search)

Fixed logic to get URL of each product

Fixed logic to remove duplicate products

Added logic to exclude Philips brand lighting products (Lighting products were found in robot tests)

Robot was converted from type HC to HC-FC to get the ctin code from product page

Added FC logic in page function

FC logic only applies to products without ctin code and with CTINRegex parameters in userData

Changed logic and CTINRegex parameter of userData for Philips, Avent and Duracell brands to get a larger number of valid ctin codes

Changed build version

From: version-2 (2.0.9)

To: version-3 (3.0.11)

Changed proxy rotation to avoid blocked request (required for FC section)

From: RECOMMENDED

To: UNTIL_FAILURE

Preserved input URLs

Preserved proxy configuration (Automatic)

Preserved ProductUrl and ProductId of each product

No other codes found on search or product page that match with other retailers

Preserved omission of product stock value, there aren’t references to stock on search page

Preserved omission of product price value, some values ​​don't match between search and product pages

Crawler robot is in CS_QA environment

Crawler robot Apify Console 

Last run Apify Console 

Validation test

Crawler validation Apify Console 