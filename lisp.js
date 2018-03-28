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
  let [f, rem] = getNextArg(input)
  if (scope[f] != null) return [scope[f], rem]
  return scope['parent'] !== null ? parseInScope(input, scope['parent']) : null
}

let specialForms = ['if', 'define', 'lambda']
function isSpecial (fn) {
  return specialForms.some(x => x === fn)
}

function parseSpecial (input) {
  let [f, rem] = getNextArg(input)
  if (isSpecial(f)) return [f, rem]
  return null
}

function parseIdentifiers (input) {
  let [f, rem] = getNextArg(input)
  return f === null ? null : [f, rem]
}

const parseValue = (x, scope) => parseSpecial(x) || parseNumber(x) || 
  parseBool(x) || parseNull(x) || parseString(x) || parseParens(x) || 
  parseInScope(x, scope) || parseIdentifiers(x)

function getNextArg (input) {
  let noSpace = parseSpace(input)
  let m = noSpace.match(/[^\s)]+/)
  if (m == null) console.log('Invalid expression at ', input.slice(0, 20))
  else return [m[0], noSpace.slice(m[0].length)]
}

function getAllArgs (input, scope, acc) {
  if (input[0] === ')') return [acc, input.slice(1)]
  else if (input[0] === '') return null
  let [arg, remm] = parseExpr(input, scope)
  return getAllArgs(remm, scope, [...acc, arg])
}

function evalExpr (fn, args, scope) {
  if (!isSpecial(fn)) {
    return fn(args)
  } else {
    switch (fn) {
      case 'define' : 
    }
  }
}

function parseExpr (input, scope) {
  let [v, rem] = parseValue(parseSpace(input), scope)
  if (v === '(') {
    let [fn, remm] = parseValue(parseSpace(rem), scope)
    let [args, r] = getAllArgs(remm, scope, [])
    return [evalExpr(fn, args), r]
  } else { return [v, rem] }
}

console.log(parseExpr('12', globalEnv))
console.log(parseExpr('(+ (+ 3 3) -4 56 35)', globalEnv))
