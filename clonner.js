/**
* This function provides pure (without any properties leak or modifications)
* clonning of classical JS object.
* It works faster than JSON.parse(JSON.stringify(obj)) - see in end of this file
* the testing code and an output of testing results.
*
* @param obj - a classical JS object, wich has to be clonned
* @return a clone of param obj
*/
const cloneOf = (obj) => {
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
const testObj = {
  a: 1,
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
    }, 17, false, null, undefined, (p) => console.log(p)]
  },
  c: 25,
  d: [],
  e: 'text',
  f: (p) => !p,
  fa: [(p) => 'param = ' + p],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false
};

console.log('###################     Data Testing:    ######################');
const printTestData = (obj, discript) => {
  console.log('--------------- ' + discript + ' -------------------');
  console.log(obj);
  Object.keys(obj).forEach(k => console.log(k + ' -> ' + (typeof obj[k]) +
    '; isArray = ' + (obj[k] instanceof Array)));
};

const testOf = (fName, funct) => {
  console.log('=================== Test for "' + fName + '" ===================');
  const test = {a: {b: {c: ['Test 1 -> COMPLEATED']}}, f: (p) => p};
  const testClone = funct(test);
  console.log(testClone.f ? testClone.f(testClone.a.b.c[0]) : 'Test 1 -> FAILED');
  test.a.b.c[0] = 'Test 2 -> COMPLEATED';
  testClone.a.b.c[0] = 'Test 2 -> FAILED';
  console.log(test.a.b.c[0]);
  printTestData(funct(testObj), 'Clone by ' + fName);
};

printTestData(testObj, 'Object for clonning');
testOf('cloneOf', cloneOf);
testOf('jsonClone', jsonClone);
testOf('Object.assign', Object.assign);

console.log('##################   Performance Testing:   ######################');
const performanceOf = (fName, funct, param, iterations) => {
  const start = process.hrtime();
  if (iterations && typeof iterations === 'number' && iterations > 0) {
    for (var i = 0; i < iterations; i++) funct(param);
  } else funct(param);
  const t = process.hrtime(start);
  const performance = t[0] + t[1]/1000000000;
  //console.log('Performance of "' + fName + '" = ' + performance + ' sec');
  return performance;
};

for (var iter = 1; iter < 10000; iter = iter * 2) {
  const faster = [];
  const slower = [];
  for (var caseNum = 0; caseNum < 100; caseNum++) {
    const pure = performanceOf('cloneOf', cloneOf, testObj, iter);
    const json = performanceOf('jsonClone', jsonClone, testObj, iter);
    const times = json > pure ? json / pure : pure / json;
    if (json > pure) faster.push(times); else slower.push(times);
  }
  const fa = faster.reduce((a,b) => a + b, 0)/(faster.length > 0 ? faster.length : 1);
  const sa = slower.reduce((a,b) => a + b, 0)/(slower.length > 0 ? slower.length : 1);
  const mod = 100 * (1 - (slower.length * sa)/(faster.length * fa));
  console.log(iter + ' iterations -> FASTER for ' + faster.length +
    ' cases; AVERAGE - in ' + fa.toFixed(2) + ' times');
  console.log(iter + ' iterations -> SLOWER for ' + slower.length +
    ' cases; AVERAGE - in ' + sa.toFixed(2) + ' times');
  console.log(iter + ' iterations -> Absolutely is ' +
    (mod < 0 ? 'SLOWER' : 'FASTER') + ' on ' + mod.toFixed(2) + ' %');
  console.log('---------------------------------------------------------------');
}

