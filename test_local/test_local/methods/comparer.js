const fs = require('fs').promises;
const _ = require('lodash');
const dir = './data';
const inputs = require('./inputs.json');
const XLSX = require('xlsx');

const fetch = require('node-fetch');

async function rejecthandler(err) {
    console.log(err)
};

async function fileExists({ dir, isFile }) {
    return new Promise(async (resolve, reject) => {
        try {
            let stat = await fs.stat(dir);
            resolve(isFile ? stat.isFile() : stat.isDirectory());
        } catch (err) {
            resolve(false);
        }
    })
};

function innerProp(obj, propPath) {
    propPath = propPath.split('.');
    if (propPath.length > 1) {
        propPath.shift();
        try {
            for (const [idx, el] of obj.entries()) {
                for (const prop of propPath) {
                    obj[idx] = el[prop];
                }
            }
        } catch (err) {
            throw err;
        }
    }
    return obj;
}
exports.nFiles = async ({ dir }) => {
    var files = await fs.readdir(dir).catch(rejecthandler);
    return files
}

exports.readFile = async ({ obj, json }) => {
    let exists = await fileExists({ dir: `${dir}/${obj}.json`, isFile: true });
    if (!exists) {
        filesThatExists = await fs.readdir(`${dir}`);
        return `Error: ${obj}.json file does not exists, verifiy directory and name of file\n` +
            `Actual files in ./data : \n\n\t${filesThatExists.join('\n\t')}\n`;
    }
    const res = await fs.readFile(`${dir}/${obj}.json`).catch(rejecthandler);

    if (json) {
        return JSON.parse(res);
    }

    return res;
};

exports.clear = async () => {
    let existsDir = await fileExists({ dir: './output', isFile: false })
    if (existsDir) {
        let files = await this.nFiles({ dir: './output' })
        if (files.length > 0) {
            for (const file of files) {
                await fs.unlink(`./output/${file}`).catch(rejecthandler);
            }
        }
    }

    return `cleared`;
};

exports.load = async ({ obj, props, save }) => {
    let objeto = await this.readFile({ obj, json: true });
    if (props) objeto = innerProp(objeto, props);

    if (save) await fs.writeFile(`./data/${obj}.js`, JSON.stringify(objeto, null, 4));
    return objeto;
};

exports.keys = async ({ obj, props, save }) => {
    let objeto = await this.readFile({ obj, json: true });
    if (props) objeto = innerProp(objeto, props);

    return Object.keys(objeto);
};

exports.uniquesBy = async ({ obj, prop, save }) => {
    let objeto = await this.readFile({ obj, json: true });
    let uniques = _.uniqBy(objeto, prop);

    if (save) await fs.writeFile(`./data/${obj}_uniques.js`, JSON.stringify(objeto, null, 4));
    return uniques;
}

exports.repeatedBy = async ({ obj, prop, save }) => {
    let objeto = await this.readFile({ obj, json: true });
    let uniques = await this.uniquesBy({ obj, prop });

    let repeated = uniques.filter((uniq) => {
        let times = 0;
        for (const el of objeto) {
            if (uniq[prop] === el[prop]) {
                times++
            }
        }
        if (times > 1) return true
    })

    if (save) await fs.writeFile(`./data/${obj}_repeated.js`, JSON.stringify(objeto, null, 4));
    return repeated;
}

exports.handleds = async ({ obj, clean }) => {
    let objeto = await this.readFile({ obj, json: true });

    handleds = objeto.filter((el) => { return el.hasOwnProperty('Handled') });

    if (clean) {
        objeto = objeto.filter((el) => { return !el.hasOwnProperty('Handled') });
        await fs.writeFile(`./data/${obj}.js`, JSON.stringify(objeto, null, 4));
        await fs.writeFile(`./data/${obj}_handleds.js`, JSON.stringify(handleds, null, 4));
    }

    return handleds;
}

