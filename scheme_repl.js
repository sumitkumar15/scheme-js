const repl = require('repl')
const lisp = require('./lisp')
const evalFn = lisp.parse

function myEval (str) {
  if (str === '\n') return undefined
  const nstr = str.slice(0, str.length - 1)
  return console.log(evalFn(nstr))
}

repl.start({ prompt: 'scm> ', eval: myEval })
