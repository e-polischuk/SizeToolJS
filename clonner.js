/**
* This function (together with simpleCloneOf() function) provides pure clonning
* of any JS object (without any properties leaks or modifications).
* The returned clone of the object can be configured by the optional second param -
* isCloneSimple. For many cases of practical problems it's enougth of the simple
* clone (without clonning of not enumerable and inherited in prototype properties),
* so this optional param by default is true - as result, such simple clonning has
* better performance time in comparison with other clonning approaches (for
* example - JSON.parse(JSON.stringify(obj))). But if needs to clone mentioned
* not enumerable and inherited properties than just call this function with false -
* in such case the performance time is significantly worse in comparison with
* other approaches (see in end of this file the testing code and two outputs of
* testing results which cover two cases of isCloneSimple param).
*
* @param obj - a JS object, which has to be clonned
* @param isCloneSimple - an optional boolean flag - by default is true.
* @return a clone of obj
*/
export const cloneOf = (obj, isCloneSimple = true) => isCloneSimple ? simpleCloneOf(obj) :
  !obj || typeof obj !== 'object' ? obj : Object.getOwnPropertyNames(obj).reduce((clone, i) => {
      clone[i] = !obj[i] || typeof obj[i] !== 'object' ? obj[i] : cloneOf(obj[i], false);
      return clone;
    }, Object.create(cloneOf(Object.getPrototypeOf(obj), false)));

const simpleCloneOf = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const isArray = obj instanceof Array;
  const clone = isArray ? [] : {};
  (isArray ? obj : Object.keys(obj)).forEach(i => {
    const val = isArray ? i : obj[i];
    const cloneVal = !val || typeof val !== 'object' ? val : cloneOf(val);
    if (isArray) clone.push(cloneVal); else clone[i] = cloneVal;
  });
  return clone;
};

// TESTING of 'cloneOf' function:
// Function for comparison:
const jsonClone = (obj) => JSON.parse(JSON.stringify(obj));

// JS object for testing:
const isCloneSimple = true;
const testObj = {
  a: Object.create({p: 'Test 5 (inherited prop) -> COMPLEATED'}),
  b: {
    a: 2,
    b: [{
      a: 3
    }, {
      a: 4,
      b: 'test',
      c: [],
      d: {},
      f: (p) => p + 11111
    }, 17, false, null, undefined, (p) => !p]
  },
  c: {a: 'stop'},
  d: [17, 25, 33],
  e: 'text',
  f: (p) => console.log(p),
  fa: [(p) => 'param = ' + p],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false,
  1: 'number',
  $: 'symbol'
};
Object.defineProperty(testObj, 'notEnum', { value: 'Test 3 (not enumerable prop) -> COMPLEATED', enumerable: false, writable: true});

console.log('###################     Data Testing:    ######################');
const printTestData = (obj, discript) => {
  console.log('--------------- ' + discript + ' -------------------');
  console.log(obj);
  Object.getOwnPropertyNames(obj).forEach(k => console.log(k + ' -> ' +
  (typeof obj[k]) + '; isArray = ' + (obj[k] instanceof Array)));
};

const testOf = (fName, funct) => {
  console.log('=================== Test for "' + fName + '" ===================');
  const test = {a: {b: {c: ['Test 1 (clonned function) -> COMPLEATED']}}, f: (p) => p};
  const testClone = funct(test, isCloneSimple);
  console.log(testClone.f ? testClone.f(testClone.a.b.c[0]) : 'Test 1 (clonned function) -> FAILED');
  test.a.b.c[0] = 'Test 2 (clonned nested object) -> COMPLEATED';
  testClone.a.b.c[0] = 'Test 2 (clonned nested object) -> FAILED';
  console.log(test.a.b.c[0]);
  const testObjClone = funct(testObj, isCloneSimple);
  console.log(testObjClone.notEnum ? testObjClone.notEnum : 'Test 3 (not enumerable prop) -> FAILED');
  if (testObjClone.notEnum) {
    const temp = testObj.notEnum;
    testObj.notEnum = 'Test 4 (clonned not enumerable prop) -> COMPLEATED';
    testObjClone.notEnum = 'Test 4 (clonned not enumerable prop) -> FAILED';
    console.log(testObj.notEnum);
    testObj.notEnum = temp;
  } else console.log('Test 4 (clonned not enumerable prop) -> FAILED');
  const protoClone = Object.getPrototypeOf(testObjClone.a);
  console.log(protoClone && protoClone.p ? protoClone.p : 'Test 5 (inherited prop) -> FAILED');
  if (protoClone && protoClone.p) {
    const temp = Object.getPrototypeOf(testObj.a).p;
    Object.getPrototypeOf(testObj.a).p = 'Test 6 (clonned inherited prop) -> COMPLEATED';
    protoClone.p = 'Test 6 (clonned inherited prop) -> FAILED';
    console.log(Object.getPrototypeOf(testObj.a).p);
    Object.getPrototypeOf(testObj.a).p = temp;
  } else console.log('Test 6 (clonned inherited prop) -> FAILED');
  // printTestData(testObjClone, 'Clone by ' + fName);
  console.log('');
};