exports.QA = async ({ obj, prop, save }) => {
    let objeto = await this.readFile({ obj, json: true });
    let uniques = await this.uniquesBy({ obj, prop });

    let errors = [];
    for (const el of objeto) {
        var error = [];
        if (!errors.find(item => item['ProductId'] === el['ProductId']) && !el.hasOwnProperty('Handled')) {
            if (el['ProductName'] && el['ProductId'] && el['ProductUrl']) {
                if (el['ProductName'].match(/\s\s+/) || el['ProductName'].match(/^\s+|\s+$/) || el['ProductUrl'].match(/^\s+|\s+$/)) {
                    error.push('Double space or extra space');
                }
                if ((el['Price'] && !Number.isFinite(el['Price'])) || (el['ProductId'] && Number.isFinite(el['ProductId'])) || (el['RatingSourceValue'] && !Number.isFinite(el['RatingSourceValue'])) || (el['ReviewCount'] && !Number.isFinite(el['ReviewCount']))) {
                    error.push('Wrong format');
                }
                if ((el['Price'] && el['Price'] == null) || !el['ProductName']) {
                    error.push('Without value');
                }
                if (uniques.filter(item => item['ProductId'] === el['ProductId']).length > 1 || uniques.filter(item => item['ProductUrl'] === el['ProductUrl']).length > 1) {
                    error.push(`Repeated ${uniques.filter(item => item['ProductId'] === el['ProductId']).length}-ID, ${uniques.filter(item => item['ProductUrl'] === el['ProductUrl']).length}-URL`);
                }
            } else {
                error.push('Property is missing');
            }

            if (error.length > 0) {
                var prodWithError = el;
                prodWithError['error'] = error;
                errors.push(prodWithError);
            }
        }

    }

    if (save) await fs.writeFile(`./data/${obj}_QA.js`, JSON.stringify(errors, null, 4));
    return errors;
}

exports.toExcel = async ({ obj }) => {
    let objeto = await this.readFile({ obj, json: true });

    // let headers = _.flatMap(objeto);
    let headers = _.flatMap(objeto, (item) => {
        return Object.keys(item);
    });
    headers = _.uniq(headers);
    console.log(_.uniq(headers));

    cells = [];
    objeto.forEach((item, idx) => {
        let newRow = [];

        Object.keys(item).forEach((prop) => {
            let nCol = headers.indexOf(prop);
            newRow[nCol] = item[prop];
        });
        cells.push(newRow);
    });

    cells.unshift(headers);
    console.log(cells);

    var wb = XLSX.utils.book_new();
    var ws_name = "SheetJS";

    /* make worksheet */
    var ws = XLSX.utils.aoa_to_sheet(cells);

    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, 'out.xlsb');
};

