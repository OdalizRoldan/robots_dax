import json
import sys

print("Converting...")

originFileName = sys.argv[1]
outputFileName = sys.argv[2]


mFile = open(originFileName,encoding='utf-8')
mJson = json.load(mFile)

print(f"{len(mJson)} total items found in file")

startUrls = []

for item in mJson:
    if "Handled" not in item:
         inputItem = {
           "url": 'https://www.eldorado.ru/sem/v3/a408/products?query='+item["ProductUrl"],
            
            "userData": {
               "Manufacturer": item["Manufacturer"], 
                "OriginalUrl":str(item["ProductUrl"])
               #"RetailerProductCode":str(item["ProductId"])
                #"ProductId":str(item["ProductId"]),
           # "ProductName":item["ProductName"],
            #    "OTHERCode":item["OTHERCode"]
            }
        } 
         startUrls.append(inputItem)
print(f"{len(startUrls)} items in new input")

newInput = {"startUrls": startUrls}    

with open(outputFileName, 'w') as newFile:
    json.dump(newInput, newFile)

### References
# https://stackoverflow.com/questions/4033723/how-do-i-access-command-line-arguments-in-python
# https://datatofish.com/rename-file-python/
# https://stackoverflow.com/questions/4152963/get-name-of-current-script-in-python
# https://www.newbedev.com/python/howto/how-to-iterate-over-files-in-a-given-directory/
# https://matthew-brett.github.io/teaching/string_formatting.html
