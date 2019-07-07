/*jshint esversion: 6 */
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

// Tests for 'cloneOf' function:
const performanceOf = (fName, funct, param, iterations) => {
  const start = process.hrtime();//+new Date();
  if (iterations && typeof iterations === 'number' && iterations > 0) {
    for (var i = 0; i < iterations; i++) funct(param);
  } else funct(param);
  const t = process.hrtime(start);
  const performance = t[0] + t[1]/1000000000;
  //console.log('Performance of "' + fName + '" = ' + performance + ' sec');
  return performance;
};

const printTest = (obj, msg) => {
  console.log('--------------- ' + msg + ' -------------------');
  console.log(obj);
  console.log(obj.b.b[1].f ? obj.b.b[1].f(9) : 'Function DIED!');
  Object.keys(obj).forEach(k => console.log(k + ' -> ' + (typeof obj[k]) + '; isArray = ' + (obj[k] instanceof Array) + '; isEmpty = ' + !obj[k]));
};

const testOf = (fName, funct, param) => {
  console.log('=============== Test of "' + fName + '" ================');
  printTest(param, 'object');
  printTest(funct(param), 'clone');
};

var testObj = {
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
      f: function(p) {
        return p + 11;
      }
    }, 17, false, null, undefined, function(p) {
      console.log(p);
    }]
  },
  c: 25,
  d: [],
  e: 'text',
  f: function(p) {
    return !p;
  },
  f1: function(p) {
    return !p;
  },
  f2: function(p) {
    return !p;
  },
  f3: function(p) {
    return !p;
  },
  f4: function(p) {
    return !p;
  },
  f5: function(p) {
    return !p;
  },
  f6: [function(p){return !p;}, function(p){return !p;}, function(p){return !p;}, function(p){return !p;}, function(p){return !p;}, function(p){return !p;}],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false
};

const jsonClone = (obj) => JSON.parse(JSON.stringify(obj));

console.log('################### Data Testing: ######################');
testOf('cloneOf', cloneOf, testObj);
testOf('jsonClone', jsonClone, testObj);

console.log('################### Performance Testing: ######################');
let faster, slower;
for (var iter = 1; iter < 10000; iter = iter * 2) {
  faster = [];
  slower = [];
  for (var i = 1; i < 101; i++) {
    const pure = performanceOf('cloneOf', cloneOf, testObj, iter);
    const json = performanceOf('jsonClone', jsonClone, testObj, iter);
    const comparator = json > pure ? ' FASTER ' : ' SLOWER ';
    const times = json > pure ? json / pure : pure / json;
    if (json > pure) faster.push(times); else slower.push(times);
    //console.log(i + ' -> "cloneOf" is' + comparator + 'in ' + times + ' times');
    //console.log('--------------------------------------');
  }
  const fa = faster.reduce((a,b) => a + b, 0)/(faster.length > 0 ? faster.length : 1);
  const sa = slower.reduce((a,b) => a + b, 0)/(slower.length > 0 ? slower.length : 1);
  const mod = 100 * (1 - (slower.length * sa)/(faster.length * fa));
  const abs = 2 * mod - 100;
  console.log(iter + ' iterations -> FASTER for ' + faster.length + ' cases; AVERAGE - in ' + fa + ' times');
  console.log(iter + ' iterations -> SLOWER for ' + slower.length + ' cases; AVERAGE - in ' + sa + ' times');
  console.log(iter + ' iterations -> FASTER_MODULE = ' + mod + '% -> Absolutely is ' + (mod < 50 ? 'SLOWER' : 'FASTER') + ' on ' + abs + '%');
  console.log('--------------------------------------------------------------');
}

