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
  const start = +new Date();
  if (iterations && typeof iterations === 'number' && iterations > 0) {
    for (var i = 0; i < iterations; i++) funct(param);
  } else funct(param);
  console.log('Performance of "' + fName + '" = ' + (+new Date() - start) + ' ms.');
};

const printTest = (obj, msg) => {
  console.log('--------------- ' + msg + ' -------------------');
  console.log(obj);
  console.log(obj.b.b[1].f ? obj.b.b[1].f(9) : 'Function DIED!');
  Object.keys(obj).forEach(k => console.log(k + ' -> ' + (typeof obj[k]) + '; isArray = ' + (obj[k] instanceof Array) + '; isEmpty = ' + !obj[k]));
  console.log('----------------------------------------------');
};

const testOf = (fName, funct, param) => {
  console.log('=============== Test of "' + fName + '" ================');
  printTest(param, 'object');
  printTest(funct(param), 'clone');
  performanceOf(fName, funct, param, 100000);
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
  g: '',
  i: null,
  j: undefined,
  p: true,
  n: false
};

testOf('cloneOf', cloneOf, testObj);
// For comparison:
testOf('jsonClone', (obj) => JSON.parse(JSON.stringify(obj)), testObj);
