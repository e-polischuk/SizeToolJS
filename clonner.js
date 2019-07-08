/**
* This function provides pure (without any properties leak or modifications)
* clonning of any JS object.
* But it works significantly slower than JSON.parse(JSON.stringify(obj)) -
* see in end of this file the testing code and an output of testing results.
* To increase performance of this function call it with second param 
* isProto=false (in such case inherited properties of prototype are lost).
*
* @param obj - a JS object, wich has to be clonned
* @return a clone of obj
*/
const cloneOf = (obj, isProto = false) => {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.getOwnPropertyNames(obj).reduce((clone, i) => {
      clone[i] = !obj[i] || typeof obj[i] !== 'object' ? obj[i] : cloneOf(obj[i], isProto);
      return clone;
    }, isProto ? Object.create(cloneOf(Object.getPrototypeOf(obj), true)) : Array.isArray(obj) ? [] : {});
};

// TESTING of 'cloneOf' function:
// Function for comparison:
const jsonClone = (obj) => JSON.parse(JSON.stringify(obj));

// JS object for testing:
const isRequiredProto = true;
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
  printTestData(testObjClone, 'Clone by ' + fName);
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

/* ##### RANDOM OUTPUT OF ABOVE TESTING CODE: #####
###################     Data Testing:    ######################
=================== Test for "cloneOf" ===================
Test 1 (clonned function) -> COMPLEATED
Test 2 (clonned nested object) -> COMPLEATED
Test 3 (not enumerable prop) -> COMPLEATED
Test 4 (clonned not enumerable prop) -> COMPLEATED
Test 5 (inherited prop) -> COMPLEATED
Test 6 (clonned inherited prop) -> COMPLEATED
--------------- Clone by cloneOf -------------------
{ '1': 'number',
  a: {},
  b:
   { a: 2,
     b:
      Array {
        '0': [Object],
        '1': [Object],
        '2': 17,
        '3': false,
        '4': null,
        '5': undefined,
        '6': [Function],
        length: 7 } },
  c: { a: 'stop' },
  d: Array { '0': 17, '1': 25, '2': 33, length: 3 },
  e: 'text',
  f: [Function: f],
  fa: Array { '0': [Function], length: 1 },
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false,
  '$': 'symbol',
  notEnum: 'Test 4 (clonned not enumerable prop) -> FAILED' }
1 -> string; isArray = false
a -> object; isArray = false
b -> object; isArray = false
c -> object; isArray = false
d -> object; isArray = false
e -> string; isArray = false
f -> function; isArray = false
fa -> object; isArray = false
g -> string; isArray = false
i -> object; isArray = false
j -> undefined; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
$ -> string; isArray = false
notEnum -> string; isArray = false

=================== Test for "jsonClone" ===================
Test 1 (clonned function) -> FAILED
Test 2 (clonned nested object) -> COMPLEATED
Test 3 (not enumerable prop) -> FAILED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> FAILED
Test 6 (clonned inherited prop) -> FAILED
--------------- Clone by jsonClone -------------------
{ '1': 'number',
  a: {},
  b:
   { a: 2, b: [ [Object], [Object], 17, false, null, null, null ] },
  c: { a: 'stop' },
  d: [ 17, 25, 33 ],
  e: 'text',
  fa: [ null ],
  g: '',
  i: null,
  p: true,
  n: false,
  '$': 'symbol' }
1 -> string; isArray = false
a -> object; isArray = false
b -> object; isArray = false
c -> object; isArray = false
d -> object; isArray = true
e -> string; isArray = false
fa -> object; isArray = true
g -> string; isArray = false
i -> object; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
$ -> string; isArray = false

=================== Test for "Object.assign" ===================
Test 1 (clonned function) -> COMPLEATED
Test 2 (clonned nested object) -> FAILED
Test 3 (not enumerable prop) -> COMPLEATED
Test 4 (clonned not enumerable prop) -> FAILED
Test 5 (inherited prop) -> COMPLEATED
Test 6 (clonned inherited prop) -> FAILED
--------------- Clone by Object.assign -------------------
{ '1': 'number',
  a: {},
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: { a: 'stop' },
  d: [ 17, 25, 33 ],
  e: 'text',
  f: [Function: f],
  fa: [ [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false,
  '$': 'symbol' }
1 -> string; isArray = false
a -> object; isArray = false
b -> object; isArray = false
c -> object; isArray = false
d -> object; isArray = true
e -> string; isArray = false
f -> function; isArray = false
fa -> object; isArray = true
g -> string; isArray = false
i -> object; isArray = false
j -> undefined; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
$ -> string; isArray = false
notEnum -> string; isArray = false

##################   Performance Testing:   ######################
1 iterations -> Awerage Time of "cloneOf" = 0.00044640890000000017 sec
1 iterations -> Awerage Time of "jsonClone" = 0.0000288675 sec
1 iterations -> "cloneOf" is SLOWER in 15.464 times
---------------------------------------------------------------
2 iterations -> Awerage Time of "cloneOf" = 0.0007024945099999999 sec
2 iterations -> Awerage Time of "jsonClone" = 0.000038796280000000005 sec
2 iterations -> "cloneOf" is SLOWER in 18.107 times
---------------------------------------------------------------
4 iterations -> Awerage Time of "cloneOf" = 0.0012704389400000004 sec
4 iterations -> Awerage Time of "jsonClone" = 0.00006162688999999999 sec
4 iterations -> "cloneOf" is SLOWER in 20.615 times
---------------------------------------------------------------
8 iterations -> Awerage Time of "cloneOf" = 0.0023849932900000008 sec
8 iterations -> Awerage Time of "jsonClone" = 0.00010260326999999996 sec
8 iterations -> "cloneOf" is SLOWER in 23.245 times
---------------------------------------------------------------
16 iterations -> Awerage Time of "cloneOf" = 0.004580016660000001 sec
16 iterations -> Awerage Time of "jsonClone" = 0.00018865606999999993 sec
16 iterations -> "cloneOf" is SLOWER in 24.277 times
---------------------------------------------------------------
32 iterations -> Awerage Time of "cloneOf" = 0.009043858370000003 sec
32 iterations -> Awerage Time of "jsonClone" = 0.00034908199 sec
32 iterations -> "cloneOf" is SLOWER in 25.908 times
---------------------------------------------------------------
64 iterations -> Awerage Time of "cloneOf" = 0.017952498419999994 sec
64 iterations -> Awerage Time of "jsonClone" = 0.0007134625500000004 sec
64 iterations -> "cloneOf" is SLOWER in 25.162 times
---------------------------------------------------------------
128 iterations -> Awerage Time of "cloneOf" = 0.035965715610000004 sec
128 iterations -> Awerage Time of "jsonClone" = 0.0013158153299999997 sec
128 iterations -> "cloneOf" is SLOWER in 27.333 times
---------------------------------------------------------------
256 iterations -> Awerage Time of "cloneOf" = 0.07893317279999994 sec
256 iterations -> Awerage Time of "jsonClone" = 0.00290598458 sec
256 iterations -> "cloneOf" is SLOWER in 27.162 times
---------------------------------------------------------------
512 iterations -> Awerage Time of "cloneOf" = 0.14769702924 sec
512 iterations -> Awerage Time of "jsonClone" = 0.005228878300000001 sec
512 iterations -> "cloneOf" is SLOWER in 28.246 times
---------------------------------------------------------------
1024 iterations -> Awerage Time of "cloneOf" = 0.2981846621299999 sec
1024 iterations -> Awerage Time of "jsonClone" = 0.011137253689999998 sec
1024 iterations -> "cloneOf" is SLOWER in 26.774 times
---------------------------------------------------------------
[Finished in 62.46s]*/