/* ##### RANDOM OUTPUT OF ABOVE TESTING CODE: #####
JavaScript - clonner.js:114
################### Data Testing: ######################
=============== Test of "cloneOf" ================
--------------- object -------------------
{ a: 1,
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: 25,
  d: [],
  e: 'text',
  f: [Function: f],
  f1: [Function: f1],
  f2: [Function: f2],
  f3: [Function: f3],
  f4: [Function: f4],
  f5: [Function: f5],
  f6:
   [ [Function],
     [Function],
     [Function],
     [Function],
     [Function],
     [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false }
20
a -> number; isArray = false; isEmpty = false
b -> object; isArray = false; isEmpty = false
c -> number; isArray = false; isEmpty = false
d -> object; isArray = true; isEmpty = false
e -> string; isArray = false; isEmpty = false
f -> function; isArray = false; isEmpty = false
f1 -> function; isArray = false; isEmpty = false
f2 -> function; isArray = false; isEmpty = false
f3 -> function; isArray = false; isEmpty = false
f4 -> function; isArray = false; isEmpty = false
f5 -> function; isArray = false; isEmpty = false
f6 -> object; isArray = true; isEmpty = false
g -> string; isArray = false; isEmpty = true
i -> object; isArray = false; isEmpty = true
j -> undefined; isArray = false; isEmpty = true
p -> boolean; isArray = false; isEmpty = false
n -> boolean; isArray = false; isEmpty = true
--------------- clone -------------------
{ a: 1,
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: 25,
  d: [],
  e: 'text',
  f: [Function: f],
  f1: [Function: f1],
  f2: [Function: f2],
  f3: [Function: f3],
  f4: [Function: f4],
  f5: [Function: f5],
  f6:
   [ [Function],
     [Function],
     [Function],
     [Function],
     [Function],
     [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false }
20
a -> number; isArray = false; isEmpty = false
b -> object; isArray = false; isEmpty = false
c -> number; isArray = false; isEmpty = false
d -> object; isArray = true; isEmpty = false
e -> string; isArray = false; isEmpty = false
f -> function; isArray = false; isEmpty = false
f1 -> function; isArray = false; isEmpty = false
f2 -> function; isArray = false; isEmpty = false
f3 -> function; isArray = false; isEmpty = false
f4 -> function; isArray = false; isEmpty = false
f5 -> function; isArray = false; isEmpty = false
f6 -> object; isArray = true; isEmpty = false
g -> string; isArray = false; isEmpty = true
i -> object; isArray = false; isEmpty = true
j -> undefined; isArray = false; isEmpty = true
p -> boolean; isArray = false; isEmpty = false
n -> boolean; isArray = false; isEmpty = true
=============== Test of "jsonClone" ================
--------------- object -------------------
{ a: 1,
  b:
   { a: 2,
     b:
      [ [Object], [Object], 17, false, null, undefined, [Function] ] },
  c: 25,
  d: [],
  e: 'text',
  f: [Function: f],
  f1: [Function: f1],
  f2: [Function: f2],
  f3: [Function: f3],
  f4: [Function: f4],
  f5: [Function: f5],
  f6:
   [ [Function],
     [Function],
     [Function],
     [Function],
     [Function],
     [Function] ],
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false }
20
a -> number; isArray = false; isEmpty = false
b -> object; isArray = false; isEmpty = false
c -> number; isArray = false; isEmpty = false
d -> object; isArray = true; isEmpty = false
e -> string; isArray = false; isEmpty = false
f -> function; isArray = false; isEmpty = false
f1 -> function; isArray = false; isEmpty = false
f2 -> function; isArray = false; isEmpty = false
f3 -> function; isArray = false; isEmpty = false
f4 -> function; isArray = false; isEmpty = false
f5 -> function; isArray = false; isEmpty = false
f6 -> object; isArray = true; isEmpty = false
g -> string; isArray = false; isEmpty = true
i -> object; isArray = false; isEmpty = true
j -> undefined; isArray = false; isEmpty = true
p -> boolean; isArray = false; isEmpty = false
n -> boolean; isArray = false; isEmpty = true
--------------- clone -------------------
{ a: 1,
  b:
   { a: 2, b: [ [Object], [Object], 17, false, null, null, null ] },
  c: 25,
  d: [],
  e: 'text',
  f6: [ null, null, null, null, null, null ],
  g: '',
  i: null,
  p: true,
  n: false }
Function DIED!
a -> number; isArray = false; isEmpty = false
b -> object; isArray = false; isEmpty = false
c -> number; isArray = false; isEmpty = false
d -> object; isArray = true; isEmpty = false
e -> string; isArray = false; isEmpty = false
f6 -> object; isArray = true; isEmpty = false
g -> string; isArray = false; isEmpty = true
i -> object; isArray = false; isEmpty = true
p -> boolean; isArray = false; isEmpty = false
n -> boolean; isArray = false; isEmpty = true
################### Performance Testing: ######################
1 iterations -> FASTER for 90 cases; AVERAGE - in 1.2095700555523015 times
1 iterations -> SLOWER for 10 cases; AVERAGE - in 1.288752065146532 times
1 iterations -> FASTER_MODULE = 88.16152291073492% -> Absolutely is FASTER on 76.32304582146983%
--------------------------------------------------------------
2 iterations -> FASTER for 83 cases; AVERAGE - in 1.1801258686156813 times
2 iterations -> SLOWER for 17 cases; AVERAGE - in 2.5299225691521414 times
2 iterations -> FASTER_MODULE = 56.091386051736315% -> Absolutely is FASTER on 12.18277210347263%
--------------------------------------------------------------
4 iterations -> FASTER for 98 cases; AVERAGE - in 2.261645821183338 times
4 iterations -> SLOWER for 2 cases; AVERAGE - in 7.315948198926494 times
4 iterations -> FASTER_MODULE = 93.3983887359474% -> Absolutely is FASTER on 86.79677747189481%
--------------------------------------------------------------
8 iterations -> FASTER for 97 cases; AVERAGE - in 2.825721349195555 times
8 iterations -> SLOWER for 3 cases; AVERAGE - in 3.5792033611620764 times
8 iterations -> FASTER_MODULE = 96.08252203631207% -> Absolutely is FASTER on 92.16504407262414%
--------------------------------------------------------------
16 iterations -> FASTER for 99 cases; AVERAGE - in 4.128566106043659 times
16 iterations -> SLOWER for 1 cases; AVERAGE - in 1.3133180049522462 times
16 iterations -> FASTER_MODULE = 99.67868169981725% -> Absolutely is FASTER on 99.3573633996345%
--------------------------------------------------------------
32 iterations -> FASTER for 99 cases; AVERAGE - in 3.9474409234585757 times
32 iterations -> SLOWER for 1 cases; AVERAGE - in 1.1381720336776322 times
32 iterations -> FASTER_MODULE = 99.70875594006884% -> Absolutely is FASTER on 99.41751188013768%
--------------------------------------------------------------
64 iterations -> FASTER for 100 cases; AVERAGE - in 3.6813193463553637 times
64 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
64 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
128 iterations -> FASTER for 100 cases; AVERAGE - in 3.6683704663070995 times
128 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
128 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
256 iterations -> FASTER for 100 cases; AVERAGE - in 3.675545748683341 times
256 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
256 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
512 iterations -> FASTER for 100 cases; AVERAGE - in 3.6434217525898145 times
512 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
512 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
1024 iterations -> FASTER for 100 cases; AVERAGE - in 3.573039125100696 times
1024 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
1024 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
2048 iterations -> FASTER for 100 cases; AVERAGE - in 3.57914214388739 times
2048 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
2048 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
4096 iterations -> FASTER for 100 cases; AVERAGE - in 3.655600194730763 times
4096 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
4096 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
8192 iterations -> FASTER for 100 cases; AVERAGE - in 3.6255463687866634 times
8192 iterations -> SLOWER for 0 cases; AVERAGE - in 0 times
8192 iterations -> FASTER_MODULE = 100% -> Absolutely is FASTER on 100%
--------------------------------------------------------------
[Finished in 17.042s] */
