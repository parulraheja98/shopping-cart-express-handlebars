# z-builtins [![Build Status](https://secure.travis-ci.org/jakobmattsson/z-builtins.png)](http://travis-ci.org/jakobmattsson/z-builtins)

A plugin for [Z](https://github.com/jakobmattsson/z-core), the utility library for JavaScript promises.

The z-builtins plugin exposes all native JavaScript methods directly on Z promises.



## Installation

The easiest way to get started is to use a ready-made package of Z, like [z-std-pack](https://github.com/jakobmattsson/z-core). It includes this plugin.

---

If you want to set it up yourself, you have a number of options:

* `npm install z-builtins` and then `var zBuiltins = require('z-builtins');`

* `bower install z-builtins`

* Download it manually from the dist folder of this repo.

When installed, you apply the plugin by calling `Z.mixin(zBuiltins)`. Note that you have to install [Z](https://github.com/jakobmattsson/z-core) first, if you're not using a ready-made package.



## Crash course

Go to the [Z main page](https://github.com/jakobmattsson/z-core) to learn what Z does.

The idea behind this particular plugin, **z-builtins**, is to expose all the standard JavaScript methods available on strings, arrays and other types of objects directly on promises wrapping them. It allows you to do things like:

```js
// Let's assume this returns a Z-promise.
// If it expects a callback then we can convert it using Z beforehand.
var people = getJSON('/people');

// Even though "people" is a promise, and not an array,
// we can now use all the regular methods as if it was an array.
// No need to sprinke our code with ".then".
var listOfToddlers = people.filter(function(person) {
  return person.age <= 3;
}).map(function(person) {
  return person.name;
}).join('\n');

// Even global methods like "console.log" are
// available directly on our objects now.
listOfToddlers.log();
```

All the usual methods are available directly on promises. Instead of returning their results directly (which would be impossible, since the promise might not have resolved) they in turn return new promises. Those new promises also have all the expected methods. And so on. Down to turtles.

The only time you have to treat these objects diferently then you have treated regular objects is when you call global functions like `console.log`. If the list of toddlers from above was used like this, then `console.log(listOfToddlers)` would just print `"[object Object]"` since  `listOfToddlers` is not actually as string; it's a promise. Instead, either do `listOfToddlers.then(function(list) { console.log(list)); };` or simply `listOfToddlers.log()`.


## Methods included in this plugin

Except then explicitly noted, all methods below will invoke their [native counterparts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) directly. All quirks and bugs will still get to you. As will all fixes and performance improvements in the future.



### String methods

```js
charAt
charCodeAt
concat
indexOf
lastIndexOf
localeCompare
replace
search
slice
split
substr
substring
toLocaleLowerCase
toLocaleUpperCase
toLowerCase
toString *AND* toStr
toUpperCase
trim
```

Note that `toString` has not been overridden to return a promise. It will return a string as always. That is to follow the principle of least surprise. If you want to call `toString` on the value that the promise resolves to, then you can use `toStr`.

##### Example:

```js
var html = getHTML('http://www.google.com');

var str1 = html.toString(); // An actual string, containing "[object Object]"

var str2 = html.toStr();    // A promise, containing the html-string

console.log(str1);          // The actual string can be used in all the ways strings can

str2.then(function(s) {     // The promised string has to be resolved
  console.log(s);           // "<html><head>......"
});

str2.slice(0, 5).log();     // Or better, used with methods from this plugin.
                            // Prints "<html"

```


### Array methods


```js
pop *
push *
reverse *
shift *
sort *
splice *
unshift *
concat
join
slice
toString *AND* toStr // same as String.toString, earlier in the docs
toLocaleString
indexOf
lastIndexOf
forEach
every
some
filter
map
reduce
reduceRight
```

The methods followed by a star are mutator methods in the JavaScript standard library. They change the object they act upon and return something else.

Mutating behaviour doesn't work well with promises. Therefore, these methods do **not** mutate when used in Z. Their usual return values are ignored and instead they return the new array produced.

##### Example:

```js
var numbers = getJSON('/primeNumbers?n=5');

numbers.log(); // 2, 3, 5, 7, 11

var newNumbers = numbers.push(9000);

numbers.log(); // still 2, 3, 5, 7, 11
newNumbers.log(); // 2, 3, 5, 7, 11, 9000
```


### JSON methods

```
parseJSON (alias for JSON.parse, since parse is ambiguous)
stringify
```



### Math methods

```
abs
acos
asin
atan
atan2
ceil
cos
exp
floor
logarithm (alias for log, since log is for console.log)
max
min
pow
round
sin
sqrt
tan
```



### Number methods

```
toExponential
toFixed
toLocaleString
toPrecision
```



### Regexp methods

```
exec
test
```



### Function methods

```
apply
bind
call
```



### Operators

```
get - the dot and indexing operators (. and [])
inc - increment (++)
dec - decrement (--)
neg - negate (-)
typeof
del - delete
in
instanceof
mult - multiplication (*)
div - division (/)
mod - modulo (%)
add - addition (+)
sub - subtraction (-)
bitNot - bitwise not (~)
bitAnd - bitwise and (&)
bitOr - bitwise or (|)
bitLeft - bitwise left shift (<<)
bitRight - bitwise right shift (>>)
bitRightFill - bitwise right shift zero fill (>>>)
gt - greater than (>)
gte - greather than or equal to (>=)
lt - less than (<)
lte - less than or equal to (<=)
and - logical and (&&)
or - logical or (||)
not - logical not (!)
if - the conditional operator (:?)
```

Note: The operators `yield`, `void`, `new`, `,` and the assignment operators are not available.



### Global functions

```
eval
isFinite
isNaN
parseFloat
parseInt
decodeURI
decodeURIComponent
encodeURI
encodeURIComponent
escape
unescape
```

These functions use the promised value as their first argument. Remaining arguments can be given as usual.

##### Example

```js
Z("1+5").eval().log(); // 6
Z("1111").parseInt(2); // 15
```



### Other methods

```js
length
isArray
log
print
```

The `length` method returns the value of the length property.

The `isArray` method invokes `Array.iArray`.

The `log` method invoked `console.log`.

The `print` method invokes `JSON.stringify` followed by `console.log`.



##### Example:

```js
var people = getJSON('/people');

people.isArray().log(); // true

people.length().log(); // 6000000000
```