exports.compare = async ({ obj1, obj2, save, compareBy }) => {
    let objeto1 = await this.readFile({ obj: obj1, json: true });
    objeto1 = objeto1.filter((el) => { return !el.hasOwnProperty('Handled') });
    let objeto2 = await this.readFile({ obj: obj2, json: true });
    objeto2 = objeto2.filter((el) => { return !el.hasOwnProperty('Handled') });

    let missedProd = [];
    var differences = objeto1.filter(el1 => {
        let same = true;

        let missed = true;
        for (let el2 of objeto2) {
            for (var prop in el1) {
                if (el1[compareBy] === el2[compareBy]) {
                    if (!el1.hasOwnProperty('diff')) {
                        el1['diff'] = {};
                        el1.diff['comparedProps'] = [];
                        el1.diff['differenceIn'] = [];
                    }

                    if (el2.hasOwnProperty(prop)) {
                        el1.diff.comparedProps.push(prop);

                        if (el1[prop] != el2[prop] && el1[compareBy] == el2[compareBy]) {
                            console.log(`${compareBy}: ${el1[compareBy]} => ${obj1}.${prop}: ${el1[prop]} != ${obj2}.${prop}: ${el2[prop]}`);
                            el1.diff.differenceIn.push(prop);
                            same = false;
                        }
                    }
                }
            }
            if (el1[compareBy] === el2[compareBy]) {
                missed = false;
            }
        }
        if (missed == true) {
            if (!el1.hasOwnProperty('diff')) {
                el1['diff'] = {};
                el1.diff['comparedProps'] = [];
                el1.diff['differenceIn'] = [];
            }
            console.log(`${compareBy}: ${el1[compareBy]} not exist ${el1.ProductName}`);

            el1.diff.differenceIn.push(el1[compareBy]);
            same = false;
        }
        //console.log(same)
        return !same
    })

    if (save) {
        // await fs.writeFile(`./data/missed_${obj1}_${obj2}.js`, JSON.stringify(missed, null, 4));
        await fs.writeFile(`./data/difference_${obj1}_${obj2}.js`, JSON.stringify(differences, null, 4));
    }
    return differences;
}
exports.compareAttribute = async ({ obj1, obj2, save, attribute, compareBy }) => {
    let objeto1 = await this.readFile({ obj: obj1, json: true });
    objeto1 = objeto1.filter((el) => { return !el.hasOwnProperty('Handled') });
    let objeto2 = await this.readFile({ obj: obj2, json: true });
    objeto2 = objeto2.filter((el) => { return !el.hasOwnProperty('Handled') });

    let diffArray = [];
    objeto1.map(el1 => {
        let diff = {};

        let missed = true;
        for (let el2 of objeto2) {
            if (el1[compareBy] === el2[compareBy]) {
                let id = el1[compareBy]
                if (!diff.hasOwnProperty('ProductId')) {
                    diff['ProductId'] = id;
                    diff['comparedProps'];
                    diff['differenceIn'] = {};
                }

                if (el2.hasOwnProperty(attribute)) {
                    diff.comparedProps = attribute;

                    if (el1[attribute] != el2[attribute] && el1[compareBy] == el2[compareBy]) {
                        console.log(`${compareBy}: ${el1[compareBy]} from ${obj1}.${attribute}: ${el1[attribute]} to ${obj2}.${attribute}: ${el2[attribute]}`);
                        diff.differenceIn = {
                            'CS_Production': el1[attribute],
                            'CS_QA': el2[attribute]
                        };
                        diffArray.push(diff)
                    }
                }
            }

            if (el1[compareBy] === el2[compareBy]) {
                missed = false;
            }
        }
        if (missed == true) {
            console.log(`${compareBy}: ${el1[compareBy]} not exist ${el1.ProductName}`);
        }
    })

    if (save) {
        await fs.writeFile(`./data/UrlDiff_CS_Production_CS_QA.json`, JSON.stringify(diffArray, null, 4));
    }
    return diffArray;
}
exports.QAProd = async (obj, save, { prop }) => {
    let objeto = obj;

    let uniques = await this.uniquesBy({ obj, prop });

    let errors = [];
    for (const el of objeto) {
        var error = [];
        if (!errors.find(item => item['ProductId'] === el['ProductId']) && !el.hasOwnProperty('Handled')) {
            if (el['ProductName'] && el['ProductId'] && el['ProductUrl']) {
                if (el['ProductName'].match(/\s\s+/) || el['ProductName'].match(/^\s+|\s+$/) || el['ProductUrl'].match(/^\s+|\s+$/)) {
                    error.push('Double space or extra space');
                }
                if ((el['Price'] && !Number.isFinite(el['Price'])) || (el['ProductId'] && Number.isFinite(el['ProductId'])) || (el['RatingSourceValue'] && !Number.isFinite(el['RatingSourceValue'])) || (el['ReviewCount'] && !Number.isFinite(el['ReviewCount']))) {
                    error.push('Wrong format');
                }
                if ((el['Price'] && el['Price'] == null) || !el['ProductName']) {
                    error.push('Without value');
                }
                if (uniques.filter(item => item['ProductId'] === el['ProductId']).length > 1 || uniques.filter(item => item['ProductUrl'] === el['ProductUrl']).length > 1) {
                    error.push(`Repeated ${uniques.filter(item => item['ProductId'] === el['ProductId']).length}-ID, ${uniques.filter(item => item['ProductUrl'] === el['ProductUrl']).length}-URL`);
                }
            } else {
                error.push('Property is missing');
            }

            if (error.length > 0) {
                var prodWithError = el;
                prodWithError['error'] = error;
                errors.push(prodWithError);
            }
        }

    }

    if (save) await fs.writeFile(`./data/prod_QA.js`, JSON.stringify(errors, null, 4));
    return errors;
}

