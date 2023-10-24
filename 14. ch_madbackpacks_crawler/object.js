#!/usr/bin/env node

const commander = require('commander');
const program = new commander.Command();
const comparer = require('./methods/comparer.js');

program
  .command('clear')
  .description('Clear previous session framework')
  .action(async (obj, opts) => {
      let res = await comparer.clear();
      console.log(res);
  });

program
  .command('view <object>')
  .description('Print selected object')
  .option('-t, --props <propsPath>', 'Path of props, eg. ".propLvl_1.propLvl_2.propLvl_3"', null)
  .option('-s, --save', 'Save modified file', false)
  .action(async (obj, opts) => {
      let res = await comparer.load({obj, ...opts});
      console.log(res);
	  if (opts.save) console.log(`\n File modified`);
  });

program
  .command('keys <obj>')
  .description('View keys in given object')
  .option('-t, --props <propsPath>', 'Path of props, eg. ".propLvl_1.propLvl_2.propLvl_3"', null)
  .action(async (obj, opts) => {
      let res = await comparer.keys({obj, ...opts});
      console.log(res);
  });

program
  .command('uniques <obj> [prop]')
  .description('Verify uniques objects by given prop')
  .option('-s, --save', 'Save repeated objets in ./objectUniques.js', false)
  .action(async (obj, prop, opts) => {
      let objeto = await comparer.load({ obj, path: '.' });

      let res = await comparer.uniquesBy({ obj, prop, ...opts });
      console.log(`Uniques ${res.length} of ${objeto.length}`);
	  if (opts.save) console.log(`\n Results saved at ${obj}_uniques.js`);
  });

program
  .command('repeated <obj> [prop]')
  .description('Verify uniques objects by prop')
  .option('-s, --save', 'Save repeated objets in ./objectRepeated.js', false)
  .action(async (obj, prop, opts) => {
      let res = await comparer.repeatedBy({ obj, prop, ...opts });
      console.log(res);
      console.log(`\n${res.length} elements repeated in object`)
	  if (opts.save) console.log(`\nResults saved at ${obj}_repeated.js`);
  });    

program
  .command('QA <obj> [prop]')
  .description('Verify QA requirements')
  .option('-s, --save', 'Save QA objets in ./objectQA.js', false)
  .action(async (obj, prop, opts) => {
      let res = await comparer.QA({ obj, prop, ...opts });
      console.log(res);
      console.log(`\n${res.length} elements with error in object`)
	  if (opts.save) console.log(`\nResults saved at ${obj}_QA.js`);
  });  

program
  .command('compare <obj1>  <obj2>')
  .description('Compare ubiquitous properties in two given objects <obj1> <obj2>')
  .option('-s, --save', 'Save repeated objets in ./Difference_object1_object2.js', false)
  .option('-b, --compareBy <propToCompare>', 'Set a different prop to compare by', 'ProductUrl')
  // .option('-a, --attribute <attribute>', 'Compare specific attribute', 'ProductUrl')
  .action(async (obj1, obj2, opts) => {
      let res = await comparer.compare({ obj1, obj2, ...opts });
	  console.log(`\n${res.length} elements with differents values for the same props between both objects`);
	  if (opts.save) console.log(`\nResults saved at difference_${obj1}_${obj2}.js`);
  });
program
  .command('compareProduction <apiUrl>')
  .description('Compare production ubiquitous properties in two given objects <obj1> production <obj2>')
  .option('-s, --save', 'Save repeated objets in ./Difference_object1_object2.js', false)
  .option('-b, --compareBy <propToCompare>', 'Set a different prop to compare by', 'ProductUrl')
  // .option('-a, --attribute <attribute>', 'Compare specific attribute', 'ProductUrl')
  .action(async (apiUrl, opts) => {
      let res = await comparer.compareProduction({ apiUrl, ...opts });
	  console.log(`\n${res.length} elements with differents values for the same props between both objects`);
	  if (opts.save) console.log(`\nResults saved at difference_Production.js`);
  });
program
  .command('compareAttribute <obj1>  <obj2>  <attribute>')
  .description('Compare one attribute in two given objects <obj1> <obj2>')
  .option('-s, --save', 'Save repeated objets in ./AttributeDifference_object1_object2.js', false)
  .option('-b, --compareBy <propToCompare>', 'Set a different prop to compare by', 'ProductUrl')
  .action(async (obj1, obj2, attribute, opts) => {
      let res = await comparer.compareAttribute({ obj1, obj2, attribute, ...opts });
	  console.log(`\n${res.length} elements with differents values for the same props between both objects`);
	  if (opts.save) console.log(`\nResults saved at ${attribute}Difference_${obj1}_${obj2}.js`);
  });  
program
  .command('schema <obj>')
  .description('Verify props in object match with schema')
  .option('-s, --save', 'Save schema verification in ./object_schemaVerification.js', false)
  .action(async (obj, opts) => {
      let res = await comparer.schema({ obj, ...opts });
      if (res.length > 0) {
            console.log(`\nBad property keys finded: `);
            console.log(res);
      } else {
            console.log(`\nNo bad property keys finded`);
      }

	  //console.log(`\n${res.length} elements with differents values for the same props between both objects`);
	  if (opts.save) console.log(`\nResults saved at ${obj}_schemaVerification.js`);
  });  

program
  .command('handled <obj>')
  .description('View Handled items in object')
  .option('-c, --clean', 'Clean al handled items of object, handled items will be saved in ./object_handleds.js', false)
  .action(async (obj, opts) => {
      let res = await comparer.handleds({ obj, ...opts });
      if (res.length === 0) {
          console.log(`Not handled items in object`);
          return null;
      }
      console.log('\n');
      console.log(res);
      if (opts.clean) {
          console.log(`Original Object cleaned of handleds, these ares saved at ./data/${obj}_handleds.js`)
      }
  });
  
program
  .command('toexcel <obj>')
  .description('Generate .xlsx file with object data')
  .action(async (obj, opts) => {
      let res = await comparer.toExcel({ obj, ...opts });
  });
program
  .command('inputProd <apiUrl>')
  .description('Rewrite input with production data')
  .action(async (apiUrl, opts) => {
      let res = await comparer.getInput({ apiUrl, ...opts });
  });
program
  .command('inputLocal')
  .description('Rewrite input with last inputPPUF data')
  .action(async (opts) => {
      let res = await comparer.getInputL({ ...opts });
  });
program
  .command('functionProd <apiUrl> <obj1>')
  .description('Rewrite funcction with production data')
  .action(async (apiUrl, obj1, opts) => {
      let res = await comparer.getFunction({ apiUrl, obj1, ...opts });
  });
program.parse(process.argv);

