/**
 * @enum number
 */
const State = {
  TopLevelContent: 1,
  AfterOpeningAngleBracket: 2,
  InsideOpeningTag: 3,
  InsideOpeningTagAndHasSeenWhitespace: 4,
  AfterClosingTagAngleBrackets: 5,
  AfterClosingTagName: 6,
  AfterAttributeName: 7,
  AfterAttributeEqualSign: 8,
  InsideAttributeDoubleQuote: 9,
  InsideBlockComment: 10,
  None: 11,
  InsideDoubleQuoteString: 12,
  InsideSingleQuoteString: 13,
  AfterTripleBackTick: 14,
  AfterTripleBackTickAfterLanguageId: 15,
  InsideBackTickString: 16,
}

export const StateMap = {}

/**
 * @enum number
 */
export const TokenType = {
  None: 99999999,
  Numeric: 30,
  String: 50,
  Whitespace: 0,
  Comment: 60,
  Text: 117,
  PunctuationTag: 228,
  TagName: 118,
  AttributeName: 119,
  Punctuation: 10,
  Error: 141,
  PunctuationString: 11,
  NewLine: 891,
  Heading: 13,
  MarkdownString: 18,
  MarkdownLinkName: 19,
  MarkdownLinkUrl: 20,
}

export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.String]: 'String',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Comment]: 'Comment',
  [TokenType.Text]: 'Text',
  [TokenType.PunctuationTag]: 'PunctuationTag',
  [TokenType.TagName]: 'TagName',
  [TokenType.AttributeName]: 'AttributeName',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.Error]: 'Error',
  [TokenType.PunctuationString]: 'PunctuationString',
  [TokenType.Heading]: 'Heading',
  [TokenType.MarkdownString]: 'MarkdownString',
  [TokenType.MarkdownLinkName]: 'MarkdownLinkName',
  [TokenType.MarkdownLinkUrl]: 'MarkdownLinkUrl',
}

