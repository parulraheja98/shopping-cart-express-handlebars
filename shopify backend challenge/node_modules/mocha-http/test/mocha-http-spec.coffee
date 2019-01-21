Q = require 'q'
index = require '../src/index'

describe 'equals', ->

  it 'finds differences when running deep', ->
    p = Q.fcall -> 45
    assertionResult = p.should.eventually.deep.equal 44
    assertionResult.should.be.rejected

  it 'finds differences when not running deep', ->
    p = Q.fcall -> 45
    assertionResult = p.should.eventually.equal 44
    assertionResult.should.be.rejected

  it 'finds similarities when running deep', ->
    p = Q.fcall -> 42
    assertionResult = p.should.eventually.deep.equal 42
    assertionResult.should.be.fulfilled

  it 'finds similarities when not running deep', ->
    p = Q.fcall -> 42
    assertionResult = p.should.eventually.equal 42
    assertionResult.should.be.fulfilled