/* ##### RANDOM OUTPUT OF ABOVE TESTING CODE: #####
###################     Data Testing:    ######################
--------------- Object for clonning -------------------
{ a: 1,
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: 25,
  d: [],
  e: 'text',
  f: [Function: f],
  fa: [ [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false }
a -> number; isArray = false
b -> object; isArray = false
c -> number; isArray = false
d -> object; isArray = true
e -> string; isArray = false
f -> function; isArray = false
fa -> object; isArray = true
g -> string; isArray = false
i -> object; isArray = false
j -> undefined; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
=================== Test for "cloneOf" ===================
Test 1 -> COMPLEATED
Test 2 -> COMPLEATED
--------------- Clone by cloneOf -------------------
{ a: 1,
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: 25,
  d: [],
  e: 'text',
  f: [Function: f],
  fa: [ [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false }
a -> number; isArray = false
b -> object; isArray = false
c -> number; isArray = false
d -> object; isArray = true
e -> string; isArray = false
f -> function; isArray = false
fa -> object; isArray = true
g -> string; isArray = false
i -> object; isArray = false
j -> undefined; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
=================== Test for "jsonClone" ===================
Test 1 -> FAILED
Test 2 -> COMPLEATED
--------------- Clone by jsonClone -------------------
{ a: 1,
  b:
   { a: 2, b: [ [Object], [Object], 17, false, null, null, null ] },
  c: 25,
  d: [],
  e: 'text',
  fa: [ null ],
  g: '',
  i: null,
  p: true,
  n: false }
a -> number; isArray = false
b -> object; isArray = false
c -> number; isArray = false
d -> object; isArray = true
e -> string; isArray = false
fa -> object; isArray = true
g -> string; isArray = false
i -> object; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
=================== Test for "Object.assign" ===================
Test 1 -> COMPLEATED
Test 2 -> FAILED
--------------- Clone by Object.assign -------------------
{ a: 1,
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: 25,
  d: [],
  e: 'text',
  f: [Function: f],
  fa: [ [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false }
a -> number; isArray = false
b -> object; isArray = false
c -> number; isArray = false
d -> object; isArray = true
e -> string; isArray = false
f -> function; isArray = false
fa -> object; isArray = true
g -> string; isArray = false
i -> object; isArray = false
j -> undefined; isArray = false
p -> boolean; isArray = false
n -> boolean; isArray = false
##################   Performance Testing:   ######################
1 iterations -> FASTER for 97 cases; AVERAGE - in 1.41 times
1 iterations -> SLOWER for 3 cases; AVERAGE - in 1.46 times
1 iterations -> Absolutely is FASTER on 96.80 %
---------------------------------------------------------------
2 iterations -> FASTER for 82 cases; AVERAGE - in 1.29 times
2 iterations -> SLOWER for 18 cases; AVERAGE - in 2.56 times
2 iterations -> Absolutely is FASTER on 56.52 %
---------------------------------------------------------------
4 iterations -> FASTER for 97 cases; AVERAGE - in 2.43 times
4 iterations -> SLOWER for 3 cases; AVERAGE - in 11.09 times
4 iterations -> Absolutely is FASTER on 85.88 %
---------------------------------------------------------------
8 iterations -> FASTER for 98 cases; AVERAGE - in 3.49 times
8 iterations -> SLOWER for 2 cases; AVERAGE - in 4.70 times
8 iterations -> Absolutely is FASTER on 97.25 %
---------------------------------------------------------------
16 iterations -> FASTER for 100 cases; AVERAGE - in 4.51 times
16 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
16 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
32 iterations -> FASTER for 97 cases; AVERAGE - in 4.21 times
32 iterations -> SLOWER for 3 cases; AVERAGE - in 1.32 times
32 iterations -> Absolutely is FASTER on 99.03 %
---------------------------------------------------------------
64 iterations -> FASTER for 100 cases; AVERAGE - in 4.11 times
64 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
64 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
128 iterations -> FASTER for 100 cases; AVERAGE - in 3.97 times
128 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
128 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
256 iterations -> FASTER for 100 cases; AVERAGE - in 3.91 times
256 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
256 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
512 iterations -> FASTER for 100 cases; AVERAGE - in 3.94 times
512 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
512 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
1024 iterations -> FASTER for 100 cases; AVERAGE - in 3.83 times
1024 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
1024 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
2048 iterations -> FASTER for 100 cases; AVERAGE - in 3.91 times
2048 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
2048 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
4096 iterations -> FASTER for 100 cases; AVERAGE - in 3.90 times
4096 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
4096 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
8192 iterations -> FASTER for 100 cases; AVERAGE - in 3.86 times
8192 iterations -> SLOWER for 0 cases; AVERAGE - in 0.00 times
8192 iterations -> Absolutely is FASTER on 100.00 %
---------------------------------------------------------------
[Finished in 14.53s]*/
