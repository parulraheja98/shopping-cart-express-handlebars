# z-std-pack [![Build Status](https://secure.travis-ci.org/jakobmattsson/z-std-pack.png)](http://travis-ci.org/jakobmattsson/z-std-pack)

Utility library for JavaScript promises



### Installation

Use npm: `npm install z-std-pack`

Or bower: (not available yet)

Or download it manually from the `dist` folder of this repo.



### Contents

This is a bundle for [z-core](https://github.com/jakobmattsson/z-core), [z-builtins](https://github.com/jakobmattsson/z-builtins) and [z-underscore](https://github.com/jakobmattsson/z-underscore).



### Usage

You can wrap anything (promise or not) and use all methods from the JavaScript standard library and from underscore.

    Z("Hello world!").toLowerCase().first(5).log(); // "hello"

For more details, check out the documentation for each of the bundled repos.
