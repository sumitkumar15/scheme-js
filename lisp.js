let standardEnv = {
  '+': args => args.reduce((a, b) => a + b),
  '-': args => args.reduce((a, b) => a - b),
  '*': args => args.reduce((a, b) => a * b),
  '/': args => args.reduce((a, b) => a / b)
}

let globalEnv = standardEnv

function parseBool (input) {
  let m = input.match(/^(?:#t|#f)/)
  if (m == null) return null
  return m[0] === '#t' ? [true, input.slice(2)] : [false, input.slice(2)]
}

function parseNull (input) {
  return input.startsWith('null') ? ['null', input.slice(4)] : null
}

function parseNumber (input) {
let m = input.match(/^[+-]?\d*\.?\d+(?:[eE][-+]?\d+)?\s*?/)
  if (m == null) return null
  return [parseFloat(m[0]), input.slice(m[0].length)]
}

function parseString (input) {
  if (input[0] !== '"') return null
  let m = input.match(/(["])(?:(?=(\\?))\2.)*?\1/)
  if (m == null) console.log('non terminated string')
  else return [m[0], input.slice(m[0].length)]
}

function parseSpace (input) {
  let m = input.match(/\s*/)
  if (m == null) return input
  return input.slice(m[0].length)
}

function parseParens (input) {
  if (input[0] === '(') return ['(', input.slice(1)]
  else if (input[0] === ')') return [')', input.slice(1)]
  return null
}

function parseInScope (input, scope) {
  // if (scope['parent'] == null) {

  // }
  let [f, rem] = getNextArg(input)
  if (scope[f] != null) return [scope[f], rem]
}
const parseValue = (x, scope) => parseNumber(x) || parseBool(x) ||
  parseNull(x) || parseString(x) || parseParens(x) || parseInScope(x, scope)

function getNextArg (input) {
  // let m = input.match(/^\w+$/)
  let noSpace = parseSpace(input)
  let m = noSpace.match(/[^\s)]+/)
  console.log('m', m)
  if (m == null) console.log('Invalid expression at ', input.slice(0, 20))
  else return [m[0], noSpace.slice(m[0].length)]
}

function getAllArgs (input, scope, acc) {
  if (input[0] === ')') return [acc, input.slice(1)]
  else if (input[0] === '') return null
  let [arg, remm] = parseExpr(input, scope)
  return getAllArgs(remm, scope, [...acc, arg])
}

function isSpecial (fn) {
  let sp = ['if', 'define', 'lambda']
  return sp.some(x => x === fn)
}

function evalExpr (fn, args, scope) {
  if (!isSpecial(fn)) {
    return fn(args)
  }
}

function parseExpr (input, scope) {
  let [v, rem] = parseValue(parseSpace(input), scope)
  if (v === '(') {
    console.log(rem)
    let [fn, remm] = parseValue(rem, scope)
    let [args, r] = getAllArgs(remm, scope, [])
    return [evalExpr(fn, args), r]
  } else { return [v, rem] }
}

console.log(parseExpr('12', globalEnv))
console.log(parseExpr('(+ (+ 3 3) -4 56 86 35)', globalEnv))
