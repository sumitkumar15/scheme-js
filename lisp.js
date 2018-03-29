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
  if (m == null) throw SyntaxError('non terminated string')
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
  return scope['parent'] != null ? parseInScope(input, scope['parent']) : null
}

let specialForms = ['if', 'define', 'lambda', 'let']
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
  if (m == null) throw SyntaxError('Invalid expression at ', input.slice(0, 20))
  else return [m[0], noSpace.slice(m[0].length)]
}

function getAllArgs (input, scope, acc) {
  if (input[0] === ')') return [acc, input.slice(1)]
  else if (input[0] === '') return null
  let [arg, remm] = parseExpr(input, scope)
  return getAllArgs(remm, scope, [...acc, arg])
}

function getExpr (input) {
  const helper = (x, cnt, acc) => {
    if (x[0] === '(') return helper(x.slice(1), cnt + 1, acc + x[0])
    else if (x[0] === ')' && cnt !== 0) return helper(x.slice(1), cnt - 1, acc + x[0])
    else if (x[0] === ')' && cnt === 0) return [acc + x[0], x.slice(1)]
    else if (cnt === 0) return [acc, x]
    else return helper(x.slice(1), cnt, acc + x[0])
  }
  let p = parseSpace(input)
  if (p[0] === '(') return helper(p.slice(1), 1, '(')
  return getNextArg(p)
}

function parseEvalLetForm (input, scope) {
  let noSpace = parseSpace(input)
  let [bindStr, rem] = getExpr(noSpace)
  let [bodyStr, remm] = getExpr(rem)

  const extractBindings = (x, acc) => {
    if (x === '') return acc
    let b = getExpr(x.slice(1))
    let [id, bind] = parseIdentifiers(b[0].slice(1, b[0].length - 1))
    acc[id] = parseExpr(bind, scope)[0]
    return extractBindings(b[1], acc)
  }
  let newScope = extractBindings(bindStr, {})
  newScope['parent'] = scope
  return [parseExpr(bodyStr, newScope), remm]
}

function evalExpr (fn, rstring, scope) {
  if (!isSpecial(fn)) {
    let [args, rem] = getAllArgs(rstring, scope, [])
    return [fn(args), rem]
  } else {
    switch (fn) {
      case 'define' : {
        let [args, rem] = getAllArgs(rstring, scope, [])
        if (args.length !== 2) throw SyntaxError('Invalid Arity for define', rstring.slice(0, 20))
        else { globalEnv[args[0]] = args[1]; return [args[0], rem] }
      }
      case 'if' : {
        let [args, rem] = getAllArgs(rstring, scope, [])
        if (args.length !== 3) throw SyntaxError('Invalid Arity for if', rstring.slice(0, 20))
        return [args[0] ? args[1] : args[2], rem]
      }
      case 'let' : {
        return parseEvalLetForm(rstring, scope)
      }
    }
  }
}

function parseExpr (input, scope = globalEnv) {
  let [v, rem] = parseValue(parseSpace(input), scope)
  if (v === '(') {
    let [fn, remm] = parseValue(parseSpace(rem), scope)
    return evalExpr(fn, remm, scope)
  } else { return [v, rem] }
}

const parse = x => parseExpr(x)[0]

// console.log(parse('12'))
// console.log(parse('(+ (+ 3 3) -4 56 35)'))
// parse('(define a 20)')
// console.log(parse('a'))
// console.log(parse('(+ 30 a)'))
// console.log(parse('(if #t 4 5)'))
// parse('(define Simba 55)')
// console.log(parse('Simba'))
console.log(parse('(let ((x 10) (y 50)) (+ x y))'))