// printTestData(testObj, 'Object for clonning');
testOf('cloneOf', cloneOf);
testOf('jsonClone', jsonClone);
testOf('Object.assign', Object.assign);

console.log('##################   Performance Testing:   ######################');
const performanceOf = (funct, param, iterations) => {
  const start = process.hrtime();
  if (iterations && typeof iterations === 'number' && iterations > 0) {
    for (var i = 0; i < iterations; i++) funct(param, isCloneSimple);
  } else funct(param, isCloneSimple);
  const t = process.hrtime(start);
  return t[0] + t[1]/1000000000;
};

for (var iter = 1; iter < 1025; iter = iter * 2) {
  const faster = [];
  const slower = [];
  const pureTime = [];
  const jsonTime = [];
  for (var caseNum = 0; caseNum < 100; caseNum++) {
    let json = 0, pure = 0;
    if (caseNum % 2 > 0) {
      jsonTime.push(performanceOf(jsonClone, testObj, iter));
      pureTime.push(performanceOf(cloneOf, testObj, iter));
    } else {
      pureTime.push(performanceOf(cloneOf, testObj, iter));
      jsonTime.push(performanceOf(jsonClone, testObj, iter));
    }
  }
  const pt = pureTime.reduce((a,b) => a + b, 0)/pureTime.length;
  const jt = jsonTime.reduce((a,b) => a + b, 0)/jsonTime.length;
  console.log(iter + ' iterations -> Awerage Time of "cloneOf" = ' + pt + ' sec');
  console.log(iter + ' iterations -> Awerage Time of "jsonClone" = ' + jt + ' sec');
  console.log(iter + ' iterations -> "cloneOf" is ' + (jt > pt ? 'FASTER' : 'SLOWER') +
  ' in ' + (jt > pt ? jt / pt : pt / jt).toFixed(3) + ' times');
  console.log('---------------------------------------------------------------');
}

/* ##### RANDOM OUTPUT OF TESTING CODE FOR CASE - isCloneSimple = true: #####
###################     Data Testing:    ######################
=================== Test for "cloneOf" ===================
Test 1 (clonned function) -> COMPLEATED
Test 2 (clonned nested object) -> COMPLEATED
Test 3 (not enumerable prop) -> FAILED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> FAILED
Test 6 (clonned inherited prop) -> FAILED

=================== Test for "jsonClone" ===================
Test 1 (clonned function) -> FAILED
Test 2 (clonned nested object) -> COMPLEATED
Test 3 (not enumerable prop) -> FAILED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> FAILED
Test 6 (clonned inherited prop) -> FAILED

=================== Test for "Object.assign" ===================
Test 1 (clonned function) -> COMPLEATED
Test 2 (clonned nested object) -> FAILED
Test 3 (not enumerable prop) -> COMPLEATED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> COMPLEATED
Test 6 (clonned inherited prop) -> FAILED

##################   Performance Testing:   ######################
1 iterations -> Awerage Time of "cloneOf" = 0.000016127280000000003 sec
1 iterations -> Awerage Time of "jsonClone" = 0.000025109369999999995 sec
1 iterations -> "cloneOf" is FASTER in 1.557 times
---------------------------------------------------------------
2 iterations -> Awerage Time of "cloneOf" = 0.00007598248000000003 sec
2 iterations -> Awerage Time of "jsonClone" = 0.00005059400000000001 sec
2 iterations -> "cloneOf" is SLOWER in 1.502 times
---------------------------------------------------------------
4 iterations -> Awerage Time of "cloneOf" = 0.000037866419999999995 sec
4 iterations -> Awerage Time of "jsonClone" = 0.00005207040000000003 sec
4 iterations -> "cloneOf" is FASTER in 1.375 times
---------------------------------------------------------------
8 iterations -> Awerage Time of "cloneOf" = 0.00007186357999999997 sec
8 iterations -> Awerage Time of "jsonClone" = 0.00012884556 sec
8 iterations -> "cloneOf" is FASTER in 1.793 times
---------------------------------------------------------------
16 iterations -> Awerage Time of "cloneOf" = 0.00007592450999999997 sec
16 iterations -> Awerage Time of "jsonClone" = 0.00022640969000000007 sec
16 iterations -> "cloneOf" is FASTER in 2.982 times
---------------------------------------------------------------
32 iterations -> Awerage Time of "cloneOf" = 0.00010949551 sec
32 iterations -> Awerage Time of "jsonClone" = 0.0003831228000000001 sec
32 iterations -> "cloneOf" is FASTER in 3.499 times
---------------------------------------------------------------
64 iterations -> Awerage Time of "cloneOf" = 0.00019569176000000003 sec
64 iterations -> Awerage Time of "jsonClone" = 0.0006712032400000002 sec
64 iterations -> "cloneOf" is FASTER in 3.430 times
---------------------------------------------------------------
128 iterations -> Awerage Time of "cloneOf" = 0.00037519645999999995 sec
128 iterations -> Awerage Time of "jsonClone" = 0.0012964775900000003 sec
128 iterations -> "cloneOf" is FASTER in 3.455 times
---------------------------------------------------------------
256 iterations -> Awerage Time of "cloneOf" = 0.0007123166799999999 sec
256 iterations -> Awerage Time of "jsonClone" = 0.0024645975900000005 sec
256 iterations -> "cloneOf" is FASTER in 3.460 times
---------------------------------------------------------------
512 iterations -> Awerage Time of "cloneOf" = 0.0014094706500000006 sec
512 iterations -> Awerage Time of "jsonClone" = 0.004958605350000001 sec
512 iterations -> "cloneOf" is FASTER in 3.518 times
---------------------------------------------------------------
1024 iterations -> Awerage Time of "cloneOf" = 0.0029813986099999994 sec
1024 iterations -> Awerage Time of "jsonClone" = 0.010867027569999996 sec
1024 iterations -> "cloneOf" is FASTER in 3.645 times
---------------------------------------------------------------
[Finished in 3.288s]
*/

