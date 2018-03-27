let globalEnv = {}

let standardEnv = {
  '+': args => args.reduce((a, b) => a + b),
  '-': args => args.reduce((a, b) => a - b),
  '*': args => args.reduce((a, b) => a * b),
  '/': args => args.reduce((a, b) => a / b)
}

function parseBool (input) {
  let m = input.match(/^(?:#t|#f)/)
  if (m == null) return [null, input]
  return m[0] === '#t' ? [true, input.slice(2)] : [false, input.slice(2)]
}

function parseNull (input) {
  return input.startsWith('null') ? ['null', input.slice(4)] : [null, input]
}