const RE_ANGLE_BRACKET_CLOSE = /^>/
const RE_ANGLE_BRACKET_ONLY = /^</
const RE_ANGLE_BRACKET_OPEN = /^</
const RE_ANGLE_BRACKET_OPEN_TAG = /^<(?!\s)/
const RE_ANY_TEXT = /^[^\n]+/
const RE_ATTRIBUTE_NAME = /^[a-zA-Z\d\-]+/
const RE_BLOCK_COMMENT_CONTENT = /^.(?:.*?)(?=-->|$)/s
const RE_BLOCK_COMMENT_END = /^-->/
const RE_BLOCK_COMMENT_START = /^<!--/
const RE_DASH_DASH = /^\-\-/
const RE_DOUBLE_QUOTE = /^"/
const RE_EQUAL_SIGN = /^=/
const RE_EXCLAMATION_MARK = /^!/
const RE_INVALID_INSIDE_ClOSING_TAG = /^[^a-zA-Z>]/
const RE_INVALID_INSIDE_OPENING_TAG = /^[^a-zA-Z>]/
const RE_NEWLINE = /^\n/
const RE_NEWLINE_WHITESPACE = /^\n\s*/
const RE_NOT_TAGNAME = /^[^a-zA-Z\d]+/
const RE_PUNCTUATION = /^[<;'".,]/
const RE_PUNCTUATION_SELF_CLOSING = /^\/>/
const RE_SELF_CLOSING = /^\/>/
const RE_SINGLE_QUOTE = /^'/
const RE_QUOTE_BACKTICK = /^`/
const RE_SLASH = /^\//
const RE_STRING_BACKTICK_QUOTE_CONTENT = /^[^`]+/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^']+/
const RE_TAG_TEXT = /^[^\s>]+/
const RE_TAGNAME = /^[!\w]+/
const RE_TEXT = /^[^<>\n\`\[\]]+/
const RE_WHITESPACE = /^\s+/
const RE_WORD = /^[^\s]+/
const RE_HEADING = /^\#.*/s
const RE_TRIPLE_BACKTICK = /^`{3,}/
const RE_TRIPLE_QUOTED_STRING_CONTENT = /[^`]/s
const RE_STRING_ESCAPE = /^\\./
const RE_LINK = /^\[([^\[\]\\]+?)\]\((.*)\)/
const RE_ANYTHING_UNTIL_END = /^.+/s

export const initialLineState = {
  state: State.TopLevelContent,
}

/**
 *
 * @param {any} lineStateA
 * @param {any} lineStateB
 * @returns
 */
export const isLineStateEqual = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

export const hasArrayReturn = true

/**
 *
 * @param {string} line
 * @param {any} lineState
 * @returns
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_BLOCK_COMMENT_START))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else if ((next = part.match(RE_ANGLE_BRACKET_OPEN_TAG))) {
          token = TokenType.PunctuationTag
          state = State.AfterOpeningAngleBracket
        } else if ((next = part.match(RE_HEADING))) {
          token = TokenType.Heading
        } else if ((next = part.match(RE_TRIPLE_BACKTICK))) {
          token = TokenType.PunctuationString
          state = State.AfterTripleBackTick
        } else if ((next = part.match(RE_TEXT))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else if ((next = part.match(RE_QUOTE_BACKTICK))) {
          token = TokenType.Punctuation
          state = State.InsideBackTickString
        } else if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANGLE_BRACKET_OPEN))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else if ((next = part.match(RE_LINK))) {
          const tokenLength = next[0].length
          index += tokenLength
          const linkName = next[1]
          const linkUrl = next[2]
          tokens.push(
            TokenType.Punctuation,
            1,
            TokenType.MarkdownLinkName,
            linkName.length,
            TokenType.Punctuation,
            1,
            TokenType.Punctuation,
            1,
            TokenType.MarkdownLinkUrl,
            linkUrl.length,
            TokenType.Punctuation,
            1
          )
          tokens.push(token, tokenLength)
          continue
        } else if ((next = part.match(RE_ANYTHING_UNTIL_END))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          console.log({ part })
          throw new Error('no')
        }
        break
      case State.AfterOpeningAngleBracket:
        if ((next = part.match(RE_TAGNAME))) {
          token = TokenType.TagName
          state = State.InsideOpeningTag
        } else if ((next = part.match(RE_SLASH))) {
          token = TokenType.PunctuationTag
          state = State.AfterClosingTagAngleBrackets
        } else if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANY_TEXT))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.InsideOpeningTag:
        if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else if ((next = part.match(RE_EXCLAMATION_MARK))) {
          token = TokenType.PunctuationTag
          state = State.InsideOpeningTag
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.InsideOpeningTagAndHasSeenWhitespace
        } else if ((next = part.match(RE_DASH_DASH))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else if ((next = part.match(RE_TAG_TEXT))) {
          token = TokenType.Text
          state = State.InsideOpeningTag
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.AfterClosingTagAngleBrackets:
        if ((next = part.match(RE_TAGNAME))) {
          token = TokenType.TagName
          state = State.AfterClosingTagName
        } else if ((next = part.match(RE_ANY_TEXT))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.AfterClosingTagName:
        if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TEXT))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideOpeningTagAndHasSeenWhitespace:
        if ((next = part.match(RE_ATTRIBUTE_NAME))) {
          token = TokenType.AttributeName
          state = State.AfterAttributeName
        } else if ((next = part.match(RE_SELF_CLOSING))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TAG_TEXT))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.AfterAttributeName:
        if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else if ((next = part.match(RE_EQUAL_SIGN))) {
          token = TokenType.Punctuation
          state = State.AfterAttributeEqualSign
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_TAG_TEXT))) {
          token = TokenType.Text
          state = State.InsideOpeningTag
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.InsideOpeningTagAndHasSeenWhitespace
        } else {
          // TODO check quotation mark
          part //?
          throw new Error('no')
        }
        break
      case State.AfterAttributeEqualSign:
        if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_ANGLE_BRACKET_CLOSE))) {
          token = TokenType.PunctuationTag
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideOpeningTag
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideSingleQuoteString:
        if ((next = part.match(RE_SINGLE_QUOTE))) {
          token = TokenType.PunctuationString
          state = State.InsideOpeningTag
        } else if ((next = part.match(RE_STRING_SINGLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideBlockComment:
        if ((next = part.match(RE_BLOCK_COMMENT_END))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_BLOCK_COMMENT_CONTENT))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else {
          throw new Error('no')
        }
        break
      case State.AfterTripleBackTick:
        if ((next = part.match(RE_WORD))) {
          token = TokenType.String
          state = State.AfterTripleBackTickAfterLanguageId
        } else if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterTripleBackTick
        } else {
          throw new Error('no')
        }
        break
      case State.AfterTripleBackTickAfterLanguageId:
        if ((next = part.match(RE_TRIPLE_BACKTICK))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TRIPLE_QUOTED_STRING_CONTENT))) {
          token = TokenType.String
          state = State.AfterTripleBackTickAfterLanguageId
        } else if ((next = part.match(RE_QUOTE_BACKTICK))) {
          token = TokenType.Text
          state = State.AfterTripleBackTickAfterLanguageId
        } else {
          part
          throw new Error('no')
        }
        break
      case State.InsideBackTickString:
        if ((next = part.match(RE_QUOTE_BACKTICK))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_BACKTICK_QUOTE_CONTENT))) {
          token = TokenType.MarkdownString
          state = State.InsideBackTickString
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
          state = State.InsideBackTickString
        } else {
          throw new Error('no')
        }
        break
      default:
        state
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