/* ##### RANDOM OUTPUT OF TESTING CODE FOR CASE - isCloneSimple = false: #####
###################     Data Testing:    ######################
=================== Test for "cloneOf" ===================
Test 1 (clonned function) -> COMPLEATED
Test 2 (clonned nested object) -> COMPLEATED
Test 3 (not enumerable prop) -> COMPLEATED
Test 4 (clonned not enumerable prop) -> COMPLEATED
Test 5 (inherited prop) -> COMPLEATED
Test 6 (clonned inherited prop) -> COMPLEATED

=================== Test for "jsonClone" ===================
Test 1 (clonned function) -> FAILED
Test 2 (clonned nested object) -> COMPLEATED
Test 3 (not enumerable prop) -> FAILED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> FAILED
Test 6 (clonned inherited prop) -> FAILED

=================== Test for "Object.assign" ===================
Test 1 (clonned function) -> COMPLEATED
Test 2 (clonned nested object) -> FAILED
Test 3 (not enumerable prop) -> COMPLEATED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> COMPLEATED
Test 6 (clonned inherited prop) -> FAILED

##################   Performance Testing:   ######################
1 iterations -> Awerage Time of "cloneOf" = 0.0004693557000000001 sec
1 iterations -> Awerage Time of "jsonClone" = 0.000031533239999999994 sec
1 iterations -> "cloneOf" is SLOWER in 14.884 times
---------------------------------------------------------------
2 iterations -> Awerage Time of "cloneOf" = 0.0007141089099999998 sec
2 iterations -> Awerage Time of "jsonClone" = 0.000042256749999999975 sec
2 iterations -> "cloneOf" is SLOWER in 16.899 times
---------------------------------------------------------------
4 iterations -> Awerage Time of "cloneOf" = 0.0012580926399999998 sec
4 iterations -> Awerage Time of "jsonClone" = 0.00005895197999999999 sec
4 iterations -> "cloneOf" is SLOWER in 21.341 times
---------------------------------------------------------------
8 iterations -> Awerage Time of "cloneOf" = 0.002362426129999999 sec
8 iterations -> Awerage Time of "jsonClone" = 0.00010317525999999996 sec
8 iterations -> "cloneOf" is SLOWER in 22.897 times
---------------------------------------------------------------
16 iterations -> Awerage Time of "cloneOf" = 0.004595826449999998 sec
16 iterations -> Awerage Time of "jsonClone" = 0.00019345808000000004 sec
16 iterations -> "cloneOf" is SLOWER in 23.756 times
---------------------------------------------------------------
32 iterations -> Awerage Time of "cloneOf" = 0.008859061160000004 sec
32 iterations -> Awerage Time of "jsonClone" = 0.00034984331 sec
32 iterations -> "cloneOf" is SLOWER in 25.323 times
---------------------------------------------------------------
64 iterations -> Awerage Time of "cloneOf" = 0.018071851890000004 sec
64 iterations -> Awerage Time of "jsonClone" = 0.0006608724800000001 sec
64 iterations -> "cloneOf" is SLOWER in 27.345 times
---------------------------------------------------------------
128 iterations -> Awerage Time of "cloneOf" = 0.035308987869999996 sec
128 iterations -> Awerage Time of "jsonClone" = 0.0013355433200000003 sec
128 iterations -> "cloneOf" is SLOWER in 26.438 times
---------------------------------------------------------------
256 iterations -> Awerage Time of "cloneOf" = 0.07242559146 sec
256 iterations -> Awerage Time of "jsonClone" = 0.002737441140000001 sec
256 iterations -> "cloneOf" is SLOWER in 26.457 times
---------------------------------------------------------------
512 iterations -> Awerage Time of "cloneOf" = 0.14302350001000005 sec
512 iterations -> Awerage Time of "jsonClone" = 0.0052847461299999985 sec
512 iterations -> "cloneOf" is SLOWER in 27.063 times
---------------------------------------------------------------
1024 iterations -> Awerage Time of "cloneOf" = 0.28303938272 sec
1024 iterations -> Awerage Time of "jsonClone" = 0.010681218270000004 sec
1024 iterations -> "cloneOf" is SLOWER in 26.499 times
---------------------------------------------------------------
[Finished in 59.747s]
*/