exports.schema = async ({ obj, save }) => {
    let objeto = await this.readFile({ obj: obj, json: true });
    var propsItems = objeto.map(item => Object.keys(item));
    console.log(`\n`)

    var updaterSchema = [
        'ProductId',
        'Manufacturer',
        'ProductName',
        'ProductUrl',
        'Price',
        'Stock',
        'ImageUri',
        'CTINCode',
        'GTINCode',
        'ASINCode',
        'OtherCode',
        'RatingType',
        'RatingSourceValue',
        'ReviewCount',
        'ReviewLink'];

    badKeys = [];

    propsItems.forEach(iProps => {
        iProps.forEach((prop) => {
            if (!updaterSchema.includes(prop)) {
                if (!badKeys.includes(prop)) {
                    badKeys.push(prop);
                }
            }
        })
    })

    // Mode of slashs of Product Url
    const slashs = objeto.map((obj) => {
        if (obj.hasOwnProperty('ProductUrl')) {
            return obj.ProductUrl.split('/').length;
        }
        return null;
    })
    let slashsMode = _.countBy(slashs);
    let numSlashs = Object.keys(slashsMode).map((prop) => {
        return { numOfSlash: prop, repeated: slashsMode[prop] }
    });
    numSlashs = _.orderBy(numSlashs, 'repeated', 'desc');
    slashMode = Number(numSlashs[0]['numOfSlash']);

    // Mode of slashs of ImageUri
    const imgSlashs = objeto.map((obj) => {
        if (obj.hasOwnProperty('ImageUri')) {
            return obj.ImageUri.split('/').length;
        }
        return null;
    })
    let imgSlashsMode = _.countBy(imgSlashs);
    let imgNumSlashs = Object.keys(imgSlashsMode).map((prop) => {
        return { imgNumOfSlash: prop, repeated: imgSlashsMode[prop] }
    });
    imgNumSlashs = _.orderBy(imgNumSlashs, 'repeated', 'desc');
    imgSlashMode = Number(imgNumSlashs[0]['imgNumOfSlash']);

    objeto.forEach((item, idx) => {
        for (const prop in item) {

            // PRODUCT ID
            if (prop === 'ProductId') {
                if (typeof item[prop] !== 'string' && item[prop] !== null) {
                    console.log(`${item['ProductId']}: 'ProductId' value is not String type`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'ProductId' value is not String type`;
                }
            }

            // PRODUCT NAME
            if (prop === 'ProductName') {
                if (typeof item[prop] !== 'string' || item[prop] === null) {
                    console.log(`${item['ProductId']}: 'ProductName' value is not String type`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'ProductName' value is not String type`;
                }
            }

            // MANUFACTURER
            if (prop === 'Manufacturer') {
                if (typeof item[prop] !== 'string' || item[prop] === null) {
                    console.log(`${item['ProductId']}: 'Manufacturer' value is not String type`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'Manufacturer' value is not String type`;
                }
            }

            // STOCK
            if (prop === 'Stock') {
                if (!item[prop].match('OutOfStock|InStock') && item[prop] !== null) {
                    console.log(`${item['ProductId']}: 'Stock' value not match 'OutOfStock/InStock'`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'Stock' value not match 'OutOfStock / InStock' schema`;
                }
            }

            // PRICE
            if (prop === 'Price') {
                if (typeof item[prop] !== 'number' && item[prop] !== null) {
                    console.log(`${item['ProductId']}: 'Price' is not a Number type`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'Price' is not Number type`;
                }
            }

            // PRODUCT URL
            if (prop === 'ProductUrl') {
                if (item[prop].split('/').length !== slashMode) {
                    console.log(`${item['ProductId']}: 'ProductUrl' has a number of '/' different than most`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'ProductUrl' has a number of '/' different than most`;
                }
            }

            // IMAGE URI
            if (prop === 'ImageUri') {
                if (item[prop].split('/').length !== imgSlashMode) {
                    console.log(`${item['ProductId']}: 'ImageUri' has a number of '/' different than most`);
                    if (!objeto[idx].hasOwnProperty('schemaErr')) objeto[idx]['schemaErr'] = {};
                    objeto[idx]['schemaErr'][prop] = `'ImageUri' has a number of '/' different than most`;
                }
            }
        }
    })

    const toPrint = {
        badKeys: badKeys,
        badSchema: objeto.filter((obj) => obj.hasOwnProperty('schemaErr')),
    }
    if (save) await fs.writeFile(`./data/${obj}_schemaVerification.js`, JSON.stringify(toPrint, null, 4));
    return badKeys;
};

exports.deployQA = async ({ save, compareBy, erease, crawler }) => {
    // const res = await fs.readFile(`${dir}/results.json`).catch(rejecthandler);
    const prodDataUrl = inputs.Prod.Data;
    const qaDataUrl = inputs.QA.Data;
    const prodInputUrl = inputs.Prod.Input;
    const qaInputUrl = inputs.QA.Input;

    async function getDataProd() {
        const response = await fetch(`${prodDataUrl}&clean=1`);
        const dataProd = await response.json();
        return dataProd;
    }

    async function getDataQA() {
        const response = await fetch(`${qaDataUrl}&clean=1`);
        const dataQA = await response.json();
        return dataQA;
    }
    async function getInputProd() {
        const response = await fetch(`${prodInputUrl}&clean=1`);
        const dataProd = await response.json();
        return dataProd;
    }

    async function getInputQA() {
        const response = await fetch(`${qaInputUrl}&clean=1`);
        const dataQA = await response.json();
        return dataQA;
    }
    let objetoProd = await getDataProd();
    let objetoQA = await getDataQA();
    let inputProd = await getInputProd();
    let inputQA = await getInputQA();
    objetoProd = objetoProd.filter((el) => { return !el.hasOwnProperty('Handled') });
    objetoQA = objetoQA.filter((el) => { return !el.hasOwnProperty('Handled') });

    inputProd = inputProd.startUrls ? inputProd.startUrls : inputProd.data.input.startUrls;
    inputQA = inputQA.startUrls ? inputQA.startUrls : inputQA.data.input.startUrls;


    let missedProd = [];
    var differencesData = objetoProd.filter(el1 => {
        let same = true;

        let missed = true;
        for (let el2 of objetoQA) {
            for (var prop in el1) {
                if (el1[compareBy] === el2[compareBy]) {
                    if (!el1.hasOwnProperty('diff')) {
                        el1['diff'] = {};
                        el1.diff['comparedProps'] = [];
                        el1.diff['differenceIn'] = [];
                    }

                    if (el2.hasOwnProperty(prop)) {
                        el1.diff.comparedProps.push(prop);

                        if (el1[prop] != el2[prop] && el1[compareBy] == el2[compareBy]) {
                            console.log(`${compareBy}: ${el1[compareBy]} => prod.${prop}: ${el1[prop]} != CS_QA.${prop}: ${el2[prop]}`);
                            el1.diff.differenceIn.push(prop);
                            same = false;
                        }
                    }
                }
            }
            if (el1[compareBy] == el2[compareBy]) {
                missed = false;
            }
        }
        if (missed == true) {
            if (!el1.hasOwnProperty('diff')) {
                el1['diff'] = {};
                el1.diff['comparedProps'] = [];
                el1.diff['differenceIn'] = [];
            }
            console.log(`${compareBy}: ${el1[compareBy]} not exist ${el1.ProductName}`);

            el1.diff.differenceIn.push(el1[compareBy]);
            same = false;
        }
        //console.log(same)
        return !same
    })

    if (save) {
        // await fs.writeFile(`./data/missed_${obj1}_${obj2}.js`, JSON.stringify(missed, null, 4));
        await fs.writeFile(`./data/differenceData_prod.js`, JSON.stringify(differencesData, null, 4));
        await fs.writeFile(`./data/ProductionData_prod.js`, JSON.stringify(objetoProd, null, 4));
    }
    // return differences;
    var differencesInput = inputProd.filter(el1 => {
        let same = true;

        let missed = true;
        for (let el2 of inputQA) {
            for (var prop in el1.userData) {
                if (el1.userData.Manufacturer === el2.userData.Manufacturer && el1.userData.Brand === el2.userData.Brand) {

                    if (!el1.hasOwnProperty('diff')) {
                        el1['diff'] = {};
                        el1.diff['comparedProps'] = [];
                        el1.diff['differenceIn'] = [];
                    }
                    if (el2.userData.hasOwnProperty(prop) && crawler ) {
                        el1.diff.comparedProps.push(prop);
                        if (el1.url != el2.url && el1.userData.Manufacturer === el2.userData.Manufacturer && el1.userData.Brand === el2.userData.Brand && !el1.diff.differenceIn.includes('URL')) {
                            console.log(`This input: ${el1.url} => prod.URL: ${el1.url} != CS_QA.URL: ${el2.url}`);
                            el1.diff.differenceIn.push('URL');
                            same = false;
                        } else if (el1.userData[prop] != el2.userData[prop] && el1.userData.Manufacturer === el2.userData.Manufacturer && el1.userData.Brand === el2.userData.Brand && !el1.diff.differenceIn.includes(prop)) {
                            console.log(`This input: ${el1.url} => prod.${prop}: ${el1.userData[prop]} != CS_QA.${prop}: ${el2.userData[prop]}`);
                            el1.diff.differenceIn.push(prop);
                            same = false;
                        }

                    }
                }
                if (el1.url == el2.url && !crawler) {
                    if (!el1.hasOwnProperty('diff')) {
                        el1['diff'] = {};
                        el1.diff['comparedProps'] = [];
                        el1.diff['differenceIn'] = [];
                    }
                    el1.diff.comparedProps.push(prop);
                    if (el2.userData.hasOwnProperty(prop) && el1.userData[prop] != el2.userData[prop]) {
                        console.log(`This input: ${el1.url} => prod.${prop}: ${el1.userData[prop]} != CS_QA.${prop}: ${el2.userData[prop]}`);
                        el1.diff.differenceIn.push(prop);
                        same = false;
                    } else if (!el2.userData.hasOwnProperty(prop)) {
                        console.log(`This input: ${el1.url} => prod.${prop}: ${el1.userData[prop]} != CS_QA.${prop}: ${el2.userData[prop]}`);
                        el1.diff.differenceIn.push(prop);
                        same = false;
                    }
                }
            }
            for (var prop in el2.userData) {
                if (el1.userData.Manufacturer === el2.userData.Manufacturer && el1.userData.Brand === el2.userData.Brand) {

                    if (!el1.hasOwnProperty('diff')) {
                        el1['diff'] = {};
                        el1.diff['comparedProps'] = [];
                        el1.diff['differenceIn'] = [];
                    }
                    if (el2.userData.hasOwnProperty(prop) && crawler) {
                        el1.diff.comparedProps.push(prop);
                        if (el1.url != el2.url && el1.userData.Manufacturer === el2.userData.Manufacturer && el1.userData.Brand === el2.userData.Brand && !el1.diff.differenceIn.includes('URL')) {
                            console.log(`This input: ${el1.url} => prod.URL: ${el1.url} != CS_QA.URL: ${el2.url}`);
                            el1.diff.differenceIn.push(prop);
                            same = false;
                        } else if (el1.userData[prop] != el2.userData[prop] && el1.userData.Manufacturer === el2.userData.Manufacturer && el1.userData.Brand === el2.userData.Brand && !el1.diff.differenceIn.includes(prop)) {
                            console.log(`This input: ${el1.url} => prod.${prop}: ${el1.userData[prop]} != CS_QA.${prop}: ${el2.userData[prop]}`);
                            el1.diff.differenceIn.push(prop);
                            same = false;
                        }

                    }
                }
                if (el1.url == el2.url && !crawler) {
                    if (!el1.hasOwnProperty('diff')) {
                        el1['diff'] = {};
                        el1.diff['comparedProps'] = [];
                        el1.diff['differenceIn'] = [];
                    }
                    el1.diff.comparedProps.push(prop);
                    if (el2.userData.hasOwnProperty(prop) && el1.userData[prop] != el2.userData[prop]) {
                        console.log(`This input: ${el1.url} => prod.${prop}: ${el1.userData[prop]} != CS_QA.${prop}: ${el2.userData[prop]}`);
                        el1.diff.differenceIn.push(prop);
                        same = false;
                    } else if (!el2.userData.hasOwnProperty(prop)) {
                        console.log(`This input: ${el1.url} => prod.${prop}: ${el1.userData[prop]} != CS_QA.${prop}: ${el2.userData[prop]}`);
                        el1.diff.differenceIn.push(prop);
                        same = false;
                    }
                }
            }
            if (el1[compareBy] == el2[compareBy]) {
                missed = false;
            }
        }
        if (missed == true) {
            if (!el1.hasOwnProperty('diff')) {
                el1['diff'] = {};
                el1.diff['comparedProps'] = [];
                el1.diff['differenceIn'] = [];
            }
            console.log(`This input: ${el1.url} not exist`);

            el1.diff.differenceIn.push(el1.url);
            same = false;
        }
        //console.log(same)
        return !same
    })

    if (save) {
        // await fs.writeFile(`./data/missed_${obj1}_${obj2}.js`, JSON.stringify(missed, null, 4));
        await fs.writeFile(`./data/differenceInput_prod.js`, JSON.stringify(differencesInput, null, 4));
        await fs.writeFile(`./data/ProductionInput_prod.js`, JSON.stringify(objetoProd, null, 4));
    }
    const differences = [...differencesInput, ...differencesData];
    let res = await this.QAProd(objetoQA, true, 'ProductId');
    console.log(res);
    if (erease) {
        const inputsRewrite = {
            "Prod": {
                "Input": "",
                "Data": ""
            },
            "QA": {
                "Input": "",
                "Data": ""
            }
        }
        await fs.writeFile(`./methods/inputs.json`, JSON.stringify(inputsRewrite, null, 4));
    }
    console.log(`\n${res.length} elements with error in CS_QA`)
    return differences;
}