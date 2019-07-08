/**
* This function provides pure (without any properties leak or modifications)
* clonning of any JS object.
* But if function's second param is true than it works significantly slower than
* JSON.parse(JSON.stringify(obj)) - see in end of this file the testing code and
* an output of testing results.
* To increase performance of this function call it without second param or as
* isEnumAndProto = false (in such case not enumerable and inherited properties
* will be lost but performance is significantly better).
*
* @param obj - a JS object, wich has to be clonned
* @return a clone of obj
*/
const cloneOf = (obj, isEnumAndProto = false) => !obj || typeof obj !== 'object' ? obj :
  (isEnumAndProto ? Object.getOwnPropertyNames(obj) : Object.keys(obj)).reduce((clone, i) => {
      clone[i] = !obj[i] || typeof obj[i] !== 'object' ? obj[i] : cloneOf(obj[i], isEnumAndProto);
      return clone;
  }, isEnumAndProto ? Object.create(cloneOf(Object.getPrototypeOf(obj), true)) : Array.isArray(obj) ? [] : {});

// TESTING of 'cloneOf' function:
// Function for comparison:
const jsonClone = (obj) => JSON.parse(JSON.stringify(obj));

// JS object for testing:
const isRequiredProto = false;
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
  const testClone = funct(test, isRequiredProto);
  console.log(testClone.f ? testClone.f(testClone.a.b.c[0]) : 'Test 1 (clonned function) -> FAILED');
  test.a.b.c[0] = 'Test 2 (clonned nested object) -> COMPLEATED';
  testClone.a.b.c[0] = 'Test 2 (clonned nested object) -> FAILED';
  console.log(test.a.b.c[0]);
  const testObjClone = funct(testObj, isRequiredProto);
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
    for (var i = 0; i < iterations; i++) funct(param, isRequiredProto);
  } else funct(param, isRequiredProto);
  const t = process.hrtime(start);
  return t[0] + t[1]/1000000000;
};

for (var iter = 1; iter < 1025; iter = iter * 2) { //10000
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

/* ##### RANDOM OUTPUT OF TESTING CODE FOR CASE - isEnumAndProto = true: #####
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
1 iterations -> Awerage Time of "cloneOf" = 0.0005854807799999999 sec
1 iterations -> Awerage Time of "jsonClone" = 0.000036308460000000004 sec
1 iterations -> "cloneOf" is SLOWER in 16.125 times
---------------------------------------------------------------
2 iterations -> Awerage Time of "cloneOf" = 0.0007744734100000001 sec
2 iterations -> Awerage Time of "jsonClone" = 0.000049225320000000006 sec
2 iterations -> "cloneOf" is SLOWER in 15.733 times
---------------------------------------------------------------
4 iterations -> Awerage Time of "cloneOf" = 0.0016094376199999993 sec
4 iterations -> Awerage Time of "jsonClone" = 0.00007614844 sec
4 iterations -> "cloneOf" is SLOWER in 21.136 times
---------------------------------------------------------------
8 iterations -> Awerage Time of "cloneOf" = 0.0025505842200000007 sec
8 iterations -> Awerage Time of "jsonClone" = 0.00011128764000000002 sec
8 iterations -> "cloneOf" is SLOWER in 22.919 times
---------------------------------------------------------------
16 iterations -> Awerage Time of "cloneOf" = 0.004900409210000001 sec
16 iterations -> Awerage Time of "jsonClone" = 0.00020382183 sec
16 iterations -> "cloneOf" is SLOWER in 24.043 times
---------------------------------------------------------------
32 iterations -> Awerage Time of "cloneOf" = 0.009900946930000003 sec
32 iterations -> Awerage Time of "jsonClone" = 0.0003899778300000002 sec
32 iterations -> "cloneOf" is SLOWER in 25.388 times
---------------------------------------------------------------
64 iterations -> Awerage Time of "cloneOf" = 0.018079124240000004 sec
64 iterations -> Awerage Time of "jsonClone" = 0.0007610325199999998 sec
64 iterations -> "cloneOf" is SLOWER in 23.756 times
---------------------------------------------------------------
128 iterations -> Awerage Time of "cloneOf" = 0.03588377968 sec
128 iterations -> Awerage Time of "jsonClone" = 0.0013358488200000003 sec
128 iterations -> "cloneOf" is SLOWER in 26.862 times
---------------------------------------------------------------
256 iterations -> Awerage Time of "cloneOf" = 0.07350399859 sec
256 iterations -> Awerage Time of "jsonClone" = 0.0027395478799999997 sec
256 iterations -> "cloneOf" is SLOWER in 26.831 times
---------------------------------------------------------------
512 iterations -> Awerage Time of "cloneOf" = 0.14269501291 sec
512 iterations -> Awerage Time of "jsonClone" = 0.005348719509999999 sec
512 iterations -> "cloneOf" is SLOWER in 26.678 times
---------------------------------------------------------------
1024 iterations -> Awerage Time of "cloneOf" = 0.28595831950999995 sec
1024 iterations -> Awerage Time of "jsonClone" = 0.01048451649 sec
1024 iterations -> "cloneOf" is SLOWER in 27.274 times
---------------------------------------------------------------
[Finished in 60.4s]
*/

/* ##### RANDOM OUTPUT OF TESTING CODE FOR CASE - isEnumAndProto = false: #####
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
1 iterations -> Awerage Time of "cloneOf" = 0.000018850110000000002 sec
1 iterations -> Awerage Time of "jsonClone" = 0.000017139680000000003 sec
1 iterations -> "cloneOf" is SLOWER in 1.100 times
---------------------------------------------------------------
2 iterations -> Awerage Time of "cloneOf" = 0.00005891679999999999 sec
2 iterations -> Awerage Time of "jsonClone" = 0.000042579769999999986 sec
2 iterations -> "cloneOf" is SLOWER in 1.384 times
---------------------------------------------------------------
4 iterations -> Awerage Time of "cloneOf" = 0.00004829268000000001 sec
4 iterations -> Awerage Time of "jsonClone" = 0.00006485845999999999 sec
4 iterations -> "cloneOf" is FASTER in 1.343 times
---------------------------------------------------------------
8 iterations -> Awerage Time of "cloneOf" = 0.00008801825999999995 sec
8 iterations -> Awerage Time of "jsonClone" = 0.00012403738000000002 sec
8 iterations -> "cloneOf" is FASTER in 1.409 times
---------------------------------------------------------------
16 iterations -> Awerage Time of "cloneOf" = 0.00014946941000000004 sec
16 iterations -> Awerage Time of "jsonClone" = 0.0002260331 sec
16 iterations -> "cloneOf" is FASTER in 1.512 times
---------------------------------------------------------------
32 iterations -> Awerage Time of "cloneOf" = 0.00023039472000000005 sec
32 iterations -> Awerage Time of "jsonClone" = 0.00035851711000000003 sec
32 iterations -> "cloneOf" is FASTER in 1.556 times
---------------------------------------------------------------
64 iterations -> Awerage Time of "cloneOf" = 0.00042246305999999996 sec
64 iterations -> Awerage Time of "jsonClone" = 0.0006566058799999999 sec
64 iterations -> "cloneOf" is FASTER in 1.554 times
---------------------------------------------------------------
128 iterations -> Awerage Time of "cloneOf" = 0.0008478348899999998 sec
128 iterations -> Awerage Time of "jsonClone" = 0.0013189032199999997 sec
128 iterations -> "cloneOf" is FASTER in 1.556 times
---------------------------------------------------------------
256 iterations -> Awerage Time of "cloneOf" = 0.0018094340399999994 sec
256 iterations -> Awerage Time of "jsonClone" = 0.0027916327399999993 sec
256 iterations -> "cloneOf" is FASTER in 1.543 times
---------------------------------------------------------------
512 iterations -> Awerage Time of "cloneOf" = 0.003261039110000002 sec
512 iterations -> Awerage Time of "jsonClone" = 0.005047586580000001 sec
512 iterations -> "cloneOf" is FASTER in 1.548 times
---------------------------------------------------------------
1024 iterations -> Awerage Time of "cloneOf" = 0.0064841967900000005 sec
1024 iterations -> Awerage Time of "jsonClone" = 0.01013567198 sec
1024 iterations -> "cloneOf" is FASTER in 1.563 times
---------------------------------------------------------------
[Finished in 3.978s]
*/
