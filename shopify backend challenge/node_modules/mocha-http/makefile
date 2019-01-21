NODE_TARGET_VERSION = 0.10
MOCHA_PARAMS = --compilers coffee:coffee-script/register

GIT_STATUS = $(shell git status --porcelain)
GIT_BRANCH = $(shell git rev-parse --abbrev-ref HEAD)

SOURCE_FILES=$(shell find src -name *.coffee)
TARGET_FILES=$(SOURCE_FILES:src/%.coffee=lib/%.js)



## Creating files and folders
## ==========================================================================

.cov: $(SOURCE_FILES)
	@jscov --expand --conditionals src .cov

lib/%.js: src/%.coffee
	@coffee -co lib $?



## Internal tasks
## ==========================================================================

test-coverage: $(TARGET_FILES) .cov
	@JSCOV=.cov mocha --reporter mocha-term-cov-reporter $(MOCHA_PARAMS)

test-coveralls: $(TARGET_FILES) .cov
	@JSCOV=.cov mocha --reporter mocha-lcov-reporter $(MOCHA_PARAMS)

test-node: $(TARGET_FILES)
	@mocha --grep "$(TESTS)" $(MOCHA_PARAMS)



## Tasks
## ==========================================================================

clean:
	@rm -rf lib .cov

run-tests:
ifneq ($(CI),true)
	# Not running CI; only testing in node and showing code coverage
	@make test-node
	@make test-coverage
else ifneq ($(TRAVIS_NODE_VERSION),$(NODE_TARGET_VERSION))
	# Running CI in a node version other than the target version; only testing in node
	@make test-node
else
	# Running CI in the target version of node - testing node AND coverage AND browsers!
	@make test-node
	@make test-coveralls
	@make test-browsers
endif

release:
ifneq "$(GIT_STATUS)" ""
	@echo "clean up your changes first"
else ifneq "$(GIT_BRANCH)" "master"
	@echo "You can only release from the master branch"
else
	@npm test
	@json -I -e "version='$(VERSION)'" -f package.json
	@git add package.json
	@git commit -m v$(VERSION)
	@git tag -a v$(VERSION) -m v$(VERSION)
	@git push --follow-tags
endif
