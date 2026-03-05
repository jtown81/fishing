/**
 * TourneyCalc Formula Language - Complete Implementation
 * Lexer, Parser, and Evaluator for safe formula expressions
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Value = number | boolean | string | null

export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  IDENTIFIER = 'IDENTIFIER',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MODULO = 'MODULO',
  POWER = 'POWER',

  // Comparison
  EQ = 'EQ',           // ==
  NEQ = 'NEQ',         // !=
  LT = 'LT',           // <
  GT = 'GT',           // >
  LTE = 'LTE',         // <=
  GTE = 'GTE',         // >=

  // Logical
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',

  // Ternary
  QUESTION = 'QUESTION',
  COLON = 'COLON',

  // Delimiters
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  COMMA = 'COMMA',

  // Special
  EOF = 'EOF',
  INVALID = 'INVALID'
}

export interface Token {
  type: TokenType
  value: any
  position: number
}

export interface ParseError {
  type: 'PARSE_ERROR'
  message: string
  position: number
  context: string
  suggestion?: string
}

export interface EvaluationError extends Error {
  type: 'EVALUATION_ERROR'
  formula: string
  causingValue?: any
}

export interface EvaluationResult {
  value: Value
  error?: EvaluationError
  dependencies: Set<string>
}

// AST Node Types
export interface ASTNode {
  type: string
}

export interface LiteralNode extends ASTNode {
  type: 'LITERAL'
  value: Value
}

export interface IdentifierNode extends ASTNode {
  type: 'IDENTIFIER'
  name: string
}

export interface BinaryOpNode extends ASTNode {
  type: 'BINARY_OP'
  operator: string
  left: ASTNode
  right: ASTNode
}

export interface UnaryOpNode extends ASTNode {
  type: 'UNARY_OP'
  operator: string
  operand: ASTNode
}

export interface FunctionCallNode extends ASTNode {
  type: 'FUNCTION_CALL'
  name: string
  arguments: ASTNode[]
}

export interface TernaryNode extends ASTNode {
  type: 'TERNARY'
  condition: ASTNode
  trueBranch: ASTNode
  falseBranch: ASTNode
}

// ============================================================================
// LEXER
// ============================================================================

export class Lexer {
  private input: string
  private position: number = 0
  private tokens: Token[] = []

  constructor(input: string) {
    this.input = input
  }

  tokenize(): Token[] {
    this.tokens = []
    this.position = 0

    while (this.position < this.input.length) {
      this.skipWhitespace()
      if (this.position >= this.input.length) break

      const token = this.nextToken()
      if (token.type === TokenType.INVALID) {
        throw new Error(`Invalid character at position ${token.position}: '${token.value}'`)
      }
      this.tokens.push(token)
    }

    this.tokens.push({ type: TokenType.EOF, value: null, position: this.position })
    return this.tokens
  }

  private nextToken(): Token {
    const start = this.position
    const char = this.current()

    // Numbers
    if (this.isDigit(char)) {
      return this.readNumber()
    }

    // Strings
    if (char === '"') {
      return this.readString()
    }

    // Identifiers and keywords
    if (this.isIdentifierStart(char)) {
      return this.readIdentifierOrKeyword()
    }

    // Two-character operators
    const twoChar = char + this.peek()
    const twoCharToken = this.getTwoCharOperator(twoChar)
    if (twoCharToken) {
      this.position += 2
      return { type: twoCharToken, value: twoChar, position: start }
    }

    // Single-character operators
    const singleCharToken = this.getSingleCharOperator(char)
    if (singleCharToken) {
      this.position++
      return { type: singleCharToken, value: char, position: start }
    }

    // Invalid character
    this.position++
    return { type: TokenType.INVALID, value: char, position: start }
  }

  private readNumber(): Token {
    const start = this.position
    let value = ''

    while (this.position < this.input.length && this.isDigit(this.current())) {
      value += this.current()
      this.position++
    }

    if (this.current() === '.' && this.isDigit(this.peek())) {
      value += '.'
      this.position++
      while (this.position < this.input.length && this.isDigit(this.current())) {
        value += this.current()
        this.position++
      }
    }

    return { type: TokenType.NUMBER, value: parseFloat(value), position: start }
  }

  private readString(): Token {
    const start = this.position
    let value = ''
    this.position++ // Skip opening quote

    while (this.position < this.input.length && this.current() !== '"') {
      if (this.current() === '\\') {
        this.position++
        if (this.position < this.input.length) {
          const escaped = this.current()
          value += escaped === 'n' ? '\n' : escaped === 't' ? '\t' : escaped
          this.position++
        }
      } else {
        value += this.current()
        this.position++
      }
    }

    if (this.position < this.input.length) {
      this.position++ // Skip closing quote
    }

    return { type: TokenType.STRING, value, position: start }
  }

  private readIdentifierOrKeyword(): Token {
    const start = this.position
    let value = ''

    while (
      this.position < this.input.length &&
      (this.isIdentifierChar(this.current()))
    ) {
      value += this.current()
      this.position++
    }

    const keyword = this.getKeywordToken(value)
    if (keyword) {
      return { type: keyword, value, position: start }
    }

    return { type: TokenType.IDENTIFIER, value, position: start }
  }

  private getTwoCharOperator(twoChar: string): TokenType | null {
    const map: Record<string, TokenType> = {
      '==': TokenType.EQ,
      '!=': TokenType.NEQ,
      '<=': TokenType.LTE,
      '>=': TokenType.GTE
    }
    return map[twoChar] || null
  }

  private getSingleCharOperator(char: string): TokenType | null {
    const map: Record<string, TokenType> = {
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '%': TokenType.MODULO,
      '^': TokenType.POWER,
      '<': TokenType.LT,
      '>': TokenType.GT,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      ',': TokenType.COMMA,
      '?': TokenType.QUESTION,
      ':': TokenType.COLON
    }
    return map[char] || null
  }

  private getKeywordToken(word: string): TokenType | null {
    const upper = word.toUpperCase()
    const map: Record<string, TokenType> = {
      'AND': TokenType.AND,
      'OR': TokenType.OR,
      'NOT': TokenType.NOT,
      'TRUE': TokenType.IDENTIFIER,   // Handle as identifier, convert in parser
      'FALSE': TokenType.IDENTIFIER,  // Handle as identifier, convert in parser
      'NULL': TokenType.IDENTIFIER    // Handle as identifier, convert in parser
    }
    return map[upper] || null
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char)
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char)
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char)
  }

  private current(): string {
    return this.input[this.position] || ''
  }

  private peek(): string {
    return this.input[this.position + 1] || ''
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.current())) {
      this.position++
    }
  }
}

// ============================================================================
// PARSER
// ============================================================================

export class Parser {
  private tokens: Token[] = []
  private position: number = 0

  parse(input: string): ASTNode {
    const lexer = new Lexer(input)
    this.tokens = lexer.tokenize()
    this.position = 0

    const ast = this.parseExpression()

    if (this.current().type !== TokenType.EOF) {
      throw new ParseError(
        `Unexpected token: ${this.current().value}`,
        this.current().position,
        input,
        'Check for incomplete or extra tokens'
      )
    }

    return ast
  }

  private parseExpression(): ASTNode {
    return this.parseTernary()
  }

  private parseTernary(): ASTNode {
    let expr = this.parseLogicalOr()

    if (this.match(TokenType.QUESTION)) {
      const trueBranch = this.parseExpression()
      this.expect(TokenType.COLON, 'Expected ":" in ternary expression')
      const falseBranch = this.parseExpression()

      expr = {
        type: 'TERNARY',
        condition: expr,
        trueBranch,
        falseBranch
      } as TernaryNode
    }

    return expr
  }

  private parseLogicalOr(): ASTNode {
    let expr = this.parseLogicalAnd()

    while (this.match(TokenType.OR)) {
      const operator = this.previous().value
      const right = this.parseLogicalAnd()
      expr = {
        type: 'BINARY_OP',
        operator,
        left: expr,
        right
      } as BinaryOpNode
    }

    return expr
  }

  private parseLogicalAnd(): ASTNode {
    let expr = this.parseComparison()

    while (this.match(TokenType.AND)) {
      const operator = this.previous().value
      const right = this.parseComparison()
      expr = {
        type: 'BINARY_OP',
        operator,
        left: expr,
        right
      } as BinaryOpNode
    }

    return expr
  }

  private parseComparison(): ASTNode {
    let expr = this.parseAdditive()

    while (this.isComparison(this.current())) {
      const operator = this.advance().value
      const right = this.parseAdditive()
      expr = {
        type: 'BINARY_OP',
        operator,
        left: expr,
        right
      } as BinaryOpNode
    }

    return expr
  }

  private parseAdditive(): ASTNode {
    let expr = this.parseMultiplicative()

    while (this.current().type === TokenType.PLUS || this.current().type === TokenType.MINUS) {
      const operator = this.advance().value
      const right = this.parseMultiplicative()
      expr = {
        type: 'BINARY_OP',
        operator,
        left: expr,
        right
      } as BinaryOpNode
    }

    return expr
  }

  private parseMultiplicative(): ASTNode {
    let expr = this.parseExponent()

    while (
      this.current().type === TokenType.MULTIPLY ||
      this.current().type === TokenType.DIVIDE ||
      this.current().type === TokenType.MODULO
    ) {
      const operator = this.advance().value
      const right = this.parseExponent()
      expr = {
        type: 'BINARY_OP',
        operator,
        left: expr,
        right
      } as BinaryOpNode
    }

    return expr
  }

  private parseExponent(): ASTNode {
    let expr = this.parseUnary()

    if (this.match(TokenType.POWER)) {
      const right = this.parseExponent() // Right associative
      expr = {
        type: 'BINARY_OP',
        operator: '^',
        left: expr,
        right
      } as BinaryOpNode
    }

    return expr
  }

  private parseUnary(): ASTNode {
    if (this.match(TokenType.NOT)) {
      const operand = this.parseUnary()
      return {
        type: 'UNARY_OP',
        operator: 'NOT',
        operand
      } as UnaryOpNode
    }

    if (this.match(TokenType.MINUS)) {
      const operand = this.parseUnary()
      return {
        type: 'UNARY_OP',
        operator: '-',
        operand
      } as UnaryOpNode
    }

    if (this.match(TokenType.PLUS)) {
      const operand = this.parseUnary()
      return {
        type: 'UNARY_OP',
        operator: '+',
        operand
      } as UnaryOpNode
    }

    return this.parsePostfix()
  }

  private parsePostfix(): ASTNode {
    let expr = this.parsePrimary()

    if (this.current().type === TokenType.LPAREN && expr.type === 'IDENTIFIER') {
      const name = (expr as IdentifierNode).name
      const args = this.parseFunctionArguments()
      expr = {
        type: 'FUNCTION_CALL',
        name,
        arguments: args
      } as FunctionCallNode
    }

    return expr
  }

  private parsePrimary(): ASTNode {
    if (this.match(TokenType.NUMBER)) {
      return {
        type: 'LITERAL',
        value: this.previous().value
      } as LiteralNode
    }

    if (this.match(TokenType.STRING)) {
      return {
        type: 'LITERAL',
        value: this.previous().value
      } as LiteralNode
    }

    if (this.match(TokenType.IDENTIFIER)) {
      const name = this.previous().value
      const upper = name.toUpperCase()
      // Handle true/false/null literals
      if (upper === 'TRUE') {
        return {
          type: 'LITERAL',
          value: true
        } as LiteralNode
      }
      if (upper === 'FALSE') {
        return {
          type: 'LITERAL',
          value: false
        } as LiteralNode
      }
      if (upper === 'NULL') {
        return {
          type: 'LITERAL',
          value: null
        } as LiteralNode
      }
      return {
        type: 'IDENTIFIER',
        name
      } as IdentifierNode
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression()
      this.expect(TokenType.RPAREN, 'Expected ")" after expression')
      return expr
    }

    throw new ParseError(
      `Unexpected token: ${this.current().value}`,
      this.current().position,
      '',
      'Expected number, string, identifier, or "("'
    )
  }

  private parseFunctionArguments(): ASTNode[] {
    const args: ASTNode[] = []

    this.expect(TokenType.LPAREN, 'Expected "("')

    if (this.current().type !== TokenType.RPAREN) {
      do {
        args.push(this.parseExpression())
      } while (this.match(TokenType.COMMA))
    }

    this.expect(TokenType.RPAREN, 'Expected ")" after function arguments')

    return args
  }

  private isComparison(token: Token): boolean {
    return [
      TokenType.EQ,
      TokenType.NEQ,
      TokenType.LT,
      TokenType.GT,
      TokenType.LTE,
      TokenType.GTE
    ].includes(token.type)
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private check(type: TokenType): boolean {
    return this.current().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.position++
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF
  }

  private current(): Token {
    return this.tokens[this.position]
  }

  private previous(): Token {
    return this.tokens[this.position - 1]
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    throw new ParseError(message, this.current().position, '', undefined)
  }
}

// ============================================================================
// EVALUATOR
// ============================================================================

export class Evaluator {
  private context: Record<string, Value> = {}
  private dependencies: Set<string> = new Set()

  evaluate(ast: ASTNode, context: Record<string, Value>): EvaluationResult {
    this.context = context
    this.dependencies = new Set()

    try {
      const value = this.evalNode(ast)
      return { value, dependencies: this.dependencies }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown evaluation error'
      return {
        value: null,
        error: {
          type: 'EVALUATION_ERROR' as const,
          name: 'EvaluationError',
          message: errorMsg,
          formula: ''
        },
        dependencies: this.dependencies
      }
    }
  }

  private evalNode(node: ASTNode): Value {
    switch (node.type) {
      case 'LITERAL':
        return (node as LiteralNode).value

      case 'IDENTIFIER': {
        const name = (node as IdentifierNode).name
        this.dependencies.add(name)
        const value = this.context[name]
        if (value === undefined) {
          throw new Error(`Unknown field: ${name}`)
        }
        return value
      }

      case 'BINARY_OP':
        return this.evalBinaryOp(node as BinaryOpNode)

      case 'UNARY_OP':
        return this.evalUnaryOp(node as UnaryOpNode)

      case 'TERNARY':
        return this.evalTernary(node as TernaryNode)

      case 'FUNCTION_CALL':
        return this.evalFunctionCall(node as FunctionCallNode)

      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }
  }

  private evalBinaryOp(node: BinaryOpNode): Value {
    // Handle short-circuit evaluation for AND and OR
    if (node.operator === 'AND') {
      const left = this.evalNode(node.left)
      if (!this.toBoolean(left)) {
        return false
      }
      const right = this.evalNode(node.right)
      return this.toBoolean(right)
    }

    if (node.operator === 'OR') {
      const left = this.evalNode(node.left)
      if (this.toBoolean(left)) {
        return true
      }
      const right = this.evalNode(node.right)
      return this.toBoolean(right)
    }

    // For all other operators, evaluate both sides
    const left = this.evalNode(node.left)
    const right = this.evalNode(node.right)

    switch (node.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right)
        }
        return this.toNumber(left) + this.toNumber(right)

      case '-':
        return this.toNumber(left) - this.toNumber(right)

      case '*':
        return this.toNumber(left) * this.toNumber(right)

      case '/':
        const divisor = this.toNumber(right)
        if (divisor === 0) throw new Error('Division by zero')
        return this.toNumber(left) / divisor

      case '%':
        return this.toNumber(left) % this.toNumber(right)

      case '^':
        return Math.pow(this.toNumber(left), this.toNumber(right))

      case '==':
        return this.equals(left, right)

      case '!=':
        return !this.equals(left, right)

      case '<':
        return this.toNumber(left) < this.toNumber(right)

      case '>':
        return this.toNumber(left) > this.toNumber(right)

      case '<=':
        return this.toNumber(left) <= this.toNumber(right)

      case '>=':
        return this.toNumber(left) >= this.toNumber(right)

      default:
        throw new Error(`Unknown operator: ${node.operator}`)
    }
  }

  private evalUnaryOp(node: UnaryOpNode): Value {
    const operand = this.evalNode(node.operand)

    switch (node.operator) {
      case 'NOT':
        return !this.toBoolean(operand)
      case '-':
        return -this.toNumber(operand)
      case '+':
        return this.toNumber(operand)
      default:
        throw new Error(`Unknown unary operator: ${node.operator}`)
    }
  }

  private evalTernary(node: TernaryNode): Value {
    const condition = this.evalNode(node.condition)
    if (this.toBoolean(condition)) {
      return this.evalNode(node.trueBranch)
    } else {
      return this.evalNode(node.falseBranch)
    }
  }

  private evalFunctionCall(node: FunctionCallNode): Value {
    const args = node.arguments.map((arg) => this.evalNode(arg))

    switch (node.name.toUpperCase()) {
      case 'IF':
        return this.funcIf(args)
      case 'SUM':
        return this.funcSum(args)
      case 'AVG':
        return this.funcAvg(args)
      case 'MAX':
        return this.funcMax(args)
      case 'MIN':
        return this.funcMin(args)
      case 'COUNT':
        return this.funcCount(args)
      case 'ROUND':
        return this.funcRound(args)
      case 'FLOOR':
        return this.funcFloor(args)
      case 'CEIL':
        return this.funcCeil(args)
      case 'ABS':
        return this.funcAbs(args)
      case 'STR':
        return this.funcStr(args)
      case 'NUM':
        return this.funcNum(args)
      default:
        throw new Error(`Unknown function: ${node.name}`)
    }
  }

  // Built-in Functions
  private funcIf(args: Value[]): Value {
    if (args.length !== 3) throw new Error(`IF requires 3 arguments, got ${args.length}`)
    const condition = this.toBoolean(args[0])
    return condition ? args[1] : args[2]
  }

  private funcSum(args: Value[]): Value {
    if (args.length === 0) throw new Error('SUM requires at least 1 argument')
    let sum = 0
    for (const arg of args) {
      if (arg !== null) sum += this.toNumber(arg)
    }
    return sum
  }

  private funcAvg(args: Value[]): Value {
    if (args.length === 0) throw new Error('AVG requires at least 1 argument')
    const nonNull = args.filter((a): a is Exclude<Value, null> => a !== null)
    if (nonNull.length === 0) return null
    const sum = nonNull.reduce((s: number, a) => s + this.toNumber(a), 0)
    return sum / nonNull.length
  }

  private funcMax(args: Value[]): Value {
    if (args.length === 0) throw new Error('MAX requires at least 1 argument')
    const nonNull = args.filter(a => a !== null)
    if (nonNull.length === 0) return null
    return Math.max(...nonNull.map(a => this.toNumber(a)))
  }

  private funcMin(args: Value[]): Value {
    if (args.length === 0) throw new Error('MIN requires at least 1 argument')
    const nonNull = args.filter(a => a !== null)
    if (nonNull.length === 0) return null
    return Math.min(...nonNull.map(a => this.toNumber(a)))
  }

  private funcCount(args: Value[]): Value {
    return args.filter(a => a !== null).length
  }

  private funcRound(args: Value[]): Value {
    if (args.length === 0 || args.length > 2) {
      throw new Error(`ROUND requires 1 or 2 arguments, got ${args.length}`)
    }
    const num = this.toNumber(args[0])
    const decimals = args.length === 2 ? this.toNumber(args[1]) : 0
    const factor = Math.pow(10, decimals)
    return Math.round(num * factor) / factor
  }

  private funcFloor(args: Value[]): Value {
    if (args.length !== 1) throw new Error(`FLOOR requires 1 argument, got ${args.length}`)
    return Math.floor(this.toNumber(args[0]))
  }

  private funcCeil(args: Value[]): Value {
    if (args.length !== 1) throw new Error(`CEIL requires 1 argument, got ${args.length}`)
    return Math.ceil(this.toNumber(args[0]))
  }

  private funcAbs(args: Value[]): Value {
    if (args.length !== 1) throw new Error(`ABS requires 1 argument, got ${args.length}`)
    return Math.abs(this.toNumber(args[0]))
  }

  private funcStr(args: Value[]): Value {
    if (args.length !== 1) throw new Error(`STR requires 1 argument, got ${args.length}`)
    if (args[0] === null) return 'null'
    return String(args[0])
  }

  private funcNum(args: Value[]): Value {
    if (args.length !== 1) throw new Error(`NUM requires 1 argument, got ${args.length}`)
    if (args[0] === null) return null
    const num = Number(args[0])
    if (isNaN(num)) throw new Error(`Cannot convert '${args[0]}' to number`)
    return num
  }

  // Type Conversion Helpers
  private toNumber(value: Value): number {
    if (value === null) return 0
    if (typeof value === 'number') return value
    if (typeof value === 'boolean') return value ? 1 : 0
    if (typeof value === 'string') {
      const num = Number(value)
      if (isNaN(num)) throw new Error(`Cannot convert '${value}' to number`)
      return num
    }
    throw new Error(`Cannot convert ${typeof value} to number`)
  }

  private toBoolean(value: Value): boolean {
    if (value === null || value === false) return false
    if (value === 0 || value === '') return false
    return true
  }

  private equals(a: Value, b: Value): boolean {
    if (a === null && b === null) return true
    if (a === null || b === null) return false
    if (typeof a === typeof b) return a === b
    // Try numeric comparison
    try {
      return this.toNumber(a) === this.toNumber(b)
    } catch {
      return false
    }
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function parseFormula(formula: string): ASTNode {
  const parser = new Parser()
  return parser.parse(formula)
}

export function evaluateFormula(
  formula: string,
  context: Record<string, Value>
): EvaluationResult {
  try {
    const ast = parseFormula(formula)
    const evaluator = new Evaluator()
    return evaluator.evaluate(ast, context)
  } catch (err) {
    if (err instanceof ParseError) {
      throw err
    }
    throw new EvaluationError(
      (err as Error).message,
      formula,
      undefined
    )
  }
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ParseError extends Error implements ParseError {
  constructor(
    public message: string,
    public position: number,
    public context: string,
    public suggestion?: string
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

export class EvaluationError extends Error implements EvaluationError {
  constructor(
    public message: string,
    public formula: string,
    public causingValue?: any
  ) {
    super(message)
    this.name = 'EvaluationError'
  }
}
