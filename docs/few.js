define(['require'], function (require) { 'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) { return e; } else {
			var n = {};
			if (e) {
				Object.keys(e).forEach(function (k) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () {
							return e[k];
						}
					});
				});
			}
			n['default'] = e;
			return n;
		}
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var constants = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Type = exports.Char = void 0;
	const Char = {
	  ANCHOR: '&',
	  COMMENT: '#',
	  TAG: '!',
	  DIRECTIVES_END: '-',
	  DOCUMENT_END: '.'
	};
	exports.Char = Char;
	const Type = {
	  ALIAS: 'ALIAS',
	  BLANK_LINE: 'BLANK_LINE',
	  BLOCK_FOLDED: 'BLOCK_FOLDED',
	  BLOCK_LITERAL: 'BLOCK_LITERAL',
	  COMMENT: 'COMMENT',
	  DIRECTIVE: 'DIRECTIVE',
	  DOCUMENT: 'DOCUMENT',
	  FLOW_MAP: 'FLOW_MAP',
	  FLOW_SEQ: 'FLOW_SEQ',
	  MAP: 'MAP',
	  MAP_KEY: 'MAP_KEY',
	  MAP_VALUE: 'MAP_VALUE',
	  PLAIN: 'PLAIN',
	  QUOTE_DOUBLE: 'QUOTE_DOUBLE',
	  QUOTE_SINGLE: 'QUOTE_SINGLE',
	  SEQ: 'SEQ',
	  SEQ_ITEM: 'SEQ_ITEM'
	};
	exports.Type = Type;
	});

	unwrapExports(constants);
	var constants_1 = constants.Type;
	var constants_2 = constants.Char;

	var sourceUtils = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getLinePos = getLinePos;
	exports.getLine = getLine;
	exports.getPrettyContext = getPrettyContext;

	function findLineStarts(src) {
	  const ls = [0];
	  let offset = src.indexOf('\n');

	  while (offset !== -1) {
	    offset += 1;
	    ls.push(offset);
	    offset = src.indexOf('\n', offset);
	  }

	  return ls;
	}

	function getSrcInfo(cst) {
	  let lineStarts, src;

	  if (typeof cst === 'string') {
	    lineStarts = findLineStarts(cst);
	    src = cst;
	  } else {
	    if (Array.isArray(cst)) cst = cst[0];

	    if (cst && cst.context) {
	      if (!cst.lineStarts) cst.lineStarts = findLineStarts(cst.context.src);
	      lineStarts = cst.lineStarts;
	      src = cst.context.src;
	    }
	  }

	  return {
	    lineStarts,
	    src
	  };
	}
	/**
	 * @typedef {Object} LinePos - One-indexed position in the source
	 * @property {number} line
	 * @property {number} col
	 */

	/**
	 * Determine the line/col position matching a character offset.
	 *
	 * Accepts a source string or a CST document as the second parameter. With
	 * the latter, starting indices for lines are cached in the document as
	 * `lineStarts: number[]`.
	 *
	 * Returns a one-indexed `{ line, col }` location if found, or
	 * `undefined` otherwise.
	 *
	 * @param {number} offset
	 * @param {string|Document|Document[]} cst
	 * @returns {?LinePos}
	 */


	function getLinePos(offset, cst) {
	  if (typeof offset !== 'number' || offset < 0) return null;
	  const {
	    lineStarts,
	    src
	  } = getSrcInfo(cst);
	  if (!lineStarts || !src || offset > src.length) return null;

	  for (let i = 0; i < lineStarts.length; ++i) {
	    const start = lineStarts[i];

	    if (offset < start) {
	      return {
	        line: i,
	        col: offset - lineStarts[i - 1] + 1
	      };
	    }

	    if (offset === start) return {
	      line: i + 1,
	      col: 1
	    };
	  }

	  const line = lineStarts.length;
	  return {
	    line,
	    col: offset - lineStarts[line - 1] + 1
	  };
	}
	/**
	 * Get a specified line from the source.
	 *
	 * Accepts a source string or a CST document as the second parameter. With
	 * the latter, starting indices for lines are cached in the document as
	 * `lineStarts: number[]`.
	 *
	 * Returns the line as a string if found, or `null` otherwise.
	 *
	 * @param {number} line One-indexed line number
	 * @param {string|Document|Document[]} cst
	 * @returns {?string}
	 */


	function getLine(line, cst) {
	  const {
	    lineStarts,
	    src
	  } = getSrcInfo(cst);
	  if (!lineStarts || !(line >= 1) || line > lineStarts.length) return null;
	  const start = lineStarts[line - 1];
	  let end = lineStarts[line]; // undefined for last line; that's ok for slice()

	  while (end && end > start && src[end - 1] === '\n') --end;

	  return src.slice(start, end);
	}
	/**
	 * Pretty-print the starting line from the source indicated by the range `pos`
	 *
	 * Trims output to `maxWidth` chars while keeping the starting column visible,
	 * using `…` at either end to indicate dropped characters.
	 *
	 * Returns a two-line string (or `null`) with `\n` as separator; the second line
	 * will hold appropriately indented `^` marks indicating the column range.
	 *
	 * @param {Object} pos
	 * @param {LinePos} pos.start
	 * @param {LinePos} [pos.end]
	 * @param {string|Document|Document[]*} cst
	 * @param {number} [maxWidth=80]
	 * @returns {?string}
	 */


	function getPrettyContext({
	  start,
	  end
	}, cst, maxWidth = 80) {
	  let src = getLine(start.line, cst);
	  if (!src) return null;
	  let {
	    col
	  } = start;

	  if (src.length > maxWidth) {
	    if (col <= maxWidth - 10) {
	      src = src.substr(0, maxWidth - 1) + '…';
	    } else {
	      const halfWidth = Math.round(maxWidth / 2);
	      if (src.length > col + halfWidth) src = src.substr(0, col + halfWidth - 1) + '…';
	      col -= src.length - maxWidth;
	      src = '…' + src.substr(1 - maxWidth);
	    }
	  }

	  let errLen = 1;
	  let errEnd = '';

	  if (end) {
	    if (end.line === start.line && col + (end.col - start.col) <= maxWidth + 1) {
	      errLen = end.col - start.col;
	    } else {
	      errLen = Math.min(src.length + 1, maxWidth) - col;
	      errEnd = '…';
	    }
	  }

	  const offset = col > 1 ? ' '.repeat(col - 1) : '';
	  const err = '^'.repeat(errLen);
	  return `${src}\n${offset}${err}${errEnd}`;
	}
	});

	unwrapExports(sourceUtils);
	var sourceUtils_1 = sourceUtils.getLinePos;
	var sourceUtils_2 = sourceUtils.getLine;
	var sourceUtils_3 = sourceUtils.getPrettyContext;

	var Range_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	class Range {
	  static copy(orig) {
	    return new Range(orig.start, orig.end);
	  }

	  constructor(start, end) {
	    this.start = start;
	    this.end = end || start;
	  }

	  isEmpty() {
	    return typeof this.start !== 'number' || !this.end || this.end <= this.start;
	  }
	  /**
	   * Set `origStart` and `origEnd` to point to the original source range for
	   * this node, which may differ due to dropped CR characters.
	   *
	   * @param {number[]} cr - Positions of dropped CR characters
	   * @param {number} offset - Starting index of `cr` from the last call
	   * @returns {number} - The next offset, matching the one found for `origStart`
	   */


	  setOrigRange(cr, offset) {
	    const {
	      start,
	      end
	    } = this;

	    if (cr.length === 0 || end <= cr[0]) {
	      this.origStart = start;
	      this.origEnd = end;
	      return offset;
	    }

	    let i = offset;

	    while (i < cr.length) {
	      if (cr[i] > start) break;else ++i;
	    }

	    this.origStart = start + i;
	    const nextOffset = i;

	    while (i < cr.length) {
	      // if end was at \n, it should now be at \r
	      if (cr[i] >= end) break;else ++i;
	    }

	    this.origEnd = end + i;
	    return nextOffset;
	  }

	}

	exports.default = Range;
	});

	unwrapExports(Range_1);

	var Node_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;





	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/** Root class of all nodes */
	class Node {
	  static addStringTerminator(src, offset, str) {
	    if (str[str.length - 1] === '\n') return str;
	    const next = Node.endOfWhiteSpace(src, offset);
	    return next >= src.length || src[next] === '\n' ? str + '\n' : str;
	  } // ^(---|...)


	  static atDocumentBoundary(src, offset, sep) {
	    const ch0 = src[offset];
	    if (!ch0) return true;
	    const prev = src[offset - 1];
	    if (prev && prev !== '\n') return false;

	    if (sep) {
	      if (ch0 !== sep) return false;
	    } else {
	      if (ch0 !== constants.Char.DIRECTIVES_END && ch0 !== constants.Char.DOCUMENT_END) return false;
	    }

	    const ch1 = src[offset + 1];
	    const ch2 = src[offset + 2];
	    if (ch1 !== ch0 || ch2 !== ch0) return false;
	    const ch3 = src[offset + 3];
	    return !ch3 || ch3 === '\n' || ch3 === '\t' || ch3 === ' ';
	  }

	  static endOfIdentifier(src, offset) {
	    let ch = src[offset];
	    const isVerbatim = ch === '<';
	    const notOk = isVerbatim ? ['\n', '\t', ' ', '>'] : ['\n', '\t', ' ', '[', ']', '{', '}', ','];

	    while (ch && notOk.indexOf(ch) === -1) ch = src[offset += 1];

	    if (isVerbatim && ch === '>') offset += 1;
	    return offset;
	  }

	  static endOfIndent(src, offset) {
	    let ch = src[offset];

	    while (ch === ' ') ch = src[offset += 1];

	    return offset;
	  }

	  static endOfLine(src, offset) {
	    let ch = src[offset];

	    while (ch && ch !== '\n') ch = src[offset += 1];

	    return offset;
	  }

	  static endOfWhiteSpace(src, offset) {
	    let ch = src[offset];

	    while (ch === '\t' || ch === ' ') ch = src[offset += 1];

	    return offset;
	  }

	  static startOfLine(src, offset) {
	    let ch = src[offset - 1];
	    if (ch === '\n') return offset;

	    while (ch && ch !== '\n') ch = src[offset -= 1];

	    return offset + 1;
	  }
	  /**
	   * End of indentation, or null if the line's indent level is not more
	   * than `indent`
	   *
	   * @param {string} src
	   * @param {number} indent
	   * @param {number} lineStart
	   * @returns {?number}
	   */


	  static endOfBlockIndent(src, indent, lineStart) {
	    const inEnd = Node.endOfIndent(src, lineStart);

	    if (inEnd > lineStart + indent) {
	      return inEnd;
	    } else {
	      const wsEnd = Node.endOfWhiteSpace(src, inEnd);
	      const ch = src[wsEnd];
	      if (!ch || ch === '\n') return wsEnd;
	    }

	    return null;
	  }

	  static atBlank(src, offset, endAsBlank) {
	    const ch = src[offset];
	    return ch === '\n' || ch === '\t' || ch === ' ' || endAsBlank && !ch;
	  }

	  static atCollectionItem(src, offset) {
	    const ch = src[offset];
	    return (ch === '?' || ch === ':' || ch === '-') && Node.atBlank(src, offset + 1, true);
	  }

	  static nextNodeIsIndented(ch, indentDiff, indicatorAsIndent) {
	    if (!ch || indentDiff < 0) return false;
	    if (indentDiff > 0) return true;
	    return indicatorAsIndent && ch === '-';
	  } // should be at line or string end, or at next non-whitespace char


	  static normalizeOffset(src, offset) {
	    const ch = src[offset];
	    return !ch ? offset : ch !== '\n' && src[offset - 1] === '\n' ? offset - 1 : Node.endOfWhiteSpace(src, offset);
	  } // fold single newline into space, multiple newlines to N - 1 newlines
	  // presumes src[offset] === '\n'


	  static foldNewline(src, offset, indent) {
	    let inCount = 0;
	    let error = false;
	    let fold = '';
	    let ch = src[offset + 1];

	    while (ch === ' ' || ch === '\t' || ch === '\n') {
	      switch (ch) {
	        case '\n':
	          inCount = 0;
	          offset += 1;
	          fold += '\n';
	          break;

	        case '\t':
	          if (inCount <= indent) error = true;
	          offset = Node.endOfWhiteSpace(src, offset + 2) - 1;
	          break;

	        case ' ':
	          inCount += 1;
	          offset += 1;
	          break;
	      }

	      ch = src[offset + 1];
	    }

	    if (!fold) fold = ' ';
	    if (ch && inCount <= indent) error = true;
	    return {
	      fold,
	      offset,
	      error
	    };
	  }

	  constructor(type, props, context) {
	    Object.defineProperty(this, 'context', {
	      value: context || null,
	      writable: true
	    });
	    this.error = null;
	    this.range = null;
	    this.valueRange = null;
	    this.props = props || [];
	    this.type = type;
	    this.value = null;
	  }

	  getPropValue(idx, key, skipKey) {
	    if (!this.context) return null;
	    const {
	      src
	    } = this.context;
	    const prop = this.props[idx];
	    return prop && src[prop.start] === key ? src.slice(prop.start + (skipKey ? 1 : 0), prop.end) : null;
	  }

	  get anchor() {
	    for (let i = 0; i < this.props.length; ++i) {
	      const anchor = this.getPropValue(i, constants.Char.ANCHOR, true);
	      if (anchor != null) return anchor;
	    }

	    return null;
	  }

	  get comment() {
	    const comments = [];

	    for (let i = 0; i < this.props.length; ++i) {
	      const comment = this.getPropValue(i, constants.Char.COMMENT, true);
	      if (comment != null) comments.push(comment);
	    }

	    return comments.length > 0 ? comments.join('\n') : null;
	  }

	  commentHasRequiredWhitespace(start) {
	    const {
	      src
	    } = this.context;
	    if (this.header && start === this.header.end) return false;
	    if (!this.valueRange) return false;
	    const {
	      end
	    } = this.valueRange;
	    return start !== end || Node.atBlank(src, end - 1);
	  }

	  get hasComment() {
	    if (this.context) {
	      const {
	        src
	      } = this.context;

	      for (let i = 0; i < this.props.length; ++i) {
	        if (src[this.props[i].start] === constants.Char.COMMENT) return true;
	      }
	    }

	    return false;
	  }

	  get hasProps() {
	    if (this.context) {
	      const {
	        src
	      } = this.context;

	      for (let i = 0; i < this.props.length; ++i) {
	        if (src[this.props[i].start] !== constants.Char.COMMENT) return true;
	      }
	    }

	    return false;
	  }

	  get includesTrailingLines() {
	    return false;
	  }

	  get jsonLike() {
	    const jsonLikeTypes = [constants.Type.FLOW_MAP, constants.Type.FLOW_SEQ, constants.Type.QUOTE_DOUBLE, constants.Type.QUOTE_SINGLE];
	    return jsonLikeTypes.indexOf(this.type) !== -1;
	  }

	  get rangeAsLinePos() {
	    if (!this.range || !this.context) return undefined;
	    const start = (0, sourceUtils.getLinePos)(this.range.start, this.context.root);
	    if (!start) return undefined;
	    const end = (0, sourceUtils.getLinePos)(this.range.end, this.context.root);
	    return {
	      start,
	      end
	    };
	  }

	  get rawValue() {
	    if (!this.valueRange || !this.context) return null;
	    const {
	      start,
	      end
	    } = this.valueRange;
	    return this.context.src.slice(start, end);
	  }

	  get tag() {
	    for (let i = 0; i < this.props.length; ++i) {
	      const tag = this.getPropValue(i, constants.Char.TAG, false);

	      if (tag != null) {
	        if (tag[1] === '<') {
	          return {
	            verbatim: tag.slice(2, -1)
	          };
	        } else {
	          // eslint-disable-next-line no-unused-vars
	          const [_, handle, suffix] = tag.match(/^(.*!)([^!]*)$/);
	          return {
	            handle,
	            suffix
	          };
	        }
	      }
	    }

	    return null;
	  }

	  get valueRangeContainsNewline() {
	    if (!this.valueRange || !this.context) return false;
	    const {
	      start,
	      end
	    } = this.valueRange;
	    const {
	      src
	    } = this.context;

	    for (let i = start; i < end; ++i) {
	      if (src[i] === '\n') return true;
	    }

	    return false;
	  }

	  parseComment(start) {
	    const {
	      src
	    } = this.context;

	    if (src[start] === constants.Char.COMMENT) {
	      const end = Node.endOfLine(src, start + 1);
	      const commentRange = new _Range.default(start, end);
	      this.props.push(commentRange);
	      return end;
	    }

	    return start;
	  }
	  /**
	   * Populates the `origStart` and `origEnd` values of all ranges for this
	   * node. Extended by child classes to handle descendant nodes.
	   *
	   * @param {number[]} cr - Positions of dropped CR characters
	   * @param {number} offset - Starting index of `cr` from the last call
	   * @returns {number} - The next offset, matching the one found for `origStart`
	   */


	  setOrigRanges(cr, offset) {
	    if (this.range) offset = this.range.setOrigRange(cr, offset);
	    if (this.valueRange) this.valueRange.setOrigRange(cr, offset);
	    this.props.forEach(prop => prop.setOrigRange(cr, offset));
	    return offset;
	  }

	  toString() {
	    const {
	      context: {
	        src
	      },
	      range,
	      value
	    } = this;
	    if (value != null) return value;
	    const str = src.slice(range.start, range.end);
	    return Node.addStringTerminator(src, range.end, str);
	  }

	}

	exports.default = Node;
	});

	unwrapExports(Node_1);

	var errors = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.YAMLWarning = exports.YAMLSyntaxError = exports.YAMLSemanticError = exports.YAMLReferenceError = exports.YAMLError = void 0;

	var _Node = _interopRequireDefault(Node_1);



	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class YAMLError extends Error {
	  constructor(name, source, message) {
	    if (!message || !(source instanceof _Node.default)) throw new Error(`Invalid arguments for new ${name}`);
	    super();
	    this.name = name;
	    this.message = message;
	    this.source = source;
	  }

	  makePretty() {
	    if (!this.source) return;
	    this.nodeType = this.source.type;
	    const cst = this.source.context && this.source.context.root;

	    if (typeof this.offset === 'number') {
	      this.range = new _Range.default(this.offset, this.offset + 1);
	      const start = cst && (0, sourceUtils.getLinePos)(this.offset, cst);

	      if (start) {
	        const end = {
	          line: start.line,
	          col: start.col + 1
	        };
	        this.linePos = {
	          start,
	          end
	        };
	      }

	      delete this.offset;
	    } else {
	      this.range = this.source.range;
	      this.linePos = this.source.rangeAsLinePos;
	    }

	    if (this.linePos) {
	      const {
	        line,
	        col
	      } = this.linePos.start;
	      this.message += ` at line ${line}, column ${col}`;
	      const ctx = cst && (0, sourceUtils.getPrettyContext)(this.linePos, cst);
	      if (ctx) this.message += `:\n\n${ctx}\n`;
	    }

	    delete this.source;
	  }

	}

	exports.YAMLError = YAMLError;

	class YAMLReferenceError extends YAMLError {
	  constructor(source, message) {
	    super('YAMLReferenceError', source, message);
	  }

	}

	exports.YAMLReferenceError = YAMLReferenceError;

	class YAMLSemanticError extends YAMLError {
	  constructor(source, message) {
	    super('YAMLSemanticError', source, message);
	  }

	}

	exports.YAMLSemanticError = YAMLSemanticError;

	class YAMLSyntaxError extends YAMLError {
	  constructor(source, message) {
	    super('YAMLSyntaxError', source, message);
	  }

	}

	exports.YAMLSyntaxError = YAMLSyntaxError;

	class YAMLWarning extends YAMLError {
	  constructor(source, message) {
	    super('YAMLWarning', source, message);
	  }

	}

	exports.YAMLWarning = YAMLWarning;
	});

	unwrapExports(errors);
	var errors_1 = errors.YAMLWarning;
	var errors_2 = errors.YAMLSyntaxError;
	var errors_3 = errors.YAMLSemanticError;
	var errors_4 = errors.YAMLReferenceError;
	var errors_5 = errors.YAMLError;

	var BlankLine_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;



	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class BlankLine extends _Node.default {
	  constructor() {
	    super(constants.Type.BLANK_LINE);
	  }

	  get includesTrailingLines() {
	    return true;
	  }
	  /**
	   * Parses blank lines from the source
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first \n character
	   * @returns {number} - Index of the character after this
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      src
	    } = context;
	    let offset = start + 1;

	    while (_Node.default.atBlank(src, offset)) {
	      const lineEnd = _Node.default.endOfWhiteSpace(src, offset);

	      if (lineEnd === '\n') offset = lineEnd + 1;else break;
	    }

	    this.range = new _Range.default(start, offset);
	    return offset;
	  }

	}

	exports.default = BlankLine;
	});

	unwrapExports(BlankLine_1);

	var CollectionItem_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;





	var _BlankLine = _interopRequireDefault(BlankLine_1);

	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class CollectionItem extends _Node.default {
	  constructor(type, props) {
	    super(type, props);
	    this.node = null;
	  }

	  get includesTrailingLines() {
	    return !!this.node && this.node.includesTrailingLines;
	  }
	  /**
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      parseNode,
	      src
	    } = context;
	    let {
	      atLineStart,
	      lineStart
	    } = context;
	    if (!atLineStart && this.type === constants.Type.SEQ_ITEM) this.error = new errors.YAMLSemanticError(this, 'Sequence items must not have preceding content on the same line');
	    const indent = atLineStart ? start - lineStart : context.indent;

	    let offset = _Node.default.endOfWhiteSpace(src, start + 1);

	    let ch = src[offset];
	    const inlineComment = ch === '#';
	    const comments = [];
	    let blankLine = null;

	    while (ch === '\n' || ch === '#') {
	      if (ch === '#') {
	        const end = _Node.default.endOfLine(src, offset + 1);

	        comments.push(new _Range.default(offset, end));
	        offset = end;
	      } else {
	        atLineStart = true;
	        lineStart = offset + 1;

	        const wsEnd = _Node.default.endOfWhiteSpace(src, lineStart);

	        if (src[wsEnd] === '\n' && comments.length === 0) {
	          blankLine = new _BlankLine.default();
	          lineStart = blankLine.parse({
	            src
	          }, lineStart);
	        }

	        offset = _Node.default.endOfIndent(src, lineStart);
	      }

	      ch = src[offset];
	    }

	    if (_Node.default.nextNodeIsIndented(ch, offset - (lineStart + indent), this.type !== constants.Type.SEQ_ITEM)) {
	      this.node = parseNode({
	        atLineStart,
	        inCollection: false,
	        indent,
	        lineStart,
	        parent: this
	      }, offset);
	    } else if (ch && lineStart > start + 1) {
	      offset = lineStart - 1;
	    }

	    if (this.node) {
	      if (blankLine) {
	        // Only blank lines preceding non-empty nodes are captured. Note that
	        // this means that collection item range start indices do not always
	        // increase monotonically. -- eemeli/yaml#126
	        const items = context.parent.items || context.parent.contents;
	        if (items) items.push(blankLine);
	      }

	      if (comments.length) Array.prototype.push.apply(this.props, comments);
	      offset = this.node.range.end;
	    } else {
	      if (inlineComment) {
	        const c = comments[0];
	        this.props.push(c);
	        offset = c.end;
	      } else {
	        offset = _Node.default.endOfLine(src, start + 1);
	      }
	    }

	    const end = this.node ? this.node.valueRange.end : offset;
	    this.valueRange = new _Range.default(start, end);
	    return offset;
	  }

	  setOrigRanges(cr, offset) {
	    offset = super.setOrigRanges(cr, offset);
	    return this.node ? this.node.setOrigRanges(cr, offset) : offset;
	  }

	  toString() {
	    const {
	      context: {
	        src
	      },
	      node,
	      range,
	      value
	    } = this;
	    if (value != null) return value;
	    const str = node ? src.slice(range.start, node.range.start) + String(node) : src.slice(range.start, range.end);
	    return _Node.default.addStringTerminator(src, range.end, str);
	  }

	}

	exports.default = CollectionItem;
	});

	unwrapExports(CollectionItem_1);

	var Comment_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;



	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class Comment extends _Node.default {
	  constructor() {
	    super(constants.Type.COMMENT);
	  }
	  /**
	   * Parses a comment line from the source
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this scalar
	   */


	  parse(context, start) {
	    this.context = context;
	    const offset = this.parseComment(start);
	    this.range = new _Range.default(start, offset);
	    return offset;
	  }

	}

	exports.default = Comment;
	});

	unwrapExports(Comment_1);

	var Collection_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.grabCollectionEndComments = grabCollectionEndComments;
	exports.default = void 0;



	var _BlankLine = _interopRequireDefault(BlankLine_1);

	var _CollectionItem = _interopRequireDefault(CollectionItem_1);

	var _Comment = _interopRequireDefault(Comment_1);

	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function grabCollectionEndComments(node) {
	  let cnode = node;

	  while (cnode instanceof _CollectionItem.default) cnode = cnode.node;

	  if (!(cnode instanceof Collection)) return null;
	  const len = cnode.items.length;
	  let ci = -1;

	  for (let i = len - 1; i >= 0; --i) {
	    const n = cnode.items[i];

	    if (n.type === constants.Type.COMMENT) {
	      // Keep sufficiently indented comments with preceding node
	      const {
	        indent,
	        lineStart
	      } = n.context;
	      if (indent > 0 && n.range.start >= lineStart + indent) break;
	      ci = i;
	    } else if (n.type === constants.Type.BLANK_LINE) ci = i;else break;
	  }

	  if (ci === -1) return null;
	  const ca = cnode.items.splice(ci, len - ci);
	  const prevEnd = ca[0].range.start;

	  while (true) {
	    cnode.range.end = prevEnd;
	    if (cnode.valueRange && cnode.valueRange.end > prevEnd) cnode.valueRange.end = prevEnd;
	    if (cnode === node) break;
	    cnode = cnode.context.parent;
	  }

	  return ca;
	}

	class Collection extends _Node.default {
	  static nextContentHasIndent(src, offset, indent) {
	    const lineStart = _Node.default.endOfLine(src, offset) + 1;
	    offset = _Node.default.endOfWhiteSpace(src, lineStart);
	    const ch = src[offset];
	    if (!ch) return false;
	    if (offset >= lineStart + indent) return true;
	    if (ch !== '#' && ch !== '\n') return false;
	    return Collection.nextContentHasIndent(src, offset, indent);
	  }

	  constructor(firstItem) {
	    super(firstItem.type === constants.Type.SEQ_ITEM ? constants.Type.SEQ : constants.Type.MAP);

	    for (let i = firstItem.props.length - 1; i >= 0; --i) {
	      if (firstItem.props[i].start < firstItem.context.lineStart) {
	        // props on previous line are assumed by the collection
	        this.props = firstItem.props.slice(0, i + 1);
	        firstItem.props = firstItem.props.slice(i + 1);
	        const itemRange = firstItem.props[0] || firstItem.valueRange;
	        firstItem.range.start = itemRange.start;
	        break;
	      }
	    }

	    this.items = [firstItem];
	    const ec = grabCollectionEndComments(firstItem);
	    if (ec) Array.prototype.push.apply(this.items, ec);
	  }

	  get includesTrailingLines() {
	    return this.items.length > 0;
	  }
	  /**
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      parseNode,
	      src
	    } = context; // It's easier to recalculate lineStart here rather than tracking down the
	    // last context from which to read it -- eemeli/yaml#2

	    let lineStart = _Node.default.startOfLine(src, start);

	    const firstItem = this.items[0]; // First-item context needs to be correct for later comment handling
	    // -- eemeli/yaml#17

	    firstItem.context.parent = this;
	    this.valueRange = _Range.default.copy(firstItem.valueRange);
	    const indent = firstItem.range.start - firstItem.context.lineStart;
	    let offset = start;
	    offset = _Node.default.normalizeOffset(src, offset);
	    let ch = src[offset];
	    let atLineStart = _Node.default.endOfWhiteSpace(src, lineStart) === offset;
	    let prevIncludesTrailingLines = false;

	    while (ch) {
	      while (ch === '\n' || ch === '#') {
	        if (atLineStart && ch === '\n' && !prevIncludesTrailingLines) {
	          const blankLine = new _BlankLine.default();
	          offset = blankLine.parse({
	            src
	          }, offset);
	          this.valueRange.end = offset;

	          if (offset >= src.length) {
	            ch = null;
	            break;
	          }

	          this.items.push(blankLine);
	          offset -= 1; // blankLine.parse() consumes terminal newline
	        } else if (ch === '#') {
	          if (offset < lineStart + indent && !Collection.nextContentHasIndent(src, offset, indent)) {
	            return offset;
	          }

	          const comment = new _Comment.default();
	          offset = comment.parse({
	            indent,
	            lineStart,
	            src
	          }, offset);
	          this.items.push(comment);
	          this.valueRange.end = offset;

	          if (offset >= src.length) {
	            ch = null;
	            break;
	          }
	        }

	        lineStart = offset + 1;
	        offset = _Node.default.endOfIndent(src, lineStart);

	        if (_Node.default.atBlank(src, offset)) {
	          const wsEnd = _Node.default.endOfWhiteSpace(src, offset);

	          const next = src[wsEnd];

	          if (!next || next === '\n' || next === '#') {
	            offset = wsEnd;
	          }
	        }

	        ch = src[offset];
	        atLineStart = true;
	      }

	      if (!ch) {
	        break;
	      }

	      if (offset !== lineStart + indent && (atLineStart || ch !== ':')) {
	        if (lineStart > start) offset = lineStart;
	        break;
	      }

	      if (firstItem.type === constants.Type.SEQ_ITEM !== (ch === '-')) {
	        let typeswitch = true;

	        if (ch === '-') {
	          // map key may start with -, as long as it's followed by a non-whitespace char
	          const next = src[offset + 1];
	          typeswitch = !next || next === '\n' || next === '\t' || next === ' ';
	        }

	        if (typeswitch) {
	          if (lineStart > start) offset = lineStart;
	          break;
	        }
	      }

	      const node = parseNode({
	        atLineStart,
	        inCollection: true,
	        indent,
	        lineStart,
	        parent: this
	      }, offset);
	      if (!node) return offset; // at next document start

	      this.items.push(node);
	      this.valueRange.end = node.valueRange.end;
	      offset = _Node.default.normalizeOffset(src, node.range.end);
	      ch = src[offset];
	      atLineStart = false;
	      prevIncludesTrailingLines = node.includesTrailingLines; // Need to reset lineStart and atLineStart here if preceding node's range
	      // has advanced to check the current line's indentation level
	      // -- eemeli/yaml#10 & eemeli/yaml#38

	      if (ch) {
	        let ls = offset - 1;
	        let prev = src[ls];

	        while (prev === ' ' || prev === '\t') prev = src[--ls];

	        if (prev === '\n') {
	          lineStart = ls + 1;
	          atLineStart = true;
	        }
	      }

	      const ec = grabCollectionEndComments(node);
	      if (ec) Array.prototype.push.apply(this.items, ec);
	    }

	    return offset;
	  }

	  setOrigRanges(cr, offset) {
	    offset = super.setOrigRanges(cr, offset);
	    this.items.forEach(node => {
	      offset = node.setOrigRanges(cr, offset);
	    });
	    return offset;
	  }

	  toString() {
	    const {
	      context: {
	        src
	      },
	      items,
	      range,
	      value
	    } = this;
	    if (value != null) return value;
	    let str = src.slice(range.start, items[0].range.start) + String(items[0]);

	    for (let i = 1; i < items.length; ++i) {
	      const item = items[i];
	      const {
	        atLineStart,
	        indent
	      } = item.context;
	      if (atLineStart) for (let i = 0; i < indent; ++i) str += ' ';
	      str += String(item);
	    }

	    return _Node.default.addStringTerminator(src, range.end, str);
	  }

	}

	exports.default = Collection;
	});

	unwrapExports(Collection_1);
	var Collection_2 = Collection_1.grabCollectionEndComments;

	var Directive_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;



	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class Directive extends _Node.default {
	  static endOfDirective(src, offset) {
	    let ch = src[offset];

	    while (ch && ch !== '\n' && ch !== '#') ch = src[offset += 1]; // last char can't be whitespace


	    ch = src[offset - 1];

	    while (ch === ' ' || ch === '\t') {
	      offset -= 1;
	      ch = src[offset - 1];
	    }

	    return offset;
	  }

	  constructor() {
	    super(constants.Type.DIRECTIVE);
	    this.name = null;
	  }

	  get parameters() {
	    const raw = this.rawValue;
	    return raw ? raw.trim().split(/[ \t]+/) : [];
	  }

	  parseName(start) {
	    const {
	      src
	    } = this.context;
	    let offset = start;
	    let ch = src[offset];

	    while (ch && ch !== '\n' && ch !== '\t' && ch !== ' ') ch = src[offset += 1];

	    this.name = src.slice(start, offset);
	    return offset;
	  }

	  parseParameters(start) {
	    const {
	      src
	    } = this.context;
	    let offset = start;
	    let ch = src[offset];

	    while (ch && ch !== '\n' && ch !== '#') ch = src[offset += 1];

	    this.valueRange = new _Range.default(start, offset);
	    return offset;
	  }

	  parse(context, start) {
	    this.context = context;
	    let offset = this.parseName(start + 1);
	    offset = this.parseParameters(offset);
	    offset = this.parseComment(offset);
	    this.range = new _Range.default(start, offset);
	    return offset;
	  }

	}

	exports.default = Directive;
	});

	unwrapExports(Directive_1);

	var Document_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;





	var _BlankLine = _interopRequireDefault(BlankLine_1);



	var _Comment = _interopRequireDefault(Comment_1);

	var _Directive = _interopRequireDefault(Directive_1);

	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class Document extends _Node.default {
	  static startCommentOrEndBlankLine(src, start) {
	    const offset = _Node.default.endOfWhiteSpace(src, start);

	    const ch = src[offset];
	    return ch === '#' || ch === '\n' ? offset : start;
	  }

	  constructor() {
	    super(constants.Type.DOCUMENT);
	    this.directives = null;
	    this.contents = null;
	    this.directivesEndMarker = null;
	    this.documentEndMarker = null;
	  }

	  parseDirectives(start) {
	    const {
	      src
	    } = this.context;
	    this.directives = [];
	    let atLineStart = true;
	    let hasDirectives = false;
	    let offset = start;

	    while (!_Node.default.atDocumentBoundary(src, offset, constants.Char.DIRECTIVES_END)) {
	      offset = Document.startCommentOrEndBlankLine(src, offset);

	      switch (src[offset]) {
	        case '\n':
	          if (atLineStart) {
	            const blankLine = new _BlankLine.default();
	            offset = blankLine.parse({
	              src
	            }, offset);

	            if (offset < src.length) {
	              this.directives.push(blankLine);
	            }
	          } else {
	            offset += 1;
	            atLineStart = true;
	          }

	          break;

	        case '#':
	          {
	            const comment = new _Comment.default();
	            offset = comment.parse({
	              src
	            }, offset);
	            this.directives.push(comment);
	            atLineStart = false;
	          }
	          break;

	        case '%':
	          {
	            const directive = new _Directive.default();
	            offset = directive.parse({
	              parent: this,
	              src
	            }, offset);
	            this.directives.push(directive);
	            hasDirectives = true;
	            atLineStart = false;
	          }
	          break;

	        default:
	          if (hasDirectives) {
	            this.error = new errors.YAMLSemanticError(this, 'Missing directives-end indicator line');
	          } else if (this.directives.length > 0) {
	            this.contents = this.directives;
	            this.directives = [];
	          }

	          return offset;
	      }
	    }

	    if (src[offset]) {
	      this.directivesEndMarker = new _Range.default(offset, offset + 3);
	      return offset + 3;
	    }

	    if (hasDirectives) {
	      this.error = new errors.YAMLSemanticError(this, 'Missing directives-end indicator line');
	    } else if (this.directives.length > 0) {
	      this.contents = this.directives;
	      this.directives = [];
	    }

	    return offset;
	  }

	  parseContents(start) {
	    const {
	      parseNode,
	      src
	    } = this.context;
	    if (!this.contents) this.contents = [];
	    let lineStart = start;

	    while (src[lineStart - 1] === '-') lineStart -= 1;

	    let offset = _Node.default.endOfWhiteSpace(src, start);

	    let atLineStart = lineStart === start;
	    this.valueRange = new _Range.default(offset);

	    while (!_Node.default.atDocumentBoundary(src, offset, constants.Char.DOCUMENT_END)) {
	      switch (src[offset]) {
	        case '\n':
	          if (atLineStart) {
	            const blankLine = new _BlankLine.default();
	            offset = blankLine.parse({
	              src
	            }, offset);

	            if (offset < src.length) {
	              this.contents.push(blankLine);
	            }
	          } else {
	            offset += 1;
	            atLineStart = true;
	          }

	          lineStart = offset;
	          break;

	        case '#':
	          {
	            const comment = new _Comment.default();
	            offset = comment.parse({
	              src
	            }, offset);
	            this.contents.push(comment);
	            atLineStart = false;
	          }
	          break;

	        default:
	          {
	            const iEnd = _Node.default.endOfIndent(src, offset);

	            const context = {
	              atLineStart,
	              indent: -1,
	              inFlow: false,
	              inCollection: false,
	              lineStart,
	              parent: this
	            };
	            const node = parseNode(context, iEnd);
	            if (!node) return this.valueRange.end = iEnd; // at next document start

	            this.contents.push(node);
	            offset = node.range.end;
	            atLineStart = false;
	            const ec = (0, Collection_1.grabCollectionEndComments)(node);
	            if (ec) Array.prototype.push.apply(this.contents, ec);
	          }
	      }

	      offset = Document.startCommentOrEndBlankLine(src, offset);
	    }

	    this.valueRange.end = offset;

	    if (src[offset]) {
	      this.documentEndMarker = new _Range.default(offset, offset + 3);
	      offset += 3;

	      if (src[offset]) {
	        offset = _Node.default.endOfWhiteSpace(src, offset);

	        if (src[offset] === '#') {
	          const comment = new _Comment.default();
	          offset = comment.parse({
	            src
	          }, offset);
	          this.contents.push(comment);
	        }

	        switch (src[offset]) {
	          case '\n':
	            offset += 1;
	            break;

	          case undefined:
	            break;

	          default:
	            this.error = new errors.YAMLSyntaxError(this, 'Document end marker line cannot have a non-comment suffix');
	        }
	      }
	    }

	    return offset;
	  }
	  /**
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this
	   */


	  parse(context, start) {
	    context.root = this;
	    this.context = context;
	    const {
	      src
	    } = context;
	    let offset = src.charCodeAt(start) === 0xfeff ? start + 1 : start; // skip BOM

	    offset = this.parseDirectives(offset);
	    offset = this.parseContents(offset);
	    return offset;
	  }

	  setOrigRanges(cr, offset) {
	    offset = super.setOrigRanges(cr, offset);
	    this.directives.forEach(node => {
	      offset = node.setOrigRanges(cr, offset);
	    });
	    if (this.directivesEndMarker) offset = this.directivesEndMarker.setOrigRange(cr, offset);
	    this.contents.forEach(node => {
	      offset = node.setOrigRanges(cr, offset);
	    });
	    if (this.documentEndMarker) offset = this.documentEndMarker.setOrigRange(cr, offset);
	    return offset;
	  }

	  toString() {
	    const {
	      contents,
	      directives,
	      value
	    } = this;
	    if (value != null) return value;
	    let str = directives.join('');

	    if (contents.length > 0) {
	      if (directives.length > 0 || contents[0].type === constants.Type.COMMENT) str += '---\n';
	      str += contents.join('');
	    }

	    if (str[str.length - 1] !== '\n') str += '\n';
	    return str;
	  }

	}

	exports.default = Document;
	});

	unwrapExports(Document_1);

	var Alias_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class Alias extends _Node.default {
	  /**
	   * Parses an *alias from the source
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this scalar
	   */
	  parse(context, start) {
	    this.context = context;
	    const {
	      src
	    } = context;

	    let offset = _Node.default.endOfIdentifier(src, start + 1);

	    this.valueRange = new _Range.default(start + 1, offset);
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    offset = this.parseComment(offset);
	    return offset;
	  }

	}

	exports.default = Alias;
	});

	unwrapExports(Alias_1);

	var BlockValue_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.Chomp = void 0;



	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const Chomp = {
	  CLIP: 'CLIP',
	  KEEP: 'KEEP',
	  STRIP: 'STRIP'
	};
	exports.Chomp = Chomp;

	class BlockValue extends _Node.default {
	  constructor(type, props) {
	    super(type, props);
	    this.blockIndent = null;
	    this.chomping = Chomp.CLIP;
	    this.header = null;
	  }

	  get includesTrailingLines() {
	    return this.chomping === Chomp.KEEP;
	  }

	  get strValue() {
	    if (!this.valueRange || !this.context) return null;
	    let {
	      start,
	      end
	    } = this.valueRange;
	    const {
	      indent,
	      src
	    } = this.context;
	    if (this.valueRange.isEmpty()) return '';
	    let lastNewLine = null;
	    let ch = src[end - 1];

	    while (ch === '\n' || ch === '\t' || ch === ' ') {
	      end -= 1;

	      if (end <= start) {
	        if (this.chomping === Chomp.KEEP) break;else return '';
	      }

	      if (ch === '\n') lastNewLine = end;
	      ch = src[end - 1];
	    }

	    let keepStart = end + 1;

	    if (lastNewLine) {
	      if (this.chomping === Chomp.KEEP) {
	        keepStart = lastNewLine;
	        end = this.valueRange.end;
	      } else {
	        end = lastNewLine;
	      }
	    }

	    const bi = indent + this.blockIndent;
	    const folded = this.type === constants.Type.BLOCK_FOLDED;
	    let atStart = true;
	    let str = '';
	    let sep = '';
	    let prevMoreIndented = false;

	    for (let i = start; i < end; ++i) {
	      for (let j = 0; j < bi; ++j) {
	        if (src[i] !== ' ') break;
	        i += 1;
	      }

	      const ch = src[i];

	      if (ch === '\n') {
	        if (sep === '\n') str += '\n';else sep = '\n';
	      } else {
	        const lineEnd = _Node.default.endOfLine(src, i);

	        const line = src.slice(i, lineEnd);
	        i = lineEnd;

	        if (folded && (ch === ' ' || ch === '\t') && i < keepStart) {
	          if (sep === ' ') sep = '\n';else if (!prevMoreIndented && !atStart && sep === '\n') sep = '\n\n';
	          str += sep + line; //+ ((lineEnd < end && src[lineEnd]) || '')

	          sep = lineEnd < end && src[lineEnd] || '';
	          prevMoreIndented = true;
	        } else {
	          str += sep + line;
	          sep = folded && i < keepStart ? ' ' : '\n';
	          prevMoreIndented = false;
	        }

	        if (atStart && line !== '') atStart = false;
	      }
	    }

	    return this.chomping === Chomp.STRIP ? str : str + '\n';
	  }

	  parseBlockHeader(start) {
	    const {
	      src
	    } = this.context;
	    let offset = start + 1;
	    let bi = '';

	    while (true) {
	      const ch = src[offset];

	      switch (ch) {
	        case '-':
	          this.chomping = Chomp.STRIP;
	          break;

	        case '+':
	          this.chomping = Chomp.KEEP;
	          break;

	        case '0':
	        case '1':
	        case '2':
	        case '3':
	        case '4':
	        case '5':
	        case '6':
	        case '7':
	        case '8':
	        case '9':
	          bi += ch;
	          break;

	        default:
	          this.blockIndent = Number(bi) || null;
	          this.header = new _Range.default(start, offset);
	          return offset;
	      }

	      offset += 1;
	    }
	  }

	  parseBlockValue(start) {
	    const {
	      indent,
	      src
	    } = this.context;
	    let offset = start;
	    let valueEnd = start;
	    let bi = this.blockIndent ? indent + this.blockIndent - 1 : indent;
	    let minBlockIndent = 1;

	    for (let ch = src[offset]; ch === '\n'; ch = src[offset]) {
	      offset += 1;
	      if (_Node.default.atDocumentBoundary(src, offset)) break;

	      const end = _Node.default.endOfBlockIndent(src, bi, offset); // should not include tab?


	      if (end === null) break;

	      if (!this.blockIndent) {
	        // no explicit block indent, none yet detected
	        const lineIndent = end - (offset + indent);

	        if (src[end] !== '\n') {
	          // first line with non-whitespace content
	          if (lineIndent < minBlockIndent) {
	            offset -= 1;
	            break;
	          }

	          this.blockIndent = lineIndent;
	          bi = indent + this.blockIndent - 1;
	        } else if (lineIndent > minBlockIndent) {
	          // empty line with more whitespace
	          minBlockIndent = lineIndent;
	        }
	      }

	      if (src[end] === '\n') {
	        offset = end;
	      } else {
	        offset = valueEnd = _Node.default.endOfLine(src, end);
	      }
	    }

	    if (this.chomping !== Chomp.KEEP) {
	      offset = src[valueEnd] ? valueEnd + 1 : valueEnd;
	    }

	    this.valueRange = new _Range.default(start + 1, offset);
	    return offset;
	  }
	  /**
	   * Parses a block value from the source
	   *
	   * Accepted forms are:
	   * ```
	   * BS
	   * block
	   * lines
	   *
	   * BS #comment
	   * block
	   * lines
	   * ```
	   * where the block style BS matches the regexp `[|>][-+1-9]*` and block lines
	   * are empty or have an indent level greater than `indent`.
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this block
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      src
	    } = context;
	    let offset = this.parseBlockHeader(start);
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    offset = this.parseComment(offset);
	    offset = this.parseBlockValue(offset);
	    return offset;
	  }

	  setOrigRanges(cr, offset) {
	    offset = super.setOrigRanges(cr, offset);
	    return this.header ? this.header.setOrigRange(cr, offset) : offset;
	  }

	}

	exports.default = BlockValue;
	});

	unwrapExports(BlockValue_1);
	var BlockValue_2 = BlockValue_1.Chomp;

	var FlowCollection_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;





	var _BlankLine = _interopRequireDefault(BlankLine_1);

	var _Comment = _interopRequireDefault(Comment_1);

	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class FlowCollection extends _Node.default {
	  constructor(type, props) {
	    super(type, props);
	    this.items = null;
	  }

	  prevNodeIsJsonLike(idx = this.items.length) {
	    const node = this.items[idx - 1];
	    return !!node && (node.jsonLike || node.type === constants.Type.COMMENT && this.nodeIsJsonLike(idx - 1));
	  }
	  /**
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      parseNode,
	      src
	    } = context;
	    let {
	      indent,
	      lineStart
	    } = context;
	    let char = src[start]; // { or [

	    this.items = [{
	      char,
	      offset: start
	    }];

	    let offset = _Node.default.endOfWhiteSpace(src, start + 1);

	    char = src[offset];

	    while (char && char !== ']' && char !== '}') {
	      switch (char) {
	        case '\n':
	          {
	            lineStart = offset + 1;

	            const wsEnd = _Node.default.endOfWhiteSpace(src, lineStart);

	            if (src[wsEnd] === '\n') {
	              const blankLine = new _BlankLine.default();
	              lineStart = blankLine.parse({
	                src
	              }, lineStart);
	              this.items.push(blankLine);
	            }

	            offset = _Node.default.endOfIndent(src, lineStart);

	            if (offset <= lineStart + indent) {
	              char = src[offset];

	              if (offset < lineStart + indent || char !== ']' && char !== '}') {
	                const msg = 'Insufficient indentation in flow collection';
	                this.error = new errors.YAMLSemanticError(this, msg);
	              }
	            }
	          }
	          break;

	        case ',':
	          {
	            this.items.push({
	              char,
	              offset
	            });
	            offset += 1;
	          }
	          break;

	        case '#':
	          {
	            const comment = new _Comment.default();
	            offset = comment.parse({
	              src
	            }, offset);
	            this.items.push(comment);
	          }
	          break;

	        case '?':
	        case ':':
	          {
	            const next = src[offset + 1];

	            if (next === '\n' || next === '\t' || next === ' ' || next === ',' || // in-flow : after JSON-like key does not need to be followed by whitespace
	            char === ':' && this.prevNodeIsJsonLike()) {
	              this.items.push({
	                char,
	                offset
	              });
	              offset += 1;
	              break;
	            }
	          }
	        // fallthrough

	        default:
	          {
	            const node = parseNode({
	              atLineStart: false,
	              inCollection: false,
	              inFlow: true,
	              indent: -1,
	              lineStart,
	              parent: this
	            }, offset);

	            if (!node) {
	              // at next document start
	              this.valueRange = new _Range.default(start, offset);
	              return offset;
	            }

	            this.items.push(node);
	            offset = _Node.default.normalizeOffset(src, node.range.end);
	          }
	      }

	      offset = _Node.default.endOfWhiteSpace(src, offset);
	      char = src[offset];
	    }

	    this.valueRange = new _Range.default(start, offset + 1);

	    if (char) {
	      this.items.push({
	        char,
	        offset
	      });
	      offset = _Node.default.endOfWhiteSpace(src, offset + 1);
	      offset = this.parseComment(offset);
	    }

	    return offset;
	  }

	  setOrigRanges(cr, offset) {
	    offset = super.setOrigRanges(cr, offset);
	    this.items.forEach(node => {
	      if (node instanceof _Node.default) {
	        offset = node.setOrigRanges(cr, offset);
	      } else if (cr.length === 0) {
	        node.origOffset = node.offset;
	      } else {
	        let i = offset;

	        while (i < cr.length) {
	          if (cr[i] > node.offset) break;else ++i;
	        }

	        node.origOffset = node.offset + i;
	        offset = i;
	      }
	    });
	    return offset;
	  }

	  toString() {
	    const {
	      context: {
	        src
	      },
	      items,
	      range,
	      value
	    } = this;
	    if (value != null) return value;
	    const nodes = items.filter(item => item instanceof _Node.default);
	    let str = '';
	    let prevEnd = range.start;
	    nodes.forEach(node => {
	      const prefix = src.slice(prevEnd, node.range.start);
	      prevEnd = node.range.end;
	      str += prefix + String(node);

	      if (str[str.length - 1] === '\n' && src[prevEnd - 1] !== '\n' && src[prevEnd] === '\n') {
	        // Comment range does not include the terminal newline, but its
	        // stringified value does. Without this fix, newlines at comment ends
	        // get duplicated.
	        prevEnd += 1;
	      }
	    });
	    str += src.slice(prevEnd, range.end);
	    return _Node.default.addStringTerminator(src, range.end, str);
	  }

	}

	exports.default = FlowCollection;
	});

	unwrapExports(FlowCollection_1);

	var PlainValue_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class PlainValue extends _Node.default {
	  static endOfLine(src, start, inFlow) {
	    let ch = src[start];
	    let offset = start;

	    while (ch && ch !== '\n') {
	      if (inFlow && (ch === '[' || ch === ']' || ch === '{' || ch === '}' || ch === ',')) break;
	      const next = src[offset + 1];
	      if (ch === ':' && (!next || next === '\n' || next === '\t' || next === ' ' || inFlow && next === ',')) break;
	      if ((ch === ' ' || ch === '\t') && next === '#') break;
	      offset += 1;
	      ch = next;
	    }

	    return offset;
	  }

	  get strValue() {
	    if (!this.valueRange || !this.context) return null;
	    let {
	      start,
	      end
	    } = this.valueRange;
	    const {
	      src
	    } = this.context;
	    let ch = src[end - 1];

	    while (start < end && (ch === '\n' || ch === '\t' || ch === ' ')) ch = src[--end - 1];

	    ch = src[start];

	    while (start < end && (ch === '\n' || ch === '\t' || ch === ' ')) ch = src[++start];

	    let str = '';

	    for (let i = start; i < end; ++i) {
	      const ch = src[i];

	      if (ch === '\n') {
	        const {
	          fold,
	          offset
	        } = _Node.default.foldNewline(src, i, -1);

	        str += fold;
	        i = offset;
	      } else if (ch === ' ' || ch === '\t') {
	        // trim trailing whitespace
	        const wsStart = i;
	        let next = src[i + 1];

	        while (i < end && (next === ' ' || next === '\t')) {
	          i += 1;
	          next = src[i + 1];
	        }

	        if (next !== '\n') str += i > wsStart ? src.slice(wsStart, i + 1) : ch;
	      } else {
	        str += ch;
	      }
	    }

	    return str;
	  }

	  parseBlockValue(start) {
	    const {
	      indent,
	      inFlow,
	      src
	    } = this.context;
	    let offset = start;
	    let valueEnd = start;

	    for (let ch = src[offset]; ch === '\n'; ch = src[offset]) {
	      if (_Node.default.atDocumentBoundary(src, offset + 1)) break;

	      const end = _Node.default.endOfBlockIndent(src, indent, offset + 1);

	      if (end === null || src[end] === '#') break;

	      if (src[end] === '\n') {
	        offset = end;
	      } else {
	        valueEnd = PlainValue.endOfLine(src, end, inFlow);
	        offset = valueEnd;
	      }
	    }

	    if (this.valueRange.isEmpty()) this.valueRange.start = start;
	    this.valueRange.end = valueEnd;
	    return valueEnd;
	  }
	  /**
	   * Parses a plain value from the source
	   *
	   * Accepted forms are:
	   * ```
	   * #comment
	   *
	   * first line
	   *
	   * first line #comment
	   *
	   * first line
	   * block
	   * lines
	   *
	   * #comment
	   * block
	   * lines
	   * ```
	   * where block lines are empty or have an indent level greater than `indent`.
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this scalar, may be `\n`
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      inFlow,
	      src
	    } = context;
	    let offset = start;
	    const ch = src[offset];

	    if (ch && ch !== '#' && ch !== '\n') {
	      offset = PlainValue.endOfLine(src, start, inFlow);
	    }

	    this.valueRange = new _Range.default(start, offset);
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    offset = this.parseComment(offset);

	    if (!this.hasComment || this.valueRange.isEmpty()) {
	      offset = this.parseBlockValue(offset);
	    }

	    return offset;
	  }

	}

	exports.default = PlainValue;
	});

	unwrapExports(PlainValue_1);

	var QuoteDouble_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;



	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class QuoteDouble extends _Node.default {
	  static endOfQuote(src, offset) {
	    let ch = src[offset];

	    while (ch && ch !== '"') {
	      offset += ch === '\\' ? 2 : 1;
	      ch = src[offset];
	    }

	    return offset + 1;
	  }
	  /**
	   * @returns {string | { str: string, errors: YAMLSyntaxError[] }}
	   */


	  get strValue() {
	    if (!this.valueRange || !this.context) return null;
	    const errors$1 = [];
	    const {
	      start,
	      end
	    } = this.valueRange;
	    const {
	      indent,
	      src
	    } = this.context;
	    if (src[end - 1] !== '"') errors$1.push(new errors.YAMLSyntaxError(this, 'Missing closing "quote')); // Using String#replace is too painful with escaped newlines preceded by
	    // escaped backslashes; also, this should be faster.

	    let str = '';

	    for (let i = start + 1; i < end - 1; ++i) {
	      const ch = src[i];

	      if (ch === '\n') {
	        if (_Node.default.atDocumentBoundary(src, i + 1)) errors$1.push(new errors.YAMLSemanticError(this, 'Document boundary indicators are not allowed within string values'));

	        const {
	          fold,
	          offset,
	          error
	        } = _Node.default.foldNewline(src, i, indent);

	        str += fold;
	        i = offset;
	        if (error) errors$1.push(new errors.YAMLSemanticError(this, 'Multi-line double-quoted string needs to be sufficiently indented'));
	      } else if (ch === '\\') {
	        i += 1;

	        switch (src[i]) {
	          case '0':
	            str += '\0';
	            break;
	          // null character

	          case 'a':
	            str += '\x07';
	            break;
	          // bell character

	          case 'b':
	            str += '\b';
	            break;
	          // backspace

	          case 'e':
	            str += '\x1b';
	            break;
	          // escape character

	          case 'f':
	            str += '\f';
	            break;
	          // form feed

	          case 'n':
	            str += '\n';
	            break;
	          // line feed

	          case 'r':
	            str += '\r';
	            break;
	          // carriage return

	          case 't':
	            str += '\t';
	            break;
	          // horizontal tab

	          case 'v':
	            str += '\v';
	            break;
	          // vertical tab

	          case 'N':
	            str += '\u0085';
	            break;
	          // Unicode next line

	          case '_':
	            str += '\u00a0';
	            break;
	          // Unicode non-breaking space

	          case 'L':
	            str += '\u2028';
	            break;
	          // Unicode line separator

	          case 'P':
	            str += '\u2029';
	            break;
	          // Unicode paragraph separator

	          case ' ':
	            str += ' ';
	            break;

	          case '"':
	            str += '"';
	            break;

	          case '/':
	            str += '/';
	            break;

	          case '\\':
	            str += '\\';
	            break;

	          case '\t':
	            str += '\t';
	            break;

	          case 'x':
	            str += this.parseCharCode(i + 1, 2, errors$1);
	            i += 2;
	            break;

	          case 'u':
	            str += this.parseCharCode(i + 1, 4, errors$1);
	            i += 4;
	            break;

	          case 'U':
	            str += this.parseCharCode(i + 1, 8, errors$1);
	            i += 8;
	            break;

	          case '\n':
	            // skip escaped newlines, but still trim the following line
	            while (src[i + 1] === ' ' || src[i + 1] === '\t') i += 1;

	            break;

	          default:
	            errors$1.push(new errors.YAMLSyntaxError(this, `Invalid escape sequence ${src.substr(i - 1, 2)}`));
	            str += '\\' + src[i];
	        }
	      } else if (ch === ' ' || ch === '\t') {
	        // trim trailing whitespace
	        const wsStart = i;
	        let next = src[i + 1];

	        while (next === ' ' || next === '\t') {
	          i += 1;
	          next = src[i + 1];
	        }

	        if (next !== '\n') str += i > wsStart ? src.slice(wsStart, i + 1) : ch;
	      } else {
	        str += ch;
	      }
	    }

	    return errors$1.length > 0 ? {
	      errors: errors$1,
	      str
	    } : str;
	  }

	  parseCharCode(offset, length, errors$1) {
	    const {
	      src
	    } = this.context;
	    const cc = src.substr(offset, length);
	    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
	    const code = ok ? parseInt(cc, 16) : NaN;

	    if (isNaN(code)) {
	      errors$1.push(new errors.YAMLSyntaxError(this, `Invalid escape sequence ${src.substr(offset - 2, length + 2)}`));
	      return src.substr(offset - 2, length + 2);
	    }

	    return String.fromCodePoint(code);
	  }
	  /**
	   * Parses a "double quoted" value from the source
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this scalar
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      src
	    } = context;
	    let offset = QuoteDouble.endOfQuote(src, start + 1);
	    this.valueRange = new _Range.default(start, offset);
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    offset = this.parseComment(offset);
	    return offset;
	  }

	}

	exports.default = QuoteDouble;
	});

	unwrapExports(QuoteDouble_1);

	var QuoteSingle_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;



	var _Node = _interopRequireDefault(Node_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	class QuoteSingle extends _Node.default {
	  static endOfQuote(src, offset) {
	    let ch = src[offset];

	    while (ch) {
	      if (ch === "'") {
	        if (src[offset + 1] !== "'") break;
	        ch = src[offset += 2];
	      } else {
	        ch = src[offset += 1];
	      }
	    }

	    return offset + 1;
	  }
	  /**
	   * @returns {string | { str: string, errors: YAMLSyntaxError[] }}
	   */


	  get strValue() {
	    if (!this.valueRange || !this.context) return null;
	    const errors$1 = [];
	    const {
	      start,
	      end
	    } = this.valueRange;
	    const {
	      indent,
	      src
	    } = this.context;
	    if (src[end - 1] !== "'") errors$1.push(new errors.YAMLSyntaxError(this, "Missing closing 'quote"));
	    let str = '';

	    for (let i = start + 1; i < end - 1; ++i) {
	      const ch = src[i];

	      if (ch === '\n') {
	        if (_Node.default.atDocumentBoundary(src, i + 1)) errors$1.push(new errors.YAMLSemanticError(this, 'Document boundary indicators are not allowed within string values'));

	        const {
	          fold,
	          offset,
	          error
	        } = _Node.default.foldNewline(src, i, indent);

	        str += fold;
	        i = offset;
	        if (error) errors$1.push(new errors.YAMLSemanticError(this, 'Multi-line single-quoted string needs to be sufficiently indented'));
	      } else if (ch === "'") {
	        str += ch;
	        i += 1;
	        if (src[i] !== "'") errors$1.push(new errors.YAMLSyntaxError(this, 'Unescaped single quote? This should not happen.'));
	      } else if (ch === ' ' || ch === '\t') {
	        // trim trailing whitespace
	        const wsStart = i;
	        let next = src[i + 1];

	        while (next === ' ' || next === '\t') {
	          i += 1;
	          next = src[i + 1];
	        }

	        if (next !== '\n') str += i > wsStart ? src.slice(wsStart, i + 1) : ch;
	      } else {
	        str += ch;
	      }
	    }

	    return errors$1.length > 0 ? {
	      errors: errors$1,
	      str
	    } : str;
	  }
	  /**
	   * Parses a 'single quoted' value from the source
	   *
	   * @param {ParseContext} context
	   * @param {number} start - Index of first character
	   * @returns {number} - Index of the character after this scalar
	   */


	  parse(context, start) {
	    this.context = context;
	    const {
	      src
	    } = context;
	    let offset = QuoteSingle.endOfQuote(src, start + 1);
	    this.valueRange = new _Range.default(start, offset);
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    offset = this.parseComment(offset);
	    return offset;
	  }

	}

	exports.default = QuoteSingle;
	});

	unwrapExports(QuoteSingle_1);

	var ParseContext_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;





	var _Alias = _interopRequireDefault(Alias_1);

	var _BlockValue = _interopRequireDefault(BlockValue_1);

	var _Collection = _interopRequireDefault(Collection_1);

	var _CollectionItem = _interopRequireDefault(CollectionItem_1);

	var _FlowCollection = _interopRequireDefault(FlowCollection_1);

	var _Node = _interopRequireDefault(Node_1);

	var _PlainValue = _interopRequireDefault(PlainValue_1);

	var _QuoteDouble = _interopRequireDefault(QuoteDouble_1);

	var _QuoteSingle = _interopRequireDefault(QuoteSingle_1);

	var _Range = _interopRequireDefault(Range_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	/**
	 * @param {boolean} atLineStart - Node starts at beginning of line
	 * @param {boolean} inFlow - true if currently in a flow context
	 * @param {boolean} inCollection - true if currently in a collection context
	 * @param {number} indent - Current level of indentation
	 * @param {number} lineStart - Start of the current line
	 * @param {Node} parent - The parent of the node
	 * @param {string} src - Source of the YAML document
	 */
	class ParseContext {
	  static parseType(src, offset, inFlow) {
	    switch (src[offset]) {
	      case '*':
	        return constants.Type.ALIAS;

	      case '>':
	        return constants.Type.BLOCK_FOLDED;

	      case '|':
	        return constants.Type.BLOCK_LITERAL;

	      case '{':
	        return constants.Type.FLOW_MAP;

	      case '[':
	        return constants.Type.FLOW_SEQ;

	      case '?':
	        return !inFlow && _Node.default.atBlank(src, offset + 1, true) ? constants.Type.MAP_KEY : constants.Type.PLAIN;

	      case ':':
	        return !inFlow && _Node.default.atBlank(src, offset + 1, true) ? constants.Type.MAP_VALUE : constants.Type.PLAIN;

	      case '-':
	        return !inFlow && _Node.default.atBlank(src, offset + 1, true) ? constants.Type.SEQ_ITEM : constants.Type.PLAIN;

	      case '"':
	        return constants.Type.QUOTE_DOUBLE;

	      case "'":
	        return constants.Type.QUOTE_SINGLE;

	      default:
	        return constants.Type.PLAIN;
	    }
	  }

	  constructor(orig = {}, {
	    atLineStart,
	    inCollection,
	    inFlow,
	    indent,
	    lineStart,
	    parent
	  } = {}) {
	    _defineProperty(this, "parseNode", (overlay, start) => {
	      if (_Node.default.atDocumentBoundary(this.src, start)) return null;
	      const context = new ParseContext(this, overlay);
	      const {
	        props,
	        type,
	        valueStart
	      } = context.parseProps(start);
	      let node;

	      switch (type) {
	        case constants.Type.ALIAS:
	          node = new _Alias.default(type, props);
	          break;

	        case constants.Type.BLOCK_FOLDED:
	        case constants.Type.BLOCK_LITERAL:
	          node = new _BlockValue.default(type, props);
	          break;

	        case constants.Type.FLOW_MAP:
	        case constants.Type.FLOW_SEQ:
	          node = new _FlowCollection.default(type, props);
	          break;

	        case constants.Type.MAP_KEY:
	        case constants.Type.MAP_VALUE:
	        case constants.Type.SEQ_ITEM:
	          node = new _CollectionItem.default(type, props);
	          break;

	        case constants.Type.COMMENT:
	        case constants.Type.PLAIN:
	          node = new _PlainValue.default(type, props);
	          break;

	        case constants.Type.QUOTE_DOUBLE:
	          node = new _QuoteDouble.default(type, props);
	          break;

	        case constants.Type.QUOTE_SINGLE:
	          node = new _QuoteSingle.default(type, props);
	          break;

	        default:
	          node.error = new errors.YAMLSyntaxError(node, `Unknown node type: ${JSON.stringify(type)}`);
	          node.range = new _Range.default(start, start + 1);
	          return node;
	      }

	      let offset = node.parse(context, valueStart);
	      node.range = new _Range.default(start, offset);

	      if (offset <= start) {
	        node.error = new Error(`Node#parse consumed no characters`);
	        node.error.parseEnd = offset;
	        node.error.source = node;
	        node.range.end = start + 1;
	      }

	      if (context.nodeStartsCollection(node)) {
	        if (!node.error && !context.atLineStart && context.parent.type === constants.Type.DOCUMENT) {
	          node.error = new errors.YAMLSyntaxError(node, 'Block collection must not have preceding content here (e.g. directives-end indicator)');
	        }

	        const collection = new _Collection.default(node);
	        offset = collection.parse(new ParseContext(context), offset);
	        collection.range = new _Range.default(start, offset);
	        return collection;
	      }

	      return node;
	    });

	    this.atLineStart = atLineStart != null ? atLineStart : orig.atLineStart || false;
	    this.inCollection = inCollection != null ? inCollection : orig.inCollection || false;
	    this.inFlow = inFlow != null ? inFlow : orig.inFlow || false;
	    this.indent = indent != null ? indent : orig.indent;
	    this.lineStart = lineStart != null ? lineStart : orig.lineStart;
	    this.parent = parent != null ? parent : orig.parent || {};
	    this.root = orig.root;
	    this.src = orig.src;
	  } // for logging


	  get pretty() {
	    const obj = {
	      start: `${this.lineStart} + ${this.indent}`,
	      in: [],
	      parent: this.parent.type
	    };
	    if (!this.atLineStart) obj.start += ' + N';
	    if (this.inCollection) obj.in.push('collection');
	    if (this.inFlow) obj.in.push('flow');
	    return obj;
	  }

	  nodeStartsCollection(node) {
	    const {
	      inCollection,
	      inFlow,
	      src
	    } = this;
	    if (inCollection || inFlow) return false;
	    if (node instanceof _CollectionItem.default) return true; // check for implicit key

	    let offset = node.range.end;
	    if (src[offset] === '\n' || src[offset - 1] === '\n') return false;
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    return src[offset] === ':';
	  } // Anchor and tag are before type, which determines the node implementation
	  // class; hence this intermediate step.


	  parseProps(offset) {
	    const {
	      inFlow,
	      parent,
	      src
	    } = this;
	    const props = [];
	    let lineHasProps = false;
	    offset = _Node.default.endOfWhiteSpace(src, offset);
	    let ch = src[offset];

	    while (ch === constants.Char.ANCHOR || ch === constants.Char.COMMENT || ch === constants.Char.TAG || ch === '\n') {
	      if (ch === '\n') {
	        const lineStart = offset + 1;

	        const inEnd = _Node.default.endOfIndent(src, lineStart);

	        const indentDiff = inEnd - (lineStart + this.indent);
	        const noIndicatorAsIndent = parent.type === constants.Type.SEQ_ITEM && parent.context.atLineStart;
	        if (!_Node.default.nextNodeIsIndented(src[inEnd], indentDiff, !noIndicatorAsIndent)) break;
	        this.atLineStart = true;
	        this.lineStart = lineStart;
	        lineHasProps = false;
	        offset = inEnd;
	      } else if (ch === constants.Char.COMMENT) {
	        const end = _Node.default.endOfLine(src, offset + 1);

	        props.push(new _Range.default(offset, end));
	        offset = end;
	      } else {
	        let end = _Node.default.endOfIdentifier(src, offset + 1);

	        if (ch === constants.Char.TAG && src[end] === ',' && /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+,\d\d\d\d(-\d\d){0,2}\/\S/.test(src.slice(offset + 1, end + 13))) {
	          // Let's presume we're dealing with a YAML 1.0 domain tag here, rather
	          // than an empty but 'foo.bar' private-tagged node in a flow collection
	          // followed without whitespace by a plain string starting with a year
	          // or date divided by something.
	          end = _Node.default.endOfIdentifier(src, end + 5);
	        }

	        props.push(new _Range.default(offset, end));
	        lineHasProps = true;
	        offset = _Node.default.endOfWhiteSpace(src, end);
	      }

	      ch = src[offset];
	    } // '- &a : b' has an anchor on an empty node


	    if (lineHasProps && ch === ':' && _Node.default.atBlank(src, offset + 1, true)) offset -= 1;
	    const type = ParseContext.parseType(src, offset, inFlow);
	    return {
	      props,
	      type,
	      valueStart: offset
	    };
	  }
	  /**
	   * Parses a node from the source
	   * @param {ParseContext} overlay
	   * @param {number} start - Index of first non-whitespace character for the node
	   * @returns {?Node} - null if at a document boundary
	   */


	}

	exports.default = ParseContext;
	});

	unwrapExports(ParseContext_1);

	var parse_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = parse;

	var _Document = _interopRequireDefault(Document_1);

	var _ParseContext = _interopRequireDefault(ParseContext_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Published as 'yaml/parse-cst'
	function parse(src) {
	  const cr = [];

	  if (src.indexOf('\r') !== -1) {
	    src = src.replace(/\r\n?/g, (match, offset) => {
	      if (match.length > 1) cr.push(offset);
	      return '\n';
	    });
	  }

	  const documents = [];
	  let offset = 0;

	  do {
	    const doc = new _Document.default();
	    const context = new _ParseContext.default({
	      src
	    });
	    offset = doc.parse(context, offset);
	    documents.push(doc);
	  } while (offset < src.length);

	  documents.setOrigRanges = () => {
	    if (cr.length === 0) return false;

	    for (let i = 1; i < cr.length; ++i) cr[i] -= i;

	    let crOffset = 0;

	    for (let i = 0; i < documents.length; ++i) {
	      crOffset = documents[i].setOrigRanges(cr, crOffset);
	    }

	    cr.splice(0, cr.length);
	    return true;
	  };

	  documents.toString = () => documents.join('...\n');

	  return documents;
	}
	});

	unwrapExports(parse_1);

	var addComment_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.addCommentBefore = addCommentBefore;
	exports.default = addComment;

	function addCommentBefore(str, indent, comment) {
	  if (!comment) return str;
	  const cc = comment.replace(/[\s\S]^/gm, `$&${indent}#`);
	  return `#${cc}\n${indent}${str}`;
	}

	function addComment(str, indent, comment) {
	  return !comment ? str : comment.indexOf('\n') === -1 ? `${str} #${comment}` : `${str}\n` + comment.replace(/^/gm, `${indent || ''}#`);
	}
	});

	unwrapExports(addComment_1);
	var addComment_2 = addComment_1.addCommentBefore;

	var toJSON_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = toJSON;

	function toJSON(value, arg, ctx) {
	  if (Array.isArray(value)) return value.map((v, i) => toJSON(v, String(i), ctx));

	  if (value && typeof value.toJSON === 'function') {
	    const anchor = ctx && ctx.anchors && ctx.anchors.find(a => a.node === value);
	    if (anchor) ctx.onCreate = res => {
	      anchor.res = res;
	      delete ctx.onCreate;
	    };
	    const res = value.toJSON(arg, ctx);
	    if (anchor && ctx.onCreate) ctx.onCreate(res);
	    return res;
	  }

	  return value;
	}
	});

	unwrapExports(toJSON_1);

	var Node_1$1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	class Node {}

	exports.default = Node;
	});

	unwrapExports(Node_1$1);

	var Scalar_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _toJSON = _interopRequireDefault(toJSON_1);

	var _Node = _interopRequireDefault(Node_1$1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Published as 'yaml/scalar'
	class Scalar extends _Node.default {
	  constructor(value) {
	    super();
	    this.value = value;
	  }

	  toJSON(arg, ctx) {
	    return ctx && ctx.keep ? this.value : (0, _toJSON.default)(this.value, arg, ctx);
	  }

	  toString() {
	    return String(this.value);
	  }

	}

	exports.default = Scalar;
	});

	unwrapExports(Scalar_1);

	var Pair_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _addComment = _interopRequireDefault(addComment_1);



	var _toJSON = _interopRequireDefault(toJSON_1);

	var _Collection = _interopRequireDefault(Collection_1$1);

	var _Node = _interopRequireDefault(Node_1$1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Published as 'yaml/pair'
	const stringifyKey = (key, jsKey, ctx) => {
	  if (jsKey === null) return '';
	  if (typeof jsKey !== 'object') return String(jsKey);
	  if (key instanceof _Node.default && ctx && ctx.doc) return key.toString({
	    anchors: {},
	    doc: ctx.doc,
	    indent: '',
	    inFlow: true,
	    inStringifyKey: true
	  });
	  return JSON.stringify(jsKey);
	};

	class Pair extends _Node.default {
	  constructor(key, value = null) {
	    super();
	    this.key = key;
	    this.value = value;
	    this.type = 'PAIR';
	  }

	  get commentBefore() {
	    return this.key && this.key.commentBefore;
	  }

	  set commentBefore(cb) {
	    if (this.key == null) this.key = new _Scalar.default(null);
	    this.key.commentBefore = cb;
	  }

	  addToJSMap(ctx, map) {
	    const key = (0, _toJSON.default)(this.key, '', ctx);

	    if (map instanceof Map) {
	      const value = (0, _toJSON.default)(this.value, key, ctx);
	      map.set(key, value);
	    } else if (map instanceof Set) {
	      map.add(key);
	    } else {
	      const stringKey = stringifyKey(this.key, key, ctx);
	      map[stringKey] = (0, _toJSON.default)(this.value, stringKey, ctx);
	    }

	    return map;
	  }

	  toJSON(_, ctx) {
	    const pair = ctx && ctx.mapAsMap ? new Map() : {};
	    return this.addToJSMap(ctx, pair);
	  }

	  toString(ctx, onComment, onChompKeep) {
	    if (!ctx || !ctx.doc) return JSON.stringify(this);
	    const {
	      simpleKeys
	    } = ctx.doc.options;
	    let {
	      key,
	      value
	    } = this;
	    let keyComment = key instanceof _Node.default && key.comment;

	    if (simpleKeys) {
	      if (keyComment) {
	        throw new Error('With simple keys, key nodes cannot have comments');
	      }

	      if (key instanceof _Collection.default) {
	        const msg = 'With simple keys, collection cannot be used as a key value';
	        throw new Error(msg);
	      }
	    }

	    const explicitKey = !simpleKeys && (!key || keyComment || key instanceof _Collection.default || key.type === constants.Type.BLOCK_FOLDED || key.type === constants.Type.BLOCK_LITERAL);
	    const {
	      doc,
	      indent
	    } = ctx;
	    ctx = Object.assign({}, ctx, {
	      implicitKey: !explicitKey,
	      indent: indent + '  '
	    });
	    let chompKeep = false;
	    let str = doc.schema.stringify(key, ctx, () => keyComment = null, () => chompKeep = true);
	    str = (0, _addComment.default)(str, ctx.indent, keyComment);

	    if (ctx.allNullValues && !simpleKeys) {
	      if (this.comment) {
	        str = (0, _addComment.default)(str, ctx.indent, this.comment);
	        if (onComment) onComment();
	      } else if (chompKeep && !keyComment && onChompKeep) onChompKeep();

	      return ctx.inFlow ? str : `? ${str}`;
	    }

	    str = explicitKey ? `? ${str}\n${indent}:` : `${str}:`;

	    if (this.comment) {
	      // expected (but not strictly required) to be a single-line comment
	      str = (0, _addComment.default)(str, ctx.indent, this.comment);
	      if (onComment) onComment();
	    }

	    let vcb = '';
	    let valueComment = null;

	    if (value instanceof _Node.default) {
	      if (value.spaceBefore) vcb = '\n';

	      if (value.commentBefore) {
	        const cs = value.commentBefore.replace(/^/gm, `${ctx.indent}#`);
	        vcb += `\n${cs}`;
	      }

	      valueComment = value.comment;
	    } else if (value && typeof value === 'object') {
	      value = doc.schema.createNode(value, true);
	    }

	    ctx.implicitKey = false;
	    chompKeep = false;
	    const valueStr = doc.schema.stringify(value, ctx, () => valueComment = null, () => chompKeep = true);
	    let ws = ' ';

	    if (vcb || this.comment) {
	      ws = `${vcb}\n${ctx.indent}`;
	    } else if (!explicitKey && value instanceof _Collection.default) {
	      const flow = valueStr[0] === '[' || valueStr[0] === '{';
	      if (!flow || valueStr.includes('\n')) ws = `\n${ctx.indent}`;
	    }

	    if (chompKeep && !valueComment && onChompKeep) onChompKeep();
	    return (0, _addComment.default)(str + ws + valueStr, ctx.indent, valueComment);
	  }

	}

	exports.default = Pair;
	});

	unwrapExports(Pair_1);

	var Collection_1$1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.isEmptyPath = void 0;

	var _addComment = _interopRequireDefault(addComment_1);

	var _Node = _interopRequireDefault(Node_1$1);

	var _Pair = _interopRequireDefault(Pair_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	// null, undefined, or an empty non-string iterable (e.g. [])
	const isEmptyPath = path => path == null || typeof path === 'object' && path[Symbol.iterator]().next().done;

	exports.isEmptyPath = isEmptyPath;

	class Collection extends _Node.default {
	  constructor(...args) {
	    super(...args);

	    _defineProperty(this, "items", []);
	  }

	  addIn(path, value) {
	    if (isEmptyPath(path)) this.add(value);else {
	      const [key, ...rest] = path;
	      const node = this.get(key, true);
	      if (node instanceof Collection) node.addIn(rest, value);else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
	    }
	  }

	  deleteIn([key, ...rest]) {
	    if (rest.length === 0) return this.delete(key);
	    const node = this.get(key, true);
	    if (node instanceof Collection) return node.deleteIn(rest);else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
	  }

	  getIn([key, ...rest], keepScalar) {
	    const node = this.get(key, true);
	    if (rest.length === 0) return !keepScalar && node instanceof _Scalar.default ? node.value : node;else return node instanceof Collection ? node.getIn(rest, keepScalar) : undefined;
	  }

	  hasAllNullValues() {
	    return this.items.every(node => {
	      if (!(node instanceof _Pair.default)) return false;
	      const n = node.value;
	      return n == null || n instanceof _Scalar.default && n.value == null && !n.commentBefore && !n.comment && !n.tag;
	    });
	  }

	  hasIn([key, ...rest]) {
	    if (rest.length === 0) return this.has(key);
	    const node = this.get(key, true);
	    return node instanceof Collection ? node.hasIn(rest) : false;
	  }

	  setIn([key, ...rest], value) {
	    if (rest.length === 0) {
	      this.set(key, value);
	    } else {
	      const node = this.get(key, true);
	      if (node instanceof Collection) node.setIn(rest, value);else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
	    }
	  } // overridden in implementations


	  toJSON() {
	    return null;
	  }

	  toString(ctx, {
	    blockItem,
	    flowChars,
	    isMap,
	    itemIndent
	  }, onComment, onChompKeep) {
	    const {
	      doc,
	      indent
	    } = ctx;
	    const inFlow = this.type && this.type.substr(0, 4) === 'FLOW' || ctx.inFlow;
	    if (inFlow) itemIndent += '  ';
	    const allNullValues = isMap && this.hasAllNullValues();
	    ctx = Object.assign({}, ctx, {
	      allNullValues,
	      indent: itemIndent,
	      inFlow,
	      type: null
	    });
	    let chompKeep = false;
	    let hasItemWithNewLine = false;
	    const nodes = this.items.reduce((nodes, item, i) => {
	      let comment;

	      if (item) {
	        if (!chompKeep && item.spaceBefore) nodes.push({
	          type: 'comment',
	          str: ''
	        });
	        if (item.commentBefore) item.commentBefore.match(/^.*$/gm).forEach(line => {
	          nodes.push({
	            type: 'comment',
	            str: `#${line}`
	          });
	        });
	        if (item.comment) comment = item.comment;
	        if (inFlow && (!chompKeep && item.spaceBefore || item.commentBefore || item.comment || item.key && (item.key.commentBefore || item.key.comment) || item.value && (item.value.commentBefore || item.value.comment))) hasItemWithNewLine = true;
	      }

	      chompKeep = false;
	      let str = doc.schema.stringify(item, ctx, () => comment = null, () => chompKeep = true);
	      if (inFlow && !hasItemWithNewLine && str.includes('\n')) hasItemWithNewLine = true;
	      if (inFlow && i < this.items.length - 1) str += ',';
	      str = (0, _addComment.default)(str, itemIndent, comment);
	      if (chompKeep && (comment || inFlow)) chompKeep = false;
	      nodes.push({
	        type: 'item',
	        str
	      });
	      return nodes;
	    }, []);
	    let str;

	    if (nodes.length === 0) {
	      str = flowChars.start + flowChars.end;
	    } else if (inFlow) {
	      const {
	        start,
	        end
	      } = flowChars;
	      const strings = nodes.map(n => n.str);

	      if (hasItemWithNewLine || strings.reduce((sum, str) => sum + str.length + 2, 2) > Collection.maxFlowStringSingleLineLength) {
	        str = start;

	        for (const s of strings) {
	          str += s ? `\n  ${indent}${s}` : '\n';
	        }

	        str += `\n${indent}${end}`;
	      } else {
	        str = `${start} ${strings.join(' ')} ${end}`;
	      }
	    } else {
	      const strings = nodes.map(blockItem);
	      str = strings.shift();

	      for (const s of strings) str += s ? `\n${indent}${s}` : '\n';
	    }

	    if (this.comment) {
	      str += '\n' + this.comment.replace(/^/gm, `${indent}#`);
	      if (onComment) onComment();
	    } else if (chompKeep && onChompKeep) onChompKeep();

	    return str;
	  }

	}

	exports.default = Collection;

	_defineProperty(Collection, "maxFlowStringSingleLineLength", 60);
	});

	unwrapExports(Collection_1$1);
	var Collection_2$1 = Collection_1$1.isEmptyPath;

	var Alias_1$1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;





	var _toJSON = _interopRequireDefault(toJSON_1);

	var _Collection = _interopRequireDefault(Collection_1$1);

	var _Node = _interopRequireDefault(Node_1$1);

	var _Pair = _interopRequireDefault(Pair_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	const getAliasCount = (node, anchors) => {
	  if (node instanceof Alias) {
	    const anchor = anchors.find(a => a.node === node.source);
	    return anchor.count * anchor.aliasCount;
	  } else if (node instanceof _Collection.default) {
	    let count = 0;

	    for (const item of node.items) {
	      const c = getAliasCount(item, anchors);
	      if (c > count) count = c;
	    }

	    return count;
	  } else if (node instanceof _Pair.default) {
	    const kc = getAliasCount(node.key, anchors);
	    const vc = getAliasCount(node.value, anchors);
	    return Math.max(kc, vc);
	  }

	  return 1;
	};

	class Alias extends _Node.default {
	  static stringify({
	    range,
	    source
	  }, {
	    anchors,
	    doc,
	    implicitKey,
	    inStringifyKey
	  }) {
	    let anchor = Object.keys(anchors).find(a => anchors[a] === source);
	    if (!anchor && inStringifyKey) anchor = doc.anchors.getName(source) || doc.anchors.newName();
	    if (anchor) return `*${anchor}${implicitKey ? ' ' : ''}`;
	    const msg = doc.anchors.getName(source) ? 'Alias node must be after source node' : 'Source node not found for alias node';
	    throw new Error(`${msg} [${range}]`);
	  }

	  constructor(source) {
	    super();
	    this.source = source;
	    this.type = constants.Type.ALIAS;
	  }

	  set tag(t) {
	    throw new Error('Alias nodes cannot have tags');
	  }

	  toJSON(arg, ctx) {
	    if (!ctx) return (0, _toJSON.default)(this.source, arg, ctx);
	    const {
	      anchors,
	      maxAliasCount
	    } = ctx;
	    const anchor = anchors.find(a => a.node === this.source);

	    if (!anchor || anchor.res === undefined) {
	      const msg = 'This should not happen: Alias anchor was not resolved?';
	      if (this.cstNode) throw new errors.YAMLReferenceError(this.cstNode, msg);else throw new ReferenceError(msg);
	    }

	    if (maxAliasCount >= 0) {
	      anchor.count += 1;
	      if (anchor.aliasCount === 0) anchor.aliasCount = getAliasCount(this.source, anchors);

	      if (anchor.count * anchor.aliasCount > maxAliasCount) {
	        const msg = 'Excessive alias count indicates a resource exhaustion attack';
	        if (this.cstNode) throw new errors.YAMLReferenceError(this.cstNode, msg);else throw new ReferenceError(msg);
	      }
	    }

	    return anchor.res;
	  } // Only called when stringifying an alias mapping key while constructing
	  // Object output.


	  toString(ctx) {
	    return Alias.stringify(this, ctx);
	  }

	}

	exports.default = Alias;

	_defineProperty(Alias, "default", true);
	});

	unwrapExports(Alias_1$1);

	var _Map = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.findPair = findPair;
	exports.default = void 0;

	var _Collection = _interopRequireDefault(Collection_1$1);

	var _Pair = _interopRequireDefault(Pair_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function findPair(items, key) {
	  const k = key instanceof _Scalar.default ? key.value : key;

	  for (const it of items) {
	    if (it instanceof _Pair.default) {
	      if (it.key === key || it.key === k) return it;
	      if (it.key && it.key.value === k) return it;
	    }
	  }

	  return undefined;
	}

	class YAMLMap extends _Collection.default {
	  add(pair) {
	    if (!pair) pair = new _Pair.default(pair);else if (!(pair instanceof _Pair.default)) pair = new _Pair.default(pair.key || pair, pair.value);
	    const prev = findPair(this.items, pair.key);
	    if (prev) throw new Error(`Key ${pair.key} already set`);
	    this.items.push(pair);
	  }

	  delete(key) {
	    const it = findPair(this.items, key);
	    if (!it) return false;
	    const del = this.items.splice(this.items.indexOf(it), 1);
	    return del.length > 0;
	  }

	  get(key, keepScalar) {
	    const it = findPair(this.items, key);
	    const node = it && it.value;
	    return !keepScalar && node instanceof _Scalar.default ? node.value : node;
	  }

	  has(key) {
	    return !!findPair(this.items, key);
	  }

	  set(key, value) {
	    const prev = findPair(this.items, key);
	    if (prev) prev.value = value;else this.items.push(new _Pair.default(key, value));
	  }
	  /**
	   * @param {*} arg ignored
	   * @param {*} ctx Conversion context, originally set in Document#toJSON()
	   * @param {Class} Type If set, forces the returned collection type
	   * @returns {*} Instance of Type, Map, or Object
	   */


	  toJSON(_, ctx, Type) {
	    const map = Type ? new Type() : ctx && ctx.mapAsMap ? new Map() : {};
	    if (ctx && ctx.onCreate) ctx.onCreate(map);

	    for (const item of this.items) item.addToJSMap(ctx, map);

	    return map;
	  }

	  toString(ctx, onComment, onChompKeep) {
	    if (!ctx) return JSON.stringify(this);

	    for (const item of this.items) {
	      if (!(item instanceof _Pair.default)) throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
	    }

	    return super.toString(ctx, {
	      blockItem: n => n.str,
	      flowChars: {
	        start: '{',
	        end: '}'
	      },
	      isMap: true,
	      itemIndent: ctx.indent || ''
	    }, onComment, onChompKeep);
	  }

	}

	exports.default = YAMLMap;
	});

	unwrapExports(_Map);
	var _Map_1 = _Map.findPair;

	var Seq = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _toJSON = _interopRequireDefault(toJSON_1);

	var _Collection = _interopRequireDefault(Collection_1$1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Published as 'yaml/seq'
	function asItemIndex(key) {
	  let idx = key instanceof _Scalar.default ? key.value : key;
	  if (idx && typeof idx === 'string') idx = Number(idx);
	  return Number.isInteger(idx) && idx >= 0 ? idx : null;
	}

	class YAMLSeq extends _Collection.default {
	  add(value) {
	    this.items.push(value);
	  }

	  delete(key) {
	    const idx = asItemIndex(key);
	    if (typeof idx !== 'number') return false;
	    const del = this.items.splice(idx, 1);
	    return del.length > 0;
	  }

	  get(key, keepScalar) {
	    const idx = asItemIndex(key);
	    if (typeof idx !== 'number') return undefined;
	    const it = this.items[idx];
	    return !keepScalar && it instanceof _Scalar.default ? it.value : it;
	  }

	  has(key) {
	    const idx = asItemIndex(key);
	    return typeof idx === 'number' && idx < this.items.length;
	  }

	  set(key, value) {
	    const idx = asItemIndex(key);
	    if (typeof idx !== 'number') throw new Error(`Expected a valid index, not ${key}.`);
	    this.items[idx] = value;
	  }

	  toJSON(_, ctx) {
	    const seq = [];
	    if (ctx && ctx.onCreate) ctx.onCreate(seq);
	    let i = 0;

	    for (const item of this.items) seq.push((0, _toJSON.default)(item, String(i++), ctx));

	    return seq;
	  }

	  toString(ctx, onComment, onChompKeep) {
	    if (!ctx) return JSON.stringify(this);
	    return super.toString(ctx, {
	      blockItem: n => n.type === 'comment' ? n.str : `- ${n.str}`,
	      flowChars: {
	        start: '[',
	        end: ']'
	      },
	      isMap: false,
	      itemIndent: (ctx.indent || '') + '  '
	    }, onComment, onChompKeep);
	  }

	}

	exports.default = YAMLSeq;
	});

	unwrapExports(Seq);

	var Merge_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.MERGE_KEY = void 0;

	var _Map$1 = _interopRequireDefault(_Map);

	var _Pair = _interopRequireDefault(Pair_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	var _Seq = _interopRequireDefault(Seq);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const MERGE_KEY = '<<';
	exports.MERGE_KEY = MERGE_KEY;

	class Merge extends _Pair.default {
	  constructor(pair) {
	    if (pair instanceof _Pair.default) {
	      let seq = pair.value;

	      if (!(seq instanceof _Seq.default)) {
	        seq = new _Seq.default();
	        seq.items.push(pair.value);
	        seq.range = pair.value.range;
	      }

	      super(pair.key, seq);
	      this.range = pair.range;
	    } else {
	      super(new _Scalar.default(MERGE_KEY), new _Seq.default());
	    }

	    this.type = 'MERGE_PAIR';
	  } // If the value associated with a merge key is a single mapping node, each of
	  // its key/value pairs is inserted into the current mapping, unless the key
	  // already exists in it. If the value associated with the merge key is a
	  // sequence, then this sequence is expected to contain mapping nodes and each
	  // of these nodes is merged in turn according to its order in the sequence.
	  // Keys in mapping nodes earlier in the sequence override keys specified in
	  // later mapping nodes. -- http://yaml.org/type/merge.html


	  addToJSMap(ctx, map) {
	    for (const {
	      source
	    } of this.value.items) {
	      if (!(source instanceof _Map$1.default)) throw new Error('Merge sources must be maps');
	      const srcMap = source.toJSON(null, ctx, Map);

	      for (const [key, value] of srcMap) {
	        if (map instanceof Map) {
	          if (!map.has(key)) map.set(key, value);
	        } else if (map instanceof Set) {
	          map.add(key);
	        } else {
	          if (!Object.prototype.hasOwnProperty.call(map, key)) map[key] = value;
	        }
	      }
	    }

	    return map;
	  }

	  toString(ctx, onComment) {
	    const seq = this.value;
	    if (seq.items.length > 1) return super.toString(ctx, onComment);
	    this.value = seq.items[0];
	    const str = super.toString(ctx, onComment);
	    this.value = seq;
	    return str;
	  }

	}

	exports.default = Merge;
	});

	unwrapExports(Merge_1);
	var Merge_2 = Merge_1.MERGE_KEY;

	var Anchors_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Alias = _interopRequireDefault(Alias_1$1);

	var _Map$1 = _interopRequireDefault(_Map);

	var _Merge = _interopRequireDefault(Merge_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	var _Seq = _interopRequireDefault(Seq);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	class Anchors {
	  static validAnchorNode(node) {
	    return node instanceof _Scalar.default || node instanceof _Seq.default || node instanceof _Map$1.default;
	  }

	  constructor(prefix) {
	    _defineProperty(this, "map", {});

	    this.prefix = prefix;
	  }

	  createAlias(node, name) {
	    this.setAnchor(node, name);
	    return new _Alias.default(node);
	  }

	  createMergePair(...sources) {
	    const merge = new _Merge.default();
	    merge.value.items = sources.map(s => {
	      if (s instanceof _Alias.default) {
	        if (s.source instanceof _Map$1.default) return s;
	      } else if (s instanceof _Map$1.default) {
	        return this.createAlias(s);
	      }

	      throw new Error('Merge sources must be Map nodes or their Aliases');
	    });
	    return merge;
	  }

	  getName(node) {
	    const {
	      map
	    } = this;
	    return Object.keys(map).find(a => map[a] === node);
	  }

	  getNode(name) {
	    return this.map[name];
	  }

	  newName(prefix) {
	    if (!prefix) prefix = this.prefix;
	    const names = Object.keys(this.map);

	    for (let i = 1; true; ++i) {
	      const name = `${prefix}${i}`;
	      if (!names.includes(name)) return name;
	    }
	  } // During parsing, map & aliases contain CST nodes


	  resolveNodes() {
	    const {
	      map,
	      _cstAliases
	    } = this;
	    Object.keys(map).forEach(a => {
	      map[a] = map[a].resolved;
	    });

	    _cstAliases.forEach(a => {
	      a.source = a.source.resolved;
	    });

	    delete this._cstAliases;
	  }

	  setAnchor(node, name) {
	    if (node != null && !Anchors.validAnchorNode(node)) {
	      throw new Error('Anchors may only be set for Scalar, Seq and Map nodes');
	    }

	    if (name && /[\x00-\x19\s,[\]{}]/.test(name)) {
	      throw new Error('Anchor names must not contain whitespace or control characters');
	    }

	    const {
	      map
	    } = this;
	    const prev = node && Object.keys(map).find(a => map[a] === node);

	    if (prev) {
	      if (!name) {
	        return prev;
	      } else if (prev !== name) {
	        delete map[prev];
	        map[name] = node;
	      }
	    } else {
	      if (!name) {
	        if (!node) return null;
	        name = this.newName();
	      }

	      map[name] = node;
	    }

	    return name;
	  }

	}

	exports.default = Anchors;
	});

	unwrapExports(Anchors_1);

	var listTagNames = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Collection = _interopRequireDefault(Collection_1$1);

	var _Pair = _interopRequireDefault(Pair_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const visit = (node, tags) => {
	  if (node && typeof node === 'object') {
	    const {
	      tag
	    } = node;

	    if (node instanceof _Collection.default) {
	      if (tag) tags[tag] = true;
	      node.items.forEach(n => visit(n, tags));
	    } else if (node instanceof _Pair.default) {
	      visit(node.key, tags);
	      visit(node.value, tags);
	    } else if (node instanceof _Scalar.default) {
	      if (tag) tags[tag] = true;
	    }
	  }

	  return tags;
	};

	var _default = node => Object.keys(visit(node, {}));

	exports.default = _default;
	});

	unwrapExports(listTagNames);

	var warnings = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.warn = warn;
	exports.warnFileDeprecation = warnFileDeprecation;
	exports.warnOptionDeprecation = warnOptionDeprecation;

	/* global global, console */
	function warn(warning, type) {
	  if (commonjsGlobal && commonjsGlobal._YAML_SILENCE_WARNINGS) return;
	  const {
	    emitWarning
	  } = commonjsGlobal && commonjsGlobal.process; // This will throw in Jest if `warning` is an Error instance due to
	  // https://github.com/facebook/jest/issues/2549

	  if (emitWarning) emitWarning(warning, type);else {
	    // eslint-disable-next-line no-console
	    console.warn(type ? `${type}: ${warning}` : warning);
	  }
	}

	function warnFileDeprecation(filename) {
	  if (commonjsGlobal && commonjsGlobal._YAML_SILENCE_DEPRECATION_WARNINGS) return;
	  const path = filename.replace(/.*yaml[/\\]/i, '').replace(/\.js$/, '').replace(/\\/g, '/');
	  warn(`The endpoint 'yaml/${path}' will be removed in a future release.`, 'DeprecationWarning');
	}

	const warned = {};

	function warnOptionDeprecation(name, alternative) {
	  if (commonjsGlobal && commonjsGlobal._YAML_SILENCE_DEPRECATION_WARNINGS) return;
	  if (warned[name]) return;
	  warned[name] = true;
	  let msg = `The option '${name}' will be removed in a future release`;
	  msg += alternative ? `, use '${alternative}' instead.` : '.';
	  warn(msg, 'DeprecationWarning');
	}
	});

	unwrapExports(warnings);
	var warnings_1 = warnings.warn;
	var warnings_2 = warnings.warnFileDeprecation;
	var warnings_3 = warnings.warnOptionDeprecation;

	var foldFlowLines_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = foldFlowLines;
	exports.FOLD_QUOTED = exports.FOLD_BLOCK = exports.FOLD_FLOW = void 0;
	const FOLD_FLOW = 'flow';
	exports.FOLD_FLOW = FOLD_FLOW;
	const FOLD_BLOCK = 'block';
	exports.FOLD_BLOCK = FOLD_BLOCK;
	const FOLD_QUOTED = 'quoted'; // presumes i+1 is at the start of a line
	// returns index of last newline in more-indented block

	exports.FOLD_QUOTED = FOLD_QUOTED;

	const consumeMoreIndentedLines = (text, i) => {
	  let ch = text[i + 1];

	  while (ch === ' ' || ch === '\t') {
	    do {
	      ch = text[i += 1];
	    } while (ch && ch !== '\n');

	    ch = text[i + 1];
	  }

	  return i;
	};
	/**
	 * Tries to keep input at up to `lineWidth` characters, splitting only on spaces
	 * not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
	 * terminated with `\n` and started with `indent`.
	 *
	 * @param {string} text
	 * @param {string} indent
	 * @param {string} [mode='flow'] `'block'` prevents more-indented lines
	 *   from being folded; `'quoted'` allows for `\` escapes, including escaped
	 *   newlines
	 * @param {Object} options
	 * @param {number} [options.indentAtStart] Accounts for leading contents on
	 *   the first line, defaulting to `indent.length`
	 * @param {number} [options.lineWidth=80]
	 * @param {number} [options.minContentWidth=20] Allow highly indented lines to
	 *   stretch the line width
	 * @param {function} options.onFold Called once if the text is folded
	 * @param {function} options.onFold Called once if any line of text exceeds
	 *   lineWidth characters
	 */


	function foldFlowLines(text, indent, mode, {
	  indentAtStart,
	  lineWidth = 80,
	  minContentWidth = 20,
	  onFold,
	  onOverflow
	}) {
	  if (!lineWidth || lineWidth < 0) return text;
	  const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
	  if (text.length <= endStep) return text;
	  const folds = [];
	  const escapedFolds = {};
	  let end = lineWidth - (typeof indentAtStart === 'number' ? indentAtStart : indent.length);
	  let split = undefined;
	  let prev = undefined;
	  let overflow = false;
	  let i = -1;

	  if (mode === FOLD_BLOCK) {
	    i = consumeMoreIndentedLines(text, i);
	    if (i !== -1) end = i + endStep;
	  }

	  for (let ch; ch = text[i += 1];) {
	    if (mode === FOLD_QUOTED && ch === '\\') {
	      switch (text[i + 1]) {
	        case 'x':
	          i += 3;
	          break;

	        case 'u':
	          i += 5;
	          break;

	        case 'U':
	          i += 9;
	          break;

	        default:
	          i += 1;
	      }
	    }

	    if (ch === '\n') {
	      if (mode === FOLD_BLOCK) i = consumeMoreIndentedLines(text, i);
	      end = i + endStep;
	      split = undefined;
	    } else {
	      if (ch === ' ' && prev && prev !== ' ' && prev !== '\n' && prev !== '\t') {
	        // space surrounded by non-space can be replaced with newline + indent
	        const next = text[i + 1];
	        if (next && next !== ' ' && next !== '\n' && next !== '\t') split = i;
	      }

	      if (i >= end) {
	        if (split) {
	          folds.push(split);
	          end = split + endStep;
	          split = undefined;
	        } else if (mode === FOLD_QUOTED) {
	          // white-space collected at end may stretch past lineWidth
	          while (prev === ' ' || prev === '\t') {
	            prev = ch;
	            ch = text[i += 1];
	            overflow = true;
	          } // i - 2 accounts for not-dropped last char + newline-escaping \


	          folds.push(i - 2);
	          escapedFolds[i - 2] = true;
	          end = i - 2 + endStep;
	          split = undefined;
	        } else {
	          overflow = true;
	        }
	      }
	    }

	    prev = ch;
	  }

	  if (overflow && onOverflow) onOverflow();
	  if (folds.length === 0) return text;
	  if (onFold) onFold();
	  let res = text.slice(0, folds[0]);

	  for (let i = 0; i < folds.length; ++i) {
	    const fold = folds[i];
	    const end = folds[i + 1] || text.length;
	    if (mode === FOLD_QUOTED && escapedFolds[fold]) res += `${text[fold]}\\`;
	    res += `\n${indent}${text.slice(fold + 1, end)}`;
	  }

	  return res;
	}
	});

	unwrapExports(foldFlowLines_1);
	var foldFlowLines_2 = foldFlowLines_1.FOLD_QUOTED;
	var foldFlowLines_3 = foldFlowLines_1.FOLD_BLOCK;
	var foldFlowLines_4 = foldFlowLines_1.FOLD_FLOW;

	var options = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.strOptions = exports.nullOptions = exports.boolOptions = exports.binaryOptions = void 0;



	const binaryOptions = {
	  defaultType: constants.Type.BLOCK_LITERAL,
	  lineWidth: 76
	};
	exports.binaryOptions = binaryOptions;
	const boolOptions = {
	  trueStr: 'true',
	  falseStr: 'false'
	};
	exports.boolOptions = boolOptions;
	const nullOptions = {
	  nullStr: 'null'
	};
	exports.nullOptions = nullOptions;
	const strOptions = {
	  defaultType: constants.Type.PLAIN,
	  doubleQuoted: {
	    jsonEncoding: false,
	    minMultiLineLength: 40
	  },
	  fold: {
	    lineWidth: 80,
	    minContentWidth: 20
	  }
	};
	exports.strOptions = strOptions;
	});

	unwrapExports(options);
	var options_1 = options.strOptions;
	var options_2 = options.nullOptions;
	var options_3 = options.boolOptions;
	var options_4 = options.binaryOptions;

	var stringify = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.stringifyNumber = stringifyNumber;
	exports.stringifyString = stringifyString;





	var _foldFlowLines = _interopRequireWildcard(foldFlowLines_1);



	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function stringifyNumber({
	  format,
	  minFractionDigits,
	  tag,
	  value
	}) {
	  if (!isFinite(value)) return isNaN(value) ? '.nan' : value < 0 ? '-.inf' : '.inf';
	  let n = JSON.stringify(value);

	  if (!format && minFractionDigits && (!tag || tag === 'tag:yaml.org,2002:float') && /^\d/.test(n)) {
	    let i = n.indexOf('.');

	    if (i < 0) {
	      i = n.length;
	      n += '.';
	    }

	    let d = minFractionDigits - (n.length - i - 1);

	    while (d-- > 0) n += '0';
	  }

	  return n;
	}

	function lineLengthOverLimit(str, limit) {
	  const strLen = str.length;
	  if (strLen <= limit) return false;

	  for (let i = 0, start = 0; i < strLen; ++i) {
	    if (str[i] === '\n') {
	      if (i - start > limit) return true;
	      start = i + 1;
	      if (strLen - start <= limit) return false;
	    }
	  }

	  return true;
	}

	function doubleQuotedString(value, {
	  implicitKey,
	  indent
	}) {
	  const {
	    jsonEncoding,
	    minMultiLineLength
	  } = options.strOptions.doubleQuoted;
	  const json = JSON.stringify(value);
	  if (jsonEncoding) return json;
	  let str = '';
	  let start = 0;

	  for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
	    if (ch === ' ' && json[i + 1] === '\\' && json[i + 2] === 'n') {
	      // space before newline needs to be escaped to not be folded
	      str += json.slice(start, i) + '\\ ';
	      i += 1;
	      start = i;
	      ch = '\\';
	    }

	    if (ch === '\\') switch (json[i + 1]) {
	      case 'u':
	        {
	          str += json.slice(start, i);
	          const code = json.substr(i + 2, 4);

	          switch (code) {
	            case '0000':
	              str += '\\0';
	              break;

	            case '0007':
	              str += '\\a';
	              break;

	            case '000b':
	              str += '\\v';
	              break;

	            case '001b':
	              str += '\\e';
	              break;

	            case '0085':
	              str += '\\N';
	              break;

	            case '00a0':
	              str += '\\_';
	              break;

	            case '2028':
	              str += '\\L';
	              break;

	            case '2029':
	              str += '\\P';
	              break;

	            default:
	              if (code.substr(0, 2) === '00') str += '\\x' + code.substr(2);else str += json.substr(i, 6);
	          }

	          i += 5;
	          start = i + 1;
	        }
	        break;

	      case 'n':
	        if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
	          i += 1;
	        } else {
	          // folding will eat first newline
	          str += json.slice(start, i) + '\n\n';

	          while (json[i + 2] === '\\' && json[i + 3] === 'n' && json[i + 4] !== '"') {
	            str += '\n';
	            i += 2;
	          }

	          str += indent; // space after newline needs to be escaped to not be folded

	          if (json[i + 2] === ' ') str += '\\';
	          i += 1;
	          start = i + 1;
	        }

	        break;

	      default:
	        i += 1;
	    }
	  }

	  str = start ? str + json.slice(start) : json;
	  return implicitKey ? str : (0, _foldFlowLines.default)(str, indent, _foldFlowLines.FOLD_QUOTED, options.strOptions.fold);
	}

	function singleQuotedString(value, ctx) {
	  const {
	    indent,
	    implicitKey
	  } = ctx;

	  if (implicitKey) {
	    if (/\n/.test(value)) return doubleQuotedString(value, ctx);
	  } else {
	    // single quoted string can't have leading or trailing whitespace around newline
	    if (/[ \t]\n|\n[ \t]/.test(value)) return doubleQuotedString(value, ctx);
	  }

	  const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
	  return implicitKey ? res : (0, _foldFlowLines.default)(res, indent, _foldFlowLines.FOLD_FLOW, options.strOptions.fold);
	}

	function blockString({
	  comment,
	  type,
	  value
	}, ctx, onComment, onChompKeep) {
	  // 1. Block can't end in whitespace unless the last line is non-empty.
	  // 2. Strings consisting of only whitespace are best rendered explicitly.
	  if (/\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
	    return doubleQuotedString(value, ctx);
	  }

	  const indent = ctx.indent || (ctx.forceBlockIndent ? ' ' : '');
	  const indentSize = indent ? '2' : '1'; // root is at -1

	  const literal = type === constants.Type.BLOCK_FOLDED ? false : type === constants.Type.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, options.strOptions.fold.lineWidth - indent.length);
	  let header = literal ? '|' : '>';
	  if (!value) return header + '\n';
	  let wsStart = '';
	  let wsEnd = '';
	  value = value.replace(/[\n\t ]*$/, ws => {
	    const n = ws.indexOf('\n');

	    if (n === -1) {
	      header += '-'; // strip
	    } else if (value === ws || n !== ws.length - 1) {
	      header += '+'; // keep

	      if (onChompKeep) onChompKeep();
	    }

	    wsEnd = ws.replace(/\n$/, '');
	    return '';
	  }).replace(/^[\n ]*/, ws => {
	    if (ws.indexOf(' ') !== -1) header += indentSize;
	    const m = ws.match(/ +$/);

	    if (m) {
	      wsStart = ws.slice(0, -m[0].length);
	      return m[0];
	    } else {
	      wsStart = ws;
	      return '';
	    }
	  });
	  if (wsEnd) wsEnd = wsEnd.replace(/\n+(?!\n|$)/g, `$&${indent}`);
	  if (wsStart) wsStart = wsStart.replace(/\n+/g, `$&${indent}`);

	  if (comment) {
	    header += ' #' + comment.replace(/ ?[\r\n]+/g, ' ');
	    if (onComment) onComment();
	  }

	  if (!value) return `${header}${indentSize}\n${indent}${wsEnd}`;

	  if (literal) {
	    value = value.replace(/\n+/g, `$&${indent}`);
	    return `${header}\n${indent}${wsStart}${value}${wsEnd}`;
	  }

	  value = value.replace(/\n+/g, '\n$&').replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, '$1$2') // more-indented lines aren't folded
	  //         ^ ind.line  ^ empty     ^ capture next empty lines only at end of indent
	  .replace(/\n+/g, `$&${indent}`);
	  const body = (0, _foldFlowLines.default)(`${wsStart}${value}${wsEnd}`, indent, _foldFlowLines.FOLD_BLOCK, options.strOptions.fold);
	  return `${header}\n${indent}${body}`;
	}

	function plainString(item, ctx, onComment, onChompKeep) {
	  const {
	    comment,
	    type,
	    value
	  } = item;
	  const {
	    actualString,
	    implicitKey,
	    indent,
	    inFlow,
	    tags
	  } = ctx;

	  if (implicitKey && /[\n[\]{},]/.test(value) || inFlow && /[[\]{},]/.test(value)) {
	    return doubleQuotedString(value, ctx);
	  }

	  if (!value || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
	    // not allowed:
	    // - empty string, '-' or '?'
	    // - start with an indicator character (except [?:-]) or /[?-] /
	    // - '\n ', ': ' or ' \n' anywhere
	    // - '#' not preceded by a non-space char
	    // - end with ' ' or ':'
	    return implicitKey || inFlow || value.indexOf('\n') === -1 ? value.indexOf('"') !== -1 && value.indexOf("'") === -1 ? singleQuotedString(value, ctx) : doubleQuotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
	  }

	  if (!implicitKey && !inFlow && type !== constants.Type.PLAIN && value.indexOf('\n') !== -1) {
	    // Where allowed & type not set explicitly, prefer block style for multiline strings
	    return blockString(item, ctx, onComment, onChompKeep);
	  }

	  const str = value.replace(/\n+/g, `$&\n${indent}`); // Verify that output will be parsed as a string, as e.g. plain numbers and
	  // booleans get parsed with those types in v1.2 (e.g. '42', 'true' & '0.9e-3'),
	  // and others in v1.1.

	  if (actualString && typeof tags.resolveScalar(str).value !== 'string') {
	    return doubleQuotedString(value, ctx);
	  }

	  const body = implicitKey ? str : (0, _foldFlowLines.default)(str, indent, _foldFlowLines.FOLD_FLOW, options.strOptions.fold);

	  if (comment && !inFlow && (body.indexOf('\n') !== -1 || comment.indexOf('\n') !== -1)) {
	    if (onComment) onComment();
	    return (0, addComment_1.addCommentBefore)(body, indent, comment);
	  }

	  return body;
	}

	function stringifyString(item, ctx, onComment, onChompKeep) {
	  const {
	    defaultType
	  } = options.strOptions;
	  const {
	    implicitKey,
	    inFlow
	  } = ctx;
	  let {
	    type,
	    value
	  } = item;

	  if (typeof value !== 'string') {
	    value = String(value);
	    item = Object.assign({}, item, {
	      value
	    });
	  }

	  const _stringify = _type => {
	    switch (_type) {
	      case constants.Type.BLOCK_FOLDED:
	      case constants.Type.BLOCK_LITERAL:
	        return blockString(item, ctx, onComment, onChompKeep);

	      case constants.Type.QUOTE_DOUBLE:
	        return doubleQuotedString(value, ctx);

	      case constants.Type.QUOTE_SINGLE:
	        return singleQuotedString(value, ctx);

	      case constants.Type.PLAIN:
	        return plainString(item, ctx, onComment, onChompKeep);

	      default:
	        return null;
	    }
	  };

	  if (type !== constants.Type.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f]/.test(value)) {
	    // force double quotes on control characters
	    type = constants.Type.QUOTE_DOUBLE;
	  } else if ((implicitKey || inFlow) && (type === constants.Type.BLOCK_FOLDED || type === constants.Type.BLOCK_LITERAL)) {
	    // should not happen; blocks are not valid inside flow containers
	    type = constants.Type.QUOTE_DOUBLE;
	  }

	  let res = _stringify(type);

	  if (res === null) {
	    res = _stringify(defaultType);
	    if (res === null) throw new Error(`Unsupported default string type ${defaultType}`);
	  }

	  return res;
	}
	});

	unwrapExports(stringify);
	var stringify_1 = stringify.stringifyNumber;
	var stringify_2 = stringify.stringifyString;

	var parseUtils = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.checkFlowCollectionEnd = checkFlowCollectionEnd;
	exports.checkKeyLength = checkKeyLength;
	exports.resolveComments = resolveComments;





	function checkFlowCollectionEnd(errors$1, cst) {
	  let char, name;

	  switch (cst.type) {
	    case constants.Type.FLOW_MAP:
	      char = '}';
	      name = 'flow map';
	      break;

	    case constants.Type.FLOW_SEQ:
	      char = ']';
	      name = 'flow sequence';
	      break;

	    default:
	      errors$1.push(new errors.YAMLSemanticError(cst, 'Not a flow collection!?'));
	      return;
	  }

	  let lastItem;

	  for (let i = cst.items.length - 1; i >= 0; --i) {
	    const item = cst.items[i];

	    if (!item || item.type !== constants.Type.COMMENT) {
	      lastItem = item;
	      break;
	    }
	  }

	  if (lastItem && lastItem.char !== char) {
	    const msg = `Expected ${name} to end with ${char}`;
	    let err;

	    if (typeof lastItem.offset === 'number') {
	      err = new errors.YAMLSemanticError(cst, msg);
	      err.offset = lastItem.offset + 1;
	    } else {
	      err = new errors.YAMLSemanticError(lastItem, msg);
	      if (lastItem.range && lastItem.range.end) err.offset = lastItem.range.end - lastItem.range.start;
	    }

	    errors$1.push(err);
	  }
	}

	function checkKeyLength(errors$1, node, itemIdx, key, keyStart) {
	  if (!key || typeof keyStart !== 'number') return;
	  const item = node.items[itemIdx];
	  let keyEnd = item && item.range && item.range.start;

	  if (!keyEnd) {
	    for (let i = itemIdx - 1; i >= 0; --i) {
	      const it = node.items[i];

	      if (it && it.range) {
	        keyEnd = it.range.end + 2 * (itemIdx - i);
	        break;
	      }
	    }
	  }

	  if (keyEnd > keyStart + 1024) {
	    const k = String(key).substr(0, 8) + '...' + String(key).substr(-8);
	    errors$1.push(new errors.YAMLSemanticError(node, `The "${k}" key is too long`));
	  }
	}

	function resolveComments(collection, comments) {
	  for (const {
	    afterKey,
	    before,
	    comment
	  } of comments) {
	    let item = collection.items[before];

	    if (!item) {
	      if (comment !== undefined) {
	        if (collection.comment) collection.comment += '\n' + comment;else collection.comment = comment;
	      }
	    } else {
	      if (afterKey && item.value) item = item.value;

	      if (comment === undefined) {
	        if (afterKey || !item.commentBefore) item.spaceBefore = true;
	      } else {
	        if (item.commentBefore) item.commentBefore += '\n' + comment;else item.commentBefore = comment;
	      }
	    }
	  }
	}
	});

	unwrapExports(parseUtils);
	var parseUtils_1 = parseUtils.checkFlowCollectionEnd;
	var parseUtils_2 = parseUtils.checkKeyLength;
	var parseUtils_3 = parseUtils.resolveComments;

	var parseMap_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = parseMap;



	var _PlainValue = _interopRequireDefault(PlainValue_1);



	var _Map$1 = _interopRequireDefault(_Map);

	var _Merge = _interopRequireWildcard(Merge_1);

	var _Pair = _interopRequireDefault(Pair_1);



	var _Alias = _interopRequireDefault(Alias_1$1);

	var _Collection = _interopRequireDefault(Collection_1$1);

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parseMap(doc, cst) {
	  if (cst.type !== constants.Type.MAP && cst.type !== constants.Type.FLOW_MAP) {
	    const msg = `A ${cst.type} node cannot be resolved as a mapping`;
	    doc.errors.push(new errors.YAMLSyntaxError(cst, msg));
	    return null;
	  }

	  const {
	    comments,
	    items
	  } = cst.type === constants.Type.FLOW_MAP ? resolveFlowMapItems(doc, cst) : resolveBlockMapItems(doc, cst);
	  const map = new _Map$1.default();
	  map.items = items;
	  (0, parseUtils.resolveComments)(map, comments);
	  let hasCollectionKey = false;

	  for (let i = 0; i < items.length; ++i) {
	    const {
	      key: iKey
	    } = items[i];
	    if (iKey instanceof _Collection.default) hasCollectionKey = true;

	    if (doc.schema.merge && iKey && iKey.value === _Merge.MERGE_KEY) {
	      items[i] = new _Merge.default(items[i]);
	      const sources = items[i].value.items;
	      let error = null;
	      sources.some(node => {
	        if (node instanceof _Alias.default) {
	          // During parsing, alias sources are CST nodes; to account for
	          // circular references their resolved values can't be used here.
	          const {
	            type
	          } = node.source;
	          if (type === constants.Type.MAP || type === constants.Type.FLOW_MAP) return false;
	          return error = 'Merge nodes aliases can only point to maps';
	        }

	        return error = 'Merge nodes can only have Alias nodes as values';
	      });
	      if (error) doc.errors.push(new errors.YAMLSemanticError(cst, error));
	    } else {
	      for (let j = i + 1; j < items.length; ++j) {
	        const {
	          key: jKey
	        } = items[j];

	        if (iKey === jKey || iKey && jKey && Object.prototype.hasOwnProperty.call(iKey, 'value') && iKey.value === jKey.value) {
	          const msg = `Map keys must be unique; "${iKey}" is repeated`;
	          doc.errors.push(new errors.YAMLSemanticError(cst, msg));
	          break;
	        }
	      }
	    }
	  }

	  if (hasCollectionKey && !doc.options.mapAsMap) {
	    const warn = 'Keys with collection values will be stringified as YAML due to JS Object restrictions. Use mapAsMap: true to avoid this.';
	    doc.warnings.push(new errors.YAMLWarning(cst, warn));
	  }

	  cst.resolved = map;
	  return map;
	}

	const valueHasPairComment = ({
	  context: {
	    lineStart,
	    node,
	    src
	  },
	  props
	}) => {
	  if (props.length === 0) return false;
	  const {
	    start
	  } = props[0];
	  if (node && start > node.valueRange.start) return false;
	  if (src[start] !== constants.Char.COMMENT) return false;

	  for (let i = lineStart; i < start; ++i) if (src[i] === '\n') return false;

	  return true;
	};

	function resolvePairComment(item, pair) {
	  if (!valueHasPairComment(item)) return;
	  const comment = item.getPropValue(0, constants.Char.COMMENT, true);
	  let found = false;
	  const cb = pair.value.commentBefore;

	  if (cb && cb.startsWith(comment)) {
	    pair.value.commentBefore = cb.substr(comment.length + 1);
	    found = true;
	  } else {
	    const cc = pair.value.comment;

	    if (!item.node && cc && cc.startsWith(comment)) {
	      pair.value.comment = cc.substr(comment.length + 1);
	      found = true;
	    }
	  }

	  if (found) pair.comment = comment;
	}

	function resolveBlockMapItems(doc, cst) {
	  const comments = [];
	  const items = [];
	  let key = undefined;
	  let keyStart = null;

	  for (let i = 0; i < cst.items.length; ++i) {
	    const item = cst.items[i];

	    switch (item.type) {
	      case constants.Type.BLANK_LINE:
	        comments.push({
	          afterKey: !!key,
	          before: items.length
	        });
	        break;

	      case constants.Type.COMMENT:
	        comments.push({
	          afterKey: !!key,
	          before: items.length,
	          comment: item.comment
	        });
	        break;

	      case constants.Type.MAP_KEY:
	        if (key !== undefined) items.push(new _Pair.default(key));
	        if (item.error) doc.errors.push(item.error);
	        key = doc.resolveNode(item.node);
	        keyStart = null;
	        break;

	      case constants.Type.MAP_VALUE:
	        {
	          if (key === undefined) key = null;
	          if (item.error) doc.errors.push(item.error);

	          if (!item.context.atLineStart && item.node && item.node.type === constants.Type.MAP && !item.node.context.atLineStart) {
	            const msg = 'Nested mappings are not allowed in compact mappings';
	            doc.errors.push(new errors.YAMLSemanticError(item.node, msg));
	          }

	          let valueNode = item.node;

	          if (!valueNode && item.props.length > 0) {
	            // Comments on an empty mapping value need to be preserved, so we
	            // need to construct a minimal empty node here to use instead of the
	            // missing `item.node`. -- eemeli/yaml#19
	            valueNode = new _PlainValue.default(constants.Type.PLAIN, []);
	            valueNode.context = {
	              parent: item,
	              src: item.context.src
	            };
	            const pos = item.range.start + 1;
	            valueNode.range = {
	              start: pos,
	              end: pos
	            };
	            valueNode.valueRange = {
	              start: pos,
	              end: pos
	            };

	            if (typeof item.range.origStart === 'number') {
	              const origPos = item.range.origStart + 1;
	              valueNode.range.origStart = valueNode.range.origEnd = origPos;
	              valueNode.valueRange.origStart = valueNode.valueRange.origEnd = origPos;
	            }
	          }

	          const pair = new _Pair.default(key, doc.resolveNode(valueNode));
	          resolvePairComment(item, pair);
	          items.push(pair);
	          (0, parseUtils.checkKeyLength)(doc.errors, cst, i, key, keyStart);
	          key = undefined;
	          keyStart = null;
	        }
	        break;

	      default:
	        if (key !== undefined) items.push(new _Pair.default(key));
	        key = doc.resolveNode(item);
	        keyStart = item.range.start;
	        if (item.error) doc.errors.push(item.error);

	        next: for (let j = i + 1;; ++j) {
	          const nextItem = cst.items[j];

	          switch (nextItem && nextItem.type) {
	            case constants.Type.BLANK_LINE:
	            case constants.Type.COMMENT:
	              continue next;

	            case constants.Type.MAP_VALUE:
	              break next;

	            default:
	              doc.errors.push(new errors.YAMLSemanticError(item, 'Implicit map keys need to be followed by map values'));
	              break next;
	          }
	        }

	        if (item.valueRangeContainsNewline) {
	          const msg = 'Implicit map keys need to be on a single line';
	          doc.errors.push(new errors.YAMLSemanticError(item, msg));
	        }

	    }
	  }

	  if (key !== undefined) items.push(new _Pair.default(key));
	  return {
	    comments,
	    items
	  };
	}

	function resolveFlowMapItems(doc, cst) {
	  const comments = [];
	  const items = [];
	  let key = undefined;
	  let keyStart = null;
	  let explicitKey = false;
	  let next = '{';

	  for (let i = 0; i < cst.items.length; ++i) {
	    (0, parseUtils.checkKeyLength)(doc.errors, cst, i, key, keyStart);
	    const item = cst.items[i];

	    if (typeof item.char === 'string') {
	      const {
	        char,
	        offset
	      } = item;

	      if (char === '?' && key === undefined && !explicitKey) {
	        explicitKey = true;
	        next = ':';
	        continue;
	      }

	      if (char === ':') {
	        if (key === undefined) key = null;

	        if (next === ':') {
	          next = ',';
	          continue;
	        }
	      } else {
	        if (explicitKey) {
	          if (key === undefined && char !== ',') key = null;
	          explicitKey = false;
	        }

	        if (key !== undefined) {
	          items.push(new _Pair.default(key));
	          key = undefined;
	          keyStart = null;

	          if (char === ',') {
	            next = ':';
	            continue;
	          }
	        }
	      }

	      if (char === '}') {
	        if (i === cst.items.length - 1) continue;
	      } else if (char === next) {
	        next = ':';
	        continue;
	      }

	      const msg = `Flow map contains an unexpected ${char}`;
	      const err = new errors.YAMLSyntaxError(cst, msg);
	      err.offset = offset;
	      doc.errors.push(err);
	    } else if (item.type === constants.Type.BLANK_LINE) {
	      comments.push({
	        afterKey: !!key,
	        before: items.length
	      });
	    } else if (item.type === constants.Type.COMMENT) {
	      comments.push({
	        afterKey: !!key,
	        before: items.length,
	        comment: item.comment
	      });
	    } else if (key === undefined) {
	      if (next === ',') doc.errors.push(new errors.YAMLSemanticError(item, 'Separator , missing in flow map'));
	      key = doc.resolveNode(item);
	      keyStart = explicitKey ? null : item.range.start; // TODO: add error for non-explicit multiline plain key
	    } else {
	      if (next !== ',') doc.errors.push(new errors.YAMLSemanticError(item, 'Indicator : missing in flow map entry'));
	      items.push(new _Pair.default(key, doc.resolveNode(item)));
	      key = undefined;
	      explicitKey = false;
	    }
	  }

	  (0, parseUtils.checkFlowCollectionEnd)(doc.errors, cst);
	  if (key !== undefined) items.push(new _Pair.default(key));
	  return {
	    comments,
	    items
	  };
	}
	});

	unwrapExports(parseMap_1);

	var map = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Map$1 = _interopRequireDefault(_Map);

	var _parseMap = _interopRequireDefault(parseMap_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createMap(schema, obj, ctx) {
	  const map = new _Map$1.default();

	  if (obj instanceof Map) {
	    for (const [key, value] of obj) map.items.push(schema.createPair(key, value, ctx));
	  } else if (obj && typeof obj === 'object') {
	    for (const key of Object.keys(obj)) map.items.push(schema.createPair(key, obj[key], ctx));
	  }

	  return map;
	}

	var _default = {
	  createNode: createMap,
	  default: true,
	  nodeClass: _Map$1.default,
	  tag: 'tag:yaml.org,2002:map',
	  resolve: _parseMap.default
	};
	exports.default = _default;
	});

	unwrapExports(map);

	var parseSeq_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = parseSeq;





	var _Pair = _interopRequireDefault(Pair_1);



	var _Seq = _interopRequireDefault(Seq);

	var _Collection = _interopRequireDefault(Collection_1$1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parseSeq(doc, cst) {
	  if (cst.type !== constants.Type.SEQ && cst.type !== constants.Type.FLOW_SEQ) {
	    const msg = `A ${cst.type} node cannot be resolved as a sequence`;
	    doc.errors.push(new errors.YAMLSyntaxError(cst, msg));
	    return null;
	  }

	  const {
	    comments,
	    items
	  } = cst.type === constants.Type.FLOW_SEQ ? resolveFlowSeqItems(doc, cst) : resolveBlockSeqItems(doc, cst);
	  const seq = new _Seq.default();
	  seq.items = items;
	  (0, parseUtils.resolveComments)(seq, comments);

	  if (!doc.options.mapAsMap && items.some(it => it instanceof _Pair.default && it.key instanceof _Collection.default)) {
	    const warn = 'Keys with collection values will be stringified as YAML due to JS Object restrictions. Use mapAsMap: true to avoid this.';
	    doc.warnings.push(new errors.YAMLWarning(cst, warn));
	  }

	  cst.resolved = seq;
	  return seq;
	}

	function resolveBlockSeqItems(doc, cst) {
	  const comments = [];
	  const items = [];

	  for (let i = 0; i < cst.items.length; ++i) {
	    const item = cst.items[i];

	    switch (item.type) {
	      case constants.Type.BLANK_LINE:
	        comments.push({
	          before: items.length
	        });
	        break;

	      case constants.Type.COMMENT:
	        comments.push({
	          comment: item.comment,
	          before: items.length
	        });
	        break;

	      case constants.Type.SEQ_ITEM:
	        if (item.error) doc.errors.push(item.error);
	        items.push(doc.resolveNode(item.node));

	        if (item.hasProps) {
	          const msg = 'Sequence items cannot have tags or anchors before the - indicator';
	          doc.errors.push(new errors.YAMLSemanticError(item, msg));
	        }

	        break;

	      default:
	        if (item.error) doc.errors.push(item.error);
	        doc.errors.push(new errors.YAMLSyntaxError(item, `Unexpected ${item.type} node in sequence`));
	    }
	  }

	  return {
	    comments,
	    items
	  };
	}

	function resolveFlowSeqItems(doc, cst) {
	  const comments = [];
	  const items = [];
	  let explicitKey = false;
	  let key = undefined;
	  let keyStart = null;
	  let next = '[';

	  for (let i = 0; i < cst.items.length; ++i) {
	    const item = cst.items[i];

	    if (typeof item.char === 'string') {
	      const {
	        char,
	        offset
	      } = item;

	      if (char !== ':' && (explicitKey || key !== undefined)) {
	        if (explicitKey && key === undefined) key = next ? items.pop() : null;
	        items.push(new _Pair.default(key));
	        explicitKey = false;
	        key = undefined;
	        keyStart = null;
	      }

	      if (char === next) {
	        next = null;
	      } else if (!next && char === '?') {
	        explicitKey = true;
	      } else if (next !== '[' && char === ':' && key === undefined) {
	        if (next === ',') {
	          key = items.pop();

	          if (key instanceof _Pair.default) {
	            const msg = 'Chaining flow sequence pairs is invalid';
	            const err = new errors.YAMLSemanticError(cst, msg);
	            err.offset = offset;
	            doc.errors.push(err);
	          }

	          if (!explicitKey) (0, parseUtils.checkKeyLength)(doc.errors, cst, i, key, keyStart);
	        } else {
	          key = null;
	        }

	        keyStart = null;
	        explicitKey = false; // TODO: add error for non-explicit multiline plain key

	        next = null;
	      } else if (next === '[' || char !== ']' || i < cst.items.length - 1) {
	        const msg = `Flow sequence contains an unexpected ${char}`;
	        const err = new errors.YAMLSyntaxError(cst, msg);
	        err.offset = offset;
	        doc.errors.push(err);
	      }
	    } else if (item.type === constants.Type.BLANK_LINE) {
	      comments.push({
	        before: items.length
	      });
	    } else if (item.type === constants.Type.COMMENT) {
	      comments.push({
	        comment: item.comment,
	        before: items.length
	      });
	    } else {
	      if (next) {
	        const msg = `Expected a ${next} in flow sequence`;
	        doc.errors.push(new errors.YAMLSemanticError(item, msg));
	      }

	      const value = doc.resolveNode(item);

	      if (key === undefined) {
	        items.push(value);
	      } else {
	        items.push(new _Pair.default(key, value));
	        key = undefined;
	      }

	      keyStart = item.range.start;
	      next = ',';
	    }
	  }

	  (0, parseUtils.checkFlowCollectionEnd)(doc.errors, cst);
	  if (key !== undefined) items.push(new _Pair.default(key));
	  return {
	    comments,
	    items
	  };
	}
	});

	unwrapExports(parseSeq_1);

	var seq = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _parseSeq = _interopRequireDefault(parseSeq_1);

	var _Seq = _interopRequireDefault(Seq);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createSeq(schema, obj, ctx) {
	  const seq = new _Seq.default();

	  if (obj && obj[Symbol.iterator]) {
	    for (const it of obj) {
	      const v = schema.createNode(it, ctx.wrapScalars, null, ctx);
	      seq.items.push(v);
	    }
	  }

	  return seq;
	}

	var _default = {
	  createNode: createSeq,
	  default: true,
	  nodeClass: _Seq.default,
	  tag: 'tag:yaml.org,2002:seq',
	  resolve: _parseSeq.default
	};
	exports.default = _default;
	});

	unwrapExports(seq);

	var string = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.resolveString = void 0;





	const resolveString = (doc, node) => {
	  // on error, will return { str: string, errors: Error[] }
	  const res = node.strValue;
	  if (!res) return '';
	  if (typeof res === 'string') return res;
	  res.errors.forEach(error => {
	    if (!error.source) error.source = node;
	    doc.errors.push(error);
	  });
	  return res.str;
	};

	exports.resolveString = resolveString;
	var _default = {
	  identify: value => typeof value === 'string',
	  default: true,
	  tag: 'tag:yaml.org,2002:str',
	  resolve: resolveString,

	  stringify(item, ctx, onComment, onChompKeep) {
	    ctx = Object.assign({
	      actualString: true
	    }, ctx);
	    return (0, stringify.stringifyString)(item, ctx, onComment, onChompKeep);
	  },

	  options: options.strOptions
	};
	exports.default = _default;
	});

	unwrapExports(string);
	var string_1 = string.resolveString;

	var failsafe = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _map = _interopRequireDefault(map);

	var _seq = _interopRequireDefault(seq);

	var _string = _interopRequireDefault(string);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _default = [_map.default, _seq.default, _string.default];
	exports.default = _default;
	});

	unwrapExports(failsafe);

	var core = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Scalar = _interopRequireDefault(Scalar_1);



	var _failsafe = _interopRequireDefault(failsafe);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _default = _failsafe.default.concat([{
	  identify: value => value == null,
	  createNode: (schema, value, ctx) => ctx.wrapScalars ? new _Scalar.default(null) : null,
	  default: true,
	  tag: 'tag:yaml.org,2002:null',
	  test: /^(?:~|[Nn]ull|NULL)?$/,
	  resolve: () => null,
	  options: options.nullOptions,
	  stringify: () => options.nullOptions.nullStr
	}, {
	  identify: value => typeof value === 'boolean',
	  default: true,
	  tag: 'tag:yaml.org,2002:bool',
	  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
	  resolve: str => str[0] === 't' || str[0] === 'T',
	  options: options.boolOptions,
	  stringify: ({
	    value
	  }) => value ? options.boolOptions.trueStr : options.boolOptions.falseStr
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  format: 'OCT',
	  test: /^0o([0-7]+)$/,
	  resolve: (str, oct) => parseInt(oct, 8),
	  stringify: ({
	    value
	  }) => '0o' + value.toString(8)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  test: /^[-+]?[0-9]+$/,
	  resolve: str => parseInt(str, 10),
	  stringify: stringify.stringifyNumber
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  format: 'HEX',
	  test: /^0x([0-9a-fA-F]+)$/,
	  resolve: (str, hex) => parseInt(hex, 16),
	  stringify: ({
	    value
	  }) => '0x' + value.toString(16)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  test: /^(?:[-+]?\.inf|(\.nan))$/i,
	  resolve: (str, nan) => nan ? NaN : str[0] === '-' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
	  stringify: stringify.stringifyNumber
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  format: 'EXP',
	  test: /^[-+]?(?:0|[1-9][0-9]*)(\.[0-9]*)?[eE][-+]?[0-9]+$/,
	  resolve: str => parseFloat(str),
	  stringify: ({
	    value
	  }) => Number(value).toExponential()
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  test: /^[-+]?(?:0|[1-9][0-9]*)\.([0-9]*)$/,

	  resolve(str, frac) {
	    const node = new _Scalar.default(parseFloat(str));
	    if (frac && frac[frac.length - 1] === '0') node.minFractionDigits = frac.length;
	    return node;
	  },

	  stringify: stringify.stringifyNumber
	}]);

	exports.default = _default;
	});

	unwrapExports(core);

	var json = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _map = _interopRequireDefault(map);

	var _seq = _interopRequireDefault(seq);

	var _Scalar = _interopRequireDefault(Scalar_1);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const schema = [_map.default, _seq.default, {
	  identify: value => typeof value === 'string',
	  default: true,
	  tag: 'tag:yaml.org,2002:str',
	  resolve: string.resolveString,
	  stringify: value => JSON.stringify(value)
	}, {
	  identify: value => value == null,
	  createNode: (schema, value, ctx) => ctx.wrapScalars ? new _Scalar.default(null) : null,
	  default: true,
	  tag: 'tag:yaml.org,2002:null',
	  test: /^null$/,
	  resolve: () => null,
	  stringify: value => JSON.stringify(value)
	}, {
	  identify: value => typeof value === 'boolean',
	  default: true,
	  tag: 'tag:yaml.org,2002:bool',
	  test: /^true$/,
	  resolve: () => true,
	  stringify: value => JSON.stringify(value)
	}, {
	  identify: value => typeof value === 'boolean',
	  default: true,
	  tag: 'tag:yaml.org,2002:bool',
	  test: /^false$/,
	  resolve: () => false,
	  stringify: value => JSON.stringify(value)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  test: /^-?(?:0|[1-9][0-9]*)$/,
	  resolve: str => parseInt(str, 10),
	  stringify: value => JSON.stringify(value)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
	  resolve: str => parseFloat(str),
	  stringify: value => JSON.stringify(value)
	}];

	schema.scalarFallback = str => {
	  throw new SyntaxError(`Unresolved plain scalar ${JSON.stringify(str)}`);
	};

	var _default = schema;
	exports.default = _default;
	});

	unwrapExports(json);

	var binary = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;











	/* global atob, btoa, Buffer */
	var _default = {
	  identify: value => value instanceof Uint8Array,
	  // Buffer inherits from Uint8Array
	  default: false,
	  tag: 'tag:yaml.org,2002:binary',

	  /**
	   * Returns a Buffer in node and an Uint8Array in browsers
	   *
	   * To use the resulting buffer as an image, you'll want to do something like:
	   *
	   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
	   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
	   */
	  resolve: (doc, node) => {
	    if (typeof Buffer === 'function') {
	      const src = (0, string.resolveString)(doc, node);
	      return Buffer.from(src, 'base64');
	    } else if (typeof atob === 'function') {
	      const src = atob((0, string.resolveString)(doc, node));
	      const buffer = new Uint8Array(src.length);

	      for (let i = 0; i < src.length; ++i) buffer[i] = src.charCodeAt(i);

	      return buffer;
	    } else {
	      doc.errors.push(new errors.YAMLReferenceError(node, 'This environment does not support reading binary tags; either Buffer or atob is required'));
	      return null;
	    }
	  },
	  options: options.binaryOptions,
	  stringify: ({
	    comment,
	    type,
	    value
	  }, ctx, onComment, onChompKeep) => {
	    let src;

	    if (typeof Buffer === 'function') {
	      src = value instanceof Buffer ? value.toString('base64') : Buffer.from(value.buffer).toString('base64');
	    } else if (typeof btoa === 'function') {
	      let s = '';

	      for (let i = 0; i < value.length; ++i) s += String.fromCharCode(value[i]);

	      src = btoa(s);
	    } else {
	      throw new Error('This environment does not support writing binary tags; either Buffer or btoa is required');
	    }

	    if (!type) type = options.binaryOptions.defaultType;

	    if (type === constants.Type.QUOTE_DOUBLE) {
	      value = src;
	    } else {
	      const {
	        lineWidth
	      } = options.binaryOptions;
	      const n = Math.ceil(src.length / lineWidth);
	      const lines = new Array(n);

	      for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
	        lines[i] = src.substr(o, lineWidth);
	      }

	      value = lines.join(type === constants.Type.BLOCK_LITERAL ? '\n' : ' ');
	    }

	    return (0, stringify.stringifyString)({
	      comment,
	      type,
	      value
	    }, ctx, onComment, onChompKeep);
	  }
	};
	exports.default = _default;
	});

	unwrapExports(binary);

	var pairs = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.parsePairs = parsePairs;
	exports.createPairs = createPairs;
	exports.default = void 0;



	var _Map$1 = _interopRequireDefault(_Map);

	var _Pair = _interopRequireDefault(Pair_1);

	var _parseSeq = _interopRequireDefault(parseSeq_1);

	var _Seq = _interopRequireDefault(Seq);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function parsePairs(doc, cst) {
	  const seq = (0, _parseSeq.default)(doc, cst);

	  for (let i = 0; i < seq.items.length; ++i) {
	    let item = seq.items[i];
	    if (item instanceof _Pair.default) continue;else if (item instanceof _Map$1.default) {
	      if (item.items.length > 1) {
	        const msg = 'Each pair must have its own sequence indicator';
	        throw new errors.YAMLSemanticError(cst, msg);
	      }

	      const pair = item.items[0] || new _Pair.default();
	      if (item.commentBefore) pair.commentBefore = pair.commentBefore ? `${item.commentBefore}\n${pair.commentBefore}` : item.commentBefore;
	      if (item.comment) pair.comment = pair.comment ? `${item.comment}\n${pair.comment}` : item.comment;
	      item = pair;
	    }
	    seq.items[i] = item instanceof _Pair.default ? item : new _Pair.default(item);
	  }

	  return seq;
	}

	function createPairs(schema, iterable, ctx) {
	  const pairs = new _Seq.default();
	  pairs.tag = 'tag:yaml.org,2002:pairs';

	  for (const it of iterable) {
	    let key, value;

	    if (Array.isArray(it)) {
	      if (it.length === 2) {
	        key = it[0];
	        value = it[1];
	      } else throw new TypeError(`Expected [key, value] tuple: ${it}`);
	    } else if (it && it instanceof Object) {
	      const keys = Object.keys(it);

	      if (keys.length === 1) {
	        key = keys[0];
	        value = it[key];
	      } else throw new TypeError(`Expected { key: value } tuple: ${it}`);
	    } else {
	      key = it;
	    }

	    const pair = schema.createPair(key, value, ctx);
	    pairs.items.push(pair);
	  }

	  return pairs;
	}

	var _default = {
	  default: false,
	  tag: 'tag:yaml.org,2002:pairs',
	  resolve: parsePairs,
	  createNode: createPairs
	};
	exports.default = _default;
	});

	unwrapExports(pairs);
	var pairs_1 = pairs.parsePairs;
	var pairs_2 = pairs.createPairs;

	var omap = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.YAMLOMap = void 0;



	var _toJSON = _interopRequireDefault(toJSON_1);

	var _Map$1 = _interopRequireDefault(_Map);

	var _Pair = _interopRequireDefault(Pair_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	var _Seq = _interopRequireDefault(Seq);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	class YAMLOMap extends _Seq.default {
	  constructor() {
	    super();

	    _defineProperty(this, "add", _Map$1.default.prototype.add.bind(this));

	    _defineProperty(this, "delete", _Map$1.default.prototype.delete.bind(this));

	    _defineProperty(this, "get", _Map$1.default.prototype.get.bind(this));

	    _defineProperty(this, "has", _Map$1.default.prototype.has.bind(this));

	    _defineProperty(this, "set", _Map$1.default.prototype.set.bind(this));

	    this.tag = YAMLOMap.tag;
	  }

	  toJSON(_, ctx) {
	    const map = new Map();
	    if (ctx && ctx.onCreate) ctx.onCreate(map);

	    for (const pair of this.items) {
	      let key, value;

	      if (pair instanceof _Pair.default) {
	        key = (0, _toJSON.default)(pair.key, '', ctx);
	        value = (0, _toJSON.default)(pair.value, key, ctx);
	      } else {
	        key = (0, _toJSON.default)(pair, '', ctx);
	      }

	      if (map.has(key)) throw new Error('Ordered maps must not include duplicate keys');
	      map.set(key, value);
	    }

	    return map;
	  }

	}

	exports.YAMLOMap = YAMLOMap;

	_defineProperty(YAMLOMap, "tag", 'tag:yaml.org,2002:omap');

	function parseOMap(doc, cst) {
	  const pairs$1 = (0, pairs.parsePairs)(doc, cst);
	  const seenKeys = [];

	  for (const {
	    key
	  } of pairs$1.items) {
	    if (key instanceof _Scalar.default) {
	      if (seenKeys.includes(key.value)) {
	        const msg = 'Ordered maps must not include duplicate keys';
	        throw new errors.YAMLSemanticError(cst, msg);
	      } else {
	        seenKeys.push(key.value);
	      }
	    }
	  }

	  return Object.assign(new YAMLOMap(), pairs$1);
	}

	function createOMap(schema, iterable, ctx) {
	  const pairs$1 = (0, pairs.createPairs)(schema, iterable, ctx);
	  const omap = new YAMLOMap();
	  omap.items = pairs$1.items;
	  return omap;
	}

	var _default = {
	  identify: value => value instanceof Map,
	  nodeClass: YAMLOMap,
	  default: false,
	  tag: 'tag:yaml.org,2002:omap',
	  resolve: parseOMap,
	  createNode: createOMap
	};
	exports.default = _default;
	});

	unwrapExports(omap);
	var omap_1 = omap.YAMLOMap;

	var set = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = exports.YAMLSet = void 0;



	var _Map$1 = _interopRequireWildcard(_Map);

	var _Pair = _interopRequireDefault(Pair_1);

	var _parseMap = _interopRequireDefault(parseMap_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	class YAMLSet extends _Map$1.default {
	  constructor() {
	    super();
	    this.tag = YAMLSet.tag;
	  }

	  add(key) {
	    const pair = key instanceof _Pair.default ? key : new _Pair.default(key);
	    const prev = (0, _Map$1.findPair)(this.items, pair.key);
	    if (!prev) this.items.push(pair);
	  }

	  get(key, keepPair) {
	    const pair = (0, _Map$1.findPair)(this.items, key);
	    return !keepPair && pair instanceof _Pair.default ? pair.key instanceof _Scalar.default ? pair.key.value : pair.key : pair;
	  }

	  set(key, value) {
	    if (typeof value !== 'boolean') throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
	    const prev = (0, _Map$1.findPair)(this.items, key);

	    if (prev && !value) {
	      this.items.splice(this.items.indexOf(prev), 1);
	    } else if (!prev && value) {
	      this.items.push(new _Pair.default(key));
	    }
	  }

	  toJSON(_, ctx) {
	    return super.toJSON(_, ctx, Set);
	  }

	  toString(ctx, onComment, onChompKeep) {
	    if (!ctx) return JSON.stringify(this);
	    if (this.hasAllNullValues()) return super.toString(ctx, onComment, onChompKeep);else throw new Error('Set items must all have null values');
	  }

	}

	exports.YAMLSet = YAMLSet;

	_defineProperty(YAMLSet, "tag", 'tag:yaml.org,2002:set');

	function parseSet(doc, cst) {
	  const map = (0, _parseMap.default)(doc, cst);
	  if (!map.hasAllNullValues()) throw new errors.YAMLSemanticError(cst, 'Set items must all have null values');
	  return Object.assign(new YAMLSet(), map);
	}

	function createSet(schema, iterable, ctx) {
	  const set = new YAMLSet();

	  for (const value of iterable) set.items.push(schema.createPair(value, null, ctx));

	  return set;
	}

	var _default = {
	  identify: value => value instanceof Set,
	  nodeClass: YAMLSet,
	  default: false,
	  tag: 'tag:yaml.org,2002:set',
	  resolve: parseSet,
	  createNode: createSet
	};
	exports.default = _default;
	});

	unwrapExports(set);
	var set_1 = set.YAMLSet;

	var timestamp_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.timestamp = exports.floatTime = exports.intTime = void 0;



	const parseSexagesimal = (sign, parts) => {
	  const n = parts.split(':').reduce((n, p) => n * 60 + Number(p), 0);
	  return sign === '-' ? -n : n;
	}; // hhhh:mm:ss.sss


	const stringifySexagesimal = ({
	  value
	}) => {
	  if (isNaN(value) || !isFinite(value)) return (0, stringify.stringifyNumber)(value);
	  let sign = '';

	  if (value < 0) {
	    sign = '-';
	    value = Math.abs(value);
	  }

	  const parts = [value % 60]; // seconds, including ms

	  if (value < 60) {
	    parts.unshift(0); // at least one : is required
	  } else {
	    value = Math.round((value - parts[0]) / 60);
	    parts.unshift(value % 60); // minutes

	    if (value >= 60) {
	      value = Math.round((value - parts[0]) / 60);
	      parts.unshift(value); // hours
	    }
	  }

	  return sign + parts.map(n => n < 10 ? '0' + String(n) : String(n)).join(':').replace(/000000\d*$/, '') // % 60 may introduce error
	  ;
	};

	const intTime = {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  format: 'TIME',
	  test: /^([-+]?)([0-9][0-9_]*(?::[0-5]?[0-9])+)$/,
	  resolve: (str, sign, parts) => parseSexagesimal(sign, parts.replace(/_/g, '')),
	  stringify: stringifySexagesimal
	};
	exports.intTime = intTime;
	const floatTime = {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  format: 'TIME',
	  test: /^([-+]?)([0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*)$/,
	  resolve: (str, sign, parts) => parseSexagesimal(sign, parts.replace(/_/g, '')),
	  stringify: stringifySexagesimal
	};
	exports.floatTime = floatTime;
	const timestamp = {
	  identify: value => value instanceof Date,
	  default: true,
	  tag: 'tag:yaml.org,2002:timestamp',
	  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
	  // may be omitted altogether, resulting in a date format. In such a case, the time part is
	  // assumed to be 00:00:00Z (start of day, UTC).
	  test: RegExp('^(?:' + '([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})' + // YYYY-Mm-Dd
	  '(?:(?:t|T|[ \\t]+)' + // t | T | whitespace
	  '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)' + // Hh:Mm:Ss(.ss)?
	  '(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?' + // Z | +5 | -03:30
	  ')?' + ')$'),
	  resolve: (str, year, month, day, hour, minute, second, millisec, tz) => {
	    if (millisec) millisec = (millisec + '00').substr(1, 3);
	    let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec || 0);

	    if (tz && tz !== 'Z') {
	      let d = parseSexagesimal(tz[0], tz.slice(1));
	      if (Math.abs(d) < 30) d *= 60;
	      date -= 60000 * d;
	    }

	    return new Date(date);
	  },
	  stringify: ({
	    value
	  }) => value.toISOString().replace(/((T00:00)?:00)?\.000Z$/, '')
	};
	exports.timestamp = timestamp;
	});

	unwrapExports(timestamp_1);
	var timestamp_2 = timestamp_1.timestamp;
	var timestamp_3 = timestamp_1.floatTime;
	var timestamp_4 = timestamp_1.intTime;

	var yaml1_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _Scalar = _interopRequireDefault(Scalar_1);



	var _failsafe = _interopRequireDefault(failsafe);



	var _binary = _interopRequireDefault(binary);

	var _omap = _interopRequireDefault(omap);

	var _pairs = _interopRequireDefault(pairs);

	var _set = _interopRequireDefault(set);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var _default = _failsafe.default.concat([{
	  identify: value => value == null,
	  createNode: (schema, value, ctx) => ctx.wrapScalars ? new _Scalar.default(null) : null,
	  default: true,
	  tag: 'tag:yaml.org,2002:null',
	  test: /^(?:~|[Nn]ull|NULL)?$/,
	  resolve: () => null,
	  options: options.nullOptions,
	  stringify: () => options.nullOptions.nullStr
	}, {
	  identify: value => typeof value === 'boolean',
	  default: true,
	  tag: 'tag:yaml.org,2002:bool',
	  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
	  resolve: () => true,
	  options: options.boolOptions,
	  stringify: ({
	    value
	  }) => value ? options.boolOptions.trueStr : options.boolOptions.falseStr
	}, {
	  identify: value => typeof value === 'boolean',
	  default: true,
	  tag: 'tag:yaml.org,2002:bool',
	  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/i,
	  resolve: () => false,
	  options: options.boolOptions,
	  stringify: ({
	    value
	  }) => value ? options.boolOptions.trueStr : options.boolOptions.falseStr
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  format: 'BIN',
	  test: /^0b([0-1_]+)$/,
	  resolve: (str, bin) => parseInt(bin.replace(/_/g, ''), 2),
	  stringify: ({
	    value
	  }) => '0b' + value.toString(2)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  format: 'OCT',
	  test: /^[-+]?0([0-7_]+)$/,
	  resolve: (str, oct) => parseInt(oct.replace(/_/g, ''), 8),
	  stringify: ({
	    value
	  }) => (value < 0 ? '-0' : '0') + value.toString(8)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  test: /^[-+]?[0-9][0-9_]*$/,
	  resolve: str => parseInt(str.replace(/_/g, ''), 10),
	  stringify: stringify.stringifyNumber
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:int',
	  format: 'HEX',
	  test: /^0x([0-9a-fA-F_]+)$/,
	  resolve: (str, hex) => parseInt(hex.replace(/_/g, ''), 16),
	  stringify: ({
	    value
	  }) => (value < 0 ? '-0x' : '0x') + value.toString(16)
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  test: /^(?:[-+]?\.inf|(\.nan))$/i,
	  resolve: (str, nan) => nan ? NaN : str[0] === '-' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
	  stringify: stringify.stringifyNumber
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  format: 'EXP',
	  test: /^[-+]?([0-9][0-9_]*)?(\.[0-9_]*)?[eE][-+]?[0-9]+$/,
	  resolve: str => parseFloat(str.replace(/_/g, '')),
	  stringify: ({
	    value
	  }) => Number(value).toExponential()
	}, {
	  identify: value => typeof value === 'number',
	  default: true,
	  tag: 'tag:yaml.org,2002:float',
	  test: /^[-+]?(?:[0-9][0-9_]*)?\.([0-9_]*)$/,

	  resolve(str, frac) {
	    const node = new _Scalar.default(parseFloat(str.replace(/_/g, '')));

	    if (frac) {
	      const f = frac.replace(/_/g, '');
	      if (f[f.length - 1] === '0') node.minFractionDigits = f.length;
	    }

	    return node;
	  },

	  stringify: stringify.stringifyNumber
	}], _binary.default, _omap.default, _pairs.default, _set.default, timestamp_1.intTime, timestamp_1.floatTime, timestamp_1.timestamp);

	exports.default = _default;
	});

	unwrapExports(yaml1_1);

	var tags_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.tags = exports.schemas = void 0;

	var _core = _interopRequireDefault(core);

	var _failsafe = _interopRequireDefault(failsafe);

	var _json = _interopRequireDefault(json);

	var _yaml = _interopRequireDefault(yaml1_1);

	var _map = _interopRequireDefault(map);

	var _seq = _interopRequireDefault(seq);

	var _binary = _interopRequireDefault(binary);

	var _omap = _interopRequireDefault(omap);

	var _pairs = _interopRequireDefault(pairs);

	var _set = _interopRequireDefault(set);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const schemas = {
	  core: _core.default,
	  failsafe: _failsafe.default,
	  json: _json.default,
	  yaml11: _yaml.default
	};
	exports.schemas = schemas;
	const tags = {
	  binary: _binary.default,
	  floatTime: timestamp_1.floatTime,
	  intTime: timestamp_1.intTime,
	  map: _map.default,
	  omap: _omap.default,
	  pairs: _pairs.default,
	  seq: _seq.default,
	  set: _set.default,
	  timestamp: timestamp_1.timestamp
	};
	exports.tags = tags;
	});

	unwrapExports(tags_1);
	var tags_2 = tags_1.tags;
	var tags_3 = tags_1.schemas;

	var schema = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;













	var _Alias = _interopRequireDefault(Alias_1$1);

	var _Collection = _interopRequireDefault(Collection_1$1);

	var _Node = _interopRequireDefault(Node_1$1);

	var _Pair = _interopRequireDefault(Pair_1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	const isMap = ({
	  type
	}) => type === constants.Type.FLOW_MAP || type === constants.Type.MAP;

	const isSeq = ({
	  type
	}) => type === constants.Type.FLOW_SEQ || type === constants.Type.SEQ;

	class Schema {
	  constructor({
	    customTags,
	    merge,
	    schema,
	    tags: deprecatedCustomTags
	  }) {
	    this.merge = !!merge;
	    this.name = schema;
	    this.tags = tags_1.schemas[schema.replace(/\W/g, '')]; // 'yaml-1.1' -> 'yaml11'

	    if (!this.tags) {
	      const keys = Object.keys(tags_1.schemas).map(key => JSON.stringify(key)).join(', ');
	      throw new Error(`Unknown schema "${schema}"; use one of ${keys}`);
	    }

	    if (!customTags && deprecatedCustomTags) {
	      customTags = deprecatedCustomTags;
	      (0, warnings.warnOptionDeprecation)('tags', 'customTags');
	    }

	    if (Array.isArray(customTags)) {
	      for (const tag of customTags) this.tags = this.tags.concat(tag);
	    } else if (typeof customTags === 'function') {
	      this.tags = customTags(this.tags.slice());
	    }

	    for (let i = 0; i < this.tags.length; ++i) {
	      const tag = this.tags[i];

	      if (typeof tag === 'string') {
	        const tagObj = tags_1.tags[tag];

	        if (!tagObj) {
	          const keys = Object.keys(tags_1.tags).map(key => JSON.stringify(key)).join(', ');
	          throw new Error(`Unknown custom tag "${tag}"; use one of ${keys}`);
	        }

	        this.tags[i] = tagObj;
	      }
	    }
	  }

	  createNode(value, wrapScalars, tag, ctx) {
	    if (value instanceof _Node.default) return value;
	    let tagObj;

	    if (tag) {
	      if (tag.startsWith('!!')) tag = Schema.defaultPrefix + tag.slice(2);
	      const match = this.tags.filter(t => t.tag === tag);
	      tagObj = match.find(t => !t.format) || match[0];
	      if (!tagObj) throw new Error(`Tag ${tag} not found`);
	    } else {
	      // TODO: deprecate/remove class check
	      tagObj = this.tags.find(t => (t.identify && t.identify(value) || t.class && value instanceof t.class) && !t.format);

	      if (!tagObj) {
	        if (typeof value.toJSON === 'function') value = value.toJSON();
	        if (typeof value !== 'object') return wrapScalars ? new _Scalar.default(value) : value;
	        tagObj = value instanceof Map ? tags_1.tags.map : value[Symbol.iterator] ? tags_1.tags.seq : tags_1.tags.map;
	      }
	    }

	    if (!ctx) ctx = {
	      wrapScalars
	    };else ctx.wrapScalars = wrapScalars;

	    if (ctx.onTagObj) {
	      ctx.onTagObj(tagObj);
	      delete ctx.onTagObj;
	    }

	    const obj = {};

	    if (value && typeof value === 'object' && ctx.prevObjects) {
	      const prev = ctx.prevObjects.find(o => o.value === value);

	      if (prev) {
	        const alias = new _Alias.default(prev); // leaves source dirty; must be cleaned by caller

	        ctx.aliasNodes.push(alias);
	        return alias;
	      }

	      obj.value = value;
	      ctx.prevObjects.push(obj);
	    }

	    obj.node = tagObj.createNode ? tagObj.createNode(this, value, ctx) : wrapScalars ? new _Scalar.default(value) : value;
	    return obj.node;
	  }

	  createPair(key, value, ctx) {
	    const k = this.createNode(key, ctx.wrapScalars, null, ctx);
	    const v = this.createNode(value, ctx.wrapScalars, null, ctx);
	    return new _Pair.default(k, v);
	  } // falls back to string on no match


	  resolveScalar(str, tags) {
	    if (!tags) tags = this.tags;

	    for (let i = 0; i < tags.length; ++i) {
	      const {
	        format,
	        test,
	        resolve
	      } = tags[i];

	      if (test) {
	        const match = str.match(test);

	        if (match) {
	          let res = resolve.apply(null, match);
	          if (!(res instanceof _Scalar.default)) res = new _Scalar.default(res);
	          if (format) res.format = format;
	          return res;
	        }
	      }
	    }

	    if (this.tags.scalarFallback) str = this.tags.scalarFallback(str);
	    return new _Scalar.default(str);
	  } // sets node.resolved on success


	  resolveNode(doc, node, tagName) {
	    const tags = this.tags.filter(({
	      tag
	    }) => tag === tagName);
	    const generic = tags.find(({
	      test
	    }) => !test);
	    if (node.error) doc.errors.push(node.error);

	    try {
	      if (generic) {
	        let res = generic.resolve(doc, node);
	        if (!(res instanceof _Collection.default)) res = new _Scalar.default(res);
	        node.resolved = res;
	      } else {
	        const str = (0, string.resolveString)(doc, node);

	        if (typeof str === 'string' && tags.length > 0) {
	          node.resolved = this.resolveScalar(str, tags);
	        }
	      }
	    } catch (error) {
	      if (!error.source) error.source = node;
	      doc.errors.push(error);
	      node.resolved = null;
	    }

	    if (!node.resolved) return null;
	    if (tagName && node.tag) node.resolved.tag = tagName;
	    return node.resolved;
	  }

	  resolveNodeWithFallback(doc, node, tagName) {
	    const res = this.resolveNode(doc, node, tagName);
	    if (Object.prototype.hasOwnProperty.call(node, 'resolved')) return res;
	    const fallback = isMap(node) ? Schema.defaultTags.MAP : isSeq(node) ? Schema.defaultTags.SEQ : Schema.defaultTags.STR;

	    if (fallback) {
	      doc.warnings.push(new errors.YAMLWarning(node, `The tag ${tagName} is unavailable, falling back to ${fallback}`));
	      const res = this.resolveNode(doc, node, fallback);
	      res.tag = tagName;
	      return res;
	    } else {
	      doc.errors.push(new errors.YAMLReferenceError(node, `The tag ${tagName} is unavailable`));
	    }

	    return null;
	  }

	  getTagObject(item) {
	    if (item instanceof _Alias.default) return _Alias.default;

	    if (item.tag) {
	      const match = this.tags.filter(t => t.tag === item.tag);
	      if (match.length > 0) return match.find(t => t.format === item.format) || match[0];
	    }

	    let tagObj, obj;

	    if (item instanceof _Scalar.default) {
	      obj = item.value; // TODO: deprecate/remove class check

	      const match = this.tags.filter(t => t.identify && t.identify(obj) || t.class && obj instanceof t.class);
	      tagObj = match.find(t => t.format === item.format) || match.find(t => !t.format);
	    } else {
	      obj = item;
	      tagObj = this.tags.find(t => t.nodeClass && obj instanceof t.nodeClass);
	    }

	    if (!tagObj) {
	      const name = obj && obj.constructor ? obj.constructor.name : typeof obj;
	      throw new Error(`Tag not resolved for ${name} value`);
	    }

	    return tagObj;
	  } // needs to be called before stringifier to allow for circular anchor refs


	  stringifyProps(node, tagObj, {
	    anchors,
	    doc
	  }) {
	    const props = [];
	    const anchor = doc.anchors.getName(node);

	    if (anchor) {
	      anchors[anchor] = node;
	      props.push(`&${anchor}`);
	    }

	    if (node.tag) {
	      props.push(doc.stringifyTag(node.tag));
	    } else if (!tagObj.default) {
	      props.push(doc.stringifyTag(tagObj.tag));
	    }

	    return props.join(' ');
	  }

	  stringify(item, ctx, onComment, onChompKeep) {
	    let tagObj;

	    if (!(item instanceof _Node.default)) {
	      const createCtx = {
	        aliasNodes: [],
	        onTagObj: o => tagObj = o,
	        prevObjects: []
	      };
	      item = this.createNode(item, true, null, createCtx);
	      const {
	        anchors
	      } = ctx.doc;

	      for (const alias of createCtx.aliasNodes) {
	        alias.source = alias.source.node;
	        let name = anchors.getName(alias.source);

	        if (!name) {
	          name = anchors.newName();
	          anchors.map[name] = alias.source;
	        }
	      }
	    }

	    ctx.tags = this;
	    if (item instanceof _Pair.default) return item.toString(ctx, onComment, onChompKeep);
	    if (!tagObj) tagObj = this.getTagObject(item);
	    const props = this.stringifyProps(item, tagObj, ctx);
	    const str = typeof tagObj.stringify === 'function' ? tagObj.stringify(item, ctx, onComment, onChompKeep) : item instanceof _Collection.default ? item.toString(ctx, onComment, onChompKeep) : (0, stringify.stringifyString)(item, ctx, onComment, onChompKeep);
	    return props ? item instanceof _Collection.default && str[0] !== '{' && str[0] !== '[' ? `${props}\n${ctx.indent}${str}` : `${props} ${str}` : str;
	  }

	}

	exports.default = Schema;

	_defineProperty(Schema, "defaultPrefix", 'tag:yaml.org,2002:');

	_defineProperty(Schema, "defaultTags", {
	  MAP: 'tag:yaml.org,2002:map',
	  SEQ: 'tag:yaml.org,2002:seq',
	  STR: 'tag:yaml.org,2002:str'
	});
	});

	unwrapExports(schema);

	var Document_1$1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _addComment = _interopRequireDefault(addComment_1);

	var _Anchors = _interopRequireDefault(Anchors_1);





	var _listTagNames = _interopRequireDefault(listTagNames);

	var _schema = _interopRequireDefault(schema);

	var _Alias = _interopRequireDefault(Alias_1$1);

	var _Collection = _interopRequireWildcard(Collection_1$1);

	var _Node = _interopRequireDefault(Node_1$1);

	var _Scalar = _interopRequireDefault(Scalar_1);

	var _toJSON = _interopRequireDefault(toJSON_1);

	function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	const isCollectionItem = node => node && [constants.Type.MAP_KEY, constants.Type.MAP_VALUE, constants.Type.SEQ_ITEM].includes(node.type);

	class Document {
	  constructor(options) {
	    this.anchors = new _Anchors.default(options.anchorPrefix);
	    this.commentBefore = null;
	    this.comment = null;
	    this.contents = null;
	    this.directivesEndMarker = null;
	    this.errors = [];
	    this.options = options;
	    this.schema = null;
	    this.tagPrefixes = [];
	    this.version = null;
	    this.warnings = [];
	  }

	  assertCollectionContents() {
	    if (this.contents instanceof _Collection.default) return true;
	    throw new Error('Expected a YAML collection as document contents');
	  }

	  add(value) {
	    this.assertCollectionContents();
	    return this.contents.add(value);
	  }

	  addIn(path, value) {
	    this.assertCollectionContents();
	    this.contents.addIn(path, value);
	  }

	  delete(key) {
	    this.assertCollectionContents();
	    return this.contents.delete(key);
	  }

	  deleteIn(path) {
	    if ((0, _Collection.isEmptyPath)(path)) {
	      if (this.contents == null) return false;
	      this.contents = null;
	      return true;
	    }

	    this.assertCollectionContents();
	    return this.contents.deleteIn(path);
	  }

	  getDefaults() {
	    return Document.defaults[this.version] || Document.defaults[this.options.version] || {};
	  }

	  get(key, keepScalar) {
	    return this.contents instanceof _Collection.default ? this.contents.get(key, keepScalar) : undefined;
	  }

	  getIn(path, keepScalar) {
	    if ((0, _Collection.isEmptyPath)(path)) return !keepScalar && this.contents instanceof _Scalar.default ? this.contents.value : this.contents;
	    return this.contents instanceof _Collection.default ? this.contents.getIn(path, keepScalar) : undefined;
	  }

	  has(key) {
	    return this.contents instanceof _Collection.default ? this.contents.has(key) : false;
	  }

	  hasIn(path) {
	    if ((0, _Collection.isEmptyPath)(path)) return this.contents !== undefined;
	    return this.contents instanceof _Collection.default ? this.contents.hasIn(path) : false;
	  }

	  set(key, value) {
	    this.assertCollectionContents();
	    this.contents.set(key, value);
	  }

	  setIn(path, value) {
	    if ((0, _Collection.isEmptyPath)(path)) this.contents = value;else {
	      this.assertCollectionContents();
	      this.contents.setIn(path, value);
	    }
	  }

	  setSchema(id, customTags) {
	    if (!id && !customTags && this.schema) return;
	    if (typeof id === 'number') id = id.toFixed(1);

	    if (id === '1.0' || id === '1.1' || id === '1.2') {
	      if (this.version) this.version = id;else this.options.version = id;
	      delete this.options.schema;
	    } else if (id && typeof id === 'string') {
	      this.options.schema = id;
	    }

	    if (Array.isArray(customTags)) this.options.customTags = customTags;
	    const opt = Object.assign({}, this.getDefaults(), this.options);
	    this.schema = new _schema.default(opt);
	  }

	  parse(node, prevDoc) {
	    if (this.options.keepCstNodes) this.cstNode = node;
	    if (this.options.keepNodeTypes) this.type = 'DOCUMENT';
	    const {
	      directives = [],
	      contents = [],
	      directivesEndMarker,
	      error,
	      valueRange
	    } = node;

	    if (error) {
	      if (!error.source) error.source = this;
	      this.errors.push(error);
	    }

	    this.parseDirectives(directives, prevDoc);
	    if (directivesEndMarker) this.directivesEndMarker = true;
	    this.range = valueRange ? [valueRange.start, valueRange.end] : null;
	    this.setSchema();
	    this.anchors._cstAliases = [];
	    this.parseContents(contents);
	    this.anchors.resolveNodes();

	    if (this.options.prettyErrors) {
	      for (const error of this.errors) if (error instanceof errors.YAMLError) error.makePretty();

	      for (const warn of this.warnings) if (warn instanceof errors.YAMLError) warn.makePretty();
	    }

	    return this;
	  }

	  parseDirectives(directives, prevDoc) {
	    const directiveComments = [];
	    let hasDirectives = false;
	    directives.forEach(directive => {
	      const {
	        comment,
	        name
	      } = directive;

	      switch (name) {
	        case 'TAG':
	          this.resolveTagDirective(directive);
	          hasDirectives = true;
	          break;

	        case 'YAML':
	        case 'YAML:1.0':
	          this.resolveYamlDirective(directive);
	          hasDirectives = true;
	          break;

	        default:
	          if (name) {
	            const msg = `YAML only supports %TAG and %YAML directives, and not %${name}`;
	            this.warnings.push(new errors.YAMLWarning(directive, msg));
	          }

	      }

	      if (comment) directiveComments.push(comment);
	    });

	    if (prevDoc && !hasDirectives && '1.1' === (this.version || prevDoc.version || this.options.version)) {
	      const copyTagPrefix = ({
	        handle,
	        prefix
	      }) => ({
	        handle,
	        prefix
	      });

	      this.tagPrefixes = prevDoc.tagPrefixes.map(copyTagPrefix);
	      this.version = prevDoc.version;
	    }

	    this.commentBefore = directiveComments.join('\n') || null;
	  }

	  parseContents(contents) {
	    const comments = {
	      before: [],
	      after: []
	    };
	    const contentNodes = [];
	    let spaceBefore = false;
	    contents.forEach(node => {
	      if (node.valueRange) {
	        if (contentNodes.length === 1) {
	          const msg = 'Document is not valid YAML (bad indentation?)';
	          this.errors.push(new errors.YAMLSyntaxError(node, msg));
	        }

	        const res = this.resolveNode(node);

	        if (spaceBefore) {
	          res.spaceBefore = true;
	          spaceBefore = false;
	        }

	        contentNodes.push(res);
	      } else if (node.comment !== null) {
	        const cc = contentNodes.length === 0 ? comments.before : comments.after;
	        cc.push(node.comment);
	      } else if (node.type === constants.Type.BLANK_LINE) {
	        spaceBefore = true;

	        if (contentNodes.length === 0 && comments.before.length > 0 && !this.commentBefore) {
	          // space-separated comments at start are parsed as document comments
	          this.commentBefore = comments.before.join('\n');
	          comments.before = [];
	        }
	      }
	    });

	    switch (contentNodes.length) {
	      case 0:
	        this.contents = null;
	        comments.after = comments.before;
	        break;

	      case 1:
	        this.contents = contentNodes[0];

	        if (this.contents) {
	          const cb = comments.before.join('\n') || null;

	          if (cb) {
	            const cbNode = this.contents instanceof _Collection.default && this.contents.items[0] ? this.contents.items[0] : this.contents;
	            cbNode.commentBefore = cbNode.commentBefore ? `${cb}\n${cbNode.commentBefore}` : cb;
	          }
	        } else {
	          comments.after = comments.before.concat(comments.after);
	        }

	        break;

	      default:
	        this.contents = contentNodes;

	        if (this.contents[0]) {
	          this.contents[0].commentBefore = comments.before.join('\n') || null;
	        } else {
	          comments.after = comments.before.concat(comments.after);
	        }

	    }

	    this.comment = comments.after.join('\n') || null;
	  }

	  resolveTagDirective(directive) {
	    const [handle, prefix] = directive.parameters;

	    if (handle && prefix) {
	      if (this.tagPrefixes.every(p => p.handle !== handle)) {
	        this.tagPrefixes.push({
	          handle,
	          prefix
	        });
	      } else {
	        const msg = 'The %TAG directive must only be given at most once per handle in the same document.';
	        this.errors.push(new errors.YAMLSemanticError(directive, msg));
	      }
	    } else {
	      const msg = 'Insufficient parameters given for %TAG directive';
	      this.errors.push(new errors.YAMLSemanticError(directive, msg));
	    }
	  }

	  resolveYamlDirective(directive) {
	    let [version] = directive.parameters;
	    if (directive.name === 'YAML:1.0') version = '1.0';

	    if (this.version) {
	      const msg = 'The %YAML directive must only be given at most once per document.';
	      this.errors.push(new errors.YAMLSemanticError(directive, msg));
	    }

	    if (!version) {
	      const msg = 'Insufficient parameters given for %YAML directive';
	      this.errors.push(new errors.YAMLSemanticError(directive, msg));
	    } else {
	      if (!Document.defaults[version]) {
	        const v0 = this.version || this.options.version;
	        const msg = `Document will be parsed as YAML ${v0} rather than YAML ${version}`;
	        this.warnings.push(new errors.YAMLWarning(directive, msg));
	      }

	      this.version = version;
	    }
	  }

	  resolveTagName(node) {
	    const {
	      tag,
	      type
	    } = node;
	    let nonSpecific = false;

	    if (tag) {
	      const {
	        handle,
	        suffix,
	        verbatim
	      } = tag;

	      if (verbatim) {
	        if (verbatim !== '!' && verbatim !== '!!') return verbatim;
	        const msg = `Verbatim tags aren't resolved, so ${verbatim} is invalid.`;
	        this.errors.push(new errors.YAMLSemanticError(node, msg));
	      } else if (handle === '!' && !suffix) {
	        nonSpecific = true;
	      } else {
	        let prefix = this.tagPrefixes.find(p => p.handle === handle);

	        if (!prefix) {
	          const dtp = this.getDefaults().tagPrefixes;
	          if (dtp) prefix = dtp.find(p => p.handle === handle);
	        }

	        if (prefix) {
	          if (suffix) {
	            if (handle === '!' && (this.version || this.options.version) === '1.0') {
	              if (suffix[0] === '^') return suffix;

	              if (/[:/]/.test(suffix)) {
	                // word/foo -> tag:word.yaml.org,2002:foo
	                const vocab = suffix.match(/^([a-z0-9-]+)\/(.*)/i);
	                return vocab ? `tag:${vocab[1]}.yaml.org,2002:${vocab[2]}` : `tag:${suffix}`;
	              }
	            }

	            return prefix.prefix + decodeURIComponent(suffix);
	          }

	          this.errors.push(new errors.YAMLSemanticError(node, `The ${handle} tag has no suffix.`));
	        } else {
	          const msg = `The ${handle} tag handle is non-default and was not declared.`;
	          this.errors.push(new errors.YAMLSemanticError(node, msg));
	        }
	      }
	    }

	    switch (type) {
	      case constants.Type.BLOCK_FOLDED:
	      case constants.Type.BLOCK_LITERAL:
	      case constants.Type.QUOTE_DOUBLE:
	      case constants.Type.QUOTE_SINGLE:
	        return _schema.default.defaultTags.STR;

	      case constants.Type.FLOW_MAP:
	      case constants.Type.MAP:
	        return _schema.default.defaultTags.MAP;

	      case constants.Type.FLOW_SEQ:
	      case constants.Type.SEQ:
	        return _schema.default.defaultTags.SEQ;

	      case constants.Type.PLAIN:
	        return nonSpecific ? _schema.default.defaultTags.STR : null;

	      default:
	        return null;
	    }
	  }

	  resolveNode(node) {
	    if (!node) return null;
	    const {
	      anchors,
	      errors: errors$1,
	      schema
	    } = this;
	    let hasAnchor = false;
	    let hasTag = false;
	    const comments = {
	      before: [],
	      after: []
	    };
	    const props = isCollectionItem(node.context.parent) ? node.context.parent.props.concat(node.props) : node.props;

	    for (const {
	      start,
	      end
	    } of props) {
	      switch (node.context.src[start]) {
	        case constants.Char.COMMENT:
	          {
	            if (!node.commentHasRequiredWhitespace(start)) {
	              const msg = 'Comments must be separated from other tokens by white space characters';
	              errors$1.push(new errors.YAMLSemanticError(node, msg));
	            }

	            const c = node.context.src.slice(start + 1, end);
	            const {
	              header,
	              valueRange
	            } = node;

	            if (valueRange && (start > valueRange.start || header && start > header.start)) {
	              comments.after.push(c);
	            } else {
	              comments.before.push(c);
	            }
	          }
	          break;

	        case constants.Char.ANCHOR:
	          if (hasAnchor) {
	            const msg = 'A node can have at most one anchor';
	            errors$1.push(new errors.YAMLSemanticError(node, msg));
	          }

	          hasAnchor = true;
	          break;

	        case constants.Char.TAG:
	          if (hasTag) {
	            const msg = 'A node can have at most one tag';
	            errors$1.push(new errors.YAMLSemanticError(node, msg));
	          }

	          hasTag = true;
	          break;
	      }
	    }

	    if (hasAnchor) {
	      const name = node.anchor;
	      const prev = anchors.getNode(name); // At this point, aliases for any preceding node with the same anchor
	      // name have already been resolved, so it may safely be renamed.

	      if (prev) anchors.map[anchors.newName(name)] = prev; // During parsing, we need to store the CST node in anchors.map as
	      // anchors need to be available during resolution to allow for
	      // circular references.

	      anchors.map[name] = node;
	    }

	    let res;

	    if (node.type === constants.Type.ALIAS) {
	      if (hasAnchor || hasTag) {
	        const msg = 'An alias node must not specify any properties';
	        errors$1.push(new errors.YAMLSemanticError(node, msg));
	      }

	      const name = node.rawValue;
	      const src = anchors.getNode(name);

	      if (!src) {
	        const msg = `Aliased anchor not found: ${name}`;
	        errors$1.push(new errors.YAMLReferenceError(node, msg));
	        return null;
	      } // Lazy resolution for circular references


	      res = new _Alias.default(src);

	      anchors._cstAliases.push(res);
	    } else {
	      const tagName = this.resolveTagName(node);

	      if (tagName) {
	        res = schema.resolveNodeWithFallback(this, node, tagName);
	      } else {
	        if (node.type !== constants.Type.PLAIN) {
	          const msg = `Failed to resolve ${node.type} node here`;
	          errors$1.push(new errors.YAMLSyntaxError(node, msg));
	          return null;
	        }

	        try {
	          res = schema.resolveScalar(node.strValue || '');
	        } catch (error) {
	          if (!error.source) error.source = node;
	          errors$1.push(error);
	          return null;
	        }
	      }
	    }

	    if (res) {
	      res.range = [node.range.start, node.range.end];
	      if (this.options.keepCstNodes) res.cstNode = node;
	      if (this.options.keepNodeTypes) res.type = node.type;
	      const cb = comments.before.join('\n');

	      if (cb) {
	        res.commentBefore = res.commentBefore ? `${res.commentBefore}\n${cb}` : cb;
	      }

	      const ca = comments.after.join('\n');
	      if (ca) res.comment = res.comment ? `${res.comment}\n${ca}` : ca;
	    }

	    return node.resolved = res;
	  }

	  listNonDefaultTags() {
	    return (0, _listTagNames.default)(this.contents).filter(t => t.indexOf(_schema.default.defaultPrefix) !== 0);
	  }

	  setTagPrefix(handle, prefix) {
	    if (handle[0] !== '!' || handle[handle.length - 1] !== '!') throw new Error('Handle must start and end with !');

	    if (prefix) {
	      const prev = this.tagPrefixes.find(p => p.handle === handle);
	      if (prev) prev.prefix = prefix;else this.tagPrefixes.push({
	        handle,
	        prefix
	      });
	    } else {
	      this.tagPrefixes = this.tagPrefixes.filter(p => p.handle !== handle);
	    }
	  }

	  stringifyTag(tag) {
	    if ((this.version || this.options.version) === '1.0') {
	      const priv = tag.match(/^tag:private\.yaml\.org,2002:([^:/]+)$/);
	      if (priv) return '!' + priv[1];
	      const vocab = tag.match(/^tag:([a-zA-Z0-9-]+)\.yaml\.org,2002:(.*)/);
	      return vocab ? `!${vocab[1]}/${vocab[2]}` : `!${tag.replace(/^tag:/, '')}`;
	    } else {
	      let p = this.tagPrefixes.find(p => tag.indexOf(p.prefix) === 0);

	      if (!p) {
	        const dtp = this.getDefaults().tagPrefixes;
	        p = dtp && dtp.find(p => tag.indexOf(p.prefix) === 0);
	      }

	      if (!p) return tag[0] === '!' ? tag : `!<${tag}>`;
	      const suffix = tag.substr(p.prefix.length).replace(/[!,[\]{}]/g, ch => ({
	        '!': '%21',
	        ',': '%2C',
	        '[': '%5B',
	        ']': '%5D',
	        '{': '%7B',
	        '}': '%7D'
	      })[ch]);
	      return p.handle + suffix;
	    }
	  }

	  toJSON(arg) {
	    const {
	      keepBlobsInJSON,
	      mapAsMap,
	      maxAliasCount
	    } = this.options;
	    const keep = keepBlobsInJSON && (typeof arg !== 'string' || !(this.contents instanceof _Scalar.default));
	    const ctx = {
	      doc: this,
	      keep,
	      mapAsMap: keep && !!mapAsMap,
	      maxAliasCount
	    };
	    const anchorNames = Object.keys(this.anchors.map);
	    if (anchorNames.length > 0) ctx.anchors = anchorNames.map(name => ({
	      alias: [],
	      aliasCount: 0,
	      count: 1,
	      node: this.anchors.map[name]
	    }));
	    return (0, _toJSON.default)(this.contents, arg, ctx);
	  }

	  toString() {
	    if (this.errors.length > 0) throw new Error('Document with errors cannot be stringified');
	    this.setSchema();
	    const lines = [];
	    let hasDirectives = false;

	    if (this.version) {
	      let vd = '%YAML 1.2';

	      if (this.schema.name === 'yaml-1.1') {
	        if (this.version === '1.0') vd = '%YAML:1.0';else if (this.version === '1.1') vd = '%YAML 1.1';
	      }

	      lines.push(vd);
	      hasDirectives = true;
	    }

	    const tagNames = this.listNonDefaultTags();
	    this.tagPrefixes.forEach(({
	      handle,
	      prefix
	    }) => {
	      if (tagNames.some(t => t.indexOf(prefix) === 0)) {
	        lines.push(`%TAG ${handle} ${prefix}`);
	        hasDirectives = true;
	      }
	    });
	    if (hasDirectives || this.directivesEndMarker) lines.push('---');

	    if (this.commentBefore) {
	      if (hasDirectives || !this.directivesEndMarker) lines.unshift('');
	      lines.unshift(this.commentBefore.replace(/^/gm, '#'));
	    }

	    const ctx = {
	      anchors: {},
	      doc: this,
	      indent: ''
	    };
	    let chompKeep = false;
	    let contentComment = null;

	    if (this.contents) {
	      if (this.contents instanceof _Node.default) {
	        if (this.contents.spaceBefore && (hasDirectives || this.directivesEndMarker)) lines.push('');
	        if (this.contents.commentBefore) lines.push(this.contents.commentBefore.replace(/^/gm, '#')); // top-level block scalars need to be indented if followed by a comment

	        ctx.forceBlockIndent = !!this.comment;
	        contentComment = this.contents.comment;
	      }

	      const onChompKeep = contentComment ? null : () => chompKeep = true;
	      const body = this.schema.stringify(this.contents, ctx, () => contentComment = null, onChompKeep);
	      lines.push((0, _addComment.default)(body, '', contentComment));
	    } else if (this.contents !== undefined) {
	      lines.push(this.schema.stringify(this.contents, ctx));
	    }

	    if (this.comment) {
	      if ((!chompKeep || contentComment) && lines[lines.length - 1] !== '') lines.push('');
	      lines.push(this.comment.replace(/^/gm, '#'));
	    }

	    return lines.join('\n') + '\n';
	  }

	}

	exports.default = Document;

	_defineProperty(Document, "defaults", {
	  '1.0': {
	    schema: 'yaml-1.1',
	    merge: true,
	    tagPrefixes: [{
	      handle: '!',
	      prefix: _schema.default.defaultPrefix
	    }, {
	      handle: '!!',
	      prefix: 'tag:private.yaml.org,2002:'
	    }]
	  },
	  '1.1': {
	    schema: 'yaml-1.1',
	    merge: true,
	    tagPrefixes: [{
	      handle: '!',
	      prefix: '!'
	    }, {
	      handle: '!!',
	      prefix: _schema.default.defaultPrefix
	    }]
	  },
	  '1.2': {
	    schema: 'core',
	    merge: false,
	    tagPrefixes: [{
	      handle: '!',
	      prefix: '!'
	    }, {
	      handle: '!!',
	      prefix: _schema.default.defaultPrefix
	    }]
	  }
	});
	});

	unwrapExports(Document_1$1);

	var dist = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = void 0;

	var _parse = _interopRequireDefault(parse_1);

	var _Document = _interopRequireDefault(Document_1$1);



	var _schema = _interopRequireDefault(schema);



	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	const defaultOptions = {
	  anchorPrefix: 'a',
	  customTags: null,
	  keepCstNodes: false,
	  keepNodeTypes: true,
	  keepBlobsInJSON: true,
	  mapAsMap: false,
	  maxAliasCount: 100,
	  prettyErrors: false,
	  // TODO Set true in v2
	  simpleKeys: false,
	  version: '1.2'
	};

	function createNode(value, wrapScalars = true, tag) {
	  if (tag === undefined && typeof wrapScalars === 'string') {
	    tag = wrapScalars;
	    wrapScalars = true;
	  }

	  const options = Object.assign({}, _Document.default.defaults[defaultOptions.version], defaultOptions);
	  const schema = new _schema.default(options);
	  return schema.createNode(value, wrapScalars, tag);
	}

	class Document extends _Document.default {
	  constructor(options) {
	    super(Object.assign({}, defaultOptions, options));
	  }

	}

	function parseAllDocuments(src, options) {
	  const stream = [];
	  let prev;

	  for (const cstDoc of (0, _parse.default)(src)) {
	    const doc = new Document(options);
	    doc.parse(cstDoc, prev);
	    stream.push(doc);
	    prev = doc;
	  }

	  return stream;
	}

	function parseDocument(src, options) {
	  const cst = (0, _parse.default)(src);
	  const doc = new Document(options).parse(cst[0]);

	  if (cst.length > 1) {
	    const errMsg = 'Source contains multiple documents; please use YAML.parseAllDocuments()';
	    doc.errors.unshift(new errors.YAMLSemanticError(cst[1], errMsg));
	  }

	  return doc;
	}

	function parse(src, options) {
	  const doc = parseDocument(src, options);
	  doc.warnings.forEach(warning => (0, warnings.warn)(warning));
	  if (doc.errors.length > 0) throw doc.errors[0];
	  return doc.toJSON();
	}

	function stringify(value, options) {
	  const doc = new Document(options);
	  doc.contents = value;
	  return String(doc);
	}

	var _default = {
	  createNode,
	  defaultOptions,
	  Document,
	  parse,
	  parseAllDocuments,
	  parseCST: _parse.default,
	  parseDocument,
	  stringify
	};
	exports.default = _default;
	});

	unwrapExports(dist);

	var yaml = dist.default;

	/* eslint-env es6 */

	let _directives = {};

	/**
	 * Register/define attribute directives in few
	 * @param {string} name directive name
	 * @param {FewDirective} directive attribute directive definition
	 */
	function defineDirective( name, directive ) {
	    _directives[name] = directive;
	}

	/**
	 * Get attribute directive definition
	 * @param {string} name directive name
	 * @returns {FewDirective} attribute directive definition
	 */
	function getDirective( name ) {
	    return _directives[name];
	}

	/* eslint-env es6 */
	let FewViewNullUnit = {
	    KEY: 'f-ignore'
	};

	let _filterElements = {

	};

	/**
	 * Register/define element which will be
	 * @param {string} nodeName Element name all in upper case
	 */
	function excludeElement( nodeName ) {
	    _filterElements[nodeName] = true;
	}

	/**
	 * Check if element is excluded by few
	 * @param {string} nodeName element name all in uppercase
	 * @returns {boolean} if true few will ignore the element
	 */
	function isExcluded( nodeName ) {
	    return _filterElements[nodeName];
	}

	var nullUnitFactory = {
	    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE &&
	                ( isExcluded( domNode.nodeName ) ||
	                  domNode.hasAttribute( FewViewNullUnit.KEY ) ),
	    createUnit: () => null
	};

	/* eslint-env es6 */

	/**
	 * Parse view string as DOM without interpret it
	 * TODO no for now and needs to be enahanced
	 * @param {string} str view template as string
	 * @returns {Element} DOM Element
	 */
	function parseView( str ) {
	    let parser = new DOMParser();
	    let fragement = document.createDocumentFragment();
	    fragement.appendChild( parser.parseFromString( `<div>${str}</div>`, 'text/html' ).body.firstChild );
	    return fragement.firstChild;
	}


	/**
	 * Parse view string as DOM with interpretion
	 * @param {string} str HTML String snippet as input
	 * @returns {Element} DOM Element
	 */
	function parseViewToDiv( str ) {
	    let newDom = document.createElement( 'div' );
	    newDom.innerHTML = str.trim();
	    return newDom;
	}

	/**
	 * evaluate string as Javascript expression
	 * @param {string} input string as expression
	 * @param {Object} params parameters as name value pair
	 * @param {boolean} ignoreError if true the error is not thrown
	 * @return {*} evaluation result
	 *
	 * TODO: match name with function parameters
	 * https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
	 */
	let evalExpression = function( input, params, ignoreError ) {
	  const names = params ? Object.keys( params ) : [];
	  const vals = params ? Object.values( params ) : [];
	  try {
	      return new Function( ...names, `return ${input};` )( ...vals );
	  } catch( e ) {
	      if ( !ignoreError ) {
	          throw new Error( `evalExpression('${input}') => ${e.message}` );
	      } else {
	          return undefined;
	      }
	  }
	};


	/**
	 * fastest way to copy a pure JSON object, use on your own risk
	 * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
	 *
	 * @param {Object} obj Current DOM Element
	 * @returns {Object} new cloned object
	 */
	function cloneDeepJsonObject( obj ) {
	    return obj ? JSON.parse( JSON.stringify( obj ) ) : obj;
	}

	/**
	 * get form input from Form HTML Element
	 * @param {Element} elem Form element
	 * @returns {Object} from input as name value pair
	 */
	function getFormInput( elem ) {
	    let res = {};
	    // TODO: not consider custom element for now
	    if( elem.tagName === 'FORM' ) {
	        let nodeList = elem.elements;
	        for ( let i = 0; i < nodeList.length; i++ ) {
	            if ( nodeList[i].nodeName === 'INPUT' && nodeList[i].type === 'text' ) {
	                // Update text input
	                nodeList[i].value.toLocaleUpperCase();
	            }

	            // only supports naming input
	            if( nodeList[i].name ) {
	                res[nodeList[i].name] = nodeList[i].value;
	            }
	        }
	    }
	    return res;
	}

	/**
	 * Check if element has scope defined
	 *
	 * @param {Element} element Current DOM Element
	 * @returns {boolean} true if element has scope defined
	 */
	function hasScope( element ) {
	    return element && element.classList && element.classList.contains( 'few-scope' );
	}

	/**
	 * Get closest parent element which has view model context
	 * NOTE: IE may need polyfill below -
	 * https://github.com/jonathantneal/closest
	 *
	 * @param {Element} element Current DOM Element
	 * @returns {Element} Closest parent element which has view model context
	 */
	function getScopeElement( element ) {
	    return element.closest( '.few-scope' );
	}

	/**
	 * Attach component object on specific element
	 * @param {Element} element DOM Element
	 * @param {Object} componentObj componentObject
	 */
	function setComponent( element, componentObj ) {
	    if ( element && componentObj ) {
	        element._vm = componentObj;
	        element.classList.add( 'few-scope' );
	    } else {
	      throw new Error( `setComponent(${element ?  element.id ? `id:${element.id}` : element.tagName  : 'undefined'}) => componentObj is undefined` );
	    }
	}

	/**
	 * Get view model context from closet parent element which has it
	 *
	 * @param {Element} element DOM Element
	 * @returns {Object} view model object context
	 */
	function getComponent( element ) {
	    let scopeElem = getScopeElement( element );
	    if( scopeElem ) {
	        return scopeElem._vm;
	    }
	}

	/**
	 * Get closest few view element
	 *
	 * @param {Element} element Current DOM Element
	 * @returns {Element} Closest parent element which has view model context
	 */
	function getViewElement( element ) {
	    let scopeElem = getScopeElement( element );
	    if ( scopeElem ) {
	        return scopeElem.parentElement;
	    }
	}

	/* eslint-env es6 */
	// Simple http implementation

	/**
	 * simple http get
	 * @param {string} theUrl url as string
	 * @returns {Promise} promise
	 */
	function httpGet( theUrl ) {
	    return new Promise( ( resolve, reject ) => {
	        let xhr = new XMLHttpRequest();
	        xhr.onreadystatechange = () => {
	            if ( xhr.readyState === 4 && xhr.status !== 404 ) {
	                resolve( xhr.responseText );
	            }
	        };

	        xhr.onerror = () => {
	            reject( `httpGet(${theUrl}) => ${xhr.status}: ${xhr.statusText}` );
	        };

	        xhr.onloadend = function() {
	            if ( xhr.status === 404 ) {
	                reject( `httpGet(${theUrl}) => ${xhr.status}: ${xhr.statusText}` );
	            }
	        };

	        xhr.open( 'GET', theUrl, true ); // true for asynchronous
	        xhr.send( null );
	    } );
	}

	var http = {
	    get: httpGet
	};

	/* eslint-env es6 */

	let exports$1;

	/**
	 * Run method in view model
	 * @param {Element} elem DOM Element
	 * @param {string} methodName method name in view model
	 * @param {object}  e event object as context
	 * @returns {Promise} evaluation as promise
	 */
	function handleEvent( elem, methodName, e ) {
	    /*
	        return false from within a jQuery event handler is effectively the same as calling
	        both e.preventDefault and e.stopPropagation on the passed jQuery.Event object.

	        e.preventDefault() will prevent the default event from occuring.
	        e.stopPropagation() will prevent the event from bubbling up.
	        return false will do both.

	        Note that this behaviour differs from normal (non-jQuery) event handlers, in which,
	        notably, return false does not stop the event from bubbling up.

	        Source: John Resig
	    */
	    e.preventDefault();
	    // e.stopPropagation();

	    let component = getComponent( elem );
	    return component.update( methodName, {
	        element: elem,
	        event: e
	    } );
	}

	/**
	 * Request update to parent view model
	 * @param {Element} elem DOM Element  as context
	 * @param {object}  data data as request input
	 * @param {string}  method action name
	 * @returns {Promise} evaluation as promise
	 */
	function requestUpdate( elem, data, method ) {
	    let viewElem = getViewElement( elem );
	    let component = getComponent( viewElem );
	    let actionName = method || viewElem.id;
	    if ( component.hasAction( actionName ) ) {
	        // TODO: need to tune performance to reduce over update
	        return component.update( actionName, data );
	    }
	    return requestUpdate( viewElem, data, actionName );
	}

	/**
	 * Import Global Document Style Sheet to shadow DOM
	 * @param {Element} shadowRoot Shadow root element for shadow DOM
	 */
	function importDocStyle( shadowRoot ) {
	    let linkElems = document.head.querySelectorAll( 'link' );
	    linkElems.forEach( ( elem )=>{
	        if ( elem.rel === 'stylesheet' ) {
	            shadowRoot.appendChild( elem.cloneNode() );
	        }
	    } );
	}

	var few = exports$1 = {
	    handleEvent,
	    requestUpdate,
	    getFormInput,
	    getViewElement,
	    importDocStyle,
	    httpGet,
	    exclude: excludeElement,
	    directive: defineDirective
	};

	// set it at global
	window.few = exports$1;

	var lodash = createCommonjsModule(function (module, exports) {
	(function() {

	  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
	  var undefined$1;

	  /** Used as the semantic version number. */
	  var VERSION = '4.17.15';

	  /** Used as the size to enable large array optimizations. */
	  var LARGE_ARRAY_SIZE = 200;

	  /** Error message constants. */
	  var CORE_ERROR_TEXT = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
	      FUNC_ERROR_TEXT = 'Expected a function';

	  /** Used to stand-in for `undefined` hash values. */
	  var HASH_UNDEFINED = '__lodash_hash_undefined__';

	  /** Used as the maximum memoize cache size. */
	  var MAX_MEMOIZE_SIZE = 500;

	  /** Used as the internal argument placeholder. */
	  var PLACEHOLDER = '__lodash_placeholder__';

	  /** Used to compose bitmasks for cloning. */
	  var CLONE_DEEP_FLAG = 1,
	      CLONE_FLAT_FLAG = 2,
	      CLONE_SYMBOLS_FLAG = 4;

	  /** Used to compose bitmasks for value comparisons. */
	  var COMPARE_PARTIAL_FLAG = 1,
	      COMPARE_UNORDERED_FLAG = 2;

	  /** Used to compose bitmasks for function metadata. */
	  var WRAP_BIND_FLAG = 1,
	      WRAP_BIND_KEY_FLAG = 2,
	      WRAP_CURRY_BOUND_FLAG = 4,
	      WRAP_CURRY_FLAG = 8,
	      WRAP_CURRY_RIGHT_FLAG = 16,
	      WRAP_PARTIAL_FLAG = 32,
	      WRAP_PARTIAL_RIGHT_FLAG = 64,
	      WRAP_ARY_FLAG = 128,
	      WRAP_REARG_FLAG = 256,
	      WRAP_FLIP_FLAG = 512;

	  /** Used as default options for `_.truncate`. */
	  var DEFAULT_TRUNC_LENGTH = 30,
	      DEFAULT_TRUNC_OMISSION = '...';

	  /** Used to detect hot functions by number of calls within a span of milliseconds. */
	  var HOT_COUNT = 800,
	      HOT_SPAN = 16;

	  /** Used to indicate the type of lazy iteratees. */
	  var LAZY_FILTER_FLAG = 1,
	      LAZY_MAP_FLAG = 2,
	      LAZY_WHILE_FLAG = 3;

	  /** Used as references for various `Number` constants. */
	  var INFINITY = 1 / 0,
	      MAX_SAFE_INTEGER = 9007199254740991,
	      MAX_INTEGER = 1.7976931348623157e+308,
	      NAN = 0 / 0;

	  /** Used as references for the maximum length and index of an array. */
	  var MAX_ARRAY_LENGTH = 4294967295,
	      MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
	      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

	  /** Used to associate wrap methods with their bit flags. */
	  var wrapFlags = [
	    ['ary', WRAP_ARY_FLAG],
	    ['bind', WRAP_BIND_FLAG],
	    ['bindKey', WRAP_BIND_KEY_FLAG],
	    ['curry', WRAP_CURRY_FLAG],
	    ['curryRight', WRAP_CURRY_RIGHT_FLAG],
	    ['flip', WRAP_FLIP_FLAG],
	    ['partial', WRAP_PARTIAL_FLAG],
	    ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
	    ['rearg', WRAP_REARG_FLAG]
	  ];

	  /** `Object#toString` result references. */
	  var argsTag = '[object Arguments]',
	      arrayTag = '[object Array]',
	      asyncTag = '[object AsyncFunction]',
	      boolTag = '[object Boolean]',
	      dateTag = '[object Date]',
	      domExcTag = '[object DOMException]',
	      errorTag = '[object Error]',
	      funcTag = '[object Function]',
	      genTag = '[object GeneratorFunction]',
	      mapTag = '[object Map]',
	      numberTag = '[object Number]',
	      nullTag = '[object Null]',
	      objectTag = '[object Object]',
	      promiseTag = '[object Promise]',
	      proxyTag = '[object Proxy]',
	      regexpTag = '[object RegExp]',
	      setTag = '[object Set]',
	      stringTag = '[object String]',
	      symbolTag = '[object Symbol]',
	      undefinedTag = '[object Undefined]',
	      weakMapTag = '[object WeakMap]',
	      weakSetTag = '[object WeakSet]';

	  var arrayBufferTag = '[object ArrayBuffer]',
	      dataViewTag = '[object DataView]',
	      float32Tag = '[object Float32Array]',
	      float64Tag = '[object Float64Array]',
	      int8Tag = '[object Int8Array]',
	      int16Tag = '[object Int16Array]',
	      int32Tag = '[object Int32Array]',
	      uint8Tag = '[object Uint8Array]',
	      uint8ClampedTag = '[object Uint8ClampedArray]',
	      uint16Tag = '[object Uint16Array]',
	      uint32Tag = '[object Uint32Array]';

	  /** Used to match empty string literals in compiled template source. */
	  var reEmptyStringLeading = /\b__p \+= '';/g,
	      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
	      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

	  /** Used to match HTML entities and HTML characters. */
	  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
	      reUnescapedHtml = /[&<>"']/g,
	      reHasEscapedHtml = RegExp(reEscapedHtml.source),
	      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

	  /** Used to match template delimiters. */
	  var reEscape = /<%-([\s\S]+?)%>/g,
	      reEvaluate = /<%([\s\S]+?)%>/g,
	      reInterpolate = /<%=([\s\S]+?)%>/g;

	  /** Used to match property names within property paths. */
	  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
	      reIsPlainProp = /^\w*$/,
	      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

	  /**
	   * Used to match `RegExp`
	   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	   */
	  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
	      reHasRegExpChar = RegExp(reRegExpChar.source);

	  /** Used to match leading and trailing whitespace. */
	  var reTrim = /^\s+|\s+$/g,
	      reTrimStart = /^\s+/,
	      reTrimEnd = /\s+$/;

	  /** Used to match wrap detail comments. */
	  var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
	      reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
	      reSplitDetails = /,? & /;

	  /** Used to match words composed of alphanumeric characters. */
	  var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

	  /** Used to match backslashes in property paths. */
	  var reEscapeChar = /\\(\\)?/g;

	  /**
	   * Used to match
	   * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
	   */
	  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

	  /** Used to match `RegExp` flags from their coerced string values. */
	  var reFlags = /\w*$/;

	  /** Used to detect bad signed hexadecimal string values. */
	  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	  /** Used to detect binary string values. */
	  var reIsBinary = /^0b[01]+$/i;

	  /** Used to detect host constructors (Safari). */
	  var reIsHostCtor = /^\[object .+?Constructor\]$/;

	  /** Used to detect octal string values. */
	  var reIsOctal = /^0o[0-7]+$/i;

	  /** Used to detect unsigned integer values. */
	  var reIsUint = /^(?:0|[1-9]\d*)$/;

	  /** Used to match Latin Unicode letters (excluding mathematical operators). */
	  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

	  /** Used to ensure capturing order of template delimiters. */
	  var reNoMatch = /($^)/;

	  /** Used to match unescaped characters in compiled string literals. */
	  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

	  /** Used to compose unicode character classes. */
	  var rsAstralRange = '\\ud800-\\udfff',
	      rsComboMarksRange = '\\u0300-\\u036f',
	      reComboHalfMarksRange = '\\ufe20-\\ufe2f',
	      rsComboSymbolsRange = '\\u20d0-\\u20ff',
	      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
	      rsDingbatRange = '\\u2700-\\u27bf',
	      rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
	      rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
	      rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
	      rsPunctuationRange = '\\u2000-\\u206f',
	      rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
	      rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
	      rsVarRange = '\\ufe0e\\ufe0f',
	      rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

	  /** Used to compose unicode capture groups. */
	  var rsApos = "['\u2019]",
	      rsAstral = '[' + rsAstralRange + ']',
	      rsBreak = '[' + rsBreakRange + ']',
	      rsCombo = '[' + rsComboRange + ']',
	      rsDigits = '\\d+',
	      rsDingbat = '[' + rsDingbatRange + ']',
	      rsLower = '[' + rsLowerRange + ']',
	      rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
	      rsFitz = '\\ud83c[\\udffb-\\udfff]',
	      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
	      rsNonAstral = '[^' + rsAstralRange + ']',
	      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
	      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
	      rsUpper = '[' + rsUpperRange + ']',
	      rsZWJ = '\\u200d';

	  /** Used to compose unicode regexes. */
	  var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
	      rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
	      rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
	      rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
	      reOptMod = rsModifier + '?',
	      rsOptVar = '[' + rsVarRange + ']?',
	      rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
	      rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
	      rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
	      rsSeq = rsOptVar + reOptMod + rsOptJoin,
	      rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
	      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

	  /** Used to match apostrophes. */
	  var reApos = RegExp(rsApos, 'g');

	  /**
	   * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
	   * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
	   */
	  var reComboMark = RegExp(rsCombo, 'g');

	  /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
	  var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

	  /** Used to match complex or compound words. */
	  var reUnicodeWord = RegExp([
	    rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
	    rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
	    rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
	    rsUpper + '+' + rsOptContrUpper,
	    rsOrdUpper,
	    rsOrdLower,
	    rsDigits,
	    rsEmoji
	  ].join('|'), 'g');

	  /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
	  var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

	  /** Used to detect strings that need a more robust regexp to match words. */
	  var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

	  /** Used to assign default `context` object properties. */
	  var contextProps = [
	    'Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array',
	    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object',
	    'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array',
	    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
	    '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'
	  ];

	  /** Used to make template sourceURLs easier to identify. */
	  var templateCounter = -1;

	  /** Used to identify `toStringTag` values of typed arrays. */
	  var typedArrayTags = {};
	  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	  typedArrayTags[uint32Tag] = true;
	  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
	  typedArrayTags[errorTag] = typedArrayTags[funcTag] =
	  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
	  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
	  typedArrayTags[setTag] = typedArrayTags[stringTag] =
	  typedArrayTags[weakMapTag] = false;

	  /** Used to identify `toStringTag` values supported by `_.clone`. */
	  var cloneableTags = {};
	  cloneableTags[argsTag] = cloneableTags[arrayTag] =
	  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
	  cloneableTags[boolTag] = cloneableTags[dateTag] =
	  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
	  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
	  cloneableTags[int32Tag] = cloneableTags[mapTag] =
	  cloneableTags[numberTag] = cloneableTags[objectTag] =
	  cloneableTags[regexpTag] = cloneableTags[setTag] =
	  cloneableTags[stringTag] = cloneableTags[symbolTag] =
	  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	  cloneableTags[errorTag] = cloneableTags[funcTag] =
	  cloneableTags[weakMapTag] = false;

	  /** Used to map Latin Unicode letters to basic Latin letters. */
	  var deburredLetters = {
	    // Latin-1 Supplement block.
	    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
	    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
	    '\xc7': 'C',  '\xe7': 'c',
	    '\xd0': 'D',  '\xf0': 'd',
	    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
	    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
	    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
	    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
	    '\xd1': 'N',  '\xf1': 'n',
	    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
	    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
	    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
	    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
	    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
	    '\xc6': 'Ae', '\xe6': 'ae',
	    '\xde': 'Th', '\xfe': 'th',
	    '\xdf': 'ss',
	    // Latin Extended-A block.
	    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
	    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
	    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
	    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
	    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
	    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
	    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
	    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
	    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
	    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
	    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
	    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
	    '\u0134': 'J',  '\u0135': 'j',
	    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
	    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
	    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
	    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
	    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
	    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
	    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
	    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
	    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
	    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
	    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
	    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
	    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
	    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
	    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
	    '\u0174': 'W',  '\u0175': 'w',
	    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
	    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
	    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
	    '\u0132': 'IJ', '\u0133': 'ij',
	    '\u0152': 'Oe', '\u0153': 'oe',
	    '\u0149': "'n", '\u017f': 's'
	  };

	  /** Used to map characters to HTML entities. */
	  var htmlEscapes = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#39;'
	  };

	  /** Used to map HTML entities to characters. */
	  var htmlUnescapes = {
	    '&amp;': '&',
	    '&lt;': '<',
	    '&gt;': '>',
	    '&quot;': '"',
	    '&#39;': "'"
	  };

	  /** Used to escape characters for inclusion in compiled string literals. */
	  var stringEscapes = {
	    '\\': '\\',
	    "'": "'",
	    '\n': 'n',
	    '\r': 'r',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  /** Built-in method references without a dependency on `root`. */
	  var freeParseFloat = parseFloat,
	      freeParseInt = parseInt;

	  /** Detect free variable `global` from Node.js. */
	  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	  /** Detect free variable `self`. */
	  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	  /** Used as a reference to the global object. */
	  var root = freeGlobal || freeSelf || Function('return this')();

	  /** Detect free variable `exports`. */
	  var freeExports =  exports && !exports.nodeType && exports;

	  /** Detect free variable `module`. */
	  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports;

	  /** Detect free variable `process` from Node.js. */
	  var freeProcess = moduleExports && freeGlobal.process;

	  /** Used to access faster Node.js helpers. */
	  var nodeUtil = (function() {
	    try {
	      // Use `util.types` for Node.js 10+.
	      var types = freeModule && freeModule.require && freeModule.require('util').types;

	      if (types) {
	        return types;
	      }

	      // Legacy `process.binding('util')` for Node.js < 10.
	      return freeProcess && freeProcess.binding && freeProcess.binding('util');
	    } catch (e) {}
	  }());

	  /* Node.js helper references. */
	  var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
	      nodeIsDate = nodeUtil && nodeUtil.isDate,
	      nodeIsMap = nodeUtil && nodeUtil.isMap,
	      nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
	      nodeIsSet = nodeUtil && nodeUtil.isSet,
	      nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

	  /*--------------------------------------------------------------------------*/

	  /**
	   * A faster alternative to `Function#apply`, this function invokes `func`
	   * with the `this` binding of `thisArg` and the arguments of `args`.
	   *
	   * @private
	   * @param {Function} func The function to invoke.
	   * @param {*} thisArg The `this` binding of `func`.
	   * @param {Array} args The arguments to invoke `func` with.
	   * @returns {*} Returns the result of `func`.
	   */
	  function apply(func, thisArg, args) {
	    switch (args.length) {
	      case 0: return func.call(thisArg);
	      case 1: return func.call(thisArg, args[0]);
	      case 2: return func.call(thisArg, args[0], args[1]);
	      case 3: return func.call(thisArg, args[0], args[1], args[2]);
	    }
	    return func.apply(thisArg, args);
	  }

	  /**
	   * A specialized version of `baseAggregator` for arrays.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} setter The function to set `accumulator` values.
	   * @param {Function} iteratee The iteratee to transform keys.
	   * @param {Object} accumulator The initial aggregated object.
	   * @returns {Function} Returns `accumulator`.
	   */
	  function arrayAggregator(array, setter, iteratee, accumulator) {
	    var index = -1,
	        length = array == null ? 0 : array.length;

	    while (++index < length) {
	      var value = array[index];
	      setter(accumulator, value, iteratee(value), array);
	    }
	    return accumulator;
	  }

	  /**
	   * A specialized version of `_.forEach` for arrays without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns `array`.
	   */
	  function arrayEach(array, iteratee) {
	    var index = -1,
	        length = array == null ? 0 : array.length;

	    while (++index < length) {
	      if (iteratee(array[index], index, array) === false) {
	        break;
	      }
	    }
	    return array;
	  }

	  /**
	   * A specialized version of `_.forEachRight` for arrays without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns `array`.
	   */
	  function arrayEachRight(array, iteratee) {
	    var length = array == null ? 0 : array.length;

	    while (length--) {
	      if (iteratee(array[length], length, array) === false) {
	        break;
	      }
	    }
	    return array;
	  }

	  /**
	   * A specialized version of `_.every` for arrays without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {boolean} Returns `true` if all elements pass the predicate check,
	   *  else `false`.
	   */
	  function arrayEvery(array, predicate) {
	    var index = -1,
	        length = array == null ? 0 : array.length;

	    while (++index < length) {
	      if (!predicate(array[index], index, array)) {
	        return false;
	      }
	    }
	    return true;
	  }

	  /**
	   * A specialized version of `_.filter` for arrays without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {Array} Returns the new filtered array.
	   */
	  function arrayFilter(array, predicate) {
	    var index = -1,
	        length = array == null ? 0 : array.length,
	        resIndex = 0,
	        result = [];

	    while (++index < length) {
	      var value = array[index];
	      if (predicate(value, index, array)) {
	        result[resIndex++] = value;
	      }
	    }
	    return result;
	  }

	  /**
	   * A specialized version of `_.includes` for arrays without support for
	   * specifying an index to search from.
	   *
	   * @private
	   * @param {Array} [array] The array to inspect.
	   * @param {*} target The value to search for.
	   * @returns {boolean} Returns `true` if `target` is found, else `false`.
	   */
	  function arrayIncludes(array, value) {
	    var length = array == null ? 0 : array.length;
	    return !!length && baseIndexOf(array, value, 0) > -1;
	  }

	  /**
	   * This function is like `arrayIncludes` except that it accepts a comparator.
	   *
	   * @private
	   * @param {Array} [array] The array to inspect.
	   * @param {*} target The value to search for.
	   * @param {Function} comparator The comparator invoked per element.
	   * @returns {boolean} Returns `true` if `target` is found, else `false`.
	   */
	  function arrayIncludesWith(array, value, comparator) {
	    var index = -1,
	        length = array == null ? 0 : array.length;

	    while (++index < length) {
	      if (comparator(value, array[index])) {
	        return true;
	      }
	    }
	    return false;
	  }

	  /**
	   * A specialized version of `_.map` for arrays without support for iteratee
	   * shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns the new mapped array.
	   */
	  function arrayMap(array, iteratee) {
	    var index = -1,
	        length = array == null ? 0 : array.length,
	        result = Array(length);

	    while (++index < length) {
	      result[index] = iteratee(array[index], index, array);
	    }
	    return result;
	  }

	  /**
	   * Appends the elements of `values` to `array`.
	   *
	   * @private
	   * @param {Array} array The array to modify.
	   * @param {Array} values The values to append.
	   * @returns {Array} Returns `array`.
	   */
	  function arrayPush(array, values) {
	    var index = -1,
	        length = values.length,
	        offset = array.length;

	    while (++index < length) {
	      array[offset + index] = values[index];
	    }
	    return array;
	  }

	  /**
	   * A specialized version of `_.reduce` for arrays without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @param {*} [accumulator] The initial value.
	   * @param {boolean} [initAccum] Specify using the first element of `array` as
	   *  the initial value.
	   * @returns {*} Returns the accumulated value.
	   */
	  function arrayReduce(array, iteratee, accumulator, initAccum) {
	    var index = -1,
	        length = array == null ? 0 : array.length;

	    if (initAccum && length) {
	      accumulator = array[++index];
	    }
	    while (++index < length) {
	      accumulator = iteratee(accumulator, array[index], index, array);
	    }
	    return accumulator;
	  }

	  /**
	   * A specialized version of `_.reduceRight` for arrays without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @param {*} [accumulator] The initial value.
	   * @param {boolean} [initAccum] Specify using the last element of `array` as
	   *  the initial value.
	   * @returns {*} Returns the accumulated value.
	   */
	  function arrayReduceRight(array, iteratee, accumulator, initAccum) {
	    var length = array == null ? 0 : array.length;
	    if (initAccum && length) {
	      accumulator = array[--length];
	    }
	    while (length--) {
	      accumulator = iteratee(accumulator, array[length], length, array);
	    }
	    return accumulator;
	  }

	  /**
	   * A specialized version of `_.some` for arrays without support for iteratee
	   * shorthands.
	   *
	   * @private
	   * @param {Array} [array] The array to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {boolean} Returns `true` if any element passes the predicate check,
	   *  else `false`.
	   */
	  function arraySome(array, predicate) {
	    var index = -1,
	        length = array == null ? 0 : array.length;

	    while (++index < length) {
	      if (predicate(array[index], index, array)) {
	        return true;
	      }
	    }
	    return false;
	  }

	  /**
	   * Gets the size of an ASCII `string`.
	   *
	   * @private
	   * @param {string} string The string inspect.
	   * @returns {number} Returns the string size.
	   */
	  var asciiSize = baseProperty('length');

	  /**
	   * Converts an ASCII `string` to an array.
	   *
	   * @private
	   * @param {string} string The string to convert.
	   * @returns {Array} Returns the converted array.
	   */
	  function asciiToArray(string) {
	    return string.split('');
	  }

	  /**
	   * Splits an ASCII `string` into an array of its words.
	   *
	   * @private
	   * @param {string} The string to inspect.
	   * @returns {Array} Returns the words of `string`.
	   */
	  function asciiWords(string) {
	    return string.match(reAsciiWord) || [];
	  }

	  /**
	   * The base implementation of methods like `_.findKey` and `_.findLastKey`,
	   * without support for iteratee shorthands, which iterates over `collection`
	   * using `eachFunc`.
	   *
	   * @private
	   * @param {Array|Object} collection The collection to inspect.
	   * @param {Function} predicate The function invoked per iteration.
	   * @param {Function} eachFunc The function to iterate over `collection`.
	   * @returns {*} Returns the found element or its key, else `undefined`.
	   */
	  function baseFindKey(collection, predicate, eachFunc) {
	    var result;
	    eachFunc(collection, function(value, key, collection) {
	      if (predicate(value, key, collection)) {
	        result = key;
	        return false;
	      }
	    });
	    return result;
	  }

	  /**
	   * The base implementation of `_.findIndex` and `_.findLastIndex` without
	   * support for iteratee shorthands.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {Function} predicate The function invoked per iteration.
	   * @param {number} fromIndex The index to search from.
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseFindIndex(array, predicate, fromIndex, fromRight) {
	    var length = array.length,
	        index = fromIndex + (fromRight ? 1 : -1);

	    while ((fromRight ? index-- : ++index < length)) {
	      if (predicate(array[index], index, array)) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {*} value The value to search for.
	   * @param {number} fromIndex The index to search from.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseIndexOf(array, value, fromIndex) {
	    return value === value
	      ? strictIndexOf(array, value, fromIndex)
	      : baseFindIndex(array, baseIsNaN, fromIndex);
	  }

	  /**
	   * This function is like `baseIndexOf` except that it accepts a comparator.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {*} value The value to search for.
	   * @param {number} fromIndex The index to search from.
	   * @param {Function} comparator The comparator invoked per element.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseIndexOfWith(array, value, fromIndex, comparator) {
	    var index = fromIndex - 1,
	        length = array.length;

	    while (++index < length) {
	      if (comparator(array[index], value)) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * The base implementation of `_.isNaN` without support for number objects.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	   */
	  function baseIsNaN(value) {
	    return value !== value;
	  }

	  /**
	   * The base implementation of `_.mean` and `_.meanBy` without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} array The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {number} Returns the mean.
	   */
	  function baseMean(array, iteratee) {
	    var length = array == null ? 0 : array.length;
	    return length ? (baseSum(array, iteratee) / length) : NAN;
	  }

	  /**
	   * The base implementation of `_.property` without support for deep paths.
	   *
	   * @private
	   * @param {string} key The key of the property to get.
	   * @returns {Function} Returns the new accessor function.
	   */
	  function baseProperty(key) {
	    return function(object) {
	      return object == null ? undefined$1 : object[key];
	    };
	  }

	  /**
	   * The base implementation of `_.propertyOf` without support for deep paths.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @returns {Function} Returns the new accessor function.
	   */
	  function basePropertyOf(object) {
	    return function(key) {
	      return object == null ? undefined$1 : object[key];
	    };
	  }

	  /**
	   * The base implementation of `_.reduce` and `_.reduceRight`, without support
	   * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
	   *
	   * @private
	   * @param {Array|Object} collection The collection to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @param {*} accumulator The initial value.
	   * @param {boolean} initAccum Specify using the first or last element of
	   *  `collection` as the initial value.
	   * @param {Function} eachFunc The function to iterate over `collection`.
	   * @returns {*} Returns the accumulated value.
	   */
	  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
	    eachFunc(collection, function(value, index, collection) {
	      accumulator = initAccum
	        ? (initAccum = false, value)
	        : iteratee(accumulator, value, index, collection);
	    });
	    return accumulator;
	  }

	  /**
	   * The base implementation of `_.sortBy` which uses `comparer` to define the
	   * sort order of `array` and replaces criteria objects with their corresponding
	   * values.
	   *
	   * @private
	   * @param {Array} array The array to sort.
	   * @param {Function} comparer The function to define sort order.
	   * @returns {Array} Returns `array`.
	   */
	  function baseSortBy(array, comparer) {
	    var length = array.length;

	    array.sort(comparer);
	    while (length--) {
	      array[length] = array[length].value;
	    }
	    return array;
	  }

	  /**
	   * The base implementation of `_.sum` and `_.sumBy` without support for
	   * iteratee shorthands.
	   *
	   * @private
	   * @param {Array} array The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {number} Returns the sum.
	   */
	  function baseSum(array, iteratee) {
	    var result,
	        index = -1,
	        length = array.length;

	    while (++index < length) {
	      var current = iteratee(array[index]);
	      if (current !== undefined$1) {
	        result = result === undefined$1 ? current : (result + current);
	      }
	    }
	    return result;
	  }

	  /**
	   * The base implementation of `_.times` without support for iteratee shorthands
	   * or max array length checks.
	   *
	   * @private
	   * @param {number} n The number of times to invoke `iteratee`.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns the array of results.
	   */
	  function baseTimes(n, iteratee) {
	    var index = -1,
	        result = Array(n);

	    while (++index < n) {
	      result[index] = iteratee(index);
	    }
	    return result;
	  }

	  /**
	   * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
	   * of key-value pairs for `object` corresponding to the property names of `props`.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @param {Array} props The property names to get values for.
	   * @returns {Object} Returns the key-value pairs.
	   */
	  function baseToPairs(object, props) {
	    return arrayMap(props, function(key) {
	      return [key, object[key]];
	    });
	  }

	  /**
	   * The base implementation of `_.unary` without support for storing metadata.
	   *
	   * @private
	   * @param {Function} func The function to cap arguments for.
	   * @returns {Function} Returns the new capped function.
	   */
	  function baseUnary(func) {
	    return function(value) {
	      return func(value);
	    };
	  }

	  /**
	   * The base implementation of `_.values` and `_.valuesIn` which creates an
	   * array of `object` property values corresponding to the property names
	   * of `props`.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @param {Array} props The property names to get values for.
	   * @returns {Object} Returns the array of property values.
	   */
	  function baseValues(object, props) {
	    return arrayMap(props, function(key) {
	      return object[key];
	    });
	  }

	  /**
	   * Checks if a `cache` value for `key` exists.
	   *
	   * @private
	   * @param {Object} cache The cache to query.
	   * @param {string} key The key of the entry to check.
	   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	   */
	  function cacheHas(cache, key) {
	    return cache.has(key);
	  }

	  /**
	   * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
	   * that is not found in the character symbols.
	   *
	   * @private
	   * @param {Array} strSymbols The string symbols to inspect.
	   * @param {Array} chrSymbols The character symbols to find.
	   * @returns {number} Returns the index of the first unmatched string symbol.
	   */
	  function charsStartIndex(strSymbols, chrSymbols) {
	    var index = -1,
	        length = strSymbols.length;

	    while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
	    return index;
	  }

	  /**
	   * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
	   * that is not found in the character symbols.
	   *
	   * @private
	   * @param {Array} strSymbols The string symbols to inspect.
	   * @param {Array} chrSymbols The character symbols to find.
	   * @returns {number} Returns the index of the last unmatched string symbol.
	   */
	  function charsEndIndex(strSymbols, chrSymbols) {
	    var index = strSymbols.length;

	    while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
	    return index;
	  }

	  /**
	   * Gets the number of `placeholder` occurrences in `array`.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {*} placeholder The placeholder to search for.
	   * @returns {number} Returns the placeholder count.
	   */
	  function countHolders(array, placeholder) {
	    var length = array.length,
	        result = 0;

	    while (length--) {
	      if (array[length] === placeholder) {
	        ++result;
	      }
	    }
	    return result;
	  }

	  /**
	   * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
	   * letters to basic Latin letters.
	   *
	   * @private
	   * @param {string} letter The matched letter to deburr.
	   * @returns {string} Returns the deburred letter.
	   */
	  var deburrLetter = basePropertyOf(deburredLetters);

	  /**
	   * Used by `_.escape` to convert characters to HTML entities.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  var escapeHtmlChar = basePropertyOf(htmlEscapes);

	  /**
	   * Used by `_.template` to escape characters for inclusion in compiled string literals.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeStringChar(chr) {
	    return '\\' + stringEscapes[chr];
	  }

	  /**
	   * Gets the value at `key` of `object`.
	   *
	   * @private
	   * @param {Object} [object] The object to query.
	   * @param {string} key The key of the property to get.
	   * @returns {*} Returns the property value.
	   */
	  function getValue(object, key) {
	    return object == null ? undefined$1 : object[key];
	  }

	  /**
	   * Checks if `string` contains Unicode symbols.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {boolean} Returns `true` if a symbol is found, else `false`.
	   */
	  function hasUnicode(string) {
	    return reHasUnicode.test(string);
	  }

	  /**
	   * Checks if `string` contains a word composed of Unicode symbols.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {boolean} Returns `true` if a word is found, else `false`.
	   */
	  function hasUnicodeWord(string) {
	    return reHasUnicodeWord.test(string);
	  }

	  /**
	   * Converts `iterator` to an array.
	   *
	   * @private
	   * @param {Object} iterator The iterator to convert.
	   * @returns {Array} Returns the converted array.
	   */
	  function iteratorToArray(iterator) {
	    var data,
	        result = [];

	    while (!(data = iterator.next()).done) {
	      result.push(data.value);
	    }
	    return result;
	  }

	  /**
	   * Converts `map` to its key-value pairs.
	   *
	   * @private
	   * @param {Object} map The map to convert.
	   * @returns {Array} Returns the key-value pairs.
	   */
	  function mapToArray(map) {
	    var index = -1,
	        result = Array(map.size);

	    map.forEach(function(value, key) {
	      result[++index] = [key, value];
	    });
	    return result;
	  }

	  /**
	   * Creates a unary function that invokes `func` with its argument transformed.
	   *
	   * @private
	   * @param {Function} func The function to wrap.
	   * @param {Function} transform The argument transform.
	   * @returns {Function} Returns the new function.
	   */
	  function overArg(func, transform) {
	    return function(arg) {
	      return func(transform(arg));
	    };
	  }

	  /**
	   * Replaces all `placeholder` elements in `array` with an internal placeholder
	   * and returns an array of their indexes.
	   *
	   * @private
	   * @param {Array} array The array to modify.
	   * @param {*} placeholder The placeholder to replace.
	   * @returns {Array} Returns the new array of placeholder indexes.
	   */
	  function replaceHolders(array, placeholder) {
	    var index = -1,
	        length = array.length,
	        resIndex = 0,
	        result = [];

	    while (++index < length) {
	      var value = array[index];
	      if (value === placeholder || value === PLACEHOLDER) {
	        array[index] = PLACEHOLDER;
	        result[resIndex++] = index;
	      }
	    }
	    return result;
	  }

	  /**
	   * Converts `set` to an array of its values.
	   *
	   * @private
	   * @param {Object} set The set to convert.
	   * @returns {Array} Returns the values.
	   */
	  function setToArray(set) {
	    var index = -1,
	        result = Array(set.size);

	    set.forEach(function(value) {
	      result[++index] = value;
	    });
	    return result;
	  }

	  /**
	   * Converts `set` to its value-value pairs.
	   *
	   * @private
	   * @param {Object} set The set to convert.
	   * @returns {Array} Returns the value-value pairs.
	   */
	  function setToPairs(set) {
	    var index = -1,
	        result = Array(set.size);

	    set.forEach(function(value) {
	      result[++index] = [value, value];
	    });
	    return result;
	  }

	  /**
	   * A specialized version of `_.indexOf` which performs strict equality
	   * comparisons of values, i.e. `===`.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {*} value The value to search for.
	   * @param {number} fromIndex The index to search from.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function strictIndexOf(array, value, fromIndex) {
	    var index = fromIndex - 1,
	        length = array.length;

	    while (++index < length) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return -1;
	  }

	  /**
	   * A specialized version of `_.lastIndexOf` which performs strict equality
	   * comparisons of values, i.e. `===`.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {*} value The value to search for.
	   * @param {number} fromIndex The index to search from.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function strictLastIndexOf(array, value, fromIndex) {
	    var index = fromIndex + 1;
	    while (index--) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return index;
	  }

	  /**
	   * Gets the number of symbols in `string`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {number} Returns the string size.
	   */
	  function stringSize(string) {
	    return hasUnicode(string)
	      ? unicodeSize(string)
	      : asciiSize(string);
	  }

	  /**
	   * Converts `string` to an array.
	   *
	   * @private
	   * @param {string} string The string to convert.
	   * @returns {Array} Returns the converted array.
	   */
	  function stringToArray(string) {
	    return hasUnicode(string)
	      ? unicodeToArray(string)
	      : asciiToArray(string);
	  }

	  /**
	   * Used by `_.unescape` to convert HTML entities to characters.
	   *
	   * @private
	   * @param {string} chr The matched character to unescape.
	   * @returns {string} Returns the unescaped character.
	   */
	  var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

	  /**
	   * Gets the size of a Unicode `string`.
	   *
	   * @private
	   * @param {string} string The string inspect.
	   * @returns {number} Returns the string size.
	   */
	  function unicodeSize(string) {
	    var result = reUnicode.lastIndex = 0;
	    while (reUnicode.test(string)) {
	      ++result;
	    }
	    return result;
	  }

	  /**
	   * Converts a Unicode `string` to an array.
	   *
	   * @private
	   * @param {string} string The string to convert.
	   * @returns {Array} Returns the converted array.
	   */
	  function unicodeToArray(string) {
	    return string.match(reUnicode) || [];
	  }

	  /**
	   * Splits a Unicode `string` into an array of its words.
	   *
	   * @private
	   * @param {string} The string to inspect.
	   * @returns {Array} Returns the words of `string`.
	   */
	  function unicodeWords(string) {
	    return string.match(reUnicodeWord) || [];
	  }

	  /*--------------------------------------------------------------------------*/

	  /**
	   * Create a new pristine `lodash` function using the `context` object.
	   *
	   * @static
	   * @memberOf _
	   * @since 1.1.0
	   * @category Util
	   * @param {Object} [context=root] The context object.
	   * @returns {Function} Returns a new `lodash` function.
	   * @example
	   *
	   * _.mixin({ 'foo': _.constant('foo') });
	   *
	   * var lodash = _.runInContext();
	   * lodash.mixin({ 'bar': lodash.constant('bar') });
	   *
	   * _.isFunction(_.foo);
	   * // => true
	   * _.isFunction(_.bar);
	   * // => false
	   *
	   * lodash.isFunction(lodash.foo);
	   * // => false
	   * lodash.isFunction(lodash.bar);
	   * // => true
	   *
	   * // Create a suped-up `defer` in Node.js.
	   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
	   */
	  var runInContext = (function runInContext(context) {
	    context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));

	    /** Built-in constructor references. */
	    var Array = context.Array,
	        Date = context.Date,
	        Error = context.Error,
	        Function = context.Function,
	        Math = context.Math,
	        Object = context.Object,
	        RegExp = context.RegExp,
	        String = context.String,
	        TypeError = context.TypeError;

	    /** Used for built-in method references. */
	    var arrayProto = Array.prototype,
	        funcProto = Function.prototype,
	        objectProto = Object.prototype;

	    /** Used to detect overreaching core-js shims. */
	    var coreJsData = context['__core-js_shared__'];

	    /** Used to resolve the decompiled source of functions. */
	    var funcToString = funcProto.toString;

	    /** Used to check objects for own properties. */
	    var hasOwnProperty = objectProto.hasOwnProperty;

	    /** Used to generate unique IDs. */
	    var idCounter = 0;

	    /** Used to detect methods masquerading as native. */
	    var maskSrcKey = (function() {
	      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	      return uid ? ('Symbol(src)_1.' + uid) : '';
	    }());

	    /**
	     * Used to resolve the
	     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	     * of values.
	     */
	    var nativeObjectToString = objectProto.toString;

	    /** Used to infer the `Object` constructor. */
	    var objectCtorString = funcToString.call(Object);

	    /** Used to restore the original `_` reference in `_.noConflict`. */
	    var oldDash = root._;

	    /** Used to detect if a method is native. */
	    var reIsNative = RegExp('^' +
	      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	    );

	    /** Built-in value references. */
	    var Buffer = moduleExports ? context.Buffer : undefined$1,
	        Symbol = context.Symbol,
	        Uint8Array = context.Uint8Array,
	        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined$1,
	        getPrototype = overArg(Object.getPrototypeOf, Object),
	        objectCreate = Object.create,
	        propertyIsEnumerable = objectProto.propertyIsEnumerable,
	        splice = arrayProto.splice,
	        spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined$1,
	        symIterator = Symbol ? Symbol.iterator : undefined$1,
	        symToStringTag = Symbol ? Symbol.toStringTag : undefined$1;

	    var defineProperty = (function() {
	      try {
	        var func = getNative(Object, 'defineProperty');
	        func({}, '', {});
	        return func;
	      } catch (e) {}
	    }());

	    /** Mocked built-ins. */
	    var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
	        ctxNow = Date && Date.now !== root.Date.now && Date.now,
	        ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;

	    /* Built-in method references for those with the same name as other `lodash` methods. */
	    var nativeCeil = Math.ceil,
	        nativeFloor = Math.floor,
	        nativeGetSymbols = Object.getOwnPropertySymbols,
	        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined$1,
	        nativeIsFinite = context.isFinite,
	        nativeJoin = arrayProto.join,
	        nativeKeys = overArg(Object.keys, Object),
	        nativeMax = Math.max,
	        nativeMin = Math.min,
	        nativeNow = Date.now,
	        nativeParseInt = context.parseInt,
	        nativeRandom = Math.random,
	        nativeReverse = arrayProto.reverse;

	    /* Built-in method references that are verified to be native. */
	    var DataView = getNative(context, 'DataView'),
	        Map = getNative(context, 'Map'),
	        Promise = getNative(context, 'Promise'),
	        Set = getNative(context, 'Set'),
	        WeakMap = getNative(context, 'WeakMap'),
	        nativeCreate = getNative(Object, 'create');

	    /** Used to store function metadata. */
	    var metaMap = WeakMap && new WeakMap;

	    /** Used to lookup unminified function names. */
	    var realNames = {};

	    /** Used to detect maps, sets, and weakmaps. */
	    var dataViewCtorString = toSource(DataView),
	        mapCtorString = toSource(Map),
	        promiseCtorString = toSource(Promise),
	        setCtorString = toSource(Set),
	        weakMapCtorString = toSource(WeakMap);

	    /** Used to convert symbols to primitives and strings. */
	    var symbolProto = Symbol ? Symbol.prototype : undefined$1,
	        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1,
	        symbolToString = symbolProto ? symbolProto.toString : undefined$1;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` object which wraps `value` to enable implicit method
	     * chain sequences. Methods that operate on and return arrays, collections,
	     * and functions can be chained together. Methods that retrieve a single value
	     * or may return a primitive value will automatically end the chain sequence
	     * and return the unwrapped value. Otherwise, the value must be unwrapped
	     * with `_#value`.
	     *
	     * Explicit chain sequences, which must be unwrapped with `_#value`, may be
	     * enabled using `_.chain`.
	     *
	     * The execution of chained methods is lazy, that is, it's deferred until
	     * `_#value` is implicitly or explicitly called.
	     *
	     * Lazy evaluation allows several methods to support shortcut fusion.
	     * Shortcut fusion is an optimization to merge iteratee calls; this avoids
	     * the creation of intermediate arrays and can greatly reduce the number of
	     * iteratee executions. Sections of a chain sequence qualify for shortcut
	     * fusion if the section is applied to an array and iteratees accept only
	     * one argument. The heuristic for whether a section qualifies for shortcut
	     * fusion is subject to change.
	     *
	     * Chaining is supported in custom builds as long as the `_#value` method is
	     * directly or indirectly included in the build.
	     *
	     * In addition to lodash methods, wrappers have `Array` and `String` methods.
	     *
	     * The wrapper `Array` methods are:
	     * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
	     *
	     * The wrapper `String` methods are:
	     * `replace` and `split`
	     *
	     * The wrapper methods that support shortcut fusion are:
	     * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
	     * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
	     * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
	     *
	     * The chainable wrapper methods are:
	     * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
	     * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
	     * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
	     * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
	     * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
	     * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
	     * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
	     * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
	     * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
	     * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
	     * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
	     * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
	     * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
	     * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
	     * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
	     * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
	     * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
	     * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
	     * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
	     * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
	     * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
	     * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
	     * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
	     * `zipObject`, `zipObjectDeep`, and `zipWith`
	     *
	     * The wrapper methods that are **not** chainable by default are:
	     * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
	     * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
	     * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
	     * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
	     * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
	     * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
	     * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
	     * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
	     * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
	     * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
	     * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
	     * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
	     * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
	     * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
	     * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
	     * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
	     * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
	     * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
	     * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
	     * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
	     * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
	     * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
	     * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
	     * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
	     * `upperFirst`, `value`, and `words`
	     *
	     * @name _
	     * @constructor
	     * @category Seq
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var wrapped = _([1, 2, 3]);
	     *
	     * // Returns an unwrapped value.
	     * wrapped.reduce(_.add);
	     * // => 6
	     *
	     * // Returns a wrapped value.
	     * var squares = wrapped.map(square);
	     *
	     * _.isArray(squares);
	     * // => false
	     *
	     * _.isArray(squares.value());
	     * // => true
	     */
	    function lodash(value) {
	      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
	        if (value instanceof LodashWrapper) {
	          return value;
	        }
	        if (hasOwnProperty.call(value, '__wrapped__')) {
	          return wrapperClone(value);
	        }
	      }
	      return new LodashWrapper(value);
	    }

	    /**
	     * The base implementation of `_.create` without support for assigning
	     * properties to the created object.
	     *
	     * @private
	     * @param {Object} proto The object to inherit from.
	     * @returns {Object} Returns the new object.
	     */
	    var baseCreate = (function() {
	      function object() {}
	      return function(proto) {
	        if (!isObject(proto)) {
	          return {};
	        }
	        if (objectCreate) {
	          return objectCreate(proto);
	        }
	        object.prototype = proto;
	        var result = new object;
	        object.prototype = undefined$1;
	        return result;
	      };
	    }());

	    /**
	     * The function whose prototype chain sequence wrappers inherit from.
	     *
	     * @private
	     */
	    function baseLodash() {
	      // No operation performed.
	    }

	    /**
	     * The base constructor for creating `lodash` wrapper objects.
	     *
	     * @private
	     * @param {*} value The value to wrap.
	     * @param {boolean} [chainAll] Enable explicit method chain sequences.
	     */
	    function LodashWrapper(value, chainAll) {
	      this.__wrapped__ = value;
	      this.__actions__ = [];
	      this.__chain__ = !!chainAll;
	      this.__index__ = 0;
	      this.__values__ = undefined$1;
	    }

	    /**
	     * By default, the template delimiters used by lodash are like those in
	     * embedded Ruby (ERB) as well as ES2015 template strings. Change the
	     * following template settings to use alternative delimiters.
	     *
	     * @static
	     * @memberOf _
	     * @type {Object}
	     */
	    lodash.templateSettings = {

	      /**
	       * Used to detect `data` property values to be HTML-escaped.
	       *
	       * @memberOf _.templateSettings
	       * @type {RegExp}
	       */
	      'escape': reEscape,

	      /**
	       * Used to detect code to be evaluated.
	       *
	       * @memberOf _.templateSettings
	       * @type {RegExp}
	       */
	      'evaluate': reEvaluate,

	      /**
	       * Used to detect `data` property values to inject.
	       *
	       * @memberOf _.templateSettings
	       * @type {RegExp}
	       */
	      'interpolate': reInterpolate,

	      /**
	       * Used to reference the data object in the template text.
	       *
	       * @memberOf _.templateSettings
	       * @type {string}
	       */
	      'variable': '',

	      /**
	       * Used to import variables into the compiled template.
	       *
	       * @memberOf _.templateSettings
	       * @type {Object}
	       */
	      'imports': {

	        /**
	         * A reference to the `lodash` function.
	         *
	         * @memberOf _.templateSettings.imports
	         * @type {Function}
	         */
	        '_': lodash
	      }
	    };

	    // Ensure wrappers are instances of `baseLodash`.
	    lodash.prototype = baseLodash.prototype;
	    lodash.prototype.constructor = lodash;

	    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
	    LodashWrapper.prototype.constructor = LodashWrapper;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
	     *
	     * @private
	     * @constructor
	     * @param {*} value The value to wrap.
	     */
	    function LazyWrapper(value) {
	      this.__wrapped__ = value;
	      this.__actions__ = [];
	      this.__dir__ = 1;
	      this.__filtered__ = false;
	      this.__iteratees__ = [];
	      this.__takeCount__ = MAX_ARRAY_LENGTH;
	      this.__views__ = [];
	    }

	    /**
	     * Creates a clone of the lazy wrapper object.
	     *
	     * @private
	     * @name clone
	     * @memberOf LazyWrapper
	     * @returns {Object} Returns the cloned `LazyWrapper` object.
	     */
	    function lazyClone() {
	      var result = new LazyWrapper(this.__wrapped__);
	      result.__actions__ = copyArray(this.__actions__);
	      result.__dir__ = this.__dir__;
	      result.__filtered__ = this.__filtered__;
	      result.__iteratees__ = copyArray(this.__iteratees__);
	      result.__takeCount__ = this.__takeCount__;
	      result.__views__ = copyArray(this.__views__);
	      return result;
	    }

	    /**
	     * Reverses the direction of lazy iteration.
	     *
	     * @private
	     * @name reverse
	     * @memberOf LazyWrapper
	     * @returns {Object} Returns the new reversed `LazyWrapper` object.
	     */
	    function lazyReverse() {
	      if (this.__filtered__) {
	        var result = new LazyWrapper(this);
	        result.__dir__ = -1;
	        result.__filtered__ = true;
	      } else {
	        result = this.clone();
	        result.__dir__ *= -1;
	      }
	      return result;
	    }

	    /**
	     * Extracts the unwrapped value from its lazy wrapper.
	     *
	     * @private
	     * @name value
	     * @memberOf LazyWrapper
	     * @returns {*} Returns the unwrapped value.
	     */
	    function lazyValue() {
	      var array = this.__wrapped__.value(),
	          dir = this.__dir__,
	          isArr = isArray(array),
	          isRight = dir < 0,
	          arrLength = isArr ? array.length : 0,
	          view = getView(0, arrLength, this.__views__),
	          start = view.start,
	          end = view.end,
	          length = end - start,
	          index = isRight ? end : (start - 1),
	          iteratees = this.__iteratees__,
	          iterLength = iteratees.length,
	          resIndex = 0,
	          takeCount = nativeMin(length, this.__takeCount__);

	      if (!isArr || (!isRight && arrLength == length && takeCount == length)) {
	        return baseWrapperValue(array, this.__actions__);
	      }
	      var result = [];

	      outer:
	      while (length-- && resIndex < takeCount) {
	        index += dir;

	        var iterIndex = -1,
	            value = array[index];

	        while (++iterIndex < iterLength) {
	          var data = iteratees[iterIndex],
	              iteratee = data.iteratee,
	              type = data.type,
	              computed = iteratee(value);

	          if (type == LAZY_MAP_FLAG) {
	            value = computed;
	          } else if (!computed) {
	            if (type == LAZY_FILTER_FLAG) {
	              continue outer;
	            } else {
	              break outer;
	            }
	          }
	        }
	        result[resIndex++] = value;
	      }
	      return result;
	    }

	    // Ensure `LazyWrapper` is an instance of `baseLodash`.
	    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
	    LazyWrapper.prototype.constructor = LazyWrapper;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a hash object.
	     *
	     * @private
	     * @constructor
	     * @param {Array} [entries] The key-value pairs to cache.
	     */
	    function Hash(entries) {
	      var index = -1,
	          length = entries == null ? 0 : entries.length;

	      this.clear();
	      while (++index < length) {
	        var entry = entries[index];
	        this.set(entry[0], entry[1]);
	      }
	    }

	    /**
	     * Removes all key-value entries from the hash.
	     *
	     * @private
	     * @name clear
	     * @memberOf Hash
	     */
	    function hashClear() {
	      this.__data__ = nativeCreate ? nativeCreate(null) : {};
	      this.size = 0;
	    }

	    /**
	     * Removes `key` and its value from the hash.
	     *
	     * @private
	     * @name delete
	     * @memberOf Hash
	     * @param {Object} hash The hash to modify.
	     * @param {string} key The key of the value to remove.
	     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	     */
	    function hashDelete(key) {
	      var result = this.has(key) && delete this.__data__[key];
	      this.size -= result ? 1 : 0;
	      return result;
	    }

	    /**
	     * Gets the hash value for `key`.
	     *
	     * @private
	     * @name get
	     * @memberOf Hash
	     * @param {string} key The key of the value to get.
	     * @returns {*} Returns the entry value.
	     */
	    function hashGet(key) {
	      var data = this.__data__;
	      if (nativeCreate) {
	        var result = data[key];
	        return result === HASH_UNDEFINED ? undefined$1 : result;
	      }
	      return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
	    }

	    /**
	     * Checks if a hash value for `key` exists.
	     *
	     * @private
	     * @name has
	     * @memberOf Hash
	     * @param {string} key The key of the entry to check.
	     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	     */
	    function hashHas(key) {
	      var data = this.__data__;
	      return nativeCreate ? (data[key] !== undefined$1) : hasOwnProperty.call(data, key);
	    }

	    /**
	     * Sets the hash `key` to `value`.
	     *
	     * @private
	     * @name set
	     * @memberOf Hash
	     * @param {string} key The key of the value to set.
	     * @param {*} value The value to set.
	     * @returns {Object} Returns the hash instance.
	     */
	    function hashSet(key, value) {
	      var data = this.__data__;
	      this.size += this.has(key) ? 0 : 1;
	      data[key] = (nativeCreate && value === undefined$1) ? HASH_UNDEFINED : value;
	      return this;
	    }

	    // Add methods to `Hash`.
	    Hash.prototype.clear = hashClear;
	    Hash.prototype['delete'] = hashDelete;
	    Hash.prototype.get = hashGet;
	    Hash.prototype.has = hashHas;
	    Hash.prototype.set = hashSet;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates an list cache object.
	     *
	     * @private
	     * @constructor
	     * @param {Array} [entries] The key-value pairs to cache.
	     */
	    function ListCache(entries) {
	      var index = -1,
	          length = entries == null ? 0 : entries.length;

	      this.clear();
	      while (++index < length) {
	        var entry = entries[index];
	        this.set(entry[0], entry[1]);
	      }
	    }

	    /**
	     * Removes all key-value entries from the list cache.
	     *
	     * @private
	     * @name clear
	     * @memberOf ListCache
	     */
	    function listCacheClear() {
	      this.__data__ = [];
	      this.size = 0;
	    }

	    /**
	     * Removes `key` and its value from the list cache.
	     *
	     * @private
	     * @name delete
	     * @memberOf ListCache
	     * @param {string} key The key of the value to remove.
	     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	     */
	    function listCacheDelete(key) {
	      var data = this.__data__,
	          index = assocIndexOf(data, key);

	      if (index < 0) {
	        return false;
	      }
	      var lastIndex = data.length - 1;
	      if (index == lastIndex) {
	        data.pop();
	      } else {
	        splice.call(data, index, 1);
	      }
	      --this.size;
	      return true;
	    }

	    /**
	     * Gets the list cache value for `key`.
	     *
	     * @private
	     * @name get
	     * @memberOf ListCache
	     * @param {string} key The key of the value to get.
	     * @returns {*} Returns the entry value.
	     */
	    function listCacheGet(key) {
	      var data = this.__data__,
	          index = assocIndexOf(data, key);

	      return index < 0 ? undefined$1 : data[index][1];
	    }

	    /**
	     * Checks if a list cache value for `key` exists.
	     *
	     * @private
	     * @name has
	     * @memberOf ListCache
	     * @param {string} key The key of the entry to check.
	     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	     */
	    function listCacheHas(key) {
	      return assocIndexOf(this.__data__, key) > -1;
	    }

	    /**
	     * Sets the list cache `key` to `value`.
	     *
	     * @private
	     * @name set
	     * @memberOf ListCache
	     * @param {string} key The key of the value to set.
	     * @param {*} value The value to set.
	     * @returns {Object} Returns the list cache instance.
	     */
	    function listCacheSet(key, value) {
	      var data = this.__data__,
	          index = assocIndexOf(data, key);

	      if (index < 0) {
	        ++this.size;
	        data.push([key, value]);
	      } else {
	        data[index][1] = value;
	      }
	      return this;
	    }

	    // Add methods to `ListCache`.
	    ListCache.prototype.clear = listCacheClear;
	    ListCache.prototype['delete'] = listCacheDelete;
	    ListCache.prototype.get = listCacheGet;
	    ListCache.prototype.has = listCacheHas;
	    ListCache.prototype.set = listCacheSet;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a map cache object to store key-value pairs.
	     *
	     * @private
	     * @constructor
	     * @param {Array} [entries] The key-value pairs to cache.
	     */
	    function MapCache(entries) {
	      var index = -1,
	          length = entries == null ? 0 : entries.length;

	      this.clear();
	      while (++index < length) {
	        var entry = entries[index];
	        this.set(entry[0], entry[1]);
	      }
	    }

	    /**
	     * Removes all key-value entries from the map.
	     *
	     * @private
	     * @name clear
	     * @memberOf MapCache
	     */
	    function mapCacheClear() {
	      this.size = 0;
	      this.__data__ = {
	        'hash': new Hash,
	        'map': new (Map || ListCache),
	        'string': new Hash
	      };
	    }

	    /**
	     * Removes `key` and its value from the map.
	     *
	     * @private
	     * @name delete
	     * @memberOf MapCache
	     * @param {string} key The key of the value to remove.
	     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	     */
	    function mapCacheDelete(key) {
	      var result = getMapData(this, key)['delete'](key);
	      this.size -= result ? 1 : 0;
	      return result;
	    }

	    /**
	     * Gets the map value for `key`.
	     *
	     * @private
	     * @name get
	     * @memberOf MapCache
	     * @param {string} key The key of the value to get.
	     * @returns {*} Returns the entry value.
	     */
	    function mapCacheGet(key) {
	      return getMapData(this, key).get(key);
	    }

	    /**
	     * Checks if a map value for `key` exists.
	     *
	     * @private
	     * @name has
	     * @memberOf MapCache
	     * @param {string} key The key of the entry to check.
	     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	     */
	    function mapCacheHas(key) {
	      return getMapData(this, key).has(key);
	    }

	    /**
	     * Sets the map `key` to `value`.
	     *
	     * @private
	     * @name set
	     * @memberOf MapCache
	     * @param {string} key The key of the value to set.
	     * @param {*} value The value to set.
	     * @returns {Object} Returns the map cache instance.
	     */
	    function mapCacheSet(key, value) {
	      var data = getMapData(this, key),
	          size = data.size;

	      data.set(key, value);
	      this.size += data.size == size ? 0 : 1;
	      return this;
	    }

	    // Add methods to `MapCache`.
	    MapCache.prototype.clear = mapCacheClear;
	    MapCache.prototype['delete'] = mapCacheDelete;
	    MapCache.prototype.get = mapCacheGet;
	    MapCache.prototype.has = mapCacheHas;
	    MapCache.prototype.set = mapCacheSet;

	    /*------------------------------------------------------------------------*/

	    /**
	     *
	     * Creates an array cache object to store unique values.
	     *
	     * @private
	     * @constructor
	     * @param {Array} [values] The values to cache.
	     */
	    function SetCache(values) {
	      var index = -1,
	          length = values == null ? 0 : values.length;

	      this.__data__ = new MapCache;
	      while (++index < length) {
	        this.add(values[index]);
	      }
	    }

	    /**
	     * Adds `value` to the array cache.
	     *
	     * @private
	     * @name add
	     * @memberOf SetCache
	     * @alias push
	     * @param {*} value The value to cache.
	     * @returns {Object} Returns the cache instance.
	     */
	    function setCacheAdd(value) {
	      this.__data__.set(value, HASH_UNDEFINED);
	      return this;
	    }

	    /**
	     * Checks if `value` is in the array cache.
	     *
	     * @private
	     * @name has
	     * @memberOf SetCache
	     * @param {*} value The value to search for.
	     * @returns {number} Returns `true` if `value` is found, else `false`.
	     */
	    function setCacheHas(value) {
	      return this.__data__.has(value);
	    }

	    // Add methods to `SetCache`.
	    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
	    SetCache.prototype.has = setCacheHas;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a stack cache object to store key-value pairs.
	     *
	     * @private
	     * @constructor
	     * @param {Array} [entries] The key-value pairs to cache.
	     */
	    function Stack(entries) {
	      var data = this.__data__ = new ListCache(entries);
	      this.size = data.size;
	    }

	    /**
	     * Removes all key-value entries from the stack.
	     *
	     * @private
	     * @name clear
	     * @memberOf Stack
	     */
	    function stackClear() {
	      this.__data__ = new ListCache;
	      this.size = 0;
	    }

	    /**
	     * Removes `key` and its value from the stack.
	     *
	     * @private
	     * @name delete
	     * @memberOf Stack
	     * @param {string} key The key of the value to remove.
	     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	     */
	    function stackDelete(key) {
	      var data = this.__data__,
	          result = data['delete'](key);

	      this.size = data.size;
	      return result;
	    }

	    /**
	     * Gets the stack value for `key`.
	     *
	     * @private
	     * @name get
	     * @memberOf Stack
	     * @param {string} key The key of the value to get.
	     * @returns {*} Returns the entry value.
	     */
	    function stackGet(key) {
	      return this.__data__.get(key);
	    }

	    /**
	     * Checks if a stack value for `key` exists.
	     *
	     * @private
	     * @name has
	     * @memberOf Stack
	     * @param {string} key The key of the entry to check.
	     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	     */
	    function stackHas(key) {
	      return this.__data__.has(key);
	    }

	    /**
	     * Sets the stack `key` to `value`.
	     *
	     * @private
	     * @name set
	     * @memberOf Stack
	     * @param {string} key The key of the value to set.
	     * @param {*} value The value to set.
	     * @returns {Object} Returns the stack cache instance.
	     */
	    function stackSet(key, value) {
	      var data = this.__data__;
	      if (data instanceof ListCache) {
	        var pairs = data.__data__;
	        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	          pairs.push([key, value]);
	          this.size = ++data.size;
	          return this;
	        }
	        data = this.__data__ = new MapCache(pairs);
	      }
	      data.set(key, value);
	      this.size = data.size;
	      return this;
	    }

	    // Add methods to `Stack`.
	    Stack.prototype.clear = stackClear;
	    Stack.prototype['delete'] = stackDelete;
	    Stack.prototype.get = stackGet;
	    Stack.prototype.has = stackHas;
	    Stack.prototype.set = stackSet;

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates an array of the enumerable property names of the array-like `value`.
	     *
	     * @private
	     * @param {*} value The value to query.
	     * @param {boolean} inherited Specify returning inherited property names.
	     * @returns {Array} Returns the array of property names.
	     */
	    function arrayLikeKeys(value, inherited) {
	      var isArr = isArray(value),
	          isArg = !isArr && isArguments(value),
	          isBuff = !isArr && !isArg && isBuffer(value),
	          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
	          skipIndexes = isArr || isArg || isBuff || isType,
	          result = skipIndexes ? baseTimes(value.length, String) : [],
	          length = result.length;

	      for (var key in value) {
	        if ((inherited || hasOwnProperty.call(value, key)) &&
	            !(skipIndexes && (
	               // Safari 9 has enumerable `arguments.length` in strict mode.
	               key == 'length' ||
	               // Node.js 0.10 has enumerable non-index properties on buffers.
	               (isBuff && (key == 'offset' || key == 'parent')) ||
	               // PhantomJS 2 has enumerable non-index properties on typed arrays.
	               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
	               // Skip index properties.
	               isIndex(key, length)
	            ))) {
	          result.push(key);
	        }
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `_.sample` for arrays.
	     *
	     * @private
	     * @param {Array} array The array to sample.
	     * @returns {*} Returns the random element.
	     */
	    function arraySample(array) {
	      var length = array.length;
	      return length ? array[baseRandom(0, length - 1)] : undefined$1;
	    }

	    /**
	     * A specialized version of `_.sampleSize` for arrays.
	     *
	     * @private
	     * @param {Array} array The array to sample.
	     * @param {number} n The number of elements to sample.
	     * @returns {Array} Returns the random elements.
	     */
	    function arraySampleSize(array, n) {
	      return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
	    }

	    /**
	     * A specialized version of `_.shuffle` for arrays.
	     *
	     * @private
	     * @param {Array} array The array to shuffle.
	     * @returns {Array} Returns the new shuffled array.
	     */
	    function arrayShuffle(array) {
	      return shuffleSelf(copyArray(array));
	    }

	    /**
	     * This function is like `assignValue` except that it doesn't assign
	     * `undefined` values.
	     *
	     * @private
	     * @param {Object} object The object to modify.
	     * @param {string} key The key of the property to assign.
	     * @param {*} value The value to assign.
	     */
	    function assignMergeValue(object, key, value) {
	      if ((value !== undefined$1 && !eq(object[key], value)) ||
	          (value === undefined$1 && !(key in object))) {
	        baseAssignValue(object, key, value);
	      }
	    }

	    /**
	     * Assigns `value` to `key` of `object` if the existing value is not equivalent
	     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * @private
	     * @param {Object} object The object to modify.
	     * @param {string} key The key of the property to assign.
	     * @param {*} value The value to assign.
	     */
	    function assignValue(object, key, value) {
	      var objValue = object[key];
	      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	          (value === undefined$1 && !(key in object))) {
	        baseAssignValue(object, key, value);
	      }
	    }

	    /**
	     * Gets the index at which the `key` is found in `array` of key-value pairs.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {*} key The key to search for.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     */
	    function assocIndexOf(array, key) {
	      var length = array.length;
	      while (length--) {
	        if (eq(array[length][0], key)) {
	          return length;
	        }
	      }
	      return -1;
	    }

	    /**
	     * Aggregates elements of `collection` on `accumulator` with keys transformed
	     * by `iteratee` and values set by `setter`.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} setter The function to set `accumulator` values.
	     * @param {Function} iteratee The iteratee to transform keys.
	     * @param {Object} accumulator The initial aggregated object.
	     * @returns {Function} Returns `accumulator`.
	     */
	    function baseAggregator(collection, setter, iteratee, accumulator) {
	      baseEach(collection, function(value, key, collection) {
	        setter(accumulator, value, iteratee(value), collection);
	      });
	      return accumulator;
	    }

	    /**
	     * The base implementation of `_.assign` without support for multiple sources
	     * or `customizer` functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @returns {Object} Returns `object`.
	     */
	    function baseAssign(object, source) {
	      return object && copyObject(source, keys(source), object);
	    }

	    /**
	     * The base implementation of `_.assignIn` without support for multiple sources
	     * or `customizer` functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @returns {Object} Returns `object`.
	     */
	    function baseAssignIn(object, source) {
	      return object && copyObject(source, keysIn(source), object);
	    }

	    /**
	     * The base implementation of `assignValue` and `assignMergeValue` without
	     * value checks.
	     *
	     * @private
	     * @param {Object} object The object to modify.
	     * @param {string} key The key of the property to assign.
	     * @param {*} value The value to assign.
	     */
	    function baseAssignValue(object, key, value) {
	      if (key == '__proto__' && defineProperty) {
	        defineProperty(object, key, {
	          'configurable': true,
	          'enumerable': true,
	          'value': value,
	          'writable': true
	        });
	      } else {
	        object[key] = value;
	      }
	    }

	    /**
	     * The base implementation of `_.at` without support for individual paths.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {string[]} paths The property paths to pick.
	     * @returns {Array} Returns the picked elements.
	     */
	    function baseAt(object, paths) {
	      var index = -1,
	          length = paths.length,
	          result = Array(length),
	          skip = object == null;

	      while (++index < length) {
	        result[index] = skip ? undefined$1 : get(object, paths[index]);
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.clamp` which doesn't coerce arguments.
	     *
	     * @private
	     * @param {number} number The number to clamp.
	     * @param {number} [lower] The lower bound.
	     * @param {number} upper The upper bound.
	     * @returns {number} Returns the clamped number.
	     */
	    function baseClamp(number, lower, upper) {
	      if (number === number) {
	        if (upper !== undefined$1) {
	          number = number <= upper ? number : upper;
	        }
	        if (lower !== undefined$1) {
	          number = number >= lower ? number : lower;
	        }
	      }
	      return number;
	    }

	    /**
	     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
	     * traversed objects.
	     *
	     * @private
	     * @param {*} value The value to clone.
	     * @param {boolean} bitmask The bitmask flags.
	     *  1 - Deep clone
	     *  2 - Flatten inherited properties
	     *  4 - Clone symbols
	     * @param {Function} [customizer] The function to customize cloning.
	     * @param {string} [key] The key of `value`.
	     * @param {Object} [object] The parent object of `value`.
	     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
	     * @returns {*} Returns the cloned value.
	     */
	    function baseClone(value, bitmask, customizer, key, object, stack) {
	      var result,
	          isDeep = bitmask & CLONE_DEEP_FLAG,
	          isFlat = bitmask & CLONE_FLAT_FLAG,
	          isFull = bitmask & CLONE_SYMBOLS_FLAG;

	      if (customizer) {
	        result = object ? customizer(value, key, object, stack) : customizer(value);
	      }
	      if (result !== undefined$1) {
	        return result;
	      }
	      if (!isObject(value)) {
	        return value;
	      }
	      var isArr = isArray(value);
	      if (isArr) {
	        result = initCloneArray(value);
	        if (!isDeep) {
	          return copyArray(value, result);
	        }
	      } else {
	        var tag = getTag(value),
	            isFunc = tag == funcTag || tag == genTag;

	        if (isBuffer(value)) {
	          return cloneBuffer(value, isDeep);
	        }
	        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	          result = (isFlat || isFunc) ? {} : initCloneObject(value);
	          if (!isDeep) {
	            return isFlat
	              ? copySymbolsIn(value, baseAssignIn(result, value))
	              : copySymbols(value, baseAssign(result, value));
	          }
	        } else {
	          if (!cloneableTags[tag]) {
	            return object ? value : {};
	          }
	          result = initCloneByTag(value, tag, isDeep);
	        }
	      }
	      // Check for circular references and return its corresponding clone.
	      stack || (stack = new Stack);
	      var stacked = stack.get(value);
	      if (stacked) {
	        return stacked;
	      }
	      stack.set(value, result);

	      if (isSet(value)) {
	        value.forEach(function(subValue) {
	          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
	        });
	      } else if (isMap(value)) {
	        value.forEach(function(subValue, key) {
	          result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
	        });
	      }

	      var keysFunc = isFull
	        ? (isFlat ? getAllKeysIn : getAllKeys)
	        : (isFlat ? keysIn : keys);

	      var props = isArr ? undefined$1 : keysFunc(value);
	      arrayEach(props || value, function(subValue, key) {
	        if (props) {
	          key = subValue;
	          subValue = value[key];
	        }
	        // Recursively populate clone (susceptible to call stack limits).
	        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.conforms` which doesn't clone `source`.
	     *
	     * @private
	     * @param {Object} source The object of property predicates to conform to.
	     * @returns {Function} Returns the new spec function.
	     */
	    function baseConforms(source) {
	      var props = keys(source);
	      return function(object) {
	        return baseConformsTo(object, source, props);
	      };
	    }

	    /**
	     * The base implementation of `_.conformsTo` which accepts `props` to check.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property predicates to conform to.
	     * @returns {boolean} Returns `true` if `object` conforms, else `false`.
	     */
	    function baseConformsTo(object, source, props) {
	      var length = props.length;
	      if (object == null) {
	        return !length;
	      }
	      object = Object(object);
	      while (length--) {
	        var key = props[length],
	            predicate = source[key],
	            value = object[key];

	        if ((value === undefined$1 && !(key in object)) || !predicate(value)) {
	          return false;
	        }
	      }
	      return true;
	    }

	    /**
	     * The base implementation of `_.delay` and `_.defer` which accepts `args`
	     * to provide to `func`.
	     *
	     * @private
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @param {Array} args The arguments to provide to `func`.
	     * @returns {number|Object} Returns the timer id or timeout object.
	     */
	    function baseDelay(func, wait, args) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return setTimeout(function() { func.apply(undefined$1, args); }, wait);
	    }

	    /**
	     * The base implementation of methods like `_.difference` without support
	     * for excluding multiple arrays or iteratee shorthands.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Array} values The values to exclude.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of filtered values.
	     */
	    function baseDifference(array, values, iteratee, comparator) {
	      var index = -1,
	          includes = arrayIncludes,
	          isCommon = true,
	          length = array.length,
	          result = [],
	          valuesLength = values.length;

	      if (!length) {
	        return result;
	      }
	      if (iteratee) {
	        values = arrayMap(values, baseUnary(iteratee));
	      }
	      if (comparator) {
	        includes = arrayIncludesWith;
	        isCommon = false;
	      }
	      else if (values.length >= LARGE_ARRAY_SIZE) {
	        includes = cacheHas;
	        isCommon = false;
	        values = new SetCache(values);
	      }
	      outer:
	      while (++index < length) {
	        var value = array[index],
	            computed = iteratee == null ? value : iteratee(value);

	        value = (comparator || value !== 0) ? value : 0;
	        if (isCommon && computed === computed) {
	          var valuesIndex = valuesLength;
	          while (valuesIndex--) {
	            if (values[valuesIndex] === computed) {
	              continue outer;
	            }
	          }
	          result.push(value);
	        }
	        else if (!includes(values, computed, comparator)) {
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.forEach` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array|Object} Returns `collection`.
	     */
	    var baseEach = createBaseEach(baseForOwn);

	    /**
	     * The base implementation of `_.forEachRight` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array|Object} Returns `collection`.
	     */
	    var baseEachRight = createBaseEach(baseForOwnRight, true);

	    /**
	     * The base implementation of `_.every` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`
	     */
	    function baseEvery(collection, predicate) {
	      var result = true;
	      baseEach(collection, function(value, index, collection) {
	        result = !!predicate(value, index, collection);
	        return result;
	      });
	      return result;
	    }

	    /**
	     * The base implementation of methods like `_.max` and `_.min` which accepts a
	     * `comparator` to determine the extremum value.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The iteratee invoked per iteration.
	     * @param {Function} comparator The comparator used to compare values.
	     * @returns {*} Returns the extremum value.
	     */
	    function baseExtremum(array, iteratee, comparator) {
	      var index = -1,
	          length = array.length;

	      while (++index < length) {
	        var value = array[index],
	            current = iteratee(value);

	        if (current != null && (computed === undefined$1
	              ? (current === current && !isSymbol(current))
	              : comparator(current, computed)
	            )) {
	          var computed = current,
	              result = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.fill` without an iteratee call guard.
	     *
	     * @private
	     * @param {Array} array The array to fill.
	     * @param {*} value The value to fill `array` with.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns `array`.
	     */
	    function baseFill(array, value, start, end) {
	      var length = array.length;

	      start = toInteger(start);
	      if (start < 0) {
	        start = -start > length ? 0 : (length + start);
	      }
	      end = (end === undefined$1 || end > length) ? length : toInteger(end);
	      if (end < 0) {
	        end += length;
	      }
	      end = start > end ? 0 : toLength(end);
	      while (start < end) {
	        array[start++] = value;
	      }
	      return array;
	    }

	    /**
	     * The base implementation of `_.filter` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     */
	    function baseFilter(collection, predicate) {
	      var result = [];
	      baseEach(collection, function(value, index, collection) {
	        if (predicate(value, index, collection)) {
	          result.push(value);
	        }
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.flatten` with support for restricting flattening.
	     *
	     * @private
	     * @param {Array} array The array to flatten.
	     * @param {number} depth The maximum recursion depth.
	     * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
	     * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
	     * @param {Array} [result=[]] The initial result value.
	     * @returns {Array} Returns the new flattened array.
	     */
	    function baseFlatten(array, depth, predicate, isStrict, result) {
	      var index = -1,
	          length = array.length;

	      predicate || (predicate = isFlattenable);
	      result || (result = []);

	      while (++index < length) {
	        var value = array[index];
	        if (depth > 0 && predicate(value)) {
	          if (depth > 1) {
	            // Recursively flatten arrays (susceptible to call stack limits).
	            baseFlatten(value, depth - 1, predicate, isStrict, result);
	          } else {
	            arrayPush(result, value);
	          }
	        } else if (!isStrict) {
	          result[result.length] = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `baseForOwn` which iterates over `object`
	     * properties returned by `keysFunc` and invokes `iteratee` for each property.
	     * Iteratee functions may exit iteration early by explicitly returning `false`.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @returns {Object} Returns `object`.
	     */
	    var baseFor = createBaseFor();

	    /**
	     * This function is like `baseFor` except that it iterates over properties
	     * in the opposite order.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @returns {Object} Returns `object`.
	     */
	    var baseForRight = createBaseFor(true);

	    /**
	     * The base implementation of `_.forOwn` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForOwn(object, iteratee) {
	      return object && baseFor(object, iteratee, keys);
	    }

	    /**
	     * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForOwnRight(object, iteratee) {
	      return object && baseForRight(object, iteratee, keys);
	    }

	    /**
	     * The base implementation of `_.functions` which creates an array of
	     * `object` function property names filtered from `props`.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Array} props The property names to filter.
	     * @returns {Array} Returns the function names.
	     */
	    function baseFunctions(object, props) {
	      return arrayFilter(props, function(key) {
	        return isFunction(object[key]);
	      });
	    }

	    /**
	     * The base implementation of `_.get` without support for default values.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the property to get.
	     * @returns {*} Returns the resolved value.
	     */
	    function baseGet(object, path) {
	      path = castPath(path, object);

	      var index = 0,
	          length = path.length;

	      while (object != null && index < length) {
	        object = object[toKey(path[index++])];
	      }
	      return (index && index == length) ? object : undefined$1;
	    }

	    /**
	     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	     * symbols of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @param {Function} symbolsFunc The function to get the symbols of `object`.
	     * @returns {Array} Returns the array of property names and symbols.
	     */
	    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	      var result = keysFunc(object);
	      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	    }

	    /**
	     * The base implementation of `getTag` without fallbacks for buggy environments.
	     *
	     * @private
	     * @param {*} value The value to query.
	     * @returns {string} Returns the `toStringTag`.
	     */
	    function baseGetTag(value) {
	      if (value == null) {
	        return value === undefined$1 ? undefinedTag : nullTag;
	      }
	      return (symToStringTag && symToStringTag in Object(value))
	        ? getRawTag(value)
	        : objectToString(value);
	    }

	    /**
	     * The base implementation of `_.gt` which doesn't coerce arguments.
	     *
	     * @private
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is greater than `other`,
	     *  else `false`.
	     */
	    function baseGt(value, other) {
	      return value > other;
	    }

	    /**
	     * The base implementation of `_.has` without support for deep paths.
	     *
	     * @private
	     * @param {Object} [object] The object to query.
	     * @param {Array|string} key The key to check.
	     * @returns {boolean} Returns `true` if `key` exists, else `false`.
	     */
	    function baseHas(object, key) {
	      return object != null && hasOwnProperty.call(object, key);
	    }

	    /**
	     * The base implementation of `_.hasIn` without support for deep paths.
	     *
	     * @private
	     * @param {Object} [object] The object to query.
	     * @param {Array|string} key The key to check.
	     * @returns {boolean} Returns `true` if `key` exists, else `false`.
	     */
	    function baseHasIn(object, key) {
	      return object != null && key in Object(object);
	    }

	    /**
	     * The base implementation of `_.inRange` which doesn't coerce arguments.
	     *
	     * @private
	     * @param {number} number The number to check.
	     * @param {number} start The start of the range.
	     * @param {number} end The end of the range.
	     * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
	     */
	    function baseInRange(number, start, end) {
	      return number >= nativeMin(start, end) && number < nativeMax(start, end);
	    }

	    /**
	     * The base implementation of methods like `_.intersection`, without support
	     * for iteratee shorthands, that accepts an array of arrays to inspect.
	     *
	     * @private
	     * @param {Array} arrays The arrays to inspect.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of shared values.
	     */
	    function baseIntersection(arrays, iteratee, comparator) {
	      var includes = comparator ? arrayIncludesWith : arrayIncludes,
	          length = arrays[0].length,
	          othLength = arrays.length,
	          othIndex = othLength,
	          caches = Array(othLength),
	          maxLength = Infinity,
	          result = [];

	      while (othIndex--) {
	        var array = arrays[othIndex];
	        if (othIndex && iteratee) {
	          array = arrayMap(array, baseUnary(iteratee));
	        }
	        maxLength = nativeMin(array.length, maxLength);
	        caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
	          ? new SetCache(othIndex && array)
	          : undefined$1;
	      }
	      array = arrays[0];

	      var index = -1,
	          seen = caches[0];

	      outer:
	      while (++index < length && result.length < maxLength) {
	        var value = array[index],
	            computed = iteratee ? iteratee(value) : value;

	        value = (comparator || value !== 0) ? value : 0;
	        if (!(seen
	              ? cacheHas(seen, computed)
	              : includes(result, computed, comparator)
	            )) {
	          othIndex = othLength;
	          while (--othIndex) {
	            var cache = caches[othIndex];
	            if (!(cache
	                  ? cacheHas(cache, computed)
	                  : includes(arrays[othIndex], computed, comparator))
	                ) {
	              continue outer;
	            }
	          }
	          if (seen) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.invert` and `_.invertBy` which inverts
	     * `object` with values transformed by `iteratee` and set by `setter`.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} setter The function to set `accumulator` values.
	     * @param {Function} iteratee The iteratee to transform values.
	     * @param {Object} accumulator The initial inverted object.
	     * @returns {Function} Returns `accumulator`.
	     */
	    function baseInverter(object, setter, iteratee, accumulator) {
	      baseForOwn(object, function(value, key, object) {
	        setter(accumulator, iteratee(value), key, object);
	      });
	      return accumulator;
	    }

	    /**
	     * The base implementation of `_.invoke` without support for individual
	     * method arguments.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the method to invoke.
	     * @param {Array} args The arguments to invoke the method with.
	     * @returns {*} Returns the result of the invoked method.
	     */
	    function baseInvoke(object, path, args) {
	      path = castPath(path, object);
	      object = parent(object, path);
	      var func = object == null ? object : object[toKey(last(path))];
	      return func == null ? undefined$1 : apply(func, object, args);
	    }

	    /**
	     * The base implementation of `_.isArguments`.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	     */
	    function baseIsArguments(value) {
	      return isObjectLike(value) && baseGetTag(value) == argsTag;
	    }

	    /**
	     * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
	     */
	    function baseIsArrayBuffer(value) {
	      return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
	    }

	    /**
	     * The base implementation of `_.isDate` without Node.js optimizations.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
	     */
	    function baseIsDate(value) {
	      return isObjectLike(value) && baseGetTag(value) == dateTag;
	    }

	    /**
	     * The base implementation of `_.isEqual` which supports partial comparisons
	     * and tracks traversed objects.
	     *
	     * @private
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @param {boolean} bitmask The bitmask flags.
	     *  1 - Unordered comparison
	     *  2 - Partial comparison
	     * @param {Function} [customizer] The function to customize comparisons.
	     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     */
	    function baseIsEqual(value, other, bitmask, customizer, stack) {
	      if (value === other) {
	        return true;
	      }
	      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
	        return value !== value && other !== other;
	      }
	      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
	    }

	    /**
	     * A specialized version of `baseIsEqual` for arrays and objects which performs
	     * deep comparisons and tracks traversed objects enabling objects with circular
	     * references to be compared.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	     * @param {Function} customizer The function to customize comparisons.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
	      var objIsArr = isArray(object),
	          othIsArr = isArray(other),
	          objTag = objIsArr ? arrayTag : getTag(object),
	          othTag = othIsArr ? arrayTag : getTag(other);

	      objTag = objTag == argsTag ? objectTag : objTag;
	      othTag = othTag == argsTag ? objectTag : othTag;

	      var objIsObj = objTag == objectTag,
	          othIsObj = othTag == objectTag,
	          isSameTag = objTag == othTag;

	      if (isSameTag && isBuffer(object)) {
	        if (!isBuffer(other)) {
	          return false;
	        }
	        objIsArr = true;
	        objIsObj = false;
	      }
	      if (isSameTag && !objIsObj) {
	        stack || (stack = new Stack);
	        return (objIsArr || isTypedArray(object))
	          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
	          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
	      }
	      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
	        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	        if (objIsWrapped || othIsWrapped) {
	          var objUnwrapped = objIsWrapped ? object.value() : object,
	              othUnwrapped = othIsWrapped ? other.value() : other;

	          stack || (stack = new Stack);
	          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
	        }
	      }
	      if (!isSameTag) {
	        return false;
	      }
	      stack || (stack = new Stack);
	      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
	    }

	    /**
	     * The base implementation of `_.isMap` without Node.js optimizations.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
	     */
	    function baseIsMap(value) {
	      return isObjectLike(value) && getTag(value) == mapTag;
	    }

	    /**
	     * The base implementation of `_.isMatch` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property values to match.
	     * @param {Array} matchData The property names, values, and compare flags to match.
	     * @param {Function} [customizer] The function to customize comparisons.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     */
	    function baseIsMatch(object, source, matchData, customizer) {
	      var index = matchData.length,
	          length = index,
	          noCustomizer = !customizer;

	      if (object == null) {
	        return !length;
	      }
	      object = Object(object);
	      while (index--) {
	        var data = matchData[index];
	        if ((noCustomizer && data[2])
	              ? data[1] !== object[data[0]]
	              : !(data[0] in object)
	            ) {
	          return false;
	        }
	      }
	      while (++index < length) {
	        data = matchData[index];
	        var key = data[0],
	            objValue = object[key],
	            srcValue = data[1];

	        if (noCustomizer && data[2]) {
	          if (objValue === undefined$1 && !(key in object)) {
	            return false;
	          }
	        } else {
	          var stack = new Stack;
	          if (customizer) {
	            var result = customizer(objValue, srcValue, key, object, source, stack);
	          }
	          if (!(result === undefined$1
	                ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
	                : result
	              )) {
	            return false;
	          }
	        }
	      }
	      return true;
	    }

	    /**
	     * The base implementation of `_.isNative` without bad shim checks.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a native function,
	     *  else `false`.
	     */
	    function baseIsNative(value) {
	      if (!isObject(value) || isMasked(value)) {
	        return false;
	      }
	      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
	      return pattern.test(toSource(value));
	    }

	    /**
	     * The base implementation of `_.isRegExp` without Node.js optimizations.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
	     */
	    function baseIsRegExp(value) {
	      return isObjectLike(value) && baseGetTag(value) == regexpTag;
	    }

	    /**
	     * The base implementation of `_.isSet` without Node.js optimizations.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
	     */
	    function baseIsSet(value) {
	      return isObjectLike(value) && getTag(value) == setTag;
	    }

	    /**
	     * The base implementation of `_.isTypedArray` without Node.js optimizations.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	     */
	    function baseIsTypedArray(value) {
	      return isObjectLike(value) &&
	        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
	    }

	    /**
	     * The base implementation of `_.iteratee`.
	     *
	     * @private
	     * @param {*} [value=_.identity] The value to convert to an iteratee.
	     * @returns {Function} Returns the iteratee.
	     */
	    function baseIteratee(value) {
	      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
	      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
	      if (typeof value == 'function') {
	        return value;
	      }
	      if (value == null) {
	        return identity;
	      }
	      if (typeof value == 'object') {
	        return isArray(value)
	          ? baseMatchesProperty(value[0], value[1])
	          : baseMatches(value);
	      }
	      return property(value);
	    }

	    /**
	     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     */
	    function baseKeys(object) {
	      if (!isPrototype(object)) {
	        return nativeKeys(object);
	      }
	      var result = [];
	      for (var key in Object(object)) {
	        if (hasOwnProperty.call(object, key) && key != 'constructor') {
	          result.push(key);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     */
	    function baseKeysIn(object) {
	      if (!isObject(object)) {
	        return nativeKeysIn(object);
	      }
	      var isProto = isPrototype(object),
	          result = [];

	      for (var key in object) {
	        if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	          result.push(key);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.lt` which doesn't coerce arguments.
	     *
	     * @private
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is less than `other`,
	     *  else `false`.
	     */
	    function baseLt(value, other) {
	      return value < other;
	    }

	    /**
	     * The base implementation of `_.map` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns the new mapped array.
	     */
	    function baseMap(collection, iteratee) {
	      var index = -1,
	          result = isArrayLike(collection) ? Array(collection.length) : [];

	      baseEach(collection, function(value, key, collection) {
	        result[++index] = iteratee(value, key, collection);
	      });
	      return result;
	    }

	    /**
	     * The base implementation of `_.matches` which doesn't clone `source`.
	     *
	     * @private
	     * @param {Object} source The object of property values to match.
	     * @returns {Function} Returns the new spec function.
	     */
	    function baseMatches(source) {
	      var matchData = getMatchData(source);
	      if (matchData.length == 1 && matchData[0][2]) {
	        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
	      }
	      return function(object) {
	        return object === source || baseIsMatch(object, source, matchData);
	      };
	    }

	    /**
	     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
	     *
	     * @private
	     * @param {string} path The path of the property to get.
	     * @param {*} srcValue The value to match.
	     * @returns {Function} Returns the new spec function.
	     */
	    function baseMatchesProperty(path, srcValue) {
	      if (isKey(path) && isStrictComparable(srcValue)) {
	        return matchesStrictComparable(toKey(path), srcValue);
	      }
	      return function(object) {
	        var objValue = get(object, path);
	        return (objValue === undefined$1 && objValue === srcValue)
	          ? hasIn(object, path)
	          : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
	      };
	    }

	    /**
	     * The base implementation of `_.merge` without support for multiple sources.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {number} srcIndex The index of `source`.
	     * @param {Function} [customizer] The function to customize merged values.
	     * @param {Object} [stack] Tracks traversed source values and their merged
	     *  counterparts.
	     */
	    function baseMerge(object, source, srcIndex, customizer, stack) {
	      if (object === source) {
	        return;
	      }
	      baseFor(source, function(srcValue, key) {
	        stack || (stack = new Stack);
	        if (isObject(srcValue)) {
	          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
	        }
	        else {
	          var newValue = customizer
	            ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
	            : undefined$1;

	          if (newValue === undefined$1) {
	            newValue = srcValue;
	          }
	          assignMergeValue(object, key, newValue);
	        }
	      }, keysIn);
	    }

	    /**
	     * A specialized version of `baseMerge` for arrays and objects which performs
	     * deep merges and tracks traversed objects enabling objects with circular
	     * references to be merged.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {string} key The key of the value to merge.
	     * @param {number} srcIndex The index of `source`.
	     * @param {Function} mergeFunc The function to merge values.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @param {Object} [stack] Tracks traversed source values and their merged
	     *  counterparts.
	     */
	    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
	      var objValue = safeGet(object, key),
	          srcValue = safeGet(source, key),
	          stacked = stack.get(srcValue);

	      if (stacked) {
	        assignMergeValue(object, key, stacked);
	        return;
	      }
	      var newValue = customizer
	        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
	        : undefined$1;

	      var isCommon = newValue === undefined$1;

	      if (isCommon) {
	        var isArr = isArray(srcValue),
	            isBuff = !isArr && isBuffer(srcValue),
	            isTyped = !isArr && !isBuff && isTypedArray(srcValue);

	        newValue = srcValue;
	        if (isArr || isBuff || isTyped) {
	          if (isArray(objValue)) {
	            newValue = objValue;
	          }
	          else if (isArrayLikeObject(objValue)) {
	            newValue = copyArray(objValue);
	          }
	          else if (isBuff) {
	            isCommon = false;
	            newValue = cloneBuffer(srcValue, true);
	          }
	          else if (isTyped) {
	            isCommon = false;
	            newValue = cloneTypedArray(srcValue, true);
	          }
	          else {
	            newValue = [];
	          }
	        }
	        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	          newValue = objValue;
	          if (isArguments(objValue)) {
	            newValue = toPlainObject(objValue);
	          }
	          else if (!isObject(objValue) || isFunction(objValue)) {
	            newValue = initCloneObject(srcValue);
	          }
	        }
	        else {
	          isCommon = false;
	        }
	      }
	      if (isCommon) {
	        // Recursively merge objects and arrays (susceptible to call stack limits).
	        stack.set(srcValue, newValue);
	        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
	        stack['delete'](srcValue);
	      }
	      assignMergeValue(object, key, newValue);
	    }

	    /**
	     * The base implementation of `_.nth` which doesn't coerce arguments.
	     *
	     * @private
	     * @param {Array} array The array to query.
	     * @param {number} n The index of the element to return.
	     * @returns {*} Returns the nth element of `array`.
	     */
	    function baseNth(array, n) {
	      var length = array.length;
	      if (!length) {
	        return;
	      }
	      n += n < 0 ? length : 0;
	      return isIndex(n, length) ? array[n] : undefined$1;
	    }

	    /**
	     * The base implementation of `_.orderBy` without param guards.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	     * @param {string[]} orders The sort orders of `iteratees`.
	     * @returns {Array} Returns the new sorted array.
	     */
	    function baseOrderBy(collection, iteratees, orders) {
	      var index = -1;
	      iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(getIteratee()));

	      var result = baseMap(collection, function(value, key, collection) {
	        var criteria = arrayMap(iteratees, function(iteratee) {
	          return iteratee(value);
	        });
	        return { 'criteria': criteria, 'index': ++index, 'value': value };
	      });

	      return baseSortBy(result, function(object, other) {
	        return compareMultiple(object, other, orders);
	      });
	    }

	    /**
	     * The base implementation of `_.pick` without support for individual
	     * property identifiers.
	     *
	     * @private
	     * @param {Object} object The source object.
	     * @param {string[]} paths The property paths to pick.
	     * @returns {Object} Returns the new object.
	     */
	    function basePick(object, paths) {
	      return basePickBy(object, paths, function(value, path) {
	        return hasIn(object, path);
	      });
	    }

	    /**
	     * The base implementation of  `_.pickBy` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Object} object The source object.
	     * @param {string[]} paths The property paths to pick.
	     * @param {Function} predicate The function invoked per property.
	     * @returns {Object} Returns the new object.
	     */
	    function basePickBy(object, paths, predicate) {
	      var index = -1,
	          length = paths.length,
	          result = {};

	      while (++index < length) {
	        var path = paths[index],
	            value = baseGet(object, path);

	        if (predicate(value, path)) {
	          baseSet(result, castPath(path, object), value);
	        }
	      }
	      return result;
	    }

	    /**
	     * A specialized version of `baseProperty` which supports deep paths.
	     *
	     * @private
	     * @param {Array|string} path The path of the property to get.
	     * @returns {Function} Returns the new accessor function.
	     */
	    function basePropertyDeep(path) {
	      return function(object) {
	        return baseGet(object, path);
	      };
	    }

	    /**
	     * The base implementation of `_.pullAllBy` without support for iteratee
	     * shorthands.
	     *
	     * @private
	     * @param {Array} array The array to modify.
	     * @param {Array} values The values to remove.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns `array`.
	     */
	    function basePullAll(array, values, iteratee, comparator) {
	      var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
	          index = -1,
	          length = values.length,
	          seen = array;

	      if (array === values) {
	        values = copyArray(values);
	      }
	      if (iteratee) {
	        seen = arrayMap(array, baseUnary(iteratee));
	      }
	      while (++index < length) {
	        var fromIndex = 0,
	            value = values[index],
	            computed = iteratee ? iteratee(value) : value;

	        while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
	          if (seen !== array) {
	            splice.call(seen, fromIndex, 1);
	          }
	          splice.call(array, fromIndex, 1);
	        }
	      }
	      return array;
	    }

	    /**
	     * The base implementation of `_.pullAt` without support for individual
	     * indexes or capturing the removed elements.
	     *
	     * @private
	     * @param {Array} array The array to modify.
	     * @param {number[]} indexes The indexes of elements to remove.
	     * @returns {Array} Returns `array`.
	     */
	    function basePullAt(array, indexes) {
	      var length = array ? indexes.length : 0,
	          lastIndex = length - 1;

	      while (length--) {
	        var index = indexes[length];
	        if (length == lastIndex || index !== previous) {
	          var previous = index;
	          if (isIndex(index)) {
	            splice.call(array, index, 1);
	          } else {
	            baseUnset(array, index);
	          }
	        }
	      }
	      return array;
	    }

	    /**
	     * The base implementation of `_.random` without support for returning
	     * floating-point numbers.
	     *
	     * @private
	     * @param {number} lower The lower bound.
	     * @param {number} upper The upper bound.
	     * @returns {number} Returns the random number.
	     */
	    function baseRandom(lower, upper) {
	      return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
	    }

	    /**
	     * The base implementation of `_.range` and `_.rangeRight` which doesn't
	     * coerce arguments.
	     *
	     * @private
	     * @param {number} start The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} step The value to increment or decrement by.
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Array} Returns the range of numbers.
	     */
	    function baseRange(start, end, step, fromRight) {
	      var index = -1,
	          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
	          result = Array(length);

	      while (length--) {
	        result[fromRight ? length : ++index] = start;
	        start += step;
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.repeat` which doesn't coerce arguments.
	     *
	     * @private
	     * @param {string} string The string to repeat.
	     * @param {number} n The number of times to repeat the string.
	     * @returns {string} Returns the repeated string.
	     */
	    function baseRepeat(string, n) {
	      var result = '';
	      if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
	        return result;
	      }
	      // Leverage the exponentiation by squaring algorithm for a faster repeat.
	      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
	      do {
	        if (n % 2) {
	          result += string;
	        }
	        n = nativeFloor(n / 2);
	        if (n) {
	          string += string;
	        }
	      } while (n);

	      return result;
	    }

	    /**
	     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
	     *
	     * @private
	     * @param {Function} func The function to apply a rest parameter to.
	     * @param {number} [start=func.length-1] The start position of the rest parameter.
	     * @returns {Function} Returns the new function.
	     */
	    function baseRest(func, start) {
	      return setToString(overRest(func, start, identity), func + '');
	    }

	    /**
	     * The base implementation of `_.sample`.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to sample.
	     * @returns {*} Returns the random element.
	     */
	    function baseSample(collection) {
	      return arraySample(values(collection));
	    }

	    /**
	     * The base implementation of `_.sampleSize` without param guards.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to sample.
	     * @param {number} n The number of elements to sample.
	     * @returns {Array} Returns the random elements.
	     */
	    function baseSampleSize(collection, n) {
	      var array = values(collection);
	      return shuffleSelf(array, baseClamp(n, 0, array.length));
	    }

	    /**
	     * The base implementation of `_.set`.
	     *
	     * @private
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to set.
	     * @param {*} value The value to set.
	     * @param {Function} [customizer] The function to customize path creation.
	     * @returns {Object} Returns `object`.
	     */
	    function baseSet(object, path, value, customizer) {
	      if (!isObject(object)) {
	        return object;
	      }
	      path = castPath(path, object);

	      var index = -1,
	          length = path.length,
	          lastIndex = length - 1,
	          nested = object;

	      while (nested != null && ++index < length) {
	        var key = toKey(path[index]),
	            newValue = value;

	        if (index != lastIndex) {
	          var objValue = nested[key];
	          newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
	          if (newValue === undefined$1) {
	            newValue = isObject(objValue)
	              ? objValue
	              : (isIndex(path[index + 1]) ? [] : {});
	          }
	        }
	        assignValue(nested, key, newValue);
	        nested = nested[key];
	      }
	      return object;
	    }

	    /**
	     * The base implementation of `setData` without support for hot loop shorting.
	     *
	     * @private
	     * @param {Function} func The function to associate metadata with.
	     * @param {*} data The metadata.
	     * @returns {Function} Returns `func`.
	     */
	    var baseSetData = !metaMap ? identity : function(func, data) {
	      metaMap.set(func, data);
	      return func;
	    };

	    /**
	     * The base implementation of `setToString` without support for hot loop shorting.
	     *
	     * @private
	     * @param {Function} func The function to modify.
	     * @param {Function} string The `toString` result.
	     * @returns {Function} Returns `func`.
	     */
	    var baseSetToString = !defineProperty ? identity : function(func, string) {
	      return defineProperty(func, 'toString', {
	        'configurable': true,
	        'enumerable': false,
	        'value': constant(string),
	        'writable': true
	      });
	    };

	    /**
	     * The base implementation of `_.shuffle`.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to shuffle.
	     * @returns {Array} Returns the new shuffled array.
	     */
	    function baseShuffle(collection) {
	      return shuffleSelf(values(collection));
	    }

	    /**
	     * The base implementation of `_.slice` without an iteratee call guard.
	     *
	     * @private
	     * @param {Array} array The array to slice.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function baseSlice(array, start, end) {
	      var index = -1,
	          length = array.length;

	      if (start < 0) {
	        start = -start > length ? 0 : (length + start);
	      }
	      end = end > length ? length : end;
	      if (end < 0) {
	        end += length;
	      }
	      length = start > end ? 0 : ((end - start) >>> 0);
	      start >>>= 0;

	      var result = Array(length);
	      while (++index < length) {
	        result[index] = array[index + start];
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.some` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     */
	    function baseSome(collection, predicate) {
	      var result;

	      baseEach(collection, function(value, index, collection) {
	        result = predicate(value, index, collection);
	        return !result;
	      });
	      return !!result;
	    }

	    /**
	     * The base implementation of `_.sortedIndex` and `_.sortedLastIndex` which
	     * performs a binary search of `array` to determine the index at which `value`
	     * should be inserted into `array` in order to maintain its sort order.
	     *
	     * @private
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {boolean} [retHighest] Specify returning the highest qualified index.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     */
	    function baseSortedIndex(array, value, retHighest) {
	      var low = 0,
	          high = array == null ? low : array.length;

	      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
	        while (low < high) {
	          var mid = (low + high) >>> 1,
	              computed = array[mid];

	          if (computed !== null && !isSymbol(computed) &&
	              (retHighest ? (computed <= value) : (computed < value))) {
	            low = mid + 1;
	          } else {
	            high = mid;
	          }
	        }
	        return high;
	      }
	      return baseSortedIndexBy(array, value, identity, retHighest);
	    }

	    /**
	     * The base implementation of `_.sortedIndexBy` and `_.sortedLastIndexBy`
	     * which invokes `iteratee` for `value` and each element of `array` to compute
	     * their sort ranking. The iteratee is invoked with one argument; (value).
	     *
	     * @private
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function} iteratee The iteratee invoked per element.
	     * @param {boolean} [retHighest] Specify returning the highest qualified index.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     */
	    function baseSortedIndexBy(array, value, iteratee, retHighest) {
	      value = iteratee(value);

	      var low = 0,
	          high = array == null ? 0 : array.length,
	          valIsNaN = value !== value,
	          valIsNull = value === null,
	          valIsSymbol = isSymbol(value),
	          valIsUndefined = value === undefined$1;

	      while (low < high) {
	        var mid = nativeFloor((low + high) / 2),
	            computed = iteratee(array[mid]),
	            othIsDefined = computed !== undefined$1,
	            othIsNull = computed === null,
	            othIsReflexive = computed === computed,
	            othIsSymbol = isSymbol(computed);

	        if (valIsNaN) {
	          var setLow = retHighest || othIsReflexive;
	        } else if (valIsUndefined) {
	          setLow = othIsReflexive && (retHighest || othIsDefined);
	        } else if (valIsNull) {
	          setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
	        } else if (valIsSymbol) {
	          setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
	        } else if (othIsNull || othIsSymbol) {
	          setLow = false;
	        } else {
	          setLow = retHighest ? (computed <= value) : (computed < value);
	        }
	        if (setLow) {
	          low = mid + 1;
	        } else {
	          high = mid;
	        }
	      }
	      return nativeMin(high, MAX_ARRAY_INDEX);
	    }

	    /**
	     * The base implementation of `_.sortedUniq` and `_.sortedUniqBy` without
	     * support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @returns {Array} Returns the new duplicate free array.
	     */
	    function baseSortedUniq(array, iteratee) {
	      var index = -1,
	          length = array.length,
	          resIndex = 0,
	          result = [];

	      while (++index < length) {
	        var value = array[index],
	            computed = iteratee ? iteratee(value) : value;

	        if (!index || !eq(computed, seen)) {
	          var seen = computed;
	          result[resIndex++] = value === 0 ? 0 : value;
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.toNumber` which doesn't ensure correct
	     * conversions of binary, hexadecimal, or octal string values.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {number} Returns the number.
	     */
	    function baseToNumber(value) {
	      if (typeof value == 'number') {
	        return value;
	      }
	      if (isSymbol(value)) {
	        return NAN;
	      }
	      return +value;
	    }

	    /**
	     * The base implementation of `_.toString` which doesn't convert nullish
	     * values to empty strings.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {string} Returns the string.
	     */
	    function baseToString(value) {
	      // Exit early for strings to avoid a performance hit in some environments.
	      if (typeof value == 'string') {
	        return value;
	      }
	      if (isArray(value)) {
	        // Recursively convert values (susceptible to call stack limits).
	        return arrayMap(value, baseToString) + '';
	      }
	      if (isSymbol(value)) {
	        return symbolToString ? symbolToString.call(value) : '';
	      }
	      var result = (value + '');
	      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	    }

	    /**
	     * The base implementation of `_.uniqBy` without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new duplicate free array.
	     */
	    function baseUniq(array, iteratee, comparator) {
	      var index = -1,
	          includes = arrayIncludes,
	          length = array.length,
	          isCommon = true,
	          result = [],
	          seen = result;

	      if (comparator) {
	        isCommon = false;
	        includes = arrayIncludesWith;
	      }
	      else if (length >= LARGE_ARRAY_SIZE) {
	        var set = iteratee ? null : createSet(array);
	        if (set) {
	          return setToArray(set);
	        }
	        isCommon = false;
	        includes = cacheHas;
	        seen = new SetCache;
	      }
	      else {
	        seen = iteratee ? [] : result;
	      }
	      outer:
	      while (++index < length) {
	        var value = array[index],
	            computed = iteratee ? iteratee(value) : value;

	        value = (comparator || value !== 0) ? value : 0;
	        if (isCommon && computed === computed) {
	          var seenIndex = seen.length;
	          while (seenIndex--) {
	            if (seen[seenIndex] === computed) {
	              continue outer;
	            }
	          }
	          if (iteratee) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	        else if (!includes(seen, computed, comparator)) {
	          if (seen !== result) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	      }
	      return result;
	    }

	    /**
	     * The base implementation of `_.unset`.
	     *
	     * @private
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The property path to unset.
	     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
	     */
	    function baseUnset(object, path) {
	      path = castPath(path, object);
	      object = parent(object, path);
	      return object == null || delete object[toKey(last(path))];
	    }

	    /**
	     * The base implementation of `_.update`.
	     *
	     * @private
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to update.
	     * @param {Function} updater The function to produce the updated value.
	     * @param {Function} [customizer] The function to customize path creation.
	     * @returns {Object} Returns `object`.
	     */
	    function baseUpdate(object, path, updater, customizer) {
	      return baseSet(object, path, updater(baseGet(object, path)), customizer);
	    }

	    /**
	     * The base implementation of methods like `_.dropWhile` and `_.takeWhile`
	     * without support for iteratee shorthands.
	     *
	     * @private
	     * @param {Array} array The array to query.
	     * @param {Function} predicate The function invoked per iteration.
	     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function baseWhile(array, predicate, isDrop, fromRight) {
	      var length = array.length,
	          index = fromRight ? length : -1;

	      while ((fromRight ? index-- : ++index < length) &&
	        predicate(array[index], index, array)) {}

	      return isDrop
	        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
	        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
	    }

	    /**
	     * The base implementation of `wrapperValue` which returns the result of
	     * performing a sequence of actions on the unwrapped `value`, where each
	     * successive action is supplied the return value of the previous.
	     *
	     * @private
	     * @param {*} value The unwrapped value.
	     * @param {Array} actions Actions to perform to resolve the unwrapped value.
	     * @returns {*} Returns the resolved value.
	     */
	    function baseWrapperValue(value, actions) {
	      var result = value;
	      if (result instanceof LazyWrapper) {
	        result = result.value();
	      }
	      return arrayReduce(actions, function(result, action) {
	        return action.func.apply(action.thisArg, arrayPush([result], action.args));
	      }, result);
	    }

	    /**
	     * The base implementation of methods like `_.xor`, without support for
	     * iteratee shorthands, that accepts an array of arrays to inspect.
	     *
	     * @private
	     * @param {Array} arrays The arrays to inspect.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of values.
	     */
	    function baseXor(arrays, iteratee, comparator) {
	      var length = arrays.length;
	      if (length < 2) {
	        return length ? baseUniq(arrays[0]) : [];
	      }
	      var index = -1,
	          result = Array(length);

	      while (++index < length) {
	        var array = arrays[index],
	            othIndex = -1;

	        while (++othIndex < length) {
	          if (othIndex != index) {
	            result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
	          }
	        }
	      }
	      return baseUniq(baseFlatten(result, 1), iteratee, comparator);
	    }

	    /**
	     * This base implementation of `_.zipObject` which assigns values using `assignFunc`.
	     *
	     * @private
	     * @param {Array} props The property identifiers.
	     * @param {Array} values The property values.
	     * @param {Function} assignFunc The function to assign values.
	     * @returns {Object} Returns the new object.
	     */
	    function baseZipObject(props, values, assignFunc) {
	      var index = -1,
	          length = props.length,
	          valsLength = values.length,
	          result = {};

	      while (++index < length) {
	        var value = index < valsLength ? values[index] : undefined$1;
	        assignFunc(result, props[index], value);
	      }
	      return result;
	    }

	    /**
	     * Casts `value` to an empty array if it's not an array like object.
	     *
	     * @private
	     * @param {*} value The value to inspect.
	     * @returns {Array|Object} Returns the cast array-like object.
	     */
	    function castArrayLikeObject(value) {
	      return isArrayLikeObject(value) ? value : [];
	    }

	    /**
	     * Casts `value` to `identity` if it's not a function.
	     *
	     * @private
	     * @param {*} value The value to inspect.
	     * @returns {Function} Returns cast function.
	     */
	    function castFunction(value) {
	      return typeof value == 'function' ? value : identity;
	    }

	    /**
	     * Casts `value` to a path array if it's not one.
	     *
	     * @private
	     * @param {*} value The value to inspect.
	     * @param {Object} [object] The object to query keys on.
	     * @returns {Array} Returns the cast property path array.
	     */
	    function castPath(value, object) {
	      if (isArray(value)) {
	        return value;
	      }
	      return isKey(value, object) ? [value] : stringToPath(toString(value));
	    }

	    /**
	     * A `baseRest` alias which can be replaced with `identity` by module
	     * replacement plugins.
	     *
	     * @private
	     * @type {Function}
	     * @param {Function} func The function to apply a rest parameter to.
	     * @returns {Function} Returns the new function.
	     */
	    var castRest = baseRest;

	    /**
	     * Casts `array` to a slice if it's needed.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {number} start The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the cast slice.
	     */
	    function castSlice(array, start, end) {
	      var length = array.length;
	      end = end === undefined$1 ? length : end;
	      return (!start && end >= length) ? array : baseSlice(array, start, end);
	    }

	    /**
	     * A simple wrapper around the global [`clearTimeout`](https://mdn.io/clearTimeout).
	     *
	     * @private
	     * @param {number|Object} id The timer id or timeout object of the timer to clear.
	     */
	    var clearTimeout = ctxClearTimeout || function(id) {
	      return root.clearTimeout(id);
	    };

	    /**
	     * Creates a clone of  `buffer`.
	     *
	     * @private
	     * @param {Buffer} buffer The buffer to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @returns {Buffer} Returns the cloned buffer.
	     */
	    function cloneBuffer(buffer, isDeep) {
	      if (isDeep) {
	        return buffer.slice();
	      }
	      var length = buffer.length,
	          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

	      buffer.copy(result);
	      return result;
	    }

	    /**
	     * Creates a clone of `arrayBuffer`.
	     *
	     * @private
	     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	     * @returns {ArrayBuffer} Returns the cloned array buffer.
	     */
	    function cloneArrayBuffer(arrayBuffer) {
	      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	      return result;
	    }

	    /**
	     * Creates a clone of `dataView`.
	     *
	     * @private
	     * @param {Object} dataView The data view to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @returns {Object} Returns the cloned data view.
	     */
	    function cloneDataView(dataView, isDeep) {
	      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
	      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
	    }

	    /**
	     * Creates a clone of `regexp`.
	     *
	     * @private
	     * @param {Object} regexp The regexp to clone.
	     * @returns {Object} Returns the cloned regexp.
	     */
	    function cloneRegExp(regexp) {
	      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
	      result.lastIndex = regexp.lastIndex;
	      return result;
	    }

	    /**
	     * Creates a clone of the `symbol` object.
	     *
	     * @private
	     * @param {Object} symbol The symbol object to clone.
	     * @returns {Object} Returns the cloned symbol object.
	     */
	    function cloneSymbol(symbol) {
	      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
	    }

	    /**
	     * Creates a clone of `typedArray`.
	     *
	     * @private
	     * @param {Object} typedArray The typed array to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @returns {Object} Returns the cloned typed array.
	     */
	    function cloneTypedArray(typedArray, isDeep) {
	      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	    }

	    /**
	     * Compares values to sort them in ascending order.
	     *
	     * @private
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {number} Returns the sort order indicator for `value`.
	     */
	    function compareAscending(value, other) {
	      if (value !== other) {
	        var valIsDefined = value !== undefined$1,
	            valIsNull = value === null,
	            valIsReflexive = value === value,
	            valIsSymbol = isSymbol(value);

	        var othIsDefined = other !== undefined$1,
	            othIsNull = other === null,
	            othIsReflexive = other === other,
	            othIsSymbol = isSymbol(other);

	        if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
	            (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
	            (valIsNull && othIsDefined && othIsReflexive) ||
	            (!valIsDefined && othIsReflexive) ||
	            !valIsReflexive) {
	          return 1;
	        }
	        if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
	            (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
	            (othIsNull && valIsDefined && valIsReflexive) ||
	            (!othIsDefined && valIsReflexive) ||
	            !othIsReflexive) {
	          return -1;
	        }
	      }
	      return 0;
	    }

	    /**
	     * Used by `_.orderBy` to compare multiple properties of a value to another
	     * and stable sort them.
	     *
	     * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
	     * specify an order of "desc" for descending or "asc" for ascending sort order
	     * of corresponding values.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {boolean[]|string[]} orders The order to sort by for each property.
	     * @returns {number} Returns the sort order indicator for `object`.
	     */
	    function compareMultiple(object, other, orders) {
	      var index = -1,
	          objCriteria = object.criteria,
	          othCriteria = other.criteria,
	          length = objCriteria.length,
	          ordersLength = orders.length;

	      while (++index < length) {
	        var result = compareAscending(objCriteria[index], othCriteria[index]);
	        if (result) {
	          if (index >= ordersLength) {
	            return result;
	          }
	          var order = orders[index];
	          return result * (order == 'desc' ? -1 : 1);
	        }
	      }
	      // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	      // that causes it, under certain circumstances, to provide the same value for
	      // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	      // for more details.
	      //
	      // This also ensures a stable sort in V8 and other engines.
	      // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
	      return object.index - other.index;
	    }

	    /**
	     * Creates an array that is the composition of partially applied arguments,
	     * placeholders, and provided arguments into a single array of arguments.
	     *
	     * @private
	     * @param {Array} args The provided arguments.
	     * @param {Array} partials The arguments to prepend to those provided.
	     * @param {Array} holders The `partials` placeholder indexes.
	     * @params {boolean} [isCurried] Specify composing for a curried function.
	     * @returns {Array} Returns the new array of composed arguments.
	     */
	    function composeArgs(args, partials, holders, isCurried) {
	      var argsIndex = -1,
	          argsLength = args.length,
	          holdersLength = holders.length,
	          leftIndex = -1,
	          leftLength = partials.length,
	          rangeLength = nativeMax(argsLength - holdersLength, 0),
	          result = Array(leftLength + rangeLength),
	          isUncurried = !isCurried;

	      while (++leftIndex < leftLength) {
	        result[leftIndex] = partials[leftIndex];
	      }
	      while (++argsIndex < holdersLength) {
	        if (isUncurried || argsIndex < argsLength) {
	          result[holders[argsIndex]] = args[argsIndex];
	        }
	      }
	      while (rangeLength--) {
	        result[leftIndex++] = args[argsIndex++];
	      }
	      return result;
	    }

	    /**
	     * This function is like `composeArgs` except that the arguments composition
	     * is tailored for `_.partialRight`.
	     *
	     * @private
	     * @param {Array} args The provided arguments.
	     * @param {Array} partials The arguments to append to those provided.
	     * @param {Array} holders The `partials` placeholder indexes.
	     * @params {boolean} [isCurried] Specify composing for a curried function.
	     * @returns {Array} Returns the new array of composed arguments.
	     */
	    function composeArgsRight(args, partials, holders, isCurried) {
	      var argsIndex = -1,
	          argsLength = args.length,
	          holdersIndex = -1,
	          holdersLength = holders.length,
	          rightIndex = -1,
	          rightLength = partials.length,
	          rangeLength = nativeMax(argsLength - holdersLength, 0),
	          result = Array(rangeLength + rightLength),
	          isUncurried = !isCurried;

	      while (++argsIndex < rangeLength) {
	        result[argsIndex] = args[argsIndex];
	      }
	      var offset = argsIndex;
	      while (++rightIndex < rightLength) {
	        result[offset + rightIndex] = partials[rightIndex];
	      }
	      while (++holdersIndex < holdersLength) {
	        if (isUncurried || argsIndex < argsLength) {
	          result[offset + holders[holdersIndex]] = args[argsIndex++];
	        }
	      }
	      return result;
	    }

	    /**
	     * Copies the values of `source` to `array`.
	     *
	     * @private
	     * @param {Array} source The array to copy values from.
	     * @param {Array} [array=[]] The array to copy values to.
	     * @returns {Array} Returns `array`.
	     */
	    function copyArray(source, array) {
	      var index = -1,
	          length = source.length;

	      array || (array = Array(length));
	      while (++index < length) {
	        array[index] = source[index];
	      }
	      return array;
	    }

	    /**
	     * Copies properties of `source` to `object`.
	     *
	     * @private
	     * @param {Object} source The object to copy properties from.
	     * @param {Array} props The property identifiers to copy.
	     * @param {Object} [object={}] The object to copy properties to.
	     * @param {Function} [customizer] The function to customize copied values.
	     * @returns {Object} Returns `object`.
	     */
	    function copyObject(source, props, object, customizer) {
	      var isNew = !object;
	      object || (object = {});

	      var index = -1,
	          length = props.length;

	      while (++index < length) {
	        var key = props[index];

	        var newValue = customizer
	          ? customizer(object[key], source[key], key, object, source)
	          : undefined$1;

	        if (newValue === undefined$1) {
	          newValue = source[key];
	        }
	        if (isNew) {
	          baseAssignValue(object, key, newValue);
	        } else {
	          assignValue(object, key, newValue);
	        }
	      }
	      return object;
	    }

	    /**
	     * Copies own symbols of `source` to `object`.
	     *
	     * @private
	     * @param {Object} source The object to copy symbols from.
	     * @param {Object} [object={}] The object to copy symbols to.
	     * @returns {Object} Returns `object`.
	     */
	    function copySymbols(source, object) {
	      return copyObject(source, getSymbols(source), object);
	    }

	    /**
	     * Copies own and inherited symbols of `source` to `object`.
	     *
	     * @private
	     * @param {Object} source The object to copy symbols from.
	     * @param {Object} [object={}] The object to copy symbols to.
	     * @returns {Object} Returns `object`.
	     */
	    function copySymbolsIn(source, object) {
	      return copyObject(source, getSymbolsIn(source), object);
	    }

	    /**
	     * Creates a function like `_.groupBy`.
	     *
	     * @private
	     * @param {Function} setter The function to set accumulator values.
	     * @param {Function} [initializer] The accumulator object initializer.
	     * @returns {Function} Returns the new aggregator function.
	     */
	    function createAggregator(setter, initializer) {
	      return function(collection, iteratee) {
	        var func = isArray(collection) ? arrayAggregator : baseAggregator,
	            accumulator = initializer ? initializer() : {};

	        return func(collection, setter, getIteratee(iteratee, 2), accumulator);
	      };
	    }

	    /**
	     * Creates a function like `_.assign`.
	     *
	     * @private
	     * @param {Function} assigner The function to assign values.
	     * @returns {Function} Returns the new assigner function.
	     */
	    function createAssigner(assigner) {
	      return baseRest(function(object, sources) {
	        var index = -1,
	            length = sources.length,
	            customizer = length > 1 ? sources[length - 1] : undefined$1,
	            guard = length > 2 ? sources[2] : undefined$1;

	        customizer = (assigner.length > 3 && typeof customizer == 'function')
	          ? (length--, customizer)
	          : undefined$1;

	        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	          customizer = length < 3 ? undefined$1 : customizer;
	          length = 1;
	        }
	        object = Object(object);
	        while (++index < length) {
	          var source = sources[index];
	          if (source) {
	            assigner(object, source, index, customizer);
	          }
	        }
	        return object;
	      });
	    }

	    /**
	     * Creates a `baseEach` or `baseEachRight` function.
	     *
	     * @private
	     * @param {Function} eachFunc The function to iterate over a collection.
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new base function.
	     */
	    function createBaseEach(eachFunc, fromRight) {
	      return function(collection, iteratee) {
	        if (collection == null) {
	          return collection;
	        }
	        if (!isArrayLike(collection)) {
	          return eachFunc(collection, iteratee);
	        }
	        var length = collection.length,
	            index = fromRight ? length : -1,
	            iterable = Object(collection);

	        while ((fromRight ? index-- : ++index < length)) {
	          if (iteratee(iterable[index], index, iterable) === false) {
	            break;
	          }
	        }
	        return collection;
	      };
	    }

	    /**
	     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new base function.
	     */
	    function createBaseFor(fromRight) {
	      return function(object, iteratee, keysFunc) {
	        var index = -1,
	            iterable = Object(object),
	            props = keysFunc(object),
	            length = props.length;

	        while (length--) {
	          var key = props[fromRight ? length : ++index];
	          if (iteratee(iterable[key], key, iterable) === false) {
	            break;
	          }
	        }
	        return object;
	      };
	    }

	    /**
	     * Creates a function that wraps `func` to invoke it with the optional `this`
	     * binding of `thisArg`.
	     *
	     * @private
	     * @param {Function} func The function to wrap.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createBind(func, bitmask, thisArg) {
	      var isBind = bitmask & WRAP_BIND_FLAG,
	          Ctor = createCtor(func);

	      function wrapper() {
	        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	        return fn.apply(isBind ? thisArg : this, arguments);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates a function like `_.lowerFirst`.
	     *
	     * @private
	     * @param {string} methodName The name of the `String` case method to use.
	     * @returns {Function} Returns the new case function.
	     */
	    function createCaseFirst(methodName) {
	      return function(string) {
	        string = toString(string);

	        var strSymbols = hasUnicode(string)
	          ? stringToArray(string)
	          : undefined$1;

	        var chr = strSymbols
	          ? strSymbols[0]
	          : string.charAt(0);

	        var trailing = strSymbols
	          ? castSlice(strSymbols, 1).join('')
	          : string.slice(1);

	        return chr[methodName]() + trailing;
	      };
	    }

	    /**
	     * Creates a function like `_.camelCase`.
	     *
	     * @private
	     * @param {Function} callback The function to combine each word.
	     * @returns {Function} Returns the new compounder function.
	     */
	    function createCompounder(callback) {
	      return function(string) {
	        return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
	      };
	    }

	    /**
	     * Creates a function that produces an instance of `Ctor` regardless of
	     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
	     *
	     * @private
	     * @param {Function} Ctor The constructor to wrap.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createCtor(Ctor) {
	      return function() {
	        // Use a `switch` statement to work with class constructors. See
	        // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
	        // for more details.
	        var args = arguments;
	        switch (args.length) {
	          case 0: return new Ctor;
	          case 1: return new Ctor(args[0]);
	          case 2: return new Ctor(args[0], args[1]);
	          case 3: return new Ctor(args[0], args[1], args[2]);
	          case 4: return new Ctor(args[0], args[1], args[2], args[3]);
	          case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
	          case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
	          case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	        }
	        var thisBinding = baseCreate(Ctor.prototype),
	            result = Ctor.apply(thisBinding, args);

	        // Mimic the constructor's `return` behavior.
	        // See https://es5.github.io/#x13.2.2 for more details.
	        return isObject(result) ? result : thisBinding;
	      };
	    }

	    /**
	     * Creates a function that wraps `func` to enable currying.
	     *
	     * @private
	     * @param {Function} func The function to wrap.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @param {number} arity The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createCurry(func, bitmask, arity) {
	      var Ctor = createCtor(func);

	      function wrapper() {
	        var length = arguments.length,
	            args = Array(length),
	            index = length,
	            placeholder = getHolder(wrapper);

	        while (index--) {
	          args[index] = arguments[index];
	        }
	        var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
	          ? []
	          : replaceHolders(args, placeholder);

	        length -= holders.length;
	        if (length < arity) {
	          return createRecurry(
	            func, bitmask, createHybrid, wrapper.placeholder, undefined$1,
	            args, holders, undefined$1, undefined$1, arity - length);
	        }
	        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	        return apply(fn, this, args);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates a `_.find` or `_.findLast` function.
	     *
	     * @private
	     * @param {Function} findIndexFunc The function to find the collection index.
	     * @returns {Function} Returns the new find function.
	     */
	    function createFind(findIndexFunc) {
	      return function(collection, predicate, fromIndex) {
	        var iterable = Object(collection);
	        if (!isArrayLike(collection)) {
	          var iteratee = getIteratee(predicate, 3);
	          collection = keys(collection);
	          predicate = function(key) { return iteratee(iterable[key], key, iterable); };
	        }
	        var index = findIndexFunc(collection, predicate, fromIndex);
	        return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined$1;
	      };
	    }

	    /**
	     * Creates a `_.flow` or `_.flowRight` function.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new flow function.
	     */
	    function createFlow(fromRight) {
	      return flatRest(function(funcs) {
	        var length = funcs.length,
	            index = length,
	            prereq = LodashWrapper.prototype.thru;

	        if (fromRight) {
	          funcs.reverse();
	        }
	        while (index--) {
	          var func = funcs[index];
	          if (typeof func != 'function') {
	            throw new TypeError(FUNC_ERROR_TEXT);
	          }
	          if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
	            var wrapper = new LodashWrapper([], true);
	          }
	        }
	        index = wrapper ? index : length;
	        while (++index < length) {
	          func = funcs[index];

	          var funcName = getFuncName(func),
	              data = funcName == 'wrapper' ? getData(func) : undefined$1;

	          if (data && isLaziable(data[0]) &&
	                data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) &&
	                !data[4].length && data[9] == 1
	              ) {
	            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
	          } else {
	            wrapper = (func.length == 1 && isLaziable(func))
	              ? wrapper[funcName]()
	              : wrapper.thru(func);
	          }
	        }
	        return function() {
	          var args = arguments,
	              value = args[0];

	          if (wrapper && args.length == 1 && isArray(value)) {
	            return wrapper.plant(value).value();
	          }
	          var index = 0,
	              result = length ? funcs[index].apply(this, args) : value;

	          while (++index < length) {
	            result = funcs[index].call(this, result);
	          }
	          return result;
	        };
	      });
	    }

	    /**
	     * Creates a function that wraps `func` to invoke it with optional `this`
	     * binding of `thisArg`, partial application, and currying.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to wrap.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to prepend to those provided to
	     *  the new function.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [partialsRight] The arguments to append to those provided
	     *  to the new function.
	     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
	      var isAry = bitmask & WRAP_ARY_FLAG,
	          isBind = bitmask & WRAP_BIND_FLAG,
	          isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
	          isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
	          isFlip = bitmask & WRAP_FLIP_FLAG,
	          Ctor = isBindKey ? undefined$1 : createCtor(func);

	      function wrapper() {
	        var length = arguments.length,
	            args = Array(length),
	            index = length;

	        while (index--) {
	          args[index] = arguments[index];
	        }
	        if (isCurried) {
	          var placeholder = getHolder(wrapper),
	              holdersCount = countHolders(args, placeholder);
	        }
	        if (partials) {
	          args = composeArgs(args, partials, holders, isCurried);
	        }
	        if (partialsRight) {
	          args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
	        }
	        length -= holdersCount;
	        if (isCurried && length < arity) {
	          var newHolders = replaceHolders(args, placeholder);
	          return createRecurry(
	            func, bitmask, createHybrid, wrapper.placeholder, thisArg,
	            args, newHolders, argPos, ary, arity - length
	          );
	        }
	        var thisBinding = isBind ? thisArg : this,
	            fn = isBindKey ? thisBinding[func] : func;

	        length = args.length;
	        if (argPos) {
	          args = reorder(args, argPos);
	        } else if (isFlip && length > 1) {
	          args.reverse();
	        }
	        if (isAry && ary < length) {
	          args.length = ary;
	        }
	        if (this && this !== root && this instanceof wrapper) {
	          fn = Ctor || createCtor(fn);
	        }
	        return fn.apply(thisBinding, args);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates a function like `_.invertBy`.
	     *
	     * @private
	     * @param {Function} setter The function to set accumulator values.
	     * @param {Function} toIteratee The function to resolve iteratees.
	     * @returns {Function} Returns the new inverter function.
	     */
	    function createInverter(setter, toIteratee) {
	      return function(object, iteratee) {
	        return baseInverter(object, setter, toIteratee(iteratee), {});
	      };
	    }

	    /**
	     * Creates a function that performs a mathematical operation on two values.
	     *
	     * @private
	     * @param {Function} operator The function to perform the operation.
	     * @param {number} [defaultValue] The value used for `undefined` arguments.
	     * @returns {Function} Returns the new mathematical operation function.
	     */
	    function createMathOperation(operator, defaultValue) {
	      return function(value, other) {
	        var result;
	        if (value === undefined$1 && other === undefined$1) {
	          return defaultValue;
	        }
	        if (value !== undefined$1) {
	          result = value;
	        }
	        if (other !== undefined$1) {
	          if (result === undefined$1) {
	            return other;
	          }
	          if (typeof value == 'string' || typeof other == 'string') {
	            value = baseToString(value);
	            other = baseToString(other);
	          } else {
	            value = baseToNumber(value);
	            other = baseToNumber(other);
	          }
	          result = operator(value, other);
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function like `_.over`.
	     *
	     * @private
	     * @param {Function} arrayFunc The function to iterate over iteratees.
	     * @returns {Function} Returns the new over function.
	     */
	    function createOver(arrayFunc) {
	      return flatRest(function(iteratees) {
	        iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
	        return baseRest(function(args) {
	          var thisArg = this;
	          return arrayFunc(iteratees, function(iteratee) {
	            return apply(iteratee, thisArg, args);
	          });
	        });
	      });
	    }

	    /**
	     * Creates the padding for `string` based on `length`. The `chars` string
	     * is truncated if the number of characters exceeds `length`.
	     *
	     * @private
	     * @param {number} length The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padding for `string`.
	     */
	    function createPadding(length, chars) {
	      chars = chars === undefined$1 ? ' ' : baseToString(chars);

	      var charsLength = chars.length;
	      if (charsLength < 2) {
	        return charsLength ? baseRepeat(chars, length) : chars;
	      }
	      var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
	      return hasUnicode(chars)
	        ? castSlice(stringToArray(result), 0, length).join('')
	        : result.slice(0, length);
	    }

	    /**
	     * Creates a function that wraps `func` to invoke it with the `this` binding
	     * of `thisArg` and `partials` prepended to the arguments it receives.
	     *
	     * @private
	     * @param {Function} func The function to wrap.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {Array} partials The arguments to prepend to those provided to
	     *  the new function.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createPartial(func, bitmask, thisArg, partials) {
	      var isBind = bitmask & WRAP_BIND_FLAG,
	          Ctor = createCtor(func);

	      function wrapper() {
	        var argsIndex = -1,
	            argsLength = arguments.length,
	            leftIndex = -1,
	            leftLength = partials.length,
	            args = Array(leftLength + argsLength),
	            fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

	        while (++leftIndex < leftLength) {
	          args[leftIndex] = partials[leftIndex];
	        }
	        while (argsLength--) {
	          args[leftIndex++] = arguments[++argsIndex];
	        }
	        return apply(fn, isBind ? thisArg : this, args);
	      }
	      return wrapper;
	    }

	    /**
	     * Creates a `_.range` or `_.rangeRight` function.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new range function.
	     */
	    function createRange(fromRight) {
	      return function(start, end, step) {
	        if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
	          end = step = undefined$1;
	        }
	        // Ensure the sign of `-0` is preserved.
	        start = toFinite(start);
	        if (end === undefined$1) {
	          end = start;
	          start = 0;
	        } else {
	          end = toFinite(end);
	        }
	        step = step === undefined$1 ? (start < end ? 1 : -1) : toFinite(step);
	        return baseRange(start, end, step, fromRight);
	      };
	    }

	    /**
	     * Creates a function that performs a relational operation on two values.
	     *
	     * @private
	     * @param {Function} operator The function to perform the operation.
	     * @returns {Function} Returns the new relational operation function.
	     */
	    function createRelationalOperation(operator) {
	      return function(value, other) {
	        if (!(typeof value == 'string' && typeof other == 'string')) {
	          value = toNumber(value);
	          other = toNumber(other);
	        }
	        return operator(value, other);
	      };
	    }

	    /**
	     * Creates a function that wraps `func` to continue currying.
	     *
	     * @private
	     * @param {Function} func The function to wrap.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @param {Function} wrapFunc The function to create the `func` wrapper.
	     * @param {*} placeholder The placeholder value.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to prepend to those provided to
	     *  the new function.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
	      var isCurry = bitmask & WRAP_CURRY_FLAG,
	          newHolders = isCurry ? holders : undefined$1,
	          newHoldersRight = isCurry ? undefined$1 : holders,
	          newPartials = isCurry ? partials : undefined$1,
	          newPartialsRight = isCurry ? undefined$1 : partials;

	      bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
	      bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

	      if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
	        bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
	      }
	      var newData = [
	        func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
	        newHoldersRight, argPos, ary, arity
	      ];

	      var result = wrapFunc.apply(undefined$1, newData);
	      if (isLaziable(func)) {
	        setData(result, newData);
	      }
	      result.placeholder = placeholder;
	      return setWrapToString(result, func, bitmask);
	    }

	    /**
	     * Creates a function like `_.round`.
	     *
	     * @private
	     * @param {string} methodName The name of the `Math` method to use when rounding.
	     * @returns {Function} Returns the new round function.
	     */
	    function createRound(methodName) {
	      var func = Math[methodName];
	      return function(number, precision) {
	        number = toNumber(number);
	        precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
	        if (precision && nativeIsFinite(number)) {
	          // Shift with exponential notation to avoid floating-point issues.
	          // See [MDN](https://mdn.io/round#Examples) for more details.
	          var pair = (toString(number) + 'e').split('e'),
	              value = func(pair[0] + 'e' + (+pair[1] + precision));

	          pair = (toString(value) + 'e').split('e');
	          return +(pair[0] + 'e' + (+pair[1] - precision));
	        }
	        return func(number);
	      };
	    }

	    /**
	     * Creates a set object of `values`.
	     *
	     * @private
	     * @param {Array} values The values to add to the set.
	     * @returns {Object} Returns the new set.
	     */
	    var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
	      return new Set(values);
	    };

	    /**
	     * Creates a `_.toPairs` or `_.toPairsIn` function.
	     *
	     * @private
	     * @param {Function} keysFunc The function to get the keys of a given object.
	     * @returns {Function} Returns the new pairs function.
	     */
	    function createToPairs(keysFunc) {
	      return function(object) {
	        var tag = getTag(object);
	        if (tag == mapTag) {
	          return mapToArray(object);
	        }
	        if (tag == setTag) {
	          return setToPairs(object);
	        }
	        return baseToPairs(object, keysFunc(object));
	      };
	    }

	    /**
	     * Creates a function that either curries or invokes `func` with optional
	     * `this` binding and partially applied arguments.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to wrap.
	     * @param {number} bitmask The bitmask flags.
	     *    1 - `_.bind`
	     *    2 - `_.bindKey`
	     *    4 - `_.curry` or `_.curryRight` of a bound function
	     *    8 - `_.curry`
	     *   16 - `_.curryRight`
	     *   32 - `_.partial`
	     *   64 - `_.partialRight`
	     *  128 - `_.rearg`
	     *  256 - `_.ary`
	     *  512 - `_.flip`
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to be partially applied.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
	      var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
	      if (!isBindKey && typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var length = partials ? partials.length : 0;
	      if (!length) {
	        bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
	        partials = holders = undefined$1;
	      }
	      ary = ary === undefined$1 ? ary : nativeMax(toInteger(ary), 0);
	      arity = arity === undefined$1 ? arity : toInteger(arity);
	      length -= holders ? holders.length : 0;

	      if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
	        var partialsRight = partials,
	            holdersRight = holders;

	        partials = holders = undefined$1;
	      }
	      var data = isBindKey ? undefined$1 : getData(func);

	      var newData = [
	        func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
	        argPos, ary, arity
	      ];

	      if (data) {
	        mergeData(newData, data);
	      }
	      func = newData[0];
	      bitmask = newData[1];
	      thisArg = newData[2];
	      partials = newData[3];
	      holders = newData[4];
	      arity = newData[9] = newData[9] === undefined$1
	        ? (isBindKey ? 0 : func.length)
	        : nativeMax(newData[9] - length, 0);

	      if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
	        bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
	      }
	      if (!bitmask || bitmask == WRAP_BIND_FLAG) {
	        var result = createBind(func, bitmask, thisArg);
	      } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
	        result = createCurry(func, bitmask, arity);
	      } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
	        result = createPartial(func, bitmask, thisArg, partials);
	      } else {
	        result = createHybrid.apply(undefined$1, newData);
	      }
	      var setter = data ? baseSetData : setData;
	      return setWrapToString(setter(result, newData), func, bitmask);
	    }

	    /**
	     * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
	     * of source objects to the destination object for all destination properties
	     * that resolve to `undefined`.
	     *
	     * @private
	     * @param {*} objValue The destination value.
	     * @param {*} srcValue The source value.
	     * @param {string} key The key of the property to assign.
	     * @param {Object} object The parent object of `objValue`.
	     * @returns {*} Returns the value to assign.
	     */
	    function customDefaultsAssignIn(objValue, srcValue, key, object) {
	      if (objValue === undefined$1 ||
	          (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
	        return srcValue;
	      }
	      return objValue;
	    }

	    /**
	     * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
	     * objects into destination objects that are passed thru.
	     *
	     * @private
	     * @param {*} objValue The destination value.
	     * @param {*} srcValue The source value.
	     * @param {string} key The key of the property to merge.
	     * @param {Object} object The parent object of `objValue`.
	     * @param {Object} source The parent object of `srcValue`.
	     * @param {Object} [stack] Tracks traversed source values and their merged
	     *  counterparts.
	     * @returns {*} Returns the value to assign.
	     */
	    function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
	      if (isObject(objValue) && isObject(srcValue)) {
	        // Recursively merge objects and arrays (susceptible to call stack limits).
	        stack.set(srcValue, objValue);
	        baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
	        stack['delete'](srcValue);
	      }
	      return objValue;
	    }

	    /**
	     * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
	     * objects.
	     *
	     * @private
	     * @param {*} value The value to inspect.
	     * @param {string} key The key of the property to inspect.
	     * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
	     */
	    function customOmitClone(value) {
	      return isPlainObject(value) ? undefined$1 : value;
	    }

	    /**
	     * A specialized version of `baseIsEqualDeep` for arrays with support for
	     * partial deep comparisons.
	     *
	     * @private
	     * @param {Array} array The array to compare.
	     * @param {Array} other The other array to compare.
	     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	     * @param {Function} customizer The function to customize comparisons.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Object} stack Tracks traversed `array` and `other` objects.
	     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	     */
	    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	          arrLength = array.length,
	          othLength = other.length;

	      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(array);
	      if (stacked && stack.get(other)) {
	        return stacked == other;
	      }
	      var index = -1,
	          result = true,
	          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined$1;

	      stack.set(array, other);
	      stack.set(other, array);

	      // Ignore non-index properties.
	      while (++index < arrLength) {
	        var arrValue = array[index],
	            othValue = other[index];

	        if (customizer) {
	          var compared = isPartial
	            ? customizer(othValue, arrValue, index, other, array, stack)
	            : customizer(arrValue, othValue, index, array, other, stack);
	        }
	        if (compared !== undefined$1) {
	          if (compared) {
	            continue;
	          }
	          result = false;
	          break;
	        }
	        // Recursively compare arrays (susceptible to call stack limits).
	        if (seen) {
	          if (!arraySome(other, function(othValue, othIndex) {
	                if (!cacheHas(seen, othIndex) &&
	                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
	                  return seen.push(othIndex);
	                }
	              })) {
	            result = false;
	            break;
	          }
	        } else if (!(
	              arrValue === othValue ||
	                equalFunc(arrValue, othValue, bitmask, customizer, stack)
	            )) {
	          result = false;
	          break;
	        }
	      }
	      stack['delete'](array);
	      stack['delete'](other);
	      return result;
	    }

	    /**
	     * A specialized version of `baseIsEqualDeep` for comparing objects of
	     * the same `toStringTag`.
	     *
	     * **Note:** This function only supports comparing values with tags of
	     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {string} tag The `toStringTag` of the objects to compare.
	     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	     * @param {Function} customizer The function to customize comparisons.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Object} stack Tracks traversed `object` and `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
	      switch (tag) {
	        case dataViewTag:
	          if ((object.byteLength != other.byteLength) ||
	              (object.byteOffset != other.byteOffset)) {
	            return false;
	          }
	          object = object.buffer;
	          other = other.buffer;

	        case arrayBufferTag:
	          if ((object.byteLength != other.byteLength) ||
	              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
	            return false;
	          }
	          return true;

	        case boolTag:
	        case dateTag:
	        case numberTag:
	          // Coerce booleans to `1` or `0` and dates to milliseconds.
	          // Invalid dates are coerced to `NaN`.
	          return eq(+object, +other);

	        case errorTag:
	          return object.name == other.name && object.message == other.message;

	        case regexpTag:
	        case stringTag:
	          // Coerce regexes to strings and treat strings, primitives and objects,
	          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
	          // for more details.
	          return object == (other + '');

	        case mapTag:
	          var convert = mapToArray;

	        case setTag:
	          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
	          convert || (convert = setToArray);

	          if (object.size != other.size && !isPartial) {
	            return false;
	          }
	          // Assume cyclic values are equal.
	          var stacked = stack.get(object);
	          if (stacked) {
	            return stacked == other;
	          }
	          bitmask |= COMPARE_UNORDERED_FLAG;

	          // Recursively compare objects (susceptible to call stack limits).
	          stack.set(object, other);
	          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
	          stack['delete'](object);
	          return result;

	        case symbolTag:
	          if (symbolValueOf) {
	            return symbolValueOf.call(object) == symbolValueOf.call(other);
	          }
	      }
	      return false;
	    }

	    /**
	     * A specialized version of `baseIsEqualDeep` for objects with support for
	     * partial deep comparisons.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
	     * @param {Function} customizer The function to customize comparisons.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Object} stack Tracks traversed `object` and `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
	      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
	          objProps = getAllKeys(object),
	          objLength = objProps.length,
	          othProps = getAllKeys(other),
	          othLength = othProps.length;

	      if (objLength != othLength && !isPartial) {
	        return false;
	      }
	      var index = objLength;
	      while (index--) {
	        var key = objProps[index];
	        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
	          return false;
	        }
	      }
	      // Assume cyclic values are equal.
	      var stacked = stack.get(object);
	      if (stacked && stack.get(other)) {
	        return stacked == other;
	      }
	      var result = true;
	      stack.set(object, other);
	      stack.set(other, object);

	      var skipCtor = isPartial;
	      while (++index < objLength) {
	        key = objProps[index];
	        var objValue = object[key],
	            othValue = other[key];

	        if (customizer) {
	          var compared = isPartial
	            ? customizer(othValue, objValue, key, other, object, stack)
	            : customizer(objValue, othValue, key, object, other, stack);
	        }
	        // Recursively compare objects (susceptible to call stack limits).
	        if (!(compared === undefined$1
	              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
	              : compared
	            )) {
	          result = false;
	          break;
	        }
	        skipCtor || (skipCtor = key == 'constructor');
	      }
	      if (result && !skipCtor) {
	        var objCtor = object.constructor,
	            othCtor = other.constructor;

	        // Non `Object` object instances with different constructors are not equal.
	        if (objCtor != othCtor &&
	            ('constructor' in object && 'constructor' in other) &&
	            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	          result = false;
	        }
	      }
	      stack['delete'](object);
	      stack['delete'](other);
	      return result;
	    }

	    /**
	     * A specialized version of `baseRest` which flattens the rest array.
	     *
	     * @private
	     * @param {Function} func The function to apply a rest parameter to.
	     * @returns {Function} Returns the new function.
	     */
	    function flatRest(func) {
	      return setToString(overRest(func, undefined$1, flatten), func + '');
	    }

	    /**
	     * Creates an array of own enumerable property names and symbols of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names and symbols.
	     */
	    function getAllKeys(object) {
	      return baseGetAllKeys(object, keys, getSymbols);
	    }

	    /**
	     * Creates an array of own and inherited enumerable property names and
	     * symbols of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names and symbols.
	     */
	    function getAllKeysIn(object) {
	      return baseGetAllKeys(object, keysIn, getSymbolsIn);
	    }

	    /**
	     * Gets metadata for `func`.
	     *
	     * @private
	     * @param {Function} func The function to query.
	     * @returns {*} Returns the metadata for `func`.
	     */
	    var getData = !metaMap ? noop : function(func) {
	      return metaMap.get(func);
	    };

	    /**
	     * Gets the name of `func`.
	     *
	     * @private
	     * @param {Function} func The function to query.
	     * @returns {string} Returns the function name.
	     */
	    function getFuncName(func) {
	      var result = (func.name + ''),
	          array = realNames[result],
	          length = hasOwnProperty.call(realNames, result) ? array.length : 0;

	      while (length--) {
	        var data = array[length],
	            otherFunc = data.func;
	        if (otherFunc == null || otherFunc == func) {
	          return data.name;
	        }
	      }
	      return result;
	    }

	    /**
	     * Gets the argument placeholder value for `func`.
	     *
	     * @private
	     * @param {Function} func The function to inspect.
	     * @returns {*} Returns the placeholder value.
	     */
	    function getHolder(func) {
	      var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
	      return object.placeholder;
	    }

	    /**
	     * Gets the appropriate "iteratee" function. If `_.iteratee` is customized,
	     * this function returns the custom method, otherwise it returns `baseIteratee`.
	     * If arguments are provided, the chosen function is invoked with them and
	     * its result is returned.
	     *
	     * @private
	     * @param {*} [value] The value to convert to an iteratee.
	     * @param {number} [arity] The arity of the created iteratee.
	     * @returns {Function} Returns the chosen function or its result.
	     */
	    function getIteratee() {
	      var result = lodash.iteratee || iteratee;
	      result = result === iteratee ? baseIteratee : result;
	      return arguments.length ? result(arguments[0], arguments[1]) : result;
	    }

	    /**
	     * Gets the data for `map`.
	     *
	     * @private
	     * @param {Object} map The map to query.
	     * @param {string} key The reference key.
	     * @returns {*} Returns the map data.
	     */
	    function getMapData(map, key) {
	      var data = map.__data__;
	      return isKeyable(key)
	        ? data[typeof key == 'string' ? 'string' : 'hash']
	        : data.map;
	    }

	    /**
	     * Gets the property names, values, and compare flags of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the match data of `object`.
	     */
	    function getMatchData(object) {
	      var result = keys(object),
	          length = result.length;

	      while (length--) {
	        var key = result[length],
	            value = object[key];

	        result[length] = [key, value, isStrictComparable(value)];
	      }
	      return result;
	    }

	    /**
	     * Gets the native function at `key` of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {string} key The key of the method to get.
	     * @returns {*} Returns the function if it's native, else `undefined`.
	     */
	    function getNative(object, key) {
	      var value = getValue(object, key);
	      return baseIsNative(value) ? value : undefined$1;
	    }

	    /**
	     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	     *
	     * @private
	     * @param {*} value The value to query.
	     * @returns {string} Returns the raw `toStringTag`.
	     */
	    function getRawTag(value) {
	      var isOwn = hasOwnProperty.call(value, symToStringTag),
	          tag = value[symToStringTag];

	      try {
	        value[symToStringTag] = undefined$1;
	        var unmasked = true;
	      } catch (e) {}

	      var result = nativeObjectToString.call(value);
	      if (unmasked) {
	        if (isOwn) {
	          value[symToStringTag] = tag;
	        } else {
	          delete value[symToStringTag];
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates an array of the own enumerable symbols of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of symbols.
	     */
	    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
	      if (object == null) {
	        return [];
	      }
	      object = Object(object);
	      return arrayFilter(nativeGetSymbols(object), function(symbol) {
	        return propertyIsEnumerable.call(object, symbol);
	      });
	    };

	    /**
	     * Creates an array of the own and inherited enumerable symbols of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of symbols.
	     */
	    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
	      var result = [];
	      while (object) {
	        arrayPush(result, getSymbols(object));
	        object = getPrototype(object);
	      }
	      return result;
	    };

	    /**
	     * Gets the `toStringTag` of `value`.
	     *
	     * @private
	     * @param {*} value The value to query.
	     * @returns {string} Returns the `toStringTag`.
	     */
	    var getTag = baseGetTag;

	    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
	    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	        (Map && getTag(new Map) != mapTag) ||
	        (Promise && getTag(Promise.resolve()) != promiseTag) ||
	        (Set && getTag(new Set) != setTag) ||
	        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	      getTag = function(value) {
	        var result = baseGetTag(value),
	            Ctor = result == objectTag ? value.constructor : undefined$1,
	            ctorString = Ctor ? toSource(Ctor) : '';

	        if (ctorString) {
	          switch (ctorString) {
	            case dataViewCtorString: return dataViewTag;
	            case mapCtorString: return mapTag;
	            case promiseCtorString: return promiseTag;
	            case setCtorString: return setTag;
	            case weakMapCtorString: return weakMapTag;
	          }
	        }
	        return result;
	      };
	    }

	    /**
	     * Gets the view, applying any `transforms` to the `start` and `end` positions.
	     *
	     * @private
	     * @param {number} start The start of the view.
	     * @param {number} end The end of the view.
	     * @param {Array} transforms The transformations to apply to the view.
	     * @returns {Object} Returns an object containing the `start` and `end`
	     *  positions of the view.
	     */
	    function getView(start, end, transforms) {
	      var index = -1,
	          length = transforms.length;

	      while (++index < length) {
	        var data = transforms[index],
	            size = data.size;

	        switch (data.type) {
	          case 'drop':      start += size; break;
	          case 'dropRight': end -= size; break;
	          case 'take':      end = nativeMin(end, start + size); break;
	          case 'takeRight': start = nativeMax(start, end - size); break;
	        }
	      }
	      return { 'start': start, 'end': end };
	    }

	    /**
	     * Extracts wrapper details from the `source` body comment.
	     *
	     * @private
	     * @param {string} source The source to inspect.
	     * @returns {Array} Returns the wrapper details.
	     */
	    function getWrapDetails(source) {
	      var match = source.match(reWrapDetails);
	      return match ? match[1].split(reSplitDetails) : [];
	    }

	    /**
	     * Checks if `path` exists on `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path to check.
	     * @param {Function} hasFunc The function to check properties.
	     * @returns {boolean} Returns `true` if `path` exists, else `false`.
	     */
	    function hasPath(object, path, hasFunc) {
	      path = castPath(path, object);

	      var index = -1,
	          length = path.length,
	          result = false;

	      while (++index < length) {
	        var key = toKey(path[index]);
	        if (!(result = object != null && hasFunc(object, key))) {
	          break;
	        }
	        object = object[key];
	      }
	      if (result || ++index != length) {
	        return result;
	      }
	      length = object == null ? 0 : object.length;
	      return !!length && isLength(length) && isIndex(key, length) &&
	        (isArray(object) || isArguments(object));
	    }

	    /**
	     * Initializes an array clone.
	     *
	     * @private
	     * @param {Array} array The array to clone.
	     * @returns {Array} Returns the initialized clone.
	     */
	    function initCloneArray(array) {
	      var length = array.length,
	          result = new array.constructor(length);

	      // Add properties assigned by `RegExp#exec`.
	      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	        result.index = array.index;
	        result.input = array.input;
	      }
	      return result;
	    }

	    /**
	     * Initializes an object clone.
	     *
	     * @private
	     * @param {Object} object The object to clone.
	     * @returns {Object} Returns the initialized clone.
	     */
	    function initCloneObject(object) {
	      return (typeof object.constructor == 'function' && !isPrototype(object))
	        ? baseCreate(getPrototype(object))
	        : {};
	    }

	    /**
	     * Initializes an object clone based on its `toStringTag`.
	     *
	     * **Note:** This function only supports cloning values with tags of
	     * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
	     *
	     * @private
	     * @param {Object} object The object to clone.
	     * @param {string} tag The `toStringTag` of the object to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @returns {Object} Returns the initialized clone.
	     */
	    function initCloneByTag(object, tag, isDeep) {
	      var Ctor = object.constructor;
	      switch (tag) {
	        case arrayBufferTag:
	          return cloneArrayBuffer(object);

	        case boolTag:
	        case dateTag:
	          return new Ctor(+object);

	        case dataViewTag:
	          return cloneDataView(object, isDeep);

	        case float32Tag: case float64Tag:
	        case int8Tag: case int16Tag: case int32Tag:
	        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	          return cloneTypedArray(object, isDeep);

	        case mapTag:
	          return new Ctor;

	        case numberTag:
	        case stringTag:
	          return new Ctor(object);

	        case regexpTag:
	          return cloneRegExp(object);

	        case setTag:
	          return new Ctor;

	        case symbolTag:
	          return cloneSymbol(object);
	      }
	    }

	    /**
	     * Inserts wrapper `details` in a comment at the top of the `source` body.
	     *
	     * @private
	     * @param {string} source The source to modify.
	     * @returns {Array} details The details to insert.
	     * @returns {string} Returns the modified source.
	     */
	    function insertWrapDetails(source, details) {
	      var length = details.length;
	      if (!length) {
	        return source;
	      }
	      var lastIndex = length - 1;
	      details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
	      details = details.join(length > 2 ? ', ' : ' ');
	      return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
	    }

	    /**
	     * Checks if `value` is a flattenable `arguments` object or array.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
	     */
	    function isFlattenable(value) {
	      return isArray(value) || isArguments(value) ||
	        !!(spreadableSymbol && value && value[spreadableSymbol]);
	    }

	    /**
	     * Checks if `value` is a valid array-like index.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	     */
	    function isIndex(value, length) {
	      var type = typeof value;
	      length = length == null ? MAX_SAFE_INTEGER : length;

	      return !!length &&
	        (type == 'number' ||
	          (type != 'symbol' && reIsUint.test(value))) &&
	            (value > -1 && value % 1 == 0 && value < length);
	    }

	    /**
	     * Checks if the given arguments are from an iteratee call.
	     *
	     * @private
	     * @param {*} value The potential iteratee value argument.
	     * @param {*} index The potential iteratee index or key argument.
	     * @param {*} object The potential iteratee object argument.
	     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
	     *  else `false`.
	     */
	    function isIterateeCall(value, index, object) {
	      if (!isObject(object)) {
	        return false;
	      }
	      var type = typeof index;
	      if (type == 'number'
	            ? (isArrayLike(object) && isIndex(index, object.length))
	            : (type == 'string' && index in object)
	          ) {
	        return eq(object[index], value);
	      }
	      return false;
	    }

	    /**
	     * Checks if `value` is a property name and not a property path.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @param {Object} [object] The object to query keys on.
	     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	     */
	    function isKey(value, object) {
	      if (isArray(value)) {
	        return false;
	      }
	      var type = typeof value;
	      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
	          value == null || isSymbol(value)) {
	        return true;
	      }
	      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
	        (object != null && value in Object(object));
	    }

	    /**
	     * Checks if `value` is suitable for use as unique object key.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	     */
	    function isKeyable(value) {
	      var type = typeof value;
	      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	        ? (value !== '__proto__')
	        : (value === null);
	    }

	    /**
	     * Checks if `func` has a lazy counterpart.
	     *
	     * @private
	     * @param {Function} func The function to check.
	     * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
	     *  else `false`.
	     */
	    function isLaziable(func) {
	      var funcName = getFuncName(func),
	          other = lodash[funcName];

	      if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
	        return false;
	      }
	      if (func === other) {
	        return true;
	      }
	      var data = getData(other);
	      return !!data && func === data[0];
	    }

	    /**
	     * Checks if `func` has its source masked.
	     *
	     * @private
	     * @param {Function} func The function to check.
	     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	     */
	    function isMasked(func) {
	      return !!maskSrcKey && (maskSrcKey in func);
	    }

	    /**
	     * Checks if `func` is capable of being masked.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
	     */
	    var isMaskable = coreJsData ? isFunction : stubFalse;

	    /**
	     * Checks if `value` is likely a prototype object.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	     */
	    function isPrototype(value) {
	      var Ctor = value && value.constructor,
	          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	      return value === proto;
	    }

	    /**
	     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` if suitable for strict
	     *  equality comparisons, else `false`.
	     */
	    function isStrictComparable(value) {
	      return value === value && !isObject(value);
	    }

	    /**
	     * A specialized version of `matchesProperty` for source values suitable
	     * for strict equality comparisons, i.e. `===`.
	     *
	     * @private
	     * @param {string} key The key of the property to get.
	     * @param {*} srcValue The value to match.
	     * @returns {Function} Returns the new spec function.
	     */
	    function matchesStrictComparable(key, srcValue) {
	      return function(object) {
	        if (object == null) {
	          return false;
	        }
	        return object[key] === srcValue &&
	          (srcValue !== undefined$1 || (key in Object(object)));
	      };
	    }

	    /**
	     * A specialized version of `_.memoize` which clears the memoized function's
	     * cache when it exceeds `MAX_MEMOIZE_SIZE`.
	     *
	     * @private
	     * @param {Function} func The function to have its output memoized.
	     * @returns {Function} Returns the new memoized function.
	     */
	    function memoizeCapped(func) {
	      var result = memoize(func, function(key) {
	        if (cache.size === MAX_MEMOIZE_SIZE) {
	          cache.clear();
	        }
	        return key;
	      });

	      var cache = result.cache;
	      return result;
	    }

	    /**
	     * Merges the function metadata of `source` into `data`.
	     *
	     * Merging metadata reduces the number of wrappers used to invoke a function.
	     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
	     * may be applied regardless of execution order. Methods like `_.ary` and
	     * `_.rearg` modify function arguments, making the order in which they are
	     * executed important, preventing the merging of metadata. However, we make
	     * an exception for a safe combined case where curried functions have `_.ary`
	     * and or `_.rearg` applied.
	     *
	     * @private
	     * @param {Array} data The destination metadata.
	     * @param {Array} source The source metadata.
	     * @returns {Array} Returns `data`.
	     */
	    function mergeData(data, source) {
	      var bitmask = data[1],
	          srcBitmask = source[1],
	          newBitmask = bitmask | srcBitmask,
	          isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);

	      var isCombo =
	        ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
	        ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
	        ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));

	      // Exit early if metadata can't be merged.
	      if (!(isCommon || isCombo)) {
	        return data;
	      }
	      // Use source `thisArg` if available.
	      if (srcBitmask & WRAP_BIND_FLAG) {
	        data[2] = source[2];
	        // Set when currying a bound function.
	        newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
	      }
	      // Compose partial arguments.
	      var value = source[3];
	      if (value) {
	        var partials = data[3];
	        data[3] = partials ? composeArgs(partials, value, source[4]) : value;
	        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
	      }
	      // Compose partial right arguments.
	      value = source[5];
	      if (value) {
	        partials = data[5];
	        data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
	        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
	      }
	      // Use source `argPos` if available.
	      value = source[7];
	      if (value) {
	        data[7] = value;
	      }
	      // Use source `ary` if it's smaller.
	      if (srcBitmask & WRAP_ARY_FLAG) {
	        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
	      }
	      // Use source `arity` if one is not provided.
	      if (data[9] == null) {
	        data[9] = source[9];
	      }
	      // Use source `func` and merge bitmasks.
	      data[0] = source[0];
	      data[1] = newBitmask;

	      return data;
	    }

	    /**
	     * This function is like
	     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	     * except that it includes inherited enumerable properties.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     */
	    function nativeKeysIn(object) {
	      var result = [];
	      if (object != null) {
	        for (var key in Object(object)) {
	          result.push(key);
	        }
	      }
	      return result;
	    }

	    /**
	     * Converts `value` to a string using `Object.prototype.toString`.
	     *
	     * @private
	     * @param {*} value The value to convert.
	     * @returns {string} Returns the converted string.
	     */
	    function objectToString(value) {
	      return nativeObjectToString.call(value);
	    }

	    /**
	     * A specialized version of `baseRest` which transforms the rest array.
	     *
	     * @private
	     * @param {Function} func The function to apply a rest parameter to.
	     * @param {number} [start=func.length-1] The start position of the rest parameter.
	     * @param {Function} transform The rest array transform.
	     * @returns {Function} Returns the new function.
	     */
	    function overRest(func, start, transform) {
	      start = nativeMax(start === undefined$1 ? (func.length - 1) : start, 0);
	      return function() {
	        var args = arguments,
	            index = -1,
	            length = nativeMax(args.length - start, 0),
	            array = Array(length);

	        while (++index < length) {
	          array[index] = args[start + index];
	        }
	        index = -1;
	        var otherArgs = Array(start + 1);
	        while (++index < start) {
	          otherArgs[index] = args[index];
	        }
	        otherArgs[start] = transform(array);
	        return apply(func, this, otherArgs);
	      };
	    }

	    /**
	     * Gets the parent value at `path` of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array} path The path to get the parent value of.
	     * @returns {*} Returns the parent value.
	     */
	    function parent(object, path) {
	      return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
	    }

	    /**
	     * Reorder `array` according to the specified indexes where the element at
	     * the first index is assigned as the first element, the element at
	     * the second index is assigned as the second element, and so on.
	     *
	     * @private
	     * @param {Array} array The array to reorder.
	     * @param {Array} indexes The arranged array indexes.
	     * @returns {Array} Returns `array`.
	     */
	    function reorder(array, indexes) {
	      var arrLength = array.length,
	          length = nativeMin(indexes.length, arrLength),
	          oldArray = copyArray(array);

	      while (length--) {
	        var index = indexes[length];
	        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
	      }
	      return array;
	    }

	    /**
	     * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {string} key The key of the property to get.
	     * @returns {*} Returns the property value.
	     */
	    function safeGet(object, key) {
	      if (key === 'constructor' && typeof object[key] === 'function') {
	        return;
	      }

	      if (key == '__proto__') {
	        return;
	      }

	      return object[key];
	    }

	    /**
	     * Sets metadata for `func`.
	     *
	     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
	     * period of time, it will trip its breaker and transition to an identity
	     * function to avoid garbage collection pauses in V8. See
	     * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
	     * for more details.
	     *
	     * @private
	     * @param {Function} func The function to associate metadata with.
	     * @param {*} data The metadata.
	     * @returns {Function} Returns `func`.
	     */
	    var setData = shortOut(baseSetData);

	    /**
	     * A simple wrapper around the global [`setTimeout`](https://mdn.io/setTimeout).
	     *
	     * @private
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @returns {number|Object} Returns the timer id or timeout object.
	     */
	    var setTimeout = ctxSetTimeout || function(func, wait) {
	      return root.setTimeout(func, wait);
	    };

	    /**
	     * Sets the `toString` method of `func` to return `string`.
	     *
	     * @private
	     * @param {Function} func The function to modify.
	     * @param {Function} string The `toString` result.
	     * @returns {Function} Returns `func`.
	     */
	    var setToString = shortOut(baseSetToString);

	    /**
	     * Sets the `toString` method of `wrapper` to mimic the source of `reference`
	     * with wrapper details in a comment at the top of the source body.
	     *
	     * @private
	     * @param {Function} wrapper The function to modify.
	     * @param {Function} reference The reference function.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @returns {Function} Returns `wrapper`.
	     */
	    function setWrapToString(wrapper, reference, bitmask) {
	      var source = (reference + '');
	      return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
	    }

	    /**
	     * Creates a function that'll short out and invoke `identity` instead
	     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
	     * milliseconds.
	     *
	     * @private
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new shortable function.
	     */
	    function shortOut(func) {
	      var count = 0,
	          lastCalled = 0;

	      return function() {
	        var stamp = nativeNow(),
	            remaining = HOT_SPAN - (stamp - lastCalled);

	        lastCalled = stamp;
	        if (remaining > 0) {
	          if (++count >= HOT_COUNT) {
	            return arguments[0];
	          }
	        } else {
	          count = 0;
	        }
	        return func.apply(undefined$1, arguments);
	      };
	    }

	    /**
	     * A specialized version of `_.shuffle` which mutates and sets the size of `array`.
	     *
	     * @private
	     * @param {Array} array The array to shuffle.
	     * @param {number} [size=array.length] The size of `array`.
	     * @returns {Array} Returns `array`.
	     */
	    function shuffleSelf(array, size) {
	      var index = -1,
	          length = array.length,
	          lastIndex = length - 1;

	      size = size === undefined$1 ? length : size;
	      while (++index < size) {
	        var rand = baseRandom(index, lastIndex),
	            value = array[rand];

	        array[rand] = array[index];
	        array[index] = value;
	      }
	      array.length = size;
	      return array;
	    }

	    /**
	     * Converts `string` to a property path array.
	     *
	     * @private
	     * @param {string} string The string to convert.
	     * @returns {Array} Returns the property path array.
	     */
	    var stringToPath = memoizeCapped(function(string) {
	      var result = [];
	      if (string.charCodeAt(0) === 46 /* . */) {
	        result.push('');
	      }
	      string.replace(rePropName, function(match, number, quote, subString) {
	        result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
	      });
	      return result;
	    });

	    /**
	     * Converts `value` to a string key if it's not a string or symbol.
	     *
	     * @private
	     * @param {*} value The value to inspect.
	     * @returns {string|symbol} Returns the key.
	     */
	    function toKey(value) {
	      if (typeof value == 'string' || isSymbol(value)) {
	        return value;
	      }
	      var result = (value + '');
	      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	    }

	    /**
	     * Converts `func` to its source code.
	     *
	     * @private
	     * @param {Function} func The function to convert.
	     * @returns {string} Returns the source code.
	     */
	    function toSource(func) {
	      if (func != null) {
	        try {
	          return funcToString.call(func);
	        } catch (e) {}
	        try {
	          return (func + '');
	        } catch (e) {}
	      }
	      return '';
	    }

	    /**
	     * Updates wrapper `details` based on `bitmask` flags.
	     *
	     * @private
	     * @returns {Array} details The details to modify.
	     * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
	     * @returns {Array} Returns `details`.
	     */
	    function updateWrapDetails(details, bitmask) {
	      arrayEach(wrapFlags, function(pair) {
	        var value = '_.' + pair[0];
	        if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
	          details.push(value);
	        }
	      });
	      return details.sort();
	    }

	    /**
	     * Creates a clone of `wrapper`.
	     *
	     * @private
	     * @param {Object} wrapper The wrapper to clone.
	     * @returns {Object} Returns the cloned wrapper.
	     */
	    function wrapperClone(wrapper) {
	      if (wrapper instanceof LazyWrapper) {
	        return wrapper.clone();
	      }
	      var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
	      result.__actions__ = copyArray(wrapper.__actions__);
	      result.__index__  = wrapper.__index__;
	      result.__values__ = wrapper.__values__;
	      return result;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates an array of elements split into groups the length of `size`.
	     * If `array` can't be split evenly, the final chunk will be the remaining
	     * elements.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to process.
	     * @param {number} [size=1] The length of each chunk
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the new array of chunks.
	     * @example
	     *
	     * _.chunk(['a', 'b', 'c', 'd'], 2);
	     * // => [['a', 'b'], ['c', 'd']]
	     *
	     * _.chunk(['a', 'b', 'c', 'd'], 3);
	     * // => [['a', 'b', 'c'], ['d']]
	     */
	    function chunk(array, size, guard) {
	      if ((guard ? isIterateeCall(array, size, guard) : size === undefined$1)) {
	        size = 1;
	      } else {
	        size = nativeMax(toInteger(size), 0);
	      }
	      var length = array == null ? 0 : array.length;
	      if (!length || size < 1) {
	        return [];
	      }
	      var index = 0,
	          resIndex = 0,
	          result = Array(nativeCeil(length / size));

	      while (index < length) {
	        result[resIndex++] = baseSlice(array, index, (index += size));
	      }
	      return result;
	    }

	    /**
	     * Creates an array with all falsey values removed. The values `false`, `null`,
	     * `0`, `""`, `undefined`, and `NaN` are falsey.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to compact.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.compact([0, 1, false, 2, '', 3]);
	     * // => [1, 2, 3]
	     */
	    function compact(array) {
	      var index = -1,
	          length = array == null ? 0 : array.length,
	          resIndex = 0,
	          result = [];

	      while (++index < length) {
	        var value = array[index];
	        if (value) {
	          result[resIndex++] = value;
	        }
	      }
	      return result;
	    }

	    /**
	     * Creates a new array concatenating `array` with any additional arrays
	     * and/or values.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to concatenate.
	     * @param {...*} [values] The values to concatenate.
	     * @returns {Array} Returns the new concatenated array.
	     * @example
	     *
	     * var array = [1];
	     * var other = _.concat(array, 2, [3], [[4]]);
	     *
	     * console.log(other);
	     * // => [1, 2, 3, [4]]
	     *
	     * console.log(array);
	     * // => [1]
	     */
	    function concat() {
	      var length = arguments.length;
	      if (!length) {
	        return [];
	      }
	      var args = Array(length - 1),
	          array = arguments[0],
	          index = length;

	      while (index--) {
	        args[index - 1] = arguments[index];
	      }
	      return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
	    }

	    /**
	     * Creates an array of `array` values not included in the other given arrays
	     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons. The order and references of result values are
	     * determined by the first array.
	     *
	     * **Note:** Unlike `_.pullAll`, this method returns a new array.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {...Array} [values] The values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     * @see _.without, _.xor
	     * @example
	     *
	     * _.difference([2, 1], [2, 3]);
	     * // => [1]
	     */
	    var difference = baseRest(function(array, values) {
	      return isArrayLikeObject(array)
	        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
	        : [];
	    });

	    /**
	     * This method is like `_.difference` except that it accepts `iteratee` which
	     * is invoked for each element of `array` and `values` to generate the criterion
	     * by which they're compared. The order and references of result values are
	     * determined by the first array. The iteratee is invoked with one argument:
	     * (value).
	     *
	     * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {...Array} [values] The values to exclude.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
	     * // => [1.2]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
	     * // => [{ 'x': 2 }]
	     */
	    var differenceBy = baseRest(function(array, values) {
	      var iteratee = last(values);
	      if (isArrayLikeObject(iteratee)) {
	        iteratee = undefined$1;
	      }
	      return isArrayLikeObject(array)
	        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2))
	        : [];
	    });

	    /**
	     * This method is like `_.difference` except that it accepts `comparator`
	     * which is invoked to compare elements of `array` to `values`. The order and
	     * references of result values are determined by the first array. The comparator
	     * is invoked with two arguments: (arrVal, othVal).
	     *
	     * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {...Array} [values] The values to exclude.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
	     *
	     * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
	     * // => [{ 'x': 2, 'y': 1 }]
	     */
	    var differenceWith = baseRest(function(array, values) {
	      var comparator = last(values);
	      if (isArrayLikeObject(comparator)) {
	        comparator = undefined$1;
	      }
	      return isArrayLikeObject(array)
	        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined$1, comparator)
	        : [];
	    });

	    /**
	     * Creates a slice of `array` with `n` elements dropped from the beginning.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.5.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to drop.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.drop([1, 2, 3]);
	     * // => [2, 3]
	     *
	     * _.drop([1, 2, 3], 2);
	     * // => [3]
	     *
	     * _.drop([1, 2, 3], 5);
	     * // => []
	     *
	     * _.drop([1, 2, 3], 0);
	     * // => [1, 2, 3]
	     */
	    function drop(array, n, guard) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return [];
	      }
	      n = (guard || n === undefined$1) ? 1 : toInteger(n);
	      return baseSlice(array, n < 0 ? 0 : n, length);
	    }

	    /**
	     * Creates a slice of `array` with `n` elements dropped from the end.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to drop.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropRight([1, 2, 3]);
	     * // => [1, 2]
	     *
	     * _.dropRight([1, 2, 3], 2);
	     * // => [1]
	     *
	     * _.dropRight([1, 2, 3], 5);
	     * // => []
	     *
	     * _.dropRight([1, 2, 3], 0);
	     * // => [1, 2, 3]
	     */
	    function dropRight(array, n, guard) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return [];
	      }
	      n = (guard || n === undefined$1) ? 1 : toInteger(n);
	      n = length - n;
	      return baseSlice(array, 0, n < 0 ? 0 : n);
	    }

	    /**
	     * Creates a slice of `array` excluding elements dropped from the end.
	     * Elements are dropped until `predicate` returns falsey. The predicate is
	     * invoked with three arguments: (value, index, array).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * _.dropRightWhile(users, function(o) { return !o.active; });
	     * // => objects for ['barney']
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.dropRightWhile(users, { 'user': 'pebbles', 'active': false });
	     * // => objects for ['barney', 'fred']
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.dropRightWhile(users, ['active', false]);
	     * // => objects for ['barney']
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.dropRightWhile(users, 'active');
	     * // => objects for ['barney', 'fred', 'pebbles']
	     */
	    function dropRightWhile(array, predicate) {
	      return (array && array.length)
	        ? baseWhile(array, getIteratee(predicate, 3), true, true)
	        : [];
	    }

	    /**
	     * Creates a slice of `array` excluding elements dropped from the beginning.
	     * Elements are dropped until `predicate` returns falsey. The predicate is
	     * invoked with three arguments: (value, index, array).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * _.dropWhile(users, function(o) { return !o.active; });
	     * // => objects for ['pebbles']
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.dropWhile(users, { 'user': 'barney', 'active': false });
	     * // => objects for ['fred', 'pebbles']
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.dropWhile(users, ['active', false]);
	     * // => objects for ['pebbles']
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.dropWhile(users, 'active');
	     * // => objects for ['barney', 'fred', 'pebbles']
	     */
	    function dropWhile(array, predicate) {
	      return (array && array.length)
	        ? baseWhile(array, getIteratee(predicate, 3), true)
	        : [];
	    }

	    /**
	     * Fills elements of `array` with `value` from `start` up to, but not
	     * including, `end`.
	     *
	     * **Note:** This method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.2.0
	     * @category Array
	     * @param {Array} array The array to fill.
	     * @param {*} value The value to fill `array` with.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3];
	     *
	     * _.fill(array, 'a');
	     * console.log(array);
	     * // => ['a', 'a', 'a']
	     *
	     * _.fill(Array(3), 2);
	     * // => [2, 2, 2]
	     *
	     * _.fill([4, 6, 8, 10], '*', 1, 3);
	     * // => [4, '*', '*', 10]
	     */
	    function fill(array, value, start, end) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return [];
	      }
	      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
	        start = 0;
	        end = length;
	      }
	      return baseFill(array, value, start, end);
	    }

	    /**
	     * This method is like `_.find` except that it returns the index of the first
	     * element `predicate` returns truthy for instead of the element itself.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.1.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * _.findIndex(users, function(o) { return o.user == 'barney'; });
	     * // => 0
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.findIndex(users, { 'user': 'fred', 'active': false });
	     * // => 1
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.findIndex(users, ['active', false]);
	     * // => 0
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.findIndex(users, 'active');
	     * // => 2
	     */
	    function findIndex(array, predicate, fromIndex) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return -1;
	      }
	      var index = fromIndex == null ? 0 : toInteger(fromIndex);
	      if (index < 0) {
	        index = nativeMax(length + index, 0);
	      }
	      return baseFindIndex(array, getIteratee(predicate, 3), index);
	    }

	    /**
	     * This method is like `_.findIndex` except that it iterates over elements
	     * of `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @param {number} [fromIndex=array.length-1] The index to search from.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * _.findLastIndex(users, function(o) { return o.user == 'pebbles'; });
	     * // => 2
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.findLastIndex(users, { 'user': 'barney', 'active': true });
	     * // => 0
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.findLastIndex(users, ['active', false]);
	     * // => 2
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.findLastIndex(users, 'active');
	     * // => 0
	     */
	    function findLastIndex(array, predicate, fromIndex) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return -1;
	      }
	      var index = length - 1;
	      if (fromIndex !== undefined$1) {
	        index = toInteger(fromIndex);
	        index = fromIndex < 0
	          ? nativeMax(length + index, 0)
	          : nativeMin(index, length - 1);
	      }
	      return baseFindIndex(array, getIteratee(predicate, 3), index, true);
	    }

	    /**
	     * Flattens `array` a single level deep.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to flatten.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * _.flatten([1, [2, [3, [4]], 5]]);
	     * // => [1, 2, [3, [4]], 5]
	     */
	    function flatten(array) {
	      var length = array == null ? 0 : array.length;
	      return length ? baseFlatten(array, 1) : [];
	    }

	    /**
	     * Recursively flattens `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to flatten.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * _.flattenDeep([1, [2, [3, [4]], 5]]);
	     * // => [1, 2, 3, 4, 5]
	     */
	    function flattenDeep(array) {
	      var length = array == null ? 0 : array.length;
	      return length ? baseFlatten(array, INFINITY) : [];
	    }

	    /**
	     * Recursively flatten `array` up to `depth` times.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.4.0
	     * @category Array
	     * @param {Array} array The array to flatten.
	     * @param {number} [depth=1] The maximum recursion depth.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * var array = [1, [2, [3, [4]], 5]];
	     *
	     * _.flattenDepth(array, 1);
	     * // => [1, 2, [3, [4]], 5]
	     *
	     * _.flattenDepth(array, 2);
	     * // => [1, 2, 3, [4], 5]
	     */
	    function flattenDepth(array, depth) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return [];
	      }
	      depth = depth === undefined$1 ? 1 : toInteger(depth);
	      return baseFlatten(array, depth);
	    }

	    /**
	     * The inverse of `_.toPairs`; this method returns an object composed
	     * from key-value `pairs`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} pairs The key-value pairs.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * _.fromPairs([['a', 1], ['b', 2]]);
	     * // => { 'a': 1, 'b': 2 }
	     */
	    function fromPairs(pairs) {
	      var index = -1,
	          length = pairs == null ? 0 : pairs.length,
	          result = {};

	      while (++index < length) {
	        var pair = pairs[index];
	        result[pair[0]] = pair[1];
	      }
	      return result;
	    }

	    /**
	     * Gets the first element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @alias first
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {*} Returns the first element of `array`.
	     * @example
	     *
	     * _.head([1, 2, 3]);
	     * // => 1
	     *
	     * _.head([]);
	     * // => undefined
	     */
	    function head(array) {
	      return (array && array.length) ? array[0] : undefined$1;
	    }

	    /**
	     * Gets the index at which the first occurrence of `value` is found in `array`
	     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons. If `fromIndex` is negative, it's used as the
	     * offset from the end of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {*} value The value to search for.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.indexOf([1, 2, 1, 2], 2);
	     * // => 1
	     *
	     * // Search from the `fromIndex`.
	     * _.indexOf([1, 2, 1, 2], 2, 2);
	     * // => 3
	     */
	    function indexOf(array, value, fromIndex) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return -1;
	      }
	      var index = fromIndex == null ? 0 : toInteger(fromIndex);
	      if (index < 0) {
	        index = nativeMax(length + index, 0);
	      }
	      return baseIndexOf(array, value, index);
	    }

	    /**
	     * Gets all but the last element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.initial([1, 2, 3]);
	     * // => [1, 2]
	     */
	    function initial(array) {
	      var length = array == null ? 0 : array.length;
	      return length ? baseSlice(array, 0, -1) : [];
	    }

	    /**
	     * Creates an array of unique values that are included in all given arrays
	     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons. The order and references of result values are
	     * determined by the first array.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of intersecting values.
	     * @example
	     *
	     * _.intersection([2, 1], [2, 3]);
	     * // => [2]
	     */
	    var intersection = baseRest(function(arrays) {
	      var mapped = arrayMap(arrays, castArrayLikeObject);
	      return (mapped.length && mapped[0] === arrays[0])
	        ? baseIntersection(mapped)
	        : [];
	    });

	    /**
	     * This method is like `_.intersection` except that it accepts `iteratee`
	     * which is invoked for each element of each `arrays` to generate the criterion
	     * by which they're compared. The order and references of result values are
	     * determined by the first array. The iteratee is invoked with one argument:
	     * (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Array} Returns the new array of intersecting values.
	     * @example
	     *
	     * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
	     * // => [2.1]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }]
	     */
	    var intersectionBy = baseRest(function(arrays) {
	      var iteratee = last(arrays),
	          mapped = arrayMap(arrays, castArrayLikeObject);

	      if (iteratee === last(mapped)) {
	        iteratee = undefined$1;
	      } else {
	        mapped.pop();
	      }
	      return (mapped.length && mapped[0] === arrays[0])
	        ? baseIntersection(mapped, getIteratee(iteratee, 2))
	        : [];
	    });

	    /**
	     * This method is like `_.intersection` except that it accepts `comparator`
	     * which is invoked to compare elements of `arrays`. The order and references
	     * of result values are determined by the first array. The comparator is
	     * invoked with two arguments: (arrVal, othVal).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of intersecting values.
	     * @example
	     *
	     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
	     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
	     *
	     * _.intersectionWith(objects, others, _.isEqual);
	     * // => [{ 'x': 1, 'y': 2 }]
	     */
	    var intersectionWith = baseRest(function(arrays) {
	      var comparator = last(arrays),
	          mapped = arrayMap(arrays, castArrayLikeObject);

	      comparator = typeof comparator == 'function' ? comparator : undefined$1;
	      if (comparator) {
	        mapped.pop();
	      }
	      return (mapped.length && mapped[0] === arrays[0])
	        ? baseIntersection(mapped, undefined$1, comparator)
	        : [];
	    });

	    /**
	     * Converts all elements in `array` into a string separated by `separator`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to convert.
	     * @param {string} [separator=','] The element separator.
	     * @returns {string} Returns the joined string.
	     * @example
	     *
	     * _.join(['a', 'b', 'c'], '~');
	     * // => 'a~b~c'
	     */
	    function join(array, separator) {
	      return array == null ? '' : nativeJoin.call(array, separator);
	    }

	    /**
	     * Gets the last element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {*} Returns the last element of `array`.
	     * @example
	     *
	     * _.last([1, 2, 3]);
	     * // => 3
	     */
	    function last(array) {
	      var length = array == null ? 0 : array.length;
	      return length ? array[length - 1] : undefined$1;
	    }

	    /**
	     * This method is like `_.indexOf` except that it iterates over elements of
	     * `array` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {*} value The value to search for.
	     * @param {number} [fromIndex=array.length-1] The index to search from.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.lastIndexOf([1, 2, 1, 2], 2);
	     * // => 3
	     *
	     * // Search from the `fromIndex`.
	     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
	     * // => 1
	     */
	    function lastIndexOf(array, value, fromIndex) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return -1;
	      }
	      var index = length;
	      if (fromIndex !== undefined$1) {
	        index = toInteger(fromIndex);
	        index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
	      }
	      return value === value
	        ? strictLastIndexOf(array, value, index)
	        : baseFindIndex(array, baseIsNaN, index, true);
	    }

	    /**
	     * Gets the element at index `n` of `array`. If `n` is negative, the nth
	     * element from the end is returned.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.11.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=0] The index of the element to return.
	     * @returns {*} Returns the nth element of `array`.
	     * @example
	     *
	     * var array = ['a', 'b', 'c', 'd'];
	     *
	     * _.nth(array, 1);
	     * // => 'b'
	     *
	     * _.nth(array, -2);
	     * // => 'c';
	     */
	    function nth(array, n) {
	      return (array && array.length) ? baseNth(array, toInteger(n)) : undefined$1;
	    }

	    /**
	     * Removes all given values from `array` using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
	     * to remove elements from an array by predicate.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {...*} [values] The values to remove.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
	     *
	     * _.pull(array, 'a', 'c');
	     * console.log(array);
	     * // => ['b', 'b']
	     */
	    var pull = baseRest(pullAll);

	    /**
	     * This method is like `_.pull` except that it accepts an array of values to remove.
	     *
	     * **Note:** Unlike `_.difference`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {Array} values The values to remove.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
	     *
	     * _.pullAll(array, ['a', 'c']);
	     * console.log(array);
	     * // => ['b', 'b']
	     */
	    function pullAll(array, values) {
	      return (array && array.length && values && values.length)
	        ? basePullAll(array, values)
	        : array;
	    }

	    /**
	     * This method is like `_.pullAll` except that it accepts `iteratee` which is
	     * invoked for each element of `array` and `values` to generate the criterion
	     * by which they're compared. The iteratee is invoked with one argument: (value).
	     *
	     * **Note:** Unlike `_.differenceBy`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {Array} values The values to remove.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }];
	     *
	     * _.pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x');
	     * console.log(array);
	     * // => [{ 'x': 2 }]
	     */
	    function pullAllBy(array, values, iteratee) {
	      return (array && array.length && values && values.length)
	        ? basePullAll(array, values, getIteratee(iteratee, 2))
	        : array;
	    }

	    /**
	     * This method is like `_.pullAll` except that it accepts `comparator` which
	     * is invoked to compare elements of `array` to `values`. The comparator is
	     * invoked with two arguments: (arrVal, othVal).
	     *
	     * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.6.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {Array} values The values to remove.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
	     *
	     * _.pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
	     * console.log(array);
	     * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
	     */
	    function pullAllWith(array, values, comparator) {
	      return (array && array.length && values && values.length)
	        ? basePullAll(array, values, undefined$1, comparator)
	        : array;
	    }

	    /**
	     * Removes elements from `array` corresponding to `indexes` and returns an
	     * array of removed elements.
	     *
	     * **Note:** Unlike `_.at`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {...(number|number[])} [indexes] The indexes of elements to remove.
	     * @returns {Array} Returns the new array of removed elements.
	     * @example
	     *
	     * var array = ['a', 'b', 'c', 'd'];
	     * var pulled = _.pullAt(array, [1, 3]);
	     *
	     * console.log(array);
	     * // => ['a', 'c']
	     *
	     * console.log(pulled);
	     * // => ['b', 'd']
	     */
	    var pullAt = flatRest(function(array, indexes) {
	      var length = array == null ? 0 : array.length,
	          result = baseAt(array, indexes);

	      basePullAt(array, arrayMap(indexes, function(index) {
	        return isIndex(index, length) ? +index : index;
	      }).sort(compareAscending));

	      return result;
	    });

	    /**
	     * Removes all elements from `array` that `predicate` returns truthy for
	     * and returns an array of the removed elements. The predicate is invoked
	     * with three arguments: (value, index, array).
	     *
	     * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
	     * to pull elements from an array by value.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the new array of removed elements.
	     * @example
	     *
	     * var array = [1, 2, 3, 4];
	     * var evens = _.remove(array, function(n) {
	     *   return n % 2 == 0;
	     * });
	     *
	     * console.log(array);
	     * // => [1, 3]
	     *
	     * console.log(evens);
	     * // => [2, 4]
	     */
	    function remove(array, predicate) {
	      var result = [];
	      if (!(array && array.length)) {
	        return result;
	      }
	      var index = -1,
	          indexes = [],
	          length = array.length;

	      predicate = getIteratee(predicate, 3);
	      while (++index < length) {
	        var value = array[index];
	        if (predicate(value, index, array)) {
	          result.push(value);
	          indexes.push(index);
	        }
	      }
	      basePullAt(array, indexes);
	      return result;
	    }

	    /**
	     * Reverses `array` so that the first element becomes the last, the second
	     * element becomes the second to last, and so on.
	     *
	     * **Note:** This method mutates `array` and is based on
	     * [`Array#reverse`](https://mdn.io/Array/reverse).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3];
	     *
	     * _.reverse(array);
	     * // => [3, 2, 1]
	     *
	     * console.log(array);
	     * // => [3, 2, 1]
	     */
	    function reverse(array) {
	      return array == null ? array : nativeReverse.call(array);
	    }

	    /**
	     * Creates a slice of `array` from `start` up to, but not including, `end`.
	     *
	     * **Note:** This method is used instead of
	     * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
	     * returned.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to slice.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function slice(array, start, end) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return [];
	      }
	      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
	        start = 0;
	        end = length;
	      }
	      else {
	        start = start == null ? 0 : toInteger(start);
	        end = end === undefined$1 ? length : toInteger(end);
	      }
	      return baseSlice(array, start, end);
	    }

	    /**
	     * Uses a binary search to determine the lowest index at which `value`
	     * should be inserted into `array` in order to maintain its sort order.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedIndex([30, 50], 40);
	     * // => 1
	     */
	    function sortedIndex(array, value) {
	      return baseSortedIndex(array, value);
	    }

	    /**
	     * This method is like `_.sortedIndex` except that it accepts `iteratee`
	     * which is invoked for `value` and each element of `array` to compute their
	     * sort ranking. The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * var objects = [{ 'x': 4 }, { 'x': 5 }];
	     *
	     * _.sortedIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
	     * // => 0
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.sortedIndexBy(objects, { 'x': 4 }, 'x');
	     * // => 0
	     */
	    function sortedIndexBy(array, value, iteratee) {
	      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
	    }

	    /**
	     * This method is like `_.indexOf` except that it performs a binary
	     * search on a sorted `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {*} value The value to search for.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.sortedIndexOf([4, 5, 5, 5, 6], 5);
	     * // => 1
	     */
	    function sortedIndexOf(array, value) {
	      var length = array == null ? 0 : array.length;
	      if (length) {
	        var index = baseSortedIndex(array, value);
	        if (index < length && eq(array[index], value)) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * This method is like `_.sortedIndex` except that it returns the highest
	     * index at which `value` should be inserted into `array` in order to
	     * maintain its sort order.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedLastIndex([4, 5, 5, 5, 6], 5);
	     * // => 4
	     */
	    function sortedLastIndex(array, value) {
	      return baseSortedIndex(array, value, true);
	    }

	    /**
	     * This method is like `_.sortedLastIndex` except that it accepts `iteratee`
	     * which is invoked for `value` and each element of `array` to compute their
	     * sort ranking. The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * var objects = [{ 'x': 4 }, { 'x': 5 }];
	     *
	     * _.sortedLastIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
	     * // => 1
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.sortedLastIndexBy(objects, { 'x': 4 }, 'x');
	     * // => 1
	     */
	    function sortedLastIndexBy(array, value, iteratee) {
	      return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
	    }

	    /**
	     * This method is like `_.lastIndexOf` except that it performs a binary
	     * search on a sorted `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {*} value The value to search for.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.sortedLastIndexOf([4, 5, 5, 5, 6], 5);
	     * // => 3
	     */
	    function sortedLastIndexOf(array, value) {
	      var length = array == null ? 0 : array.length;
	      if (length) {
	        var index = baseSortedIndex(array, value, true) - 1;
	        if (eq(array[index], value)) {
	          return index;
	        }
	      }
	      return -1;
	    }

	    /**
	     * This method is like `_.uniq` except that it's designed and optimized
	     * for sorted arrays.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @returns {Array} Returns the new duplicate free array.
	     * @example
	     *
	     * _.sortedUniq([1, 1, 2]);
	     * // => [1, 2]
	     */
	    function sortedUniq(array) {
	      return (array && array.length)
	        ? baseSortedUniq(array)
	        : [];
	    }

	    /**
	     * This method is like `_.uniqBy` except that it's designed and optimized
	     * for sorted arrays.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {Function} [iteratee] The iteratee invoked per element.
	     * @returns {Array} Returns the new duplicate free array.
	     * @example
	     *
	     * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
	     * // => [1.1, 2.3]
	     */
	    function sortedUniqBy(array, iteratee) {
	      return (array && array.length)
	        ? baseSortedUniq(array, getIteratee(iteratee, 2))
	        : [];
	    }

	    /**
	     * Gets all but the first element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.tail([1, 2, 3]);
	     * // => [2, 3]
	     */
	    function tail(array) {
	      var length = array == null ? 0 : array.length;
	      return length ? baseSlice(array, 1, length) : [];
	    }

	    /**
	     * Creates a slice of `array` with `n` elements taken from the beginning.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to take.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.take([1, 2, 3]);
	     * // => [1]
	     *
	     * _.take([1, 2, 3], 2);
	     * // => [1, 2]
	     *
	     * _.take([1, 2, 3], 5);
	     * // => [1, 2, 3]
	     *
	     * _.take([1, 2, 3], 0);
	     * // => []
	     */
	    function take(array, n, guard) {
	      if (!(array && array.length)) {
	        return [];
	      }
	      n = (guard || n === undefined$1) ? 1 : toInteger(n);
	      return baseSlice(array, 0, n < 0 ? 0 : n);
	    }

	    /**
	     * Creates a slice of `array` with `n` elements taken from the end.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to take.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeRight([1, 2, 3]);
	     * // => [3]
	     *
	     * _.takeRight([1, 2, 3], 2);
	     * // => [2, 3]
	     *
	     * _.takeRight([1, 2, 3], 5);
	     * // => [1, 2, 3]
	     *
	     * _.takeRight([1, 2, 3], 0);
	     * // => []
	     */
	    function takeRight(array, n, guard) {
	      var length = array == null ? 0 : array.length;
	      if (!length) {
	        return [];
	      }
	      n = (guard || n === undefined$1) ? 1 : toInteger(n);
	      n = length - n;
	      return baseSlice(array, n < 0 ? 0 : n, length);
	    }

	    /**
	     * Creates a slice of `array` with elements taken from the end. Elements are
	     * taken until `predicate` returns falsey. The predicate is invoked with
	     * three arguments: (value, index, array).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * _.takeRightWhile(users, function(o) { return !o.active; });
	     * // => objects for ['fred', 'pebbles']
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.takeRightWhile(users, { 'user': 'pebbles', 'active': false });
	     * // => objects for ['pebbles']
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.takeRightWhile(users, ['active', false]);
	     * // => objects for ['fred', 'pebbles']
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.takeRightWhile(users, 'active');
	     * // => []
	     */
	    function takeRightWhile(array, predicate) {
	      return (array && array.length)
	        ? baseWhile(array, getIteratee(predicate, 3), false, true)
	        : [];
	    }

	    /**
	     * Creates a slice of `array` with elements taken from the beginning. Elements
	     * are taken until `predicate` returns falsey. The predicate is invoked with
	     * three arguments: (value, index, array).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * _.takeWhile(users, function(o) { return !o.active; });
	     * // => objects for ['barney', 'fred']
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.takeWhile(users, { 'user': 'barney', 'active': false });
	     * // => objects for ['barney']
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.takeWhile(users, ['active', false]);
	     * // => objects for ['barney', 'fred']
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.takeWhile(users, 'active');
	     * // => []
	     */
	    function takeWhile(array, predicate) {
	      return (array && array.length)
	        ? baseWhile(array, getIteratee(predicate, 3))
	        : [];
	    }

	    /**
	     * Creates an array of unique values, in order, from all given arrays using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of combined values.
	     * @example
	     *
	     * _.union([2], [1, 2]);
	     * // => [2, 1]
	     */
	    var union = baseRest(function(arrays) {
	      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
	    });

	    /**
	     * This method is like `_.union` except that it accepts `iteratee` which is
	     * invoked for each element of each `arrays` to generate the criterion by
	     * which uniqueness is computed. Result values are chosen from the first
	     * array in which the value occurs. The iteratee is invoked with one argument:
	     * (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Array} Returns the new array of combined values.
	     * @example
	     *
	     * _.unionBy([2.1], [1.2, 2.3], Math.floor);
	     * // => [2.1, 1.2]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }, { 'x': 2 }]
	     */
	    var unionBy = baseRest(function(arrays) {
	      var iteratee = last(arrays);
	      if (isArrayLikeObject(iteratee)) {
	        iteratee = undefined$1;
	      }
	      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
	    });

	    /**
	     * This method is like `_.union` except that it accepts `comparator` which
	     * is invoked to compare elements of `arrays`. Result values are chosen from
	     * the first array in which the value occurs. The comparator is invoked
	     * with two arguments: (arrVal, othVal).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of combined values.
	     * @example
	     *
	     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
	     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
	     *
	     * _.unionWith(objects, others, _.isEqual);
	     * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
	     */
	    var unionWith = baseRest(function(arrays) {
	      var comparator = last(arrays);
	      comparator = typeof comparator == 'function' ? comparator : undefined$1;
	      return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
	    });

	    /**
	     * Creates a duplicate-free version of an array, using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons, in which only the first occurrence of each element
	     * is kept. The order of result values is determined by the order they occur
	     * in the array.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @returns {Array} Returns the new duplicate free array.
	     * @example
	     *
	     * _.uniq([2, 1, 2]);
	     * // => [2, 1]
	     */
	    function uniq(array) {
	      return (array && array.length) ? baseUniq(array) : [];
	    }

	    /**
	     * This method is like `_.uniq` except that it accepts `iteratee` which is
	     * invoked for each element in `array` to generate the criterion by which
	     * uniqueness is computed. The order of result values is determined by the
	     * order they occur in the array. The iteratee is invoked with one argument:
	     * (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Array} Returns the new duplicate free array.
	     * @example
	     *
	     * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
	     * // => [2.1, 1.2]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }, { 'x': 2 }]
	     */
	    function uniqBy(array, iteratee) {
	      return (array && array.length) ? baseUniq(array, getIteratee(iteratee, 2)) : [];
	    }

	    /**
	     * This method is like `_.uniq` except that it accepts `comparator` which
	     * is invoked to compare elements of `array`. The order of result values is
	     * determined by the order they occur in the array.The comparator is invoked
	     * with two arguments: (arrVal, othVal).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new duplicate free array.
	     * @example
	     *
	     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
	     *
	     * _.uniqWith(objects, _.isEqual);
	     * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
	     */
	    function uniqWith(array, comparator) {
	      comparator = typeof comparator == 'function' ? comparator : undefined$1;
	      return (array && array.length) ? baseUniq(array, undefined$1, comparator) : [];
	    }

	    /**
	     * This method is like `_.zip` except that it accepts an array of grouped
	     * elements and creates an array regrouping the elements to their pre-zip
	     * configuration.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.2.0
	     * @category Array
	     * @param {Array} array The array of grouped elements to process.
	     * @returns {Array} Returns the new array of regrouped elements.
	     * @example
	     *
	     * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
	     * // => [['a', 1, true], ['b', 2, false]]
	     *
	     * _.unzip(zipped);
	     * // => [['a', 'b'], [1, 2], [true, false]]
	     */
	    function unzip(array) {
	      if (!(array && array.length)) {
	        return [];
	      }
	      var length = 0;
	      array = arrayFilter(array, function(group) {
	        if (isArrayLikeObject(group)) {
	          length = nativeMax(group.length, length);
	          return true;
	        }
	      });
	      return baseTimes(length, function(index) {
	        return arrayMap(array, baseProperty(index));
	      });
	    }

	    /**
	     * This method is like `_.unzip` except that it accepts `iteratee` to specify
	     * how regrouped values should be combined. The iteratee is invoked with the
	     * elements of each group: (...group).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.8.0
	     * @category Array
	     * @param {Array} array The array of grouped elements to process.
	     * @param {Function} [iteratee=_.identity] The function to combine
	     *  regrouped values.
	     * @returns {Array} Returns the new array of regrouped elements.
	     * @example
	     *
	     * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
	     * // => [[1, 10, 100], [2, 20, 200]]
	     *
	     * _.unzipWith(zipped, _.add);
	     * // => [3, 30, 300]
	     */
	    function unzipWith(array, iteratee) {
	      if (!(array && array.length)) {
	        return [];
	      }
	      var result = unzip(array);
	      if (iteratee == null) {
	        return result;
	      }
	      return arrayMap(result, function(group) {
	        return apply(iteratee, undefined$1, group);
	      });
	    }

	    /**
	     * Creates an array excluding all given values using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * **Note:** Unlike `_.pull`, this method returns a new array.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {...*} [values] The values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     * @see _.difference, _.xor
	     * @example
	     *
	     * _.without([2, 1, 2, 3], 1, 2);
	     * // => [3]
	     */
	    var without = baseRest(function(array, values) {
	      return isArrayLikeObject(array)
	        ? baseDifference(array, values)
	        : [];
	    });

	    /**
	     * Creates an array of unique values that is the
	     * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
	     * of the given arrays. The order of result values is determined by the order
	     * they occur in the arrays.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.4.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of filtered values.
	     * @see _.difference, _.without
	     * @example
	     *
	     * _.xor([2, 1], [2, 3]);
	     * // => [1, 3]
	     */
	    var xor = baseRest(function(arrays) {
	      return baseXor(arrayFilter(arrays, isArrayLikeObject));
	    });

	    /**
	     * This method is like `_.xor` except that it accepts `iteratee` which is
	     * invoked for each element of each `arrays` to generate the criterion by
	     * which by which they're compared. The order of result values is determined
	     * by the order they occur in the arrays. The iteratee is invoked with one
	     * argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor);
	     * // => [1.2, 3.4]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 2 }]
	     */
	    var xorBy = baseRest(function(arrays) {
	      var iteratee = last(arrays);
	      if (isArrayLikeObject(iteratee)) {
	        iteratee = undefined$1;
	      }
	      return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
	    });

	    /**
	     * This method is like `_.xor` except that it accepts `comparator` which is
	     * invoked to compare elements of `arrays`. The order of result values is
	     * determined by the order they occur in the arrays. The comparator is invoked
	     * with two arguments: (arrVal, othVal).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @param {Function} [comparator] The comparator invoked per element.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
	     * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
	     *
	     * _.xorWith(objects, others, _.isEqual);
	     * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
	     */
	    var xorWith = baseRest(function(arrays) {
	      var comparator = last(arrays);
	      comparator = typeof comparator == 'function' ? comparator : undefined$1;
	      return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
	    });

	    /**
	     * Creates an array of grouped elements, the first of which contains the
	     * first elements of the given arrays, the second of which contains the
	     * second elements of the given arrays, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to process.
	     * @returns {Array} Returns the new array of grouped elements.
	     * @example
	     *
	     * _.zip(['a', 'b'], [1, 2], [true, false]);
	     * // => [['a', 1, true], ['b', 2, false]]
	     */
	    var zip = baseRest(unzip);

	    /**
	     * This method is like `_.fromPairs` except that it accepts two arrays,
	     * one of property identifiers and one of corresponding values.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.4.0
	     * @category Array
	     * @param {Array} [props=[]] The property identifiers.
	     * @param {Array} [values=[]] The property values.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * _.zipObject(['a', 'b'], [1, 2]);
	     * // => { 'a': 1, 'b': 2 }
	     */
	    function zipObject(props, values) {
	      return baseZipObject(props || [], values || [], assignValue);
	    }

	    /**
	     * This method is like `_.zipObject` except that it supports property paths.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.1.0
	     * @category Array
	     * @param {Array} [props=[]] The property identifiers.
	     * @param {Array} [values=[]] The property values.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * _.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
	     * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
	     */
	    function zipObjectDeep(props, values) {
	      return baseZipObject(props || [], values || [], baseSet);
	    }

	    /**
	     * This method is like `_.zip` except that it accepts `iteratee` to specify
	     * how grouped values should be combined. The iteratee is invoked with the
	     * elements of each group: (...group).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.8.0
	     * @category Array
	     * @param {...Array} [arrays] The arrays to process.
	     * @param {Function} [iteratee=_.identity] The function to combine
	     *  grouped values.
	     * @returns {Array} Returns the new array of grouped elements.
	     * @example
	     *
	     * _.zipWith([1, 2], [10, 20], [100, 200], function(a, b, c) {
	     *   return a + b + c;
	     * });
	     * // => [111, 222]
	     */
	    var zipWith = baseRest(function(arrays) {
	      var length = arrays.length,
	          iteratee = length > 1 ? arrays[length - 1] : undefined$1;

	      iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined$1;
	      return unzipWith(arrays, iteratee);
	    });

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates a `lodash` wrapper instance that wraps `value` with explicit method
	     * chain sequences enabled. The result of such sequences must be unwrapped
	     * with `_#value`.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.3.0
	     * @category Seq
	     * @param {*} value The value to wrap.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36 },
	     *   { 'user': 'fred',    'age': 40 },
	     *   { 'user': 'pebbles', 'age': 1 }
	     * ];
	     *
	     * var youngest = _
	     *   .chain(users)
	     *   .sortBy('age')
	     *   .map(function(o) {
	     *     return o.user + ' is ' + o.age;
	     *   })
	     *   .head()
	     *   .value();
	     * // => 'pebbles is 1'
	     */
	    function chain(value) {
	      var result = lodash(value);
	      result.__chain__ = true;
	      return result;
	    }

	    /**
	     * This method invokes `interceptor` and returns `value`. The interceptor
	     * is invoked with one argument; (value). The purpose of this method is to
	     * "tap into" a method chain sequence in order to modify intermediate results.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Seq
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * _([1, 2, 3])
	     *  .tap(function(array) {
	     *    // Mutate input array.
	     *    array.pop();
	     *  })
	     *  .reverse()
	     *  .value();
	     * // => [2, 1]
	     */
	    function tap(value, interceptor) {
	      interceptor(value);
	      return value;
	    }

	    /**
	     * This method is like `_.tap` except that it returns the result of `interceptor`.
	     * The purpose of this method is to "pass thru" values replacing intermediate
	     * results in a method chain sequence.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Seq
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @returns {*} Returns the result of `interceptor`.
	     * @example
	     *
	     * _('  abc  ')
	     *  .chain()
	     *  .trim()
	     *  .thru(function(value) {
	     *    return [value];
	     *  })
	     *  .value();
	     * // => ['abc']
	     */
	    function thru(value, interceptor) {
	      return interceptor(value);
	    }

	    /**
	     * This method is the wrapper version of `_.at`.
	     *
	     * @name at
	     * @memberOf _
	     * @since 1.0.0
	     * @category Seq
	     * @param {...(string|string[])} [paths] The property paths to pick.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
	     *
	     * _(object).at(['a[0].b.c', 'a[1]']).value();
	     * // => [3, 4]
	     */
	    var wrapperAt = flatRest(function(paths) {
	      var length = paths.length,
	          start = length ? paths[0] : 0,
	          value = this.__wrapped__,
	          interceptor = function(object) { return baseAt(object, paths); };

	      if (length > 1 || this.__actions__.length ||
	          !(value instanceof LazyWrapper) || !isIndex(start)) {
	        return this.thru(interceptor);
	      }
	      value = value.slice(start, +start + (length ? 1 : 0));
	      value.__actions__.push({
	        'func': thru,
	        'args': [interceptor],
	        'thisArg': undefined$1
	      });
	      return new LodashWrapper(value, this.__chain__).thru(function(array) {
	        if (length && !array.length) {
	          array.push(undefined$1);
	        }
	        return array;
	      });
	    });

	    /**
	     * Creates a `lodash` wrapper instance with explicit method chain sequences enabled.
	     *
	     * @name chain
	     * @memberOf _
	     * @since 0.1.0
	     * @category Seq
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * // A sequence without explicit chaining.
	     * _(users).head();
	     * // => { 'user': 'barney', 'age': 36 }
	     *
	     * // A sequence with explicit chaining.
	     * _(users)
	     *   .chain()
	     *   .head()
	     *   .pick('user')
	     *   .value();
	     * // => { 'user': 'barney' }
	     */
	    function wrapperChain() {
	      return chain(this);
	    }

	    /**
	     * Executes the chain sequence and returns the wrapped result.
	     *
	     * @name commit
	     * @memberOf _
	     * @since 3.2.0
	     * @category Seq
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2];
	     * var wrapped = _(array).push(3);
	     *
	     * console.log(array);
	     * // => [1, 2]
	     *
	     * wrapped = wrapped.commit();
	     * console.log(array);
	     * // => [1, 2, 3]
	     *
	     * wrapped.last();
	     * // => 3
	     *
	     * console.log(array);
	     * // => [1, 2, 3]
	     */
	    function wrapperCommit() {
	      return new LodashWrapper(this.value(), this.__chain__);
	    }

	    /**
	     * Gets the next value on a wrapped object following the
	     * [iterator protocol](https://mdn.io/iteration_protocols#iterator).
	     *
	     * @name next
	     * @memberOf _
	     * @since 4.0.0
	     * @category Seq
	     * @returns {Object} Returns the next iterator value.
	     * @example
	     *
	     * var wrapped = _([1, 2]);
	     *
	     * wrapped.next();
	     * // => { 'done': false, 'value': 1 }
	     *
	     * wrapped.next();
	     * // => { 'done': false, 'value': 2 }
	     *
	     * wrapped.next();
	     * // => { 'done': true, 'value': undefined }
	     */
	    function wrapperNext() {
	      if (this.__values__ === undefined$1) {
	        this.__values__ = toArray(this.value());
	      }
	      var done = this.__index__ >= this.__values__.length,
	          value = done ? undefined$1 : this.__values__[this.__index__++];

	      return { 'done': done, 'value': value };
	    }

	    /**
	     * Enables the wrapper to be iterable.
	     *
	     * @name Symbol.iterator
	     * @memberOf _
	     * @since 4.0.0
	     * @category Seq
	     * @returns {Object} Returns the wrapper object.
	     * @example
	     *
	     * var wrapped = _([1, 2]);
	     *
	     * wrapped[Symbol.iterator]() === wrapped;
	     * // => true
	     *
	     * Array.from(wrapped);
	     * // => [1, 2]
	     */
	    function wrapperToIterator() {
	      return this;
	    }

	    /**
	     * Creates a clone of the chain sequence planting `value` as the wrapped value.
	     *
	     * @name plant
	     * @memberOf _
	     * @since 3.2.0
	     * @category Seq
	     * @param {*} value The value to plant.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var wrapped = _([1, 2]).map(square);
	     * var other = wrapped.plant([3, 4]);
	     *
	     * other.value();
	     * // => [9, 16]
	     *
	     * wrapped.value();
	     * // => [1, 4]
	     */
	    function wrapperPlant(value) {
	      var result,
	          parent = this;

	      while (parent instanceof baseLodash) {
	        var clone = wrapperClone(parent);
	        clone.__index__ = 0;
	        clone.__values__ = undefined$1;
	        if (result) {
	          previous.__wrapped__ = clone;
	        } else {
	          result = clone;
	        }
	        var previous = clone;
	        parent = parent.__wrapped__;
	      }
	      previous.__wrapped__ = value;
	      return result;
	    }

	    /**
	     * This method is the wrapper version of `_.reverse`.
	     *
	     * **Note:** This method mutates the wrapped array.
	     *
	     * @name reverse
	     * @memberOf _
	     * @since 0.1.0
	     * @category Seq
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2, 3];
	     *
	     * _(array).reverse().value()
	     * // => [3, 2, 1]
	     *
	     * console.log(array);
	     * // => [3, 2, 1]
	     */
	    function wrapperReverse() {
	      var value = this.__wrapped__;
	      if (value instanceof LazyWrapper) {
	        var wrapped = value;
	        if (this.__actions__.length) {
	          wrapped = new LazyWrapper(this);
	        }
	        wrapped = wrapped.reverse();
	        wrapped.__actions__.push({
	          'func': thru,
	          'args': [reverse],
	          'thisArg': undefined$1
	        });
	        return new LodashWrapper(wrapped, this.__chain__);
	      }
	      return this.thru(reverse);
	    }

	    /**
	     * Executes the chain sequence to resolve the unwrapped value.
	     *
	     * @name value
	     * @memberOf _
	     * @since 0.1.0
	     * @alias toJSON, valueOf
	     * @category Seq
	     * @returns {*} Returns the resolved unwrapped value.
	     * @example
	     *
	     * _([1, 2, 3]).value();
	     * // => [1, 2, 3]
	     */
	    function wrapperValue() {
	      return baseWrapperValue(this.__wrapped__, this.__actions__);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` thru `iteratee`. The corresponding value of
	     * each key is the number of times the key was returned by `iteratee`. The
	     * iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.5.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.countBy([6.1, 4.2, 6.3], Math.floor);
	     * // => { '4': 1, '6': 2 }
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.countBy(['one', 'two', 'three'], 'length');
	     * // => { '3': 2, '5': 1 }
	     */
	    var countBy = createAggregator(function(result, value, key) {
	      if (hasOwnProperty.call(result, key)) {
	        ++result[key];
	      } else {
	        baseAssignValue(result, key, 1);
	      }
	    });

	    /**
	     * Checks if `predicate` returns truthy for **all** elements of `collection`.
	     * Iteration is stopped once `predicate` returns falsey. The predicate is
	     * invoked with three arguments: (value, index|key, collection).
	     *
	     * **Note:** This method returns `true` for
	     * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
	     * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
	     * elements of empty collections.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`.
	     * @example
	     *
	     * _.every([true, 1, null, 'yes'], Boolean);
	     * // => false
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': false },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.every(users, { 'user': 'barney', 'active': false });
	     * // => false
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.every(users, ['active', false]);
	     * // => true
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.every(users, 'active');
	     * // => false
	     */
	    function every(collection, predicate, guard) {
	      var func = isArray(collection) ? arrayEvery : baseEvery;
	      if (guard && isIterateeCall(collection, predicate, guard)) {
	        predicate = undefined$1;
	      }
	      return func(collection, getIteratee(predicate, 3));
	    }

	    /**
	     * Iterates over elements of `collection`, returning an array of all elements
	     * `predicate` returns truthy for. The predicate is invoked with three
	     * arguments: (value, index|key, collection).
	     *
	     * **Note:** Unlike `_.remove`, this method returns a new array.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     * @see _.reject
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * _.filter(users, function(o) { return !o.active; });
	     * // => objects for ['fred']
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.filter(users, { 'age': 36, 'active': true });
	     * // => objects for ['barney']
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.filter(users, ['active', false]);
	     * // => objects for ['fred']
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.filter(users, 'active');
	     * // => objects for ['barney']
	     */
	    function filter(collection, predicate) {
	      var func = isArray(collection) ? arrayFilter : baseFilter;
	      return func(collection, getIteratee(predicate, 3));
	    }

	    /**
	     * Iterates over elements of `collection`, returning the first element
	     * `predicate` returns truthy for. The predicate is invoked with three
	     * arguments: (value, index|key, collection).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to inspect.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36, 'active': true },
	     *   { 'user': 'fred',    'age': 40, 'active': false },
	     *   { 'user': 'pebbles', 'age': 1,  'active': true }
	     * ];
	     *
	     * _.find(users, function(o) { return o.age < 40; });
	     * // => object for 'barney'
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.find(users, { 'age': 1, 'active': true });
	     * // => object for 'pebbles'
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.find(users, ['active', false]);
	     * // => object for 'fred'
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.find(users, 'active');
	     * // => object for 'barney'
	     */
	    var find = createFind(findIndex);

	    /**
	     * This method is like `_.find` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to inspect.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @param {number} [fromIndex=collection.length-1] The index to search from.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * _.findLast([1, 2, 3, 4], function(n) {
	     *   return n % 2 == 1;
	     * });
	     * // => 3
	     */
	    var findLast = createFind(findLastIndex);

	    /**
	     * Creates a flattened array of values by running each element in `collection`
	     * thru `iteratee` and flattening the mapped results. The iteratee is invoked
	     * with three arguments: (value, index|key, collection).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * function duplicate(n) {
	     *   return [n, n];
	     * }
	     *
	     * _.flatMap([1, 2], duplicate);
	     * // => [1, 1, 2, 2]
	     */
	    function flatMap(collection, iteratee) {
	      return baseFlatten(map(collection, iteratee), 1);
	    }

	    /**
	     * This method is like `_.flatMap` except that it recursively flattens the
	     * mapped results.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.7.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * function duplicate(n) {
	     *   return [[[n, n]]];
	     * }
	     *
	     * _.flatMapDeep([1, 2], duplicate);
	     * // => [1, 1, 2, 2]
	     */
	    function flatMapDeep(collection, iteratee) {
	      return baseFlatten(map(collection, iteratee), INFINITY);
	    }

	    /**
	     * This method is like `_.flatMap` except that it recursively flattens the
	     * mapped results up to `depth` times.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.7.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {number} [depth=1] The maximum recursion depth.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * function duplicate(n) {
	     *   return [[[n, n]]];
	     * }
	     *
	     * _.flatMapDepth([1, 2], duplicate, 2);
	     * // => [[1, 1], [2, 2]]
	     */
	    function flatMapDepth(collection, iteratee, depth) {
	      depth = depth === undefined$1 ? 1 : toInteger(depth);
	      return baseFlatten(map(collection, iteratee), depth);
	    }

	    /**
	     * Iterates over elements of `collection` and invokes `iteratee` for each element.
	     * The iteratee is invoked with three arguments: (value, index|key, collection).
	     * Iteratee functions may exit iteration early by explicitly returning `false`.
	     *
	     * **Note:** As with other "Collections" methods, objects with a "length"
	     * property are iterated like arrays. To avoid this behavior use `_.forIn`
	     * or `_.forOwn` for object iteration.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @alias each
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Array|Object} Returns `collection`.
	     * @see _.forEachRight
	     * @example
	     *
	     * _.forEach([1, 2], function(value) {
	     *   console.log(value);
	     * });
	     * // => Logs `1` then `2`.
	     *
	     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
	     */
	    function forEach(collection, iteratee) {
	      var func = isArray(collection) ? arrayEach : baseEach;
	      return func(collection, getIteratee(iteratee, 3));
	    }

	    /**
	     * This method is like `_.forEach` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @alias eachRight
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Array|Object} Returns `collection`.
	     * @see _.forEach
	     * @example
	     *
	     * _.forEachRight([1, 2], function(value) {
	     *   console.log(value);
	     * });
	     * // => Logs `2` then `1`.
	     */
	    function forEachRight(collection, iteratee) {
	      var func = isArray(collection) ? arrayEachRight : baseEachRight;
	      return func(collection, getIteratee(iteratee, 3));
	    }

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` thru `iteratee`. The order of grouped values
	     * is determined by the order they occur in `collection`. The corresponding
	     * value of each key is an array of elements responsible for generating the
	     * key. The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.groupBy([6.1, 4.2, 6.3], Math.floor);
	     * // => { '4': [4.2], '6': [6.1, 6.3] }
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.groupBy(['one', 'two', 'three'], 'length');
	     * // => { '3': ['one', 'two'], '5': ['three'] }
	     */
	    var groupBy = createAggregator(function(result, value, key) {
	      if (hasOwnProperty.call(result, key)) {
	        result[key].push(value);
	      } else {
	        baseAssignValue(result, key, [value]);
	      }
	    });

	    /**
	     * Checks if `value` is in `collection`. If `collection` is a string, it's
	     * checked for a substring of `value`, otherwise
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * is used for equality comparisons. If `fromIndex` is negative, it's used as
	     * the offset from the end of `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to inspect.
	     * @param {*} value The value to search for.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	     * @returns {boolean} Returns `true` if `value` is found, else `false`.
	     * @example
	     *
	     * _.includes([1, 2, 3], 1);
	     * // => true
	     *
	     * _.includes([1, 2, 3], 1, 2);
	     * // => false
	     *
	     * _.includes({ 'a': 1, 'b': 2 }, 1);
	     * // => true
	     *
	     * _.includes('abcd', 'bc');
	     * // => true
	     */
	    function includes(collection, value, fromIndex, guard) {
	      collection = isArrayLike(collection) ? collection : values(collection);
	      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

	      var length = collection.length;
	      if (fromIndex < 0) {
	        fromIndex = nativeMax(length + fromIndex, 0);
	      }
	      return isString(collection)
	        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
	        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
	    }

	    /**
	     * Invokes the method at `path` of each element in `collection`, returning
	     * an array of the results of each invoked method. Any additional arguments
	     * are provided to each invoked method. If `path` is a function, it's invoked
	     * for, and `this` bound to, each element in `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Array|Function|string} path The path of the method to invoke or
	     *  the function invoked per iteration.
	     * @param {...*} [args] The arguments to invoke each method with.
	     * @returns {Array} Returns the array of results.
	     * @example
	     *
	     * _.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
	     * // => [[1, 5, 7], [1, 2, 3]]
	     *
	     * _.invokeMap([123, 456], String.prototype.split, '');
	     * // => [['1', '2', '3'], ['4', '5', '6']]
	     */
	    var invokeMap = baseRest(function(collection, path, args) {
	      var index = -1,
	          isFunc = typeof path == 'function',
	          result = isArrayLike(collection) ? Array(collection.length) : [];

	      baseEach(collection, function(value) {
	        result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
	      });
	      return result;
	    });

	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` thru `iteratee`. The corresponding value of
	     * each key is the last element responsible for generating the key. The
	     * iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * var array = [
	     *   { 'dir': 'left', 'code': 97 },
	     *   { 'dir': 'right', 'code': 100 }
	     * ];
	     *
	     * _.keyBy(array, function(o) {
	     *   return String.fromCharCode(o.code);
	     * });
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.keyBy(array, 'dir');
	     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
	     */
	    var keyBy = createAggregator(function(result, value, key) {
	      baseAssignValue(result, key, value);
	    });

	    /**
	     * Creates an array of values by running each element in `collection` thru
	     * `iteratee`. The iteratee is invoked with three arguments:
	     * (value, index|key, collection).
	     *
	     * Many lodash methods are guarded to work as iteratees for methods like
	     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	     *
	     * The guarded methods are:
	     * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
	     * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
	     * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
	     * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the new mapped array.
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * _.map([4, 8], square);
	     * // => [16, 64]
	     *
	     * _.map({ 'a': 4, 'b': 8 }, square);
	     * // => [16, 64] (iteration order is not guaranteed)
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.map(users, 'user');
	     * // => ['barney', 'fred']
	     */
	    function map(collection, iteratee) {
	      var func = isArray(collection) ? arrayMap : baseMap;
	      return func(collection, getIteratee(iteratee, 3));
	    }

	    /**
	     * This method is like `_.sortBy` except that it allows specifying the sort
	     * orders of the iteratees to sort by. If `orders` is unspecified, all values
	     * are sorted in ascending order. Otherwise, specify an order of "desc" for
	     * descending or "asc" for ascending sort order of corresponding values.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
	     *  The iteratees to sort by.
	     * @param {string[]} [orders] The sort orders of `iteratees`.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'fred',   'age': 48 },
	     *   { 'user': 'barney', 'age': 34 },
	     *   { 'user': 'fred',   'age': 40 },
	     *   { 'user': 'barney', 'age': 36 }
	     * ];
	     *
	     * // Sort by `user` in ascending order and by `age` in descending order.
	     * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
	     * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
	     */
	    function orderBy(collection, iteratees, orders, guard) {
	      if (collection == null) {
	        return [];
	      }
	      if (!isArray(iteratees)) {
	        iteratees = iteratees == null ? [] : [iteratees];
	      }
	      orders = guard ? undefined$1 : orders;
	      if (!isArray(orders)) {
	        orders = orders == null ? [] : [orders];
	      }
	      return baseOrderBy(collection, iteratees, orders);
	    }

	    /**
	     * Creates an array of elements split into two groups, the first of which
	     * contains elements `predicate` returns truthy for, the second of which
	     * contains elements `predicate` returns falsey for. The predicate is
	     * invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the array of grouped elements.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36, 'active': false },
	     *   { 'user': 'fred',    'age': 40, 'active': true },
	     *   { 'user': 'pebbles', 'age': 1,  'active': false }
	     * ];
	     *
	     * _.partition(users, function(o) { return o.active; });
	     * // => objects for [['fred'], ['barney', 'pebbles']]
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.partition(users, { 'age': 1, 'active': false });
	     * // => objects for [['pebbles'], ['barney', 'fred']]
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.partition(users, ['active', false]);
	     * // => objects for [['barney', 'pebbles'], ['fred']]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.partition(users, 'active');
	     * // => objects for [['fred'], ['barney', 'pebbles']]
	     */
	    var partition = createAggregator(function(result, value, key) {
	      result[key ? 0 : 1].push(value);
	    }, function() { return [[], []]; });

	    /**
	     * Reduces `collection` to a value which is the accumulated result of running
	     * each element in `collection` thru `iteratee`, where each successive
	     * invocation is supplied the return value of the previous. If `accumulator`
	     * is not given, the first element of `collection` is used as the initial
	     * value. The iteratee is invoked with four arguments:
	     * (accumulator, value, index|key, collection).
	     *
	     * Many lodash methods are guarded to work as iteratees for methods like
	     * `_.reduce`, `_.reduceRight`, and `_.transform`.
	     *
	     * The guarded methods are:
	     * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
	     * and `sortBy`
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @returns {*} Returns the accumulated value.
	     * @see _.reduceRight
	     * @example
	     *
	     * _.reduce([1, 2], function(sum, n) {
	     *   return sum + n;
	     * }, 0);
	     * // => 3
	     *
	     * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
	     *   (result[value] || (result[value] = [])).push(key);
	     *   return result;
	     * }, {});
	     * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
	     */
	    function reduce(collection, iteratee, accumulator) {
	      var func = isArray(collection) ? arrayReduce : baseReduce,
	          initAccum = arguments.length < 3;

	      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
	    }

	    /**
	     * This method is like `_.reduce` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @returns {*} Returns the accumulated value.
	     * @see _.reduce
	     * @example
	     *
	     * var array = [[0, 1], [2, 3], [4, 5]];
	     *
	     * _.reduceRight(array, function(flattened, other) {
	     *   return flattened.concat(other);
	     * }, []);
	     * // => [4, 5, 2, 3, 0, 1]
	     */
	    function reduceRight(collection, iteratee, accumulator) {
	      var func = isArray(collection) ? arrayReduceRight : baseReduce,
	          initAccum = arguments.length < 3;

	      return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
	    }

	    /**
	     * The opposite of `_.filter`; this method returns the elements of `collection`
	     * that `predicate` does **not** return truthy for.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     * @see _.filter
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': false },
	     *   { 'user': 'fred',   'age': 40, 'active': true }
	     * ];
	     *
	     * _.reject(users, function(o) { return !o.active; });
	     * // => objects for ['fred']
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.reject(users, { 'age': 40, 'active': true });
	     * // => objects for ['barney']
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.reject(users, ['active', false]);
	     * // => objects for ['fred']
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.reject(users, 'active');
	     * // => objects for ['barney']
	     */
	    function reject(collection, predicate) {
	      var func = isArray(collection) ? arrayFilter : baseFilter;
	      return func(collection, negate(getIteratee(predicate, 3)));
	    }

	    /**
	     * Gets a random element from `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to sample.
	     * @returns {*} Returns the random element.
	     * @example
	     *
	     * _.sample([1, 2, 3, 4]);
	     * // => 2
	     */
	    function sample(collection) {
	      var func = isArray(collection) ? arraySample : baseSample;
	      return func(collection);
	    }

	    /**
	     * Gets `n` random elements at unique keys from `collection` up to the
	     * size of `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to sample.
	     * @param {number} [n=1] The number of elements to sample.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the random elements.
	     * @example
	     *
	     * _.sampleSize([1, 2, 3], 2);
	     * // => [3, 1]
	     *
	     * _.sampleSize([1, 2, 3], 4);
	     * // => [2, 3, 1]
	     */
	    function sampleSize(collection, n, guard) {
	      if ((guard ? isIterateeCall(collection, n, guard) : n === undefined$1)) {
	        n = 1;
	      } else {
	        n = toInteger(n);
	      }
	      var func = isArray(collection) ? arraySampleSize : baseSampleSize;
	      return func(collection, n);
	    }

	    /**
	     * Creates an array of shuffled values, using a version of the
	     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to shuffle.
	     * @returns {Array} Returns the new shuffled array.
	     * @example
	     *
	     * _.shuffle([1, 2, 3, 4]);
	     * // => [4, 1, 3, 2]
	     */
	    function shuffle(collection) {
	      var func = isArray(collection) ? arrayShuffle : baseShuffle;
	      return func(collection);
	    }

	    /**
	     * Gets the size of `collection` by returning its length for array-like
	     * values or the number of own enumerable string keyed properties for objects.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to inspect.
	     * @returns {number} Returns the collection size.
	     * @example
	     *
	     * _.size([1, 2, 3]);
	     * // => 3
	     *
	     * _.size({ 'a': 1, 'b': 2 });
	     * // => 2
	     *
	     * _.size('pebbles');
	     * // => 7
	     */
	    function size(collection) {
	      if (collection == null) {
	        return 0;
	      }
	      if (isArrayLike(collection)) {
	        return isString(collection) ? stringSize(collection) : collection.length;
	      }
	      var tag = getTag(collection);
	      if (tag == mapTag || tag == setTag) {
	        return collection.size;
	      }
	      return baseKeys(collection).length;
	    }

	    /**
	     * Checks if `predicate` returns truthy for **any** element of `collection`.
	     * Iteration is stopped once `predicate` returns truthy. The predicate is
	     * invoked with three arguments: (value, index|key, collection).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     * @example
	     *
	     * _.some([null, 0, 'yes', false], Boolean);
	     * // => true
	     *
	     * var users = [
	     *   { 'user': 'barney', 'active': true },
	     *   { 'user': 'fred',   'active': false }
	     * ];
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.some(users, { 'user': 'barney', 'active': false });
	     * // => false
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.some(users, ['active', false]);
	     * // => true
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.some(users, 'active');
	     * // => true
	     */
	    function some(collection, predicate, guard) {
	      var func = isArray(collection) ? arraySome : baseSome;
	      if (guard && isIterateeCall(collection, predicate, guard)) {
	        predicate = undefined$1;
	      }
	      return func(collection, getIteratee(predicate, 3));
	    }

	    /**
	     * Creates an array of elements, sorted in ascending order by the results of
	     * running each element in a collection thru each iteratee. This method
	     * performs a stable sort, that is, it preserves the original sort order of
	     * equal elements. The iteratees are invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Collection
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {...(Function|Function[])} [iteratees=[_.identity]]
	     *  The iteratees to sort by.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'fred',   'age': 48 },
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 },
	     *   { 'user': 'barney', 'age': 34 }
	     * ];
	     *
	     * _.sortBy(users, [function(o) { return o.user; }]);
	     * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
	     *
	     * _.sortBy(users, ['user', 'age']);
	     * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
	     */
	    var sortBy = baseRest(function(collection, iteratees) {
	      if (collection == null) {
	        return [];
	      }
	      var length = iteratees.length;
	      if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
	        iteratees = [];
	      } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
	        iteratees = [iteratees[0]];
	      }
	      return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
	    });

	    /*------------------------------------------------------------------------*/

	    /**
	     * Gets the timestamp of the number of milliseconds that have elapsed since
	     * the Unix epoch (1 January 1970 00:00:00 UTC).
	     *
	     * @static
	     * @memberOf _
	     * @since 2.4.0
	     * @category Date
	     * @returns {number} Returns the timestamp.
	     * @example
	     *
	     * _.defer(function(stamp) {
	     *   console.log(_.now() - stamp);
	     * }, _.now());
	     * // => Logs the number of milliseconds it took for the deferred invocation.
	     */
	    var now = ctxNow || function() {
	      return root.Date.now();
	    };

	    /*------------------------------------------------------------------------*/

	    /**
	     * The opposite of `_.before`; this method creates a function that invokes
	     * `func` once it's called `n` or more times.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {number} n The number of calls before `func` is invoked.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var saves = ['profile', 'settings'];
	     *
	     * var done = _.after(saves.length, function() {
	     *   console.log('done saving!');
	     * });
	     *
	     * _.forEach(saves, function(type) {
	     *   asyncSave({ 'type': type, 'complete': done });
	     * });
	     * // => Logs 'done saving!' after the two async saves have completed.
	     */
	    function after(n, func) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      n = toInteger(n);
	      return function() {
	        if (--n < 1) {
	          return func.apply(this, arguments);
	        }
	      };
	    }

	    /**
	     * Creates a function that invokes `func`, with up to `n` arguments,
	     * ignoring any additional arguments.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Function
	     * @param {Function} func The function to cap arguments for.
	     * @param {number} [n=func.length] The arity cap.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Function} Returns the new capped function.
	     * @example
	     *
	     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
	     * // => [6, 8, 10]
	     */
	    function ary(func, n, guard) {
	      n = guard ? undefined$1 : n;
	      n = (func && n == null) ? func.length : n;
	      return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
	    }

	    /**
	     * Creates a function that invokes `func`, with the `this` binding and arguments
	     * of the created function, while it's called less than `n` times. Subsequent
	     * calls to the created function return the result of the last `func` invocation.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Function
	     * @param {number} n The number of calls at which `func` is no longer invoked.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * jQuery(element).on('click', _.before(5, addContactToList));
	     * // => Allows adding up to 4 contacts to the list.
	     */
	    function before(n, func) {
	      var result;
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      n = toInteger(n);
	      return function() {
	        if (--n > 0) {
	          result = func.apply(this, arguments);
	        }
	        if (n <= 1) {
	          func = undefined$1;
	        }
	        return result;
	      };
	    }

	    /**
	     * Creates a function that invokes `func` with the `this` binding of `thisArg`
	     * and `partials` prepended to the arguments it receives.
	     *
	     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
	     * may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
	     * property of bound functions.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to bind.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * function greet(greeting, punctuation) {
	     *   return greeting + ' ' + this.user + punctuation;
	     * }
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * var bound = _.bind(greet, object, 'hi');
	     * bound('!');
	     * // => 'hi fred!'
	     *
	     * // Bound with placeholders.
	     * var bound = _.bind(greet, object, _, '!');
	     * bound('hi');
	     * // => 'hi fred!'
	     */
	    var bind = baseRest(function(func, thisArg, partials) {
	      var bitmask = WRAP_BIND_FLAG;
	      if (partials.length) {
	        var holders = replaceHolders(partials, getHolder(bind));
	        bitmask |= WRAP_PARTIAL_FLAG;
	      }
	      return createWrap(func, bitmask, thisArg, partials, holders);
	    });

	    /**
	     * Creates a function that invokes the method at `object[key]` with `partials`
	     * prepended to the arguments it receives.
	     *
	     * This method differs from `_.bind` by allowing bound functions to reference
	     * methods that may be redefined or don't yet exist. See
	     * [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
	     * for more details.
	     *
	     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.10.0
	     * @category Function
	     * @param {Object} object The object to invoke the method on.
	     * @param {string} key The key of the method.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var object = {
	     *   'user': 'fred',
	     *   'greet': function(greeting, punctuation) {
	     *     return greeting + ' ' + this.user + punctuation;
	     *   }
	     * };
	     *
	     * var bound = _.bindKey(object, 'greet', 'hi');
	     * bound('!');
	     * // => 'hi fred!'
	     *
	     * object.greet = function(greeting, punctuation) {
	     *   return greeting + 'ya ' + this.user + punctuation;
	     * };
	     *
	     * bound('!');
	     * // => 'hiya fred!'
	     *
	     * // Bound with placeholders.
	     * var bound = _.bindKey(object, 'greet', _, '!');
	     * bound('hi');
	     * // => 'hiya fred!'
	     */
	    var bindKey = baseRest(function(object, key, partials) {
	      var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
	      if (partials.length) {
	        var holders = replaceHolders(partials, getHolder(bindKey));
	        bitmask |= WRAP_PARTIAL_FLAG;
	      }
	      return createWrap(key, bitmask, object, partials, holders);
	    });

	    /**
	     * Creates a function that accepts arguments of `func` and either invokes
	     * `func` returning its result, if at least `arity` number of arguments have
	     * been provided, or returns a function that accepts the remaining `func`
	     * arguments, and so on. The arity of `func` may be specified if `func.length`
	     * is not sufficient.
	     *
	     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
	     * may be used as a placeholder for provided arguments.
	     *
	     * **Note:** This method doesn't set the "length" property of curried functions.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Function
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var abc = function(a, b, c) {
	     *   return [a, b, c];
	     * };
	     *
	     * var curried = _.curry(abc);
	     *
	     * curried(1)(2)(3);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2)(3);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2, 3);
	     * // => [1, 2, 3]
	     *
	     * // Curried with placeholders.
	     * curried(1)(_, 3)(2);
	     * // => [1, 2, 3]
	     */
	    function curry(func, arity, guard) {
	      arity = guard ? undefined$1 : arity;
	      var result = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
	      result.placeholder = curry.placeholder;
	      return result;
	    }

	    /**
	     * This method is like `_.curry` except that arguments are applied to `func`
	     * in the manner of `_.partialRight` instead of `_.partial`.
	     *
	     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for provided arguments.
	     *
	     * **Note:** This method doesn't set the "length" property of curried functions.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Function
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var abc = function(a, b, c) {
	     *   return [a, b, c];
	     * };
	     *
	     * var curried = _.curryRight(abc);
	     *
	     * curried(3)(2)(1);
	     * // => [1, 2, 3]
	     *
	     * curried(2, 3)(1);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2, 3);
	     * // => [1, 2, 3]
	     *
	     * // Curried with placeholders.
	     * curried(3)(1, _)(2);
	     * // => [1, 2, 3]
	     */
	    function curryRight(func, arity, guard) {
	      arity = guard ? undefined$1 : arity;
	      var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
	      result.placeholder = curryRight.placeholder;
	      return result;
	    }

	    /**
	     * Creates a debounced function that delays invoking `func` until after `wait`
	     * milliseconds have elapsed since the last time the debounced function was
	     * invoked. The debounced function comes with a `cancel` method to cancel
	     * delayed `func` invocations and a `flush` method to immediately invoke them.
	     * Provide `options` to indicate whether `func` should be invoked on the
	     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
	     * with the last arguments provided to the debounced function. Subsequent
	     * calls to the debounced function return the result of the last `func`
	     * invocation.
	     *
	     * **Note:** If `leading` and `trailing` options are `true`, `func` is
	     * invoked on the trailing edge of the timeout only if the debounced function
	     * is invoked more than once during the `wait` timeout.
	     *
	     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	     *
	     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	     * for details over the differences between `_.debounce` and `_.throttle`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to debounce.
	     * @param {number} [wait=0] The number of milliseconds to delay.
	     * @param {Object} [options={}] The options object.
	     * @param {boolean} [options.leading=false]
	     *  Specify invoking on the leading edge of the timeout.
	     * @param {number} [options.maxWait]
	     *  The maximum time `func` is allowed to be delayed before it's invoked.
	     * @param {boolean} [options.trailing=true]
	     *  Specify invoking on the trailing edge of the timeout.
	     * @returns {Function} Returns the new debounced function.
	     * @example
	     *
	     * // Avoid costly calculations while the window size is in flux.
	     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	     *
	     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
	     * jQuery(element).on('click', _.debounce(sendMail, 300, {
	     *   'leading': true,
	     *   'trailing': false
	     * }));
	     *
	     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
	     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
	     * var source = new EventSource('/stream');
	     * jQuery(source).on('message', debounced);
	     *
	     * // Cancel the trailing debounced invocation.
	     * jQuery(window).on('popstate', debounced.cancel);
	     */
	    function debounce(func, wait, options) {
	      var lastArgs,
	          lastThis,
	          maxWait,
	          result,
	          timerId,
	          lastCallTime,
	          lastInvokeTime = 0,
	          leading = false,
	          maxing = false,
	          trailing = true;

	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      wait = toNumber(wait) || 0;
	      if (isObject(options)) {
	        leading = !!options.leading;
	        maxing = 'maxWait' in options;
	        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
	        trailing = 'trailing' in options ? !!options.trailing : trailing;
	      }

	      function invokeFunc(time) {
	        var args = lastArgs,
	            thisArg = lastThis;

	        lastArgs = lastThis = undefined$1;
	        lastInvokeTime = time;
	        result = func.apply(thisArg, args);
	        return result;
	      }

	      function leadingEdge(time) {
	        // Reset any `maxWait` timer.
	        lastInvokeTime = time;
	        // Start the timer for the trailing edge.
	        timerId = setTimeout(timerExpired, wait);
	        // Invoke the leading edge.
	        return leading ? invokeFunc(time) : result;
	      }

	      function remainingWait(time) {
	        var timeSinceLastCall = time - lastCallTime,
	            timeSinceLastInvoke = time - lastInvokeTime,
	            timeWaiting = wait - timeSinceLastCall;

	        return maxing
	          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
	          : timeWaiting;
	      }

	      function shouldInvoke(time) {
	        var timeSinceLastCall = time - lastCallTime,
	            timeSinceLastInvoke = time - lastInvokeTime;

	        // Either this is the first call, activity has stopped and we're at the
	        // trailing edge, the system time has gone backwards and we're treating
	        // it as the trailing edge, or we've hit the `maxWait` limit.
	        return (lastCallTime === undefined$1 || (timeSinceLastCall >= wait) ||
	          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
	      }

	      function timerExpired() {
	        var time = now();
	        if (shouldInvoke(time)) {
	          return trailingEdge(time);
	        }
	        // Restart the timer.
	        timerId = setTimeout(timerExpired, remainingWait(time));
	      }

	      function trailingEdge(time) {
	        timerId = undefined$1;

	        // Only invoke if we have `lastArgs` which means `func` has been
	        // debounced at least once.
	        if (trailing && lastArgs) {
	          return invokeFunc(time);
	        }
	        lastArgs = lastThis = undefined$1;
	        return result;
	      }

	      function cancel() {
	        if (timerId !== undefined$1) {
	          clearTimeout(timerId);
	        }
	        lastInvokeTime = 0;
	        lastArgs = lastCallTime = lastThis = timerId = undefined$1;
	      }

	      function flush() {
	        return timerId === undefined$1 ? result : trailingEdge(now());
	      }

	      function debounced() {
	        var time = now(),
	            isInvoking = shouldInvoke(time);

	        lastArgs = arguments;
	        lastThis = this;
	        lastCallTime = time;

	        if (isInvoking) {
	          if (timerId === undefined$1) {
	            return leadingEdge(lastCallTime);
	          }
	          if (maxing) {
	            // Handle invocations in a tight loop.
	            clearTimeout(timerId);
	            timerId = setTimeout(timerExpired, wait);
	            return invokeFunc(lastCallTime);
	          }
	        }
	        if (timerId === undefined$1) {
	          timerId = setTimeout(timerExpired, wait);
	        }
	        return result;
	      }
	      debounced.cancel = cancel;
	      debounced.flush = flush;
	      return debounced;
	    }

	    /**
	     * Defers invoking the `func` until the current call stack has cleared. Any
	     * additional arguments are provided to `func` when it's invoked.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to defer.
	     * @param {...*} [args] The arguments to invoke `func` with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.defer(function(text) {
	     *   console.log(text);
	     * }, 'deferred');
	     * // => Logs 'deferred' after one millisecond.
	     */
	    var defer = baseRest(function(func, args) {
	      return baseDelay(func, 1, args);
	    });

	    /**
	     * Invokes `func` after `wait` milliseconds. Any additional arguments are
	     * provided to `func` when it's invoked.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @param {...*} [args] The arguments to invoke `func` with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.delay(function(text) {
	     *   console.log(text);
	     * }, 1000, 'later');
	     * // => Logs 'later' after one second.
	     */
	    var delay = baseRest(function(func, wait, args) {
	      return baseDelay(func, toNumber(wait) || 0, args);
	    });

	    /**
	     * Creates a function that invokes `func` with arguments reversed.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Function
	     * @param {Function} func The function to flip arguments for.
	     * @returns {Function} Returns the new flipped function.
	     * @example
	     *
	     * var flipped = _.flip(function() {
	     *   return _.toArray(arguments);
	     * });
	     *
	     * flipped('a', 'b', 'c', 'd');
	     * // => ['d', 'c', 'b', 'a']
	     */
	    function flip(func) {
	      return createWrap(func, WRAP_FLIP_FLAG);
	    }

	    /**
	     * Creates a function that memoizes the result of `func`. If `resolver` is
	     * provided, it determines the cache key for storing the result based on the
	     * arguments provided to the memoized function. By default, the first argument
	     * provided to the memoized function is used as the map cache key. The `func`
	     * is invoked with the `this` binding of the memoized function.
	     *
	     * **Note:** The cache is exposed as the `cache` property on the memoized
	     * function. Its creation may be customized by replacing the `_.memoize.Cache`
	     * constructor with one whose instances implement the
	     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
	     * method interface of `clear`, `delete`, `get`, `has`, and `set`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to have its output memoized.
	     * @param {Function} [resolver] The function to resolve the cache key.
	     * @returns {Function} Returns the new memoized function.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2 };
	     * var other = { 'c': 3, 'd': 4 };
	     *
	     * var values = _.memoize(_.values);
	     * values(object);
	     * // => [1, 2]
	     *
	     * values(other);
	     * // => [3, 4]
	     *
	     * object.a = 2;
	     * values(object);
	     * // => [1, 2]
	     *
	     * // Modify the result cache.
	     * values.cache.set(object, ['a', 'b']);
	     * values(object);
	     * // => ['a', 'b']
	     *
	     * // Replace `_.memoize.Cache`.
	     * _.memoize.Cache = WeakMap;
	     */
	    function memoize(func, resolver) {
	      if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var memoized = function() {
	        var args = arguments,
	            key = resolver ? resolver.apply(this, args) : args[0],
	            cache = memoized.cache;

	        if (cache.has(key)) {
	          return cache.get(key);
	        }
	        var result = func.apply(this, args);
	        memoized.cache = cache.set(key, result) || cache;
	        return result;
	      };
	      memoized.cache = new (memoize.Cache || MapCache);
	      return memoized;
	    }

	    // Expose `MapCache`.
	    memoize.Cache = MapCache;

	    /**
	     * Creates a function that negates the result of the predicate `func`. The
	     * `func` predicate is invoked with the `this` binding and arguments of the
	     * created function.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Function
	     * @param {Function} predicate The predicate to negate.
	     * @returns {Function} Returns the new negated function.
	     * @example
	     *
	     * function isEven(n) {
	     *   return n % 2 == 0;
	     * }
	     *
	     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
	     * // => [1, 3, 5]
	     */
	    function negate(predicate) {
	      if (typeof predicate != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function() {
	        var args = arguments;
	        switch (args.length) {
	          case 0: return !predicate.call(this);
	          case 1: return !predicate.call(this, args[0]);
	          case 2: return !predicate.call(this, args[0], args[1]);
	          case 3: return !predicate.call(this, args[0], args[1], args[2]);
	        }
	        return !predicate.apply(this, args);
	      };
	    }

	    /**
	     * Creates a function that is restricted to invoking `func` once. Repeat calls
	     * to the function return the value of the first invocation. The `func` is
	     * invoked with the `this` binding and arguments of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var initialize = _.once(createApplication);
	     * initialize();
	     * initialize();
	     * // => `createApplication` is invoked once
	     */
	    function once(func) {
	      return before(2, func);
	    }

	    /**
	     * Creates a function that invokes `func` with its arguments transformed.
	     *
	     * @static
	     * @since 4.0.0
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to wrap.
	     * @param {...(Function|Function[])} [transforms=[_.identity]]
	     *  The argument transforms.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function doubled(n) {
	     *   return n * 2;
	     * }
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var func = _.overArgs(function(x, y) {
	     *   return [x, y];
	     * }, [square, doubled]);
	     *
	     * func(9, 3);
	     * // => [81, 6]
	     *
	     * func(10, 5);
	     * // => [100, 10]
	     */
	    var overArgs = castRest(function(func, transforms) {
	      transforms = (transforms.length == 1 && isArray(transforms[0]))
	        ? arrayMap(transforms[0], baseUnary(getIteratee()))
	        : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));

	      var funcsLength = transforms.length;
	      return baseRest(function(args) {
	        var index = -1,
	            length = nativeMin(args.length, funcsLength);

	        while (++index < length) {
	          args[index] = transforms[index].call(this, args[index]);
	        }
	        return apply(func, this, args);
	      });
	    });

	    /**
	     * Creates a function that invokes `func` with `partials` prepended to the
	     * arguments it receives. This method is like `_.bind` except it does **not**
	     * alter the `this` binding.
	     *
	     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** This method doesn't set the "length" property of partially
	     * applied functions.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.2.0
	     * @category Function
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * function greet(greeting, name) {
	     *   return greeting + ' ' + name;
	     * }
	     *
	     * var sayHelloTo = _.partial(greet, 'hello');
	     * sayHelloTo('fred');
	     * // => 'hello fred'
	     *
	     * // Partially applied with placeholders.
	     * var greetFred = _.partial(greet, _, 'fred');
	     * greetFred('hi');
	     * // => 'hi fred'
	     */
	    var partial = baseRest(function(func, partials) {
	      var holders = replaceHolders(partials, getHolder(partial));
	      return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
	    });

	    /**
	     * This method is like `_.partial` except that partially applied arguments
	     * are appended to the arguments it receives.
	     *
	     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** This method doesn't set the "length" property of partially
	     * applied functions.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.0.0
	     * @category Function
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * function greet(greeting, name) {
	     *   return greeting + ' ' + name;
	     * }
	     *
	     * var greetFred = _.partialRight(greet, 'fred');
	     * greetFred('hi');
	     * // => 'hi fred'
	     *
	     * // Partially applied with placeholders.
	     * var sayHelloTo = _.partialRight(greet, 'hello', _);
	     * sayHelloTo('fred');
	     * // => 'hello fred'
	     */
	    var partialRight = baseRest(function(func, partials) {
	      var holders = replaceHolders(partials, getHolder(partialRight));
	      return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
	    });

	    /**
	     * Creates a function that invokes `func` with arguments arranged according
	     * to the specified `indexes` where the argument value at the first index is
	     * provided as the first argument, the argument value at the second index is
	     * provided as the second argument, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Function
	     * @param {Function} func The function to rearrange arguments for.
	     * @param {...(number|number[])} indexes The arranged argument indexes.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var rearged = _.rearg(function(a, b, c) {
	     *   return [a, b, c];
	     * }, [2, 0, 1]);
	     *
	     * rearged('b', 'c', 'a')
	     * // => ['a', 'b', 'c']
	     */
	    var rearg = flatRest(function(func, indexes) {
	      return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
	    });

	    /**
	     * Creates a function that invokes `func` with the `this` binding of the
	     * created function and arguments from `start` and beyond provided as
	     * an array.
	     *
	     * **Note:** This method is based on the
	     * [rest parameter](https://mdn.io/rest_parameters).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Function
	     * @param {Function} func The function to apply a rest parameter to.
	     * @param {number} [start=func.length-1] The start position of the rest parameter.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var say = _.rest(function(what, names) {
	     *   return what + ' ' + _.initial(names).join(', ') +
	     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	     * });
	     *
	     * say('hello', 'fred', 'barney', 'pebbles');
	     * // => 'hello fred, barney, & pebbles'
	     */
	    function rest(func, start) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      start = start === undefined$1 ? start : toInteger(start);
	      return baseRest(func, start);
	    }

	    /**
	     * Creates a function that invokes `func` with the `this` binding of the
	     * create function and an array of arguments much like
	     * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
	     *
	     * **Note:** This method is based on the
	     * [spread operator](https://mdn.io/spread_operator).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.2.0
	     * @category Function
	     * @param {Function} func The function to spread arguments over.
	     * @param {number} [start=0] The start position of the spread.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var say = _.spread(function(who, what) {
	     *   return who + ' says ' + what;
	     * });
	     *
	     * say(['fred', 'hello']);
	     * // => 'fred says hello'
	     *
	     * var numbers = Promise.all([
	     *   Promise.resolve(40),
	     *   Promise.resolve(36)
	     * ]);
	     *
	     * numbers.then(_.spread(function(x, y) {
	     *   return x + y;
	     * }));
	     * // => a Promise of 76
	     */
	    function spread(func, start) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      start = start == null ? 0 : nativeMax(toInteger(start), 0);
	      return baseRest(function(args) {
	        var array = args[start],
	            otherArgs = castSlice(args, 0, start);

	        if (array) {
	          arrayPush(otherArgs, array);
	        }
	        return apply(func, this, otherArgs);
	      });
	    }

	    /**
	     * Creates a throttled function that only invokes `func` at most once per
	     * every `wait` milliseconds. The throttled function comes with a `cancel`
	     * method to cancel delayed `func` invocations and a `flush` method to
	     * immediately invoke them. Provide `options` to indicate whether `func`
	     * should be invoked on the leading and/or trailing edge of the `wait`
	     * timeout. The `func` is invoked with the last arguments provided to the
	     * throttled function. Subsequent calls to the throttled function return the
	     * result of the last `func` invocation.
	     *
	     * **Note:** If `leading` and `trailing` options are `true`, `func` is
	     * invoked on the trailing edge of the timeout only if the throttled function
	     * is invoked more than once during the `wait` timeout.
	     *
	     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
	     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
	     *
	     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
	     * for details over the differences between `_.throttle` and `_.debounce`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {Function} func The function to throttle.
	     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	     * @param {Object} [options={}] The options object.
	     * @param {boolean} [options.leading=true]
	     *  Specify invoking on the leading edge of the timeout.
	     * @param {boolean} [options.trailing=true]
	     *  Specify invoking on the trailing edge of the timeout.
	     * @returns {Function} Returns the new throttled function.
	     * @example
	     *
	     * // Avoid excessively updating the position while scrolling.
	     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	     *
	     * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
	     * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
	     * jQuery(element).on('click', throttled);
	     *
	     * // Cancel the trailing throttled invocation.
	     * jQuery(window).on('popstate', throttled.cancel);
	     */
	    function throttle(func, wait, options) {
	      var leading = true,
	          trailing = true;

	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      if (isObject(options)) {
	        leading = 'leading' in options ? !!options.leading : leading;
	        trailing = 'trailing' in options ? !!options.trailing : trailing;
	      }
	      return debounce(func, wait, {
	        'leading': leading,
	        'maxWait': wait,
	        'trailing': trailing
	      });
	    }

	    /**
	     * Creates a function that accepts up to one argument, ignoring any
	     * additional arguments.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Function
	     * @param {Function} func The function to cap arguments for.
	     * @returns {Function} Returns the new capped function.
	     * @example
	     *
	     * _.map(['6', '8', '10'], _.unary(parseInt));
	     * // => [6, 8, 10]
	     */
	    function unary(func) {
	      return ary(func, 1);
	    }

	    /**
	     * Creates a function that provides `value` to `wrapper` as its first
	     * argument. Any additional arguments provided to the function are appended
	     * to those provided to the `wrapper`. The wrapper is invoked with the `this`
	     * binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Function
	     * @param {*} value The value to wrap.
	     * @param {Function} [wrapper=identity] The wrapper function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var p = _.wrap(_.escape, function(func, text) {
	     *   return '<p>' + func(text) + '</p>';
	     * });
	     *
	     * p('fred, barney, & pebbles');
	     * // => '<p>fred, barney, &amp; pebbles</p>'
	     */
	    function wrap(value, wrapper) {
	      return partial(castFunction(wrapper), value);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Casts `value` as an array if it's not one.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.4.0
	     * @category Lang
	     * @param {*} value The value to inspect.
	     * @returns {Array} Returns the cast array.
	     * @example
	     *
	     * _.castArray(1);
	     * // => [1]
	     *
	     * _.castArray({ 'a': 1 });
	     * // => [{ 'a': 1 }]
	     *
	     * _.castArray('abc');
	     * // => ['abc']
	     *
	     * _.castArray(null);
	     * // => [null]
	     *
	     * _.castArray(undefined);
	     * // => [undefined]
	     *
	     * _.castArray();
	     * // => []
	     *
	     * var array = [1, 2, 3];
	     * console.log(_.castArray(array) === array);
	     * // => true
	     */
	    function castArray() {
	      if (!arguments.length) {
	        return [];
	      }
	      var value = arguments[0];
	      return isArray(value) ? value : [value];
	    }

	    /**
	     * Creates a shallow clone of `value`.
	     *
	     * **Note:** This method is loosely based on the
	     * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
	     * and supports cloning arrays, array buffers, booleans, date objects, maps,
	     * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
	     * arrays. The own enumerable properties of `arguments` objects are cloned
	     * as plain objects. An empty object is returned for uncloneable values such
	     * as error objects, functions, DOM nodes, and WeakMaps.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to clone.
	     * @returns {*} Returns the cloned value.
	     * @see _.cloneDeep
	     * @example
	     *
	     * var objects = [{ 'a': 1 }, { 'b': 2 }];
	     *
	     * var shallow = _.clone(objects);
	     * console.log(shallow[0] === objects[0]);
	     * // => true
	     */
	    function clone(value) {
	      return baseClone(value, CLONE_SYMBOLS_FLAG);
	    }

	    /**
	     * This method is like `_.clone` except that it accepts `customizer` which
	     * is invoked to produce the cloned value. If `customizer` returns `undefined`,
	     * cloning is handled by the method instead. The `customizer` is invoked with
	     * up to four arguments; (value [, index|key, object, stack]).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to clone.
	     * @param {Function} [customizer] The function to customize cloning.
	     * @returns {*} Returns the cloned value.
	     * @see _.cloneDeepWith
	     * @example
	     *
	     * function customizer(value) {
	     *   if (_.isElement(value)) {
	     *     return value.cloneNode(false);
	     *   }
	     * }
	     *
	     * var el = _.cloneWith(document.body, customizer);
	     *
	     * console.log(el === document.body);
	     * // => false
	     * console.log(el.nodeName);
	     * // => 'BODY'
	     * console.log(el.childNodes.length);
	     * // => 0
	     */
	    function cloneWith(value, customizer) {
	      customizer = typeof customizer == 'function' ? customizer : undefined$1;
	      return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
	    }

	    /**
	     * This method is like `_.clone` except that it recursively clones `value`.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.0.0
	     * @category Lang
	     * @param {*} value The value to recursively clone.
	     * @returns {*} Returns the deep cloned value.
	     * @see _.clone
	     * @example
	     *
	     * var objects = [{ 'a': 1 }, { 'b': 2 }];
	     *
	     * var deep = _.cloneDeep(objects);
	     * console.log(deep[0] === objects[0]);
	     * // => false
	     */
	    function cloneDeep(value) {
	      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
	    }

	    /**
	     * This method is like `_.cloneWith` except that it recursively clones `value`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to recursively clone.
	     * @param {Function} [customizer] The function to customize cloning.
	     * @returns {*} Returns the deep cloned value.
	     * @see _.cloneWith
	     * @example
	     *
	     * function customizer(value) {
	     *   if (_.isElement(value)) {
	     *     return value.cloneNode(true);
	     *   }
	     * }
	     *
	     * var el = _.cloneDeepWith(document.body, customizer);
	     *
	     * console.log(el === document.body);
	     * // => false
	     * console.log(el.nodeName);
	     * // => 'BODY'
	     * console.log(el.childNodes.length);
	     * // => 20
	     */
	    function cloneDeepWith(value, customizer) {
	      customizer = typeof customizer == 'function' ? customizer : undefined$1;
	      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
	    }

	    /**
	     * Checks if `object` conforms to `source` by invoking the predicate
	     * properties of `source` with the corresponding property values of `object`.
	     *
	     * **Note:** This method is equivalent to `_.conforms` when `source` is
	     * partially applied.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.14.0
	     * @category Lang
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property predicates to conform to.
	     * @returns {boolean} Returns `true` if `object` conforms, else `false`.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2 };
	     *
	     * _.conformsTo(object, { 'b': function(n) { return n > 1; } });
	     * // => true
	     *
	     * _.conformsTo(object, { 'b': function(n) { return n > 2; } });
	     * // => false
	     */
	    function conformsTo(object, source) {
	      return source == null || baseConformsTo(object, source, keys(source));
	    }

	    /**
	     * Performs a
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	     * comparison between two values to determine if they are equivalent.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * var object = { 'a': 1 };
	     * var other = { 'a': 1 };
	     *
	     * _.eq(object, object);
	     * // => true
	     *
	     * _.eq(object, other);
	     * // => false
	     *
	     * _.eq('a', 'a');
	     * // => true
	     *
	     * _.eq('a', Object('a'));
	     * // => false
	     *
	     * _.eq(NaN, NaN);
	     * // => true
	     */
	    function eq(value, other) {
	      return value === other || (value !== value && other !== other);
	    }

	    /**
	     * Checks if `value` is greater than `other`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.9.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is greater than `other`,
	     *  else `false`.
	     * @see _.lt
	     * @example
	     *
	     * _.gt(3, 1);
	     * // => true
	     *
	     * _.gt(3, 3);
	     * // => false
	     *
	     * _.gt(1, 3);
	     * // => false
	     */
	    var gt = createRelationalOperation(baseGt);

	    /**
	     * Checks if `value` is greater than or equal to `other`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.9.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is greater than or equal to
	     *  `other`, else `false`.
	     * @see _.lte
	     * @example
	     *
	     * _.gte(3, 1);
	     * // => true
	     *
	     * _.gte(3, 3);
	     * // => true
	     *
	     * _.gte(1, 3);
	     * // => false
	     */
	    var gte = createRelationalOperation(function(value, other) {
	      return value >= other;
	    });

	    /**
	     * Checks if `value` is likely an `arguments` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	     *  else `false`.
	     * @example
	     *
	     * _.isArguments(function() { return arguments; }());
	     * // => true
	     *
	     * _.isArguments([1, 2, 3]);
	     * // => false
	     */
	    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
	      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
	        !propertyIsEnumerable.call(value, 'callee');
	    };

	    /**
	     * Checks if `value` is classified as an `Array` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	     * @example
	     *
	     * _.isArray([1, 2, 3]);
	     * // => true
	     *
	     * _.isArray(document.body.children);
	     * // => false
	     *
	     * _.isArray('abc');
	     * // => false
	     *
	     * _.isArray(_.noop);
	     * // => false
	     */
	    var isArray = Array.isArray;

	    /**
	     * Checks if `value` is classified as an `ArrayBuffer` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.3.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
	     * @example
	     *
	     * _.isArrayBuffer(new ArrayBuffer(2));
	     * // => true
	     *
	     * _.isArrayBuffer(new Array(2));
	     * // => false
	     */
	    var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;

	    /**
	     * Checks if `value` is array-like. A value is considered array-like if it's
	     * not a function and has a `value.length` that's an integer greater than or
	     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	     * @example
	     *
	     * _.isArrayLike([1, 2, 3]);
	     * // => true
	     *
	     * _.isArrayLike(document.body.children);
	     * // => true
	     *
	     * _.isArrayLike('abc');
	     * // => true
	     *
	     * _.isArrayLike(_.noop);
	     * // => false
	     */
	    function isArrayLike(value) {
	      return value != null && isLength(value.length) && !isFunction(value);
	    }

	    /**
	     * This method is like `_.isArrayLike` except that it also checks if `value`
	     * is an object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an array-like object,
	     *  else `false`.
	     * @example
	     *
	     * _.isArrayLikeObject([1, 2, 3]);
	     * // => true
	     *
	     * _.isArrayLikeObject(document.body.children);
	     * // => true
	     *
	     * _.isArrayLikeObject('abc');
	     * // => false
	     *
	     * _.isArrayLikeObject(_.noop);
	     * // => false
	     */
	    function isArrayLikeObject(value) {
	      return isObjectLike(value) && isArrayLike(value);
	    }

	    /**
	     * Checks if `value` is classified as a boolean primitive or object.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
	     * @example
	     *
	     * _.isBoolean(false);
	     * // => true
	     *
	     * _.isBoolean(null);
	     * // => false
	     */
	    function isBoolean(value) {
	      return value === true || value === false ||
	        (isObjectLike(value) && baseGetTag(value) == boolTag);
	    }

	    /**
	     * Checks if `value` is a buffer.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.3.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	     * @example
	     *
	     * _.isBuffer(new Buffer(2));
	     * // => true
	     *
	     * _.isBuffer(new Uint8Array(2));
	     * // => false
	     */
	    var isBuffer = nativeIsBuffer || stubFalse;

	    /**
	     * Checks if `value` is classified as a `Date` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
	     * @example
	     *
	     * _.isDate(new Date);
	     * // => true
	     *
	     * _.isDate('Mon April 23 2012');
	     * // => false
	     */
	    var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

	    /**
	     * Checks if `value` is likely a DOM element.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
	     * @example
	     *
	     * _.isElement(document.body);
	     * // => true
	     *
	     * _.isElement('<body>');
	     * // => false
	     */
	    function isElement(value) {
	      return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
	    }

	    /**
	     * Checks if `value` is an empty object, collection, map, or set.
	     *
	     * Objects are considered empty if they have no own enumerable string keyed
	     * properties.
	     *
	     * Array-like values such as `arguments` objects, arrays, buffers, strings, or
	     * jQuery-like collections are considered empty if they have a `length` of `0`.
	     * Similarly, maps and sets are considered empty if they have a `size` of `0`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	     * @example
	     *
	     * _.isEmpty(null);
	     * // => true
	     *
	     * _.isEmpty(true);
	     * // => true
	     *
	     * _.isEmpty(1);
	     * // => true
	     *
	     * _.isEmpty([1, 2, 3]);
	     * // => false
	     *
	     * _.isEmpty({ 'a': 1 });
	     * // => false
	     */
	    function isEmpty(value) {
	      if (value == null) {
	        return true;
	      }
	      if (isArrayLike(value) &&
	          (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
	            isBuffer(value) || isTypedArray(value) || isArguments(value))) {
	        return !value.length;
	      }
	      var tag = getTag(value);
	      if (tag == mapTag || tag == setTag) {
	        return !value.size;
	      }
	      if (isPrototype(value)) {
	        return !baseKeys(value).length;
	      }
	      for (var key in value) {
	        if (hasOwnProperty.call(value, key)) {
	          return false;
	        }
	      }
	      return true;
	    }

	    /**
	     * Performs a deep comparison between two values to determine if they are
	     * equivalent.
	     *
	     * **Note:** This method supports comparing arrays, array buffers, booleans,
	     * date objects, error objects, maps, numbers, `Object` objects, regexes,
	     * sets, strings, symbols, and typed arrays. `Object` objects are compared
	     * by their own, not inherited, enumerable properties. Functions and DOM
	     * nodes are compared by strict equality, i.e. `===`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * var object = { 'a': 1 };
	     * var other = { 'a': 1 };
	     *
	     * _.isEqual(object, other);
	     * // => true
	     *
	     * object === other;
	     * // => false
	     */
	    function isEqual(value, other) {
	      return baseIsEqual(value, other);
	    }

	    /**
	     * This method is like `_.isEqual` except that it accepts `customizer` which
	     * is invoked to compare values. If `customizer` returns `undefined`, comparisons
	     * are handled by the method instead. The `customizer` is invoked with up to
	     * six arguments: (objValue, othValue [, index|key, object, other, stack]).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @param {Function} [customizer] The function to customize comparisons.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * function isGreeting(value) {
	     *   return /^h(?:i|ello)$/.test(value);
	     * }
	     *
	     * function customizer(objValue, othValue) {
	     *   if (isGreeting(objValue) && isGreeting(othValue)) {
	     *     return true;
	     *   }
	     * }
	     *
	     * var array = ['hello', 'goodbye'];
	     * var other = ['hi', 'goodbye'];
	     *
	     * _.isEqualWith(array, other, customizer);
	     * // => true
	     */
	    function isEqualWith(value, other, customizer) {
	      customizer = typeof customizer == 'function' ? customizer : undefined$1;
	      var result = customizer ? customizer(value, other) : undefined$1;
	      return result === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result;
	    }

	    /**
	     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
	     * `SyntaxError`, `TypeError`, or `URIError` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
	     * @example
	     *
	     * _.isError(new Error);
	     * // => true
	     *
	     * _.isError(Error);
	     * // => false
	     */
	    function isError(value) {
	      if (!isObjectLike(value)) {
	        return false;
	      }
	      var tag = baseGetTag(value);
	      return tag == errorTag || tag == domExcTag ||
	        (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
	    }

	    /**
	     * Checks if `value` is a finite primitive number.
	     *
	     * **Note:** This method is based on
	     * [`Number.isFinite`](https://mdn.io/Number/isFinite).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
	     * @example
	     *
	     * _.isFinite(3);
	     * // => true
	     *
	     * _.isFinite(Number.MIN_VALUE);
	     * // => true
	     *
	     * _.isFinite(Infinity);
	     * // => false
	     *
	     * _.isFinite('3');
	     * // => false
	     */
	    function isFinite(value) {
	      return typeof value == 'number' && nativeIsFinite(value);
	    }

	    /**
	     * Checks if `value` is classified as a `Function` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	     * @example
	     *
	     * _.isFunction(_);
	     * // => true
	     *
	     * _.isFunction(/abc/);
	     * // => false
	     */
	    function isFunction(value) {
	      if (!isObject(value)) {
	        return false;
	      }
	      // The use of `Object#toString` avoids issues with the `typeof` operator
	      // in Safari 9 which returns 'object' for typed arrays and other constructors.
	      var tag = baseGetTag(value);
	      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
	    }

	    /**
	     * Checks if `value` is an integer.
	     *
	     * **Note:** This method is based on
	     * [`Number.isInteger`](https://mdn.io/Number/isInteger).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
	     * @example
	     *
	     * _.isInteger(3);
	     * // => true
	     *
	     * _.isInteger(Number.MIN_VALUE);
	     * // => false
	     *
	     * _.isInteger(Infinity);
	     * // => false
	     *
	     * _.isInteger('3');
	     * // => false
	     */
	    function isInteger(value) {
	      return typeof value == 'number' && value == toInteger(value);
	    }

	    /**
	     * Checks if `value` is a valid array-like length.
	     *
	     * **Note:** This method is loosely based on
	     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	     * @example
	     *
	     * _.isLength(3);
	     * // => true
	     *
	     * _.isLength(Number.MIN_VALUE);
	     * // => false
	     *
	     * _.isLength(Infinity);
	     * // => false
	     *
	     * _.isLength('3');
	     * // => false
	     */
	    function isLength(value) {
	      return typeof value == 'number' &&
	        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	    }

	    /**
	     * Checks if `value` is the
	     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	     * @example
	     *
	     * _.isObject({});
	     * // => true
	     *
	     * _.isObject([1, 2, 3]);
	     * // => true
	     *
	     * _.isObject(_.noop);
	     * // => true
	     *
	     * _.isObject(null);
	     * // => false
	     */
	    function isObject(value) {
	      var type = typeof value;
	      return value != null && (type == 'object' || type == 'function');
	    }

	    /**
	     * Checks if `value` is object-like. A value is object-like if it's not `null`
	     * and has a `typeof` result of "object".
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	     * @example
	     *
	     * _.isObjectLike({});
	     * // => true
	     *
	     * _.isObjectLike([1, 2, 3]);
	     * // => true
	     *
	     * _.isObjectLike(_.noop);
	     * // => false
	     *
	     * _.isObjectLike(null);
	     * // => false
	     */
	    function isObjectLike(value) {
	      return value != null && typeof value == 'object';
	    }

	    /**
	     * Checks if `value` is classified as a `Map` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.3.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a map, else `false`.
	     * @example
	     *
	     * _.isMap(new Map);
	     * // => true
	     *
	     * _.isMap(new WeakMap);
	     * // => false
	     */
	    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

	    /**
	     * Performs a partial deep comparison between `object` and `source` to
	     * determine if `object` contains equivalent property values.
	     *
	     * **Note:** This method is equivalent to `_.matches` when `source` is
	     * partially applied.
	     *
	     * Partial comparisons will match empty array and empty object `source`
	     * values against any array or object value, respectively. See `_.isEqual`
	     * for a list of supported value comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Lang
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property values to match.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2 };
	     *
	     * _.isMatch(object, { 'b': 2 });
	     * // => true
	     *
	     * _.isMatch(object, { 'b': 1 });
	     * // => false
	     */
	    function isMatch(object, source) {
	      return object === source || baseIsMatch(object, source, getMatchData(source));
	    }

	    /**
	     * This method is like `_.isMatch` except that it accepts `customizer` which
	     * is invoked to compare values. If `customizer` returns `undefined`, comparisons
	     * are handled by the method instead. The `customizer` is invoked with five
	     * arguments: (objValue, srcValue, index|key, object, source).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property values to match.
	     * @param {Function} [customizer] The function to customize comparisons.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     * @example
	     *
	     * function isGreeting(value) {
	     *   return /^h(?:i|ello)$/.test(value);
	     * }
	     *
	     * function customizer(objValue, srcValue) {
	     *   if (isGreeting(objValue) && isGreeting(srcValue)) {
	     *     return true;
	     *   }
	     * }
	     *
	     * var object = { 'greeting': 'hello' };
	     * var source = { 'greeting': 'hi' };
	     *
	     * _.isMatchWith(object, source, customizer);
	     * // => true
	     */
	    function isMatchWith(object, source, customizer) {
	      customizer = typeof customizer == 'function' ? customizer : undefined$1;
	      return baseIsMatch(object, source, getMatchData(source), customizer);
	    }

	    /**
	     * Checks if `value` is `NaN`.
	     *
	     * **Note:** This method is based on
	     * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
	     * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
	     * `undefined` and other non-number values.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	     * @example
	     *
	     * _.isNaN(NaN);
	     * // => true
	     *
	     * _.isNaN(new Number(NaN));
	     * // => true
	     *
	     * isNaN(undefined);
	     * // => true
	     *
	     * _.isNaN(undefined);
	     * // => false
	     */
	    function isNaN(value) {
	      // An `NaN` primitive is the only value that is not equal to itself.
	      // Perform the `toStringTag` check first to avoid errors with some
	      // ActiveX objects in IE.
	      return isNumber(value) && value != +value;
	    }

	    /**
	     * Checks if `value` is a pristine native function.
	     *
	     * **Note:** This method can't reliably detect native functions in the presence
	     * of the core-js package because core-js circumvents this kind of detection.
	     * Despite multiple requests, the core-js maintainer has made it clear: any
	     * attempt to fix the detection will be obstructed. As a result, we're left
	     * with little choice but to throw an error. Unfortunately, this also affects
	     * packages, like [babel-polyfill](https://www.npmjs.com/package/babel-polyfill),
	     * which rely on core-js.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a native function,
	     *  else `false`.
	     * @example
	     *
	     * _.isNative(Array.prototype.push);
	     * // => true
	     *
	     * _.isNative(_);
	     * // => false
	     */
	    function isNative(value) {
	      if (isMaskable(value)) {
	        throw new Error(CORE_ERROR_TEXT);
	      }
	      return baseIsNative(value);
	    }

	    /**
	     * Checks if `value` is `null`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
	     * @example
	     *
	     * _.isNull(null);
	     * // => true
	     *
	     * _.isNull(void 0);
	     * // => false
	     */
	    function isNull(value) {
	      return value === null;
	    }

	    /**
	     * Checks if `value` is `null` or `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
	     * @example
	     *
	     * _.isNil(null);
	     * // => true
	     *
	     * _.isNil(void 0);
	     * // => true
	     *
	     * _.isNil(NaN);
	     * // => false
	     */
	    function isNil(value) {
	      return value == null;
	    }

	    /**
	     * Checks if `value` is classified as a `Number` primitive or object.
	     *
	     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
	     * classified as numbers, use the `_.isFinite` method.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a number, else `false`.
	     * @example
	     *
	     * _.isNumber(3);
	     * // => true
	     *
	     * _.isNumber(Number.MIN_VALUE);
	     * // => true
	     *
	     * _.isNumber(Infinity);
	     * // => true
	     *
	     * _.isNumber('3');
	     * // => false
	     */
	    function isNumber(value) {
	      return typeof value == 'number' ||
	        (isObjectLike(value) && baseGetTag(value) == numberTag);
	    }

	    /**
	     * Checks if `value` is a plain object, that is, an object created by the
	     * `Object` constructor or one with a `[[Prototype]]` of `null`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.8.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     * }
	     *
	     * _.isPlainObject(new Foo);
	     * // => false
	     *
	     * _.isPlainObject([1, 2, 3]);
	     * // => false
	     *
	     * _.isPlainObject({ 'x': 0, 'y': 0 });
	     * // => true
	     *
	     * _.isPlainObject(Object.create(null));
	     * // => true
	     */
	    function isPlainObject(value) {
	      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	        return false;
	      }
	      var proto = getPrototype(value);
	      if (proto === null) {
	        return true;
	      }
	      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
	        funcToString.call(Ctor) == objectCtorString;
	    }

	    /**
	     * Checks if `value` is classified as a `RegExp` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.1.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
	     * @example
	     *
	     * _.isRegExp(/abc/);
	     * // => true
	     *
	     * _.isRegExp('/abc/');
	     * // => false
	     */
	    var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

	    /**
	     * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
	     * double precision number which isn't the result of a rounded unsafe integer.
	     *
	     * **Note:** This method is based on
	     * [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a safe integer, else `false`.
	     * @example
	     *
	     * _.isSafeInteger(3);
	     * // => true
	     *
	     * _.isSafeInteger(Number.MIN_VALUE);
	     * // => false
	     *
	     * _.isSafeInteger(Infinity);
	     * // => false
	     *
	     * _.isSafeInteger('3');
	     * // => false
	     */
	    function isSafeInteger(value) {
	      return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
	    }

	    /**
	     * Checks if `value` is classified as a `Set` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.3.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a set, else `false`.
	     * @example
	     *
	     * _.isSet(new Set);
	     * // => true
	     *
	     * _.isSet(new WeakSet);
	     * // => false
	     */
	    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

	    /**
	     * Checks if `value` is classified as a `String` primitive or object.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a string, else `false`.
	     * @example
	     *
	     * _.isString('abc');
	     * // => true
	     *
	     * _.isString(1);
	     * // => false
	     */
	    function isString(value) {
	      return typeof value == 'string' ||
	        (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
	    }

	    /**
	     * Checks if `value` is classified as a `Symbol` primitive or object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	     * @example
	     *
	     * _.isSymbol(Symbol.iterator);
	     * // => true
	     *
	     * _.isSymbol('abc');
	     * // => false
	     */
	    function isSymbol(value) {
	      return typeof value == 'symbol' ||
	        (isObjectLike(value) && baseGetTag(value) == symbolTag);
	    }

	    /**
	     * Checks if `value` is classified as a typed array.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	     * @example
	     *
	     * _.isTypedArray(new Uint8Array);
	     * // => true
	     *
	     * _.isTypedArray([]);
	     * // => false
	     */
	    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

	    /**
	     * Checks if `value` is `undefined`.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	     * @example
	     *
	     * _.isUndefined(void 0);
	     * // => true
	     *
	     * _.isUndefined(null);
	     * // => false
	     */
	    function isUndefined(value) {
	      return value === undefined$1;
	    }

	    /**
	     * Checks if `value` is classified as a `WeakMap` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.3.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
	     * @example
	     *
	     * _.isWeakMap(new WeakMap);
	     * // => true
	     *
	     * _.isWeakMap(new Map);
	     * // => false
	     */
	    function isWeakMap(value) {
	      return isObjectLike(value) && getTag(value) == weakMapTag;
	    }

	    /**
	     * Checks if `value` is classified as a `WeakSet` object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.3.0
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
	     * @example
	     *
	     * _.isWeakSet(new WeakSet);
	     * // => true
	     *
	     * _.isWeakSet(new Set);
	     * // => false
	     */
	    function isWeakSet(value) {
	      return isObjectLike(value) && baseGetTag(value) == weakSetTag;
	    }

	    /**
	     * Checks if `value` is less than `other`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.9.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is less than `other`,
	     *  else `false`.
	     * @see _.gt
	     * @example
	     *
	     * _.lt(1, 3);
	     * // => true
	     *
	     * _.lt(3, 3);
	     * // => false
	     *
	     * _.lt(3, 1);
	     * // => false
	     */
	    var lt = createRelationalOperation(baseLt);

	    /**
	     * Checks if `value` is less than or equal to `other`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.9.0
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is less than or equal to
	     *  `other`, else `false`.
	     * @see _.gte
	     * @example
	     *
	     * _.lte(1, 3);
	     * // => true
	     *
	     * _.lte(3, 3);
	     * // => true
	     *
	     * _.lte(3, 1);
	     * // => false
	     */
	    var lte = createRelationalOperation(function(value, other) {
	      return value <= other;
	    });

	    /**
	     * Converts `value` to an array.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {Array} Returns the converted array.
	     * @example
	     *
	     * _.toArray({ 'a': 1, 'b': 2 });
	     * // => [1, 2]
	     *
	     * _.toArray('abc');
	     * // => ['a', 'b', 'c']
	     *
	     * _.toArray(1);
	     * // => []
	     *
	     * _.toArray(null);
	     * // => []
	     */
	    function toArray(value) {
	      if (!value) {
	        return [];
	      }
	      if (isArrayLike(value)) {
	        return isString(value) ? stringToArray(value) : copyArray(value);
	      }
	      if (symIterator && value[symIterator]) {
	        return iteratorToArray(value[symIterator]());
	      }
	      var tag = getTag(value),
	          func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

	      return func(value);
	    }

	    /**
	     * Converts `value` to a finite number.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.12.0
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {number} Returns the converted number.
	     * @example
	     *
	     * _.toFinite(3.2);
	     * // => 3.2
	     *
	     * _.toFinite(Number.MIN_VALUE);
	     * // => 5e-324
	     *
	     * _.toFinite(Infinity);
	     * // => 1.7976931348623157e+308
	     *
	     * _.toFinite('3.2');
	     * // => 3.2
	     */
	    function toFinite(value) {
	      if (!value) {
	        return value === 0 ? value : 0;
	      }
	      value = toNumber(value);
	      if (value === INFINITY || value === -INFINITY) {
	        var sign = (value < 0 ? -1 : 1);
	        return sign * MAX_INTEGER;
	      }
	      return value === value ? value : 0;
	    }

	    /**
	     * Converts `value` to an integer.
	     *
	     * **Note:** This method is loosely based on
	     * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {number} Returns the converted integer.
	     * @example
	     *
	     * _.toInteger(3.2);
	     * // => 3
	     *
	     * _.toInteger(Number.MIN_VALUE);
	     * // => 0
	     *
	     * _.toInteger(Infinity);
	     * // => 1.7976931348623157e+308
	     *
	     * _.toInteger('3.2');
	     * // => 3
	     */
	    function toInteger(value) {
	      var result = toFinite(value),
	          remainder = result % 1;

	      return result === result ? (remainder ? result - remainder : result) : 0;
	    }

	    /**
	     * Converts `value` to an integer suitable for use as the length of an
	     * array-like object.
	     *
	     * **Note:** This method is based on
	     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {number} Returns the converted integer.
	     * @example
	     *
	     * _.toLength(3.2);
	     * // => 3
	     *
	     * _.toLength(Number.MIN_VALUE);
	     * // => 0
	     *
	     * _.toLength(Infinity);
	     * // => 4294967295
	     *
	     * _.toLength('3.2');
	     * // => 3
	     */
	    function toLength(value) {
	      return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
	    }

	    /**
	     * Converts `value` to a number.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to process.
	     * @returns {number} Returns the number.
	     * @example
	     *
	     * _.toNumber(3.2);
	     * // => 3.2
	     *
	     * _.toNumber(Number.MIN_VALUE);
	     * // => 5e-324
	     *
	     * _.toNumber(Infinity);
	     * // => Infinity
	     *
	     * _.toNumber('3.2');
	     * // => 3.2
	     */
	    function toNumber(value) {
	      if (typeof value == 'number') {
	        return value;
	      }
	      if (isSymbol(value)) {
	        return NAN;
	      }
	      if (isObject(value)) {
	        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	        value = isObject(other) ? (other + '') : other;
	      }
	      if (typeof value != 'string') {
	        return value === 0 ? value : +value;
	      }
	      value = value.replace(reTrim, '');
	      var isBinary = reIsBinary.test(value);
	      return (isBinary || reIsOctal.test(value))
	        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	        : (reIsBadHex.test(value) ? NAN : +value);
	    }

	    /**
	     * Converts `value` to a plain object flattening inherited enumerable string
	     * keyed properties of `value` to own properties of the plain object.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {Object} Returns the converted plain object.
	     * @example
	     *
	     * function Foo() {
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.assign({ 'a': 1 }, new Foo);
	     * // => { 'a': 1, 'b': 2 }
	     *
	     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	     * // => { 'a': 1, 'b': 2, 'c': 3 }
	     */
	    function toPlainObject(value) {
	      return copyObject(value, keysIn(value));
	    }

	    /**
	     * Converts `value` to a safe integer. A safe integer can be compared and
	     * represented correctly.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {number} Returns the converted integer.
	     * @example
	     *
	     * _.toSafeInteger(3.2);
	     * // => 3
	     *
	     * _.toSafeInteger(Number.MIN_VALUE);
	     * // => 0
	     *
	     * _.toSafeInteger(Infinity);
	     * // => 9007199254740991
	     *
	     * _.toSafeInteger('3.2');
	     * // => 3
	     */
	    function toSafeInteger(value) {
	      return value
	        ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)
	        : (value === 0 ? value : 0);
	    }

	    /**
	     * Converts `value` to a string. An empty string is returned for `null`
	     * and `undefined` values. The sign of `-0` is preserved.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {string} Returns the converted string.
	     * @example
	     *
	     * _.toString(null);
	     * // => ''
	     *
	     * _.toString(-0);
	     * // => '-0'
	     *
	     * _.toString([1, 2, 3]);
	     * // => '1,2,3'
	     */
	    function toString(value) {
	      return value == null ? '' : baseToString(value);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Assigns own enumerable string keyed properties of source objects to the
	     * destination object. Source objects are applied from left to right.
	     * Subsequent sources overwrite property assignments of previous sources.
	     *
	     * **Note:** This method mutates `object` and is loosely based on
	     * [`Object.assign`](https://mdn.io/Object/assign).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.10.0
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @see _.assignIn
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     * }
	     *
	     * function Bar() {
	     *   this.c = 3;
	     * }
	     *
	     * Foo.prototype.b = 2;
	     * Bar.prototype.d = 4;
	     *
	     * _.assign({ 'a': 0 }, new Foo, new Bar);
	     * // => { 'a': 1, 'c': 3 }
	     */
	    var assign = createAssigner(function(object, source) {
	      if (isPrototype(source) || isArrayLike(source)) {
	        copyObject(source, keys(source), object);
	        return;
	      }
	      for (var key in source) {
	        if (hasOwnProperty.call(source, key)) {
	          assignValue(object, key, source[key]);
	        }
	      }
	    });

	    /**
	     * This method is like `_.assign` except that it iterates over own and
	     * inherited source properties.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @alias extend
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @see _.assign
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     * }
	     *
	     * function Bar() {
	     *   this.c = 3;
	     * }
	     *
	     * Foo.prototype.b = 2;
	     * Bar.prototype.d = 4;
	     *
	     * _.assignIn({ 'a': 0 }, new Foo, new Bar);
	     * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
	     */
	    var assignIn = createAssigner(function(object, source) {
	      copyObject(source, keysIn(source), object);
	    });

	    /**
	     * This method is like `_.assignIn` except that it accepts `customizer`
	     * which is invoked to produce the assigned values. If `customizer` returns
	     * `undefined`, assignment is handled by the method instead. The `customizer`
	     * is invoked with five arguments: (objValue, srcValue, key, object, source).
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @alias extendWith
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} sources The source objects.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @returns {Object} Returns `object`.
	     * @see _.assignWith
	     * @example
	     *
	     * function customizer(objValue, srcValue) {
	     *   return _.isUndefined(objValue) ? srcValue : objValue;
	     * }
	     *
	     * var defaults = _.partialRight(_.assignInWith, customizer);
	     *
	     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	     * // => { 'a': 1, 'b': 2 }
	     */
	    var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
	      copyObject(source, keysIn(source), object, customizer);
	    });

	    /**
	     * This method is like `_.assign` except that it accepts `customizer`
	     * which is invoked to produce the assigned values. If `customizer` returns
	     * `undefined`, assignment is handled by the method instead. The `customizer`
	     * is invoked with five arguments: (objValue, srcValue, key, object, source).
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} sources The source objects.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @returns {Object} Returns `object`.
	     * @see _.assignInWith
	     * @example
	     *
	     * function customizer(objValue, srcValue) {
	     *   return _.isUndefined(objValue) ? srcValue : objValue;
	     * }
	     *
	     * var defaults = _.partialRight(_.assignWith, customizer);
	     *
	     * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	     * // => { 'a': 1, 'b': 2 }
	     */
	    var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
	      copyObject(source, keys(source), object, customizer);
	    });

	    /**
	     * Creates an array of values corresponding to `paths` of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.0.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {...(string|string[])} [paths] The property paths to pick.
	     * @returns {Array} Returns the picked values.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
	     *
	     * _.at(object, ['a[0].b.c', 'a[1]']);
	     * // => [3, 4]
	     */
	    var at = flatRest(baseAt);

	    /**
	     * Creates an object that inherits from the `prototype` object. If a
	     * `properties` object is given, its own enumerable string keyed properties
	     * are assigned to the created object.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.3.0
	     * @category Object
	     * @param {Object} prototype The object to inherit from.
	     * @param {Object} [properties] The properties to assign to the object.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * function Circle() {
	     *   Shape.call(this);
	     * }
	     *
	     * Circle.prototype = _.create(Shape.prototype, {
	     *   'constructor': Circle
	     * });
	     *
	     * var circle = new Circle;
	     * circle instanceof Circle;
	     * // => true
	     *
	     * circle instanceof Shape;
	     * // => true
	     */
	    function create(prototype, properties) {
	      var result = baseCreate(prototype);
	      return properties == null ? result : baseAssign(result, properties);
	    }

	    /**
	     * Assigns own and inherited enumerable string keyed properties of source
	     * objects to the destination object for all destination properties that
	     * resolve to `undefined`. Source objects are applied from left to right.
	     * Once a property is set, additional values of the same property are ignored.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @see _.defaultsDeep
	     * @example
	     *
	     * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
	     * // => { 'a': 1, 'b': 2 }
	     */
	    var defaults = baseRest(function(object, sources) {
	      object = Object(object);

	      var index = -1;
	      var length = sources.length;
	      var guard = length > 2 ? sources[2] : undefined$1;

	      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	        length = 1;
	      }

	      while (++index < length) {
	        var source = sources[index];
	        var props = keysIn(source);
	        var propsIndex = -1;
	        var propsLength = props.length;

	        while (++propsIndex < propsLength) {
	          var key = props[propsIndex];
	          var value = object[key];

	          if (value === undefined$1 ||
	              (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
	            object[key] = source[key];
	          }
	        }
	      }

	      return object;
	    });

	    /**
	     * This method is like `_.defaults` except that it recursively assigns
	     * default properties.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.10.0
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @see _.defaults
	     * @example
	     *
	     * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
	     * // => { 'a': { 'b': 2, 'c': 3 } }
	     */
	    var defaultsDeep = baseRest(function(args) {
	      args.push(undefined$1, customDefaultsMerge);
	      return apply(mergeWith, undefined$1, args);
	    });

	    /**
	     * This method is like `_.find` except that it returns the key of the first
	     * element `predicate` returns truthy for instead of the element itself.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.1.0
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {string|undefined} Returns the key of the matched element,
	     *  else `undefined`.
	     * @example
	     *
	     * var users = {
	     *   'barney':  { 'age': 36, 'active': true },
	     *   'fred':    { 'age': 40, 'active': false },
	     *   'pebbles': { 'age': 1,  'active': true }
	     * };
	     *
	     * _.findKey(users, function(o) { return o.age < 40; });
	     * // => 'barney' (iteration order is not guaranteed)
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.findKey(users, { 'age': 1, 'active': true });
	     * // => 'pebbles'
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.findKey(users, ['active', false]);
	     * // => 'fred'
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.findKey(users, 'active');
	     * // => 'barney'
	     */
	    function findKey(object, predicate) {
	      return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
	    }

	    /**
	     * This method is like `_.findKey` except that it iterates over elements of
	     * a collection in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @param {Function} [predicate=_.identity] The function invoked per iteration.
	     * @returns {string|undefined} Returns the key of the matched element,
	     *  else `undefined`.
	     * @example
	     *
	     * var users = {
	     *   'barney':  { 'age': 36, 'active': true },
	     *   'fred':    { 'age': 40, 'active': false },
	     *   'pebbles': { 'age': 1,  'active': true }
	     * };
	     *
	     * _.findLastKey(users, function(o) { return o.age < 40; });
	     * // => returns 'pebbles' assuming `_.findKey` returns 'barney'
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.findLastKey(users, { 'age': 36, 'active': true });
	     * // => 'barney'
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.findLastKey(users, ['active', false]);
	     * // => 'fred'
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.findLastKey(users, 'active');
	     * // => 'pebbles'
	     */
	    function findLastKey(object, predicate) {
	      return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
	    }

	    /**
	     * Iterates over own and inherited enumerable string keyed properties of an
	     * object and invokes `iteratee` for each property. The iteratee is invoked
	     * with three arguments: (value, key, object). Iteratee functions may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.3.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     * @see _.forInRight
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forIn(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
	     */
	    function forIn(object, iteratee) {
	      return object == null
	        ? object
	        : baseFor(object, getIteratee(iteratee, 3), keysIn);
	    }

	    /**
	     * This method is like `_.forIn` except that it iterates over properties of
	     * `object` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     * @see _.forIn
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forInRight(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
	     */
	    function forInRight(object, iteratee) {
	      return object == null
	        ? object
	        : baseForRight(object, getIteratee(iteratee, 3), keysIn);
	    }

	    /**
	     * Iterates over own enumerable string keyed properties of an object and
	     * invokes `iteratee` for each property. The iteratee is invoked with three
	     * arguments: (value, key, object). Iteratee functions may exit iteration
	     * early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.3.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     * @see _.forOwnRight
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forOwn(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
	     */
	    function forOwn(object, iteratee) {
	      return object && baseForOwn(object, getIteratee(iteratee, 3));
	    }

	    /**
	     * This method is like `_.forOwn` except that it iterates over properties of
	     * `object` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.0.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     * @see _.forOwn
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forOwnRight(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => Logs 'b' then 'a' assuming `_.forOwn` logs 'a' then 'b'.
	     */
	    function forOwnRight(object, iteratee) {
	      return object && baseForOwnRight(object, getIteratee(iteratee, 3));
	    }

	    /**
	     * Creates an array of function property names from own enumerable properties
	     * of `object`.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the function names.
	     * @see _.functionsIn
	     * @example
	     *
	     * function Foo() {
	     *   this.a = _.constant('a');
	     *   this.b = _.constant('b');
	     * }
	     *
	     * Foo.prototype.c = _.constant('c');
	     *
	     * _.functions(new Foo);
	     * // => ['a', 'b']
	     */
	    function functions(object) {
	      return object == null ? [] : baseFunctions(object, keys(object));
	    }

	    /**
	     * Creates an array of function property names from own and inherited
	     * enumerable properties of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the function names.
	     * @see _.functions
	     * @example
	     *
	     * function Foo() {
	     *   this.a = _.constant('a');
	     *   this.b = _.constant('b');
	     * }
	     *
	     * Foo.prototype.c = _.constant('c');
	     *
	     * _.functionsIn(new Foo);
	     * // => ['a', 'b', 'c']
	     */
	    function functionsIn(object) {
	      return object == null ? [] : baseFunctions(object, keysIn(object));
	    }

	    /**
	     * Gets the value at `path` of `object`. If the resolved value is
	     * `undefined`, the `defaultValue` is returned in its place.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.7.0
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the property to get.
	     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	     *
	     * _.get(object, 'a[0].b.c');
	     * // => 3
	     *
	     * _.get(object, ['a', '0', 'b', 'c']);
	     * // => 3
	     *
	     * _.get(object, 'a.b.c', 'default');
	     * // => 'default'
	     */
	    function get(object, path, defaultValue) {
	      var result = object == null ? undefined$1 : baseGet(object, path);
	      return result === undefined$1 ? defaultValue : result;
	    }

	    /**
	     * Checks if `path` is a direct property of `object`.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path to check.
	     * @returns {boolean} Returns `true` if `path` exists, else `false`.
	     * @example
	     *
	     * var object = { 'a': { 'b': 2 } };
	     * var other = _.create({ 'a': _.create({ 'b': 2 }) });
	     *
	     * _.has(object, 'a');
	     * // => true
	     *
	     * _.has(object, 'a.b');
	     * // => true
	     *
	     * _.has(object, ['a', 'b']);
	     * // => true
	     *
	     * _.has(other, 'a');
	     * // => false
	     */
	    function has(object, path) {
	      return object != null && hasPath(object, path, baseHas);
	    }

	    /**
	     * Checks if `path` is a direct or inherited property of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path to check.
	     * @returns {boolean} Returns `true` if `path` exists, else `false`.
	     * @example
	     *
	     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
	     *
	     * _.hasIn(object, 'a');
	     * // => true
	     *
	     * _.hasIn(object, 'a.b');
	     * // => true
	     *
	     * _.hasIn(object, ['a', 'b']);
	     * // => true
	     *
	     * _.hasIn(object, 'b');
	     * // => false
	     */
	    function hasIn(object, path) {
	      return object != null && hasPath(object, path, baseHasIn);
	    }

	    /**
	     * Creates an object composed of the inverted keys and values of `object`.
	     * If `object` contains duplicate values, subsequent values overwrite
	     * property assignments of previous values.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.7.0
	     * @category Object
	     * @param {Object} object The object to invert.
	     * @returns {Object} Returns the new inverted object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2, 'c': 1 };
	     *
	     * _.invert(object);
	     * // => { '1': 'c', '2': 'b' }
	     */
	    var invert = createInverter(function(result, value, key) {
	      if (value != null &&
	          typeof value.toString != 'function') {
	        value = nativeObjectToString.call(value);
	      }

	      result[value] = key;
	    }, constant(identity));

	    /**
	     * This method is like `_.invert` except that the inverted object is generated
	     * from the results of running each element of `object` thru `iteratee`. The
	     * corresponding inverted value of each inverted key is an array of keys
	     * responsible for generating the inverted value. The iteratee is invoked
	     * with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.1.0
	     * @category Object
	     * @param {Object} object The object to invert.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {Object} Returns the new inverted object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2, 'c': 1 };
	     *
	     * _.invertBy(object);
	     * // => { '1': ['a', 'c'], '2': ['b'] }
	     *
	     * _.invertBy(object, function(value) {
	     *   return 'group' + value;
	     * });
	     * // => { 'group1': ['a', 'c'], 'group2': ['b'] }
	     */
	    var invertBy = createInverter(function(result, value, key) {
	      if (value != null &&
	          typeof value.toString != 'function') {
	        value = nativeObjectToString.call(value);
	      }

	      if (hasOwnProperty.call(result, value)) {
	        result[value].push(key);
	      } else {
	        result[value] = [key];
	      }
	    }, getIteratee);

	    /**
	     * Invokes the method at `path` of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the method to invoke.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {*} Returns the result of the invoked method.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
	     *
	     * _.invoke(object, 'a[0].b.c.slice', 1, 3);
	     * // => [2, 3]
	     */
	    var invoke = baseRest(baseInvoke);

	    /**
	     * Creates an array of the own enumerable property names of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects. See the
	     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	     * for more details.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.keys(new Foo);
	     * // => ['a', 'b'] (iteration order is not guaranteed)
	     *
	     * _.keys('hi');
	     * // => ['0', '1']
	     */
	    function keys(object) {
	      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	    }

	    /**
	     * Creates an array of the own and inherited enumerable property names of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.keysIn(new Foo);
	     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	     */
	    function keysIn(object) {
	      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
	    }

	    /**
	     * The opposite of `_.mapValues`; this method creates an object with the
	     * same values as `object` and keys generated by running each own enumerable
	     * string keyed property of `object` thru `iteratee`. The iteratee is invoked
	     * with three arguments: (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.8.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Object} Returns the new mapped object.
	     * @see _.mapValues
	     * @example
	     *
	     * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
	     *   return key + value;
	     * });
	     * // => { 'a1': 1, 'b2': 2 }
	     */
	    function mapKeys(object, iteratee) {
	      var result = {};
	      iteratee = getIteratee(iteratee, 3);

	      baseForOwn(object, function(value, key, object) {
	        baseAssignValue(result, iteratee(value, key, object), value);
	      });
	      return result;
	    }

	    /**
	     * Creates an object with the same keys as `object` and values generated
	     * by running each own enumerable string keyed property of `object` thru
	     * `iteratee`. The iteratee is invoked with three arguments:
	     * (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @since 2.4.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Object} Returns the new mapped object.
	     * @see _.mapKeys
	     * @example
	     *
	     * var users = {
	     *   'fred':    { 'user': 'fred',    'age': 40 },
	     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	     * };
	     *
	     * _.mapValues(users, function(o) { return o.age; });
	     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.mapValues(users, 'age');
	     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	     */
	    function mapValues(object, iteratee) {
	      var result = {};
	      iteratee = getIteratee(iteratee, 3);

	      baseForOwn(object, function(value, key, object) {
	        baseAssignValue(result, key, iteratee(value, key, object));
	      });
	      return result;
	    }

	    /**
	     * This method is like `_.assign` except that it recursively merges own and
	     * inherited enumerable string keyed properties of source objects into the
	     * destination object. Source properties that resolve to `undefined` are
	     * skipped if a destination value exists. Array and plain object properties
	     * are merged recursively. Other objects and value types are overridden by
	     * assignment. Source objects are applied from left to right. Subsequent
	     * sources overwrite property assignments of previous sources.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.5.0
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var object = {
	     *   'a': [{ 'b': 2 }, { 'd': 4 }]
	     * };
	     *
	     * var other = {
	     *   'a': [{ 'c': 3 }, { 'e': 5 }]
	     * };
	     *
	     * _.merge(object, other);
	     * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
	     */
	    var merge = createAssigner(function(object, source, srcIndex) {
	      baseMerge(object, source, srcIndex);
	    });

	    /**
	     * This method is like `_.merge` except that it accepts `customizer` which
	     * is invoked to produce the merged values of the destination and source
	     * properties. If `customizer` returns `undefined`, merging is handled by the
	     * method instead. The `customizer` is invoked with six arguments:
	     * (objValue, srcValue, key, object, source, stack).
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} sources The source objects.
	     * @param {Function} customizer The function to customize assigned values.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function customizer(objValue, srcValue) {
	     *   if (_.isArray(objValue)) {
	     *     return objValue.concat(srcValue);
	     *   }
	     * }
	     *
	     * var object = { 'a': [1], 'b': [2] };
	     * var other = { 'a': [3], 'b': [4] };
	     *
	     * _.mergeWith(object, other, customizer);
	     * // => { 'a': [1, 3], 'b': [2, 4] }
	     */
	    var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
	      baseMerge(object, source, srcIndex, customizer);
	    });

	    /**
	     * The opposite of `_.pick`; this method creates an object composed of the
	     * own and inherited enumerable property paths of `object` that are not omitted.
	     *
	     * **Note:** This method is considerably slower than `_.pick`.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {...(string|string[])} [paths] The property paths to omit.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': '2', 'c': 3 };
	     *
	     * _.omit(object, ['a', 'c']);
	     * // => { 'b': '2' }
	     */
	    var omit = flatRest(function(object, paths) {
	      var result = {};
	      if (object == null) {
	        return result;
	      }
	      var isDeep = false;
	      paths = arrayMap(paths, function(path) {
	        path = castPath(path, object);
	        isDeep || (isDeep = path.length > 1);
	        return path;
	      });
	      copyObject(object, getAllKeysIn(object), result);
	      if (isDeep) {
	        result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
	      }
	      var length = paths.length;
	      while (length--) {
	        baseUnset(result, paths[length]);
	      }
	      return result;
	    });

	    /**
	     * The opposite of `_.pickBy`; this method creates an object composed of
	     * the own and inherited enumerable string keyed properties of `object` that
	     * `predicate` doesn't return truthy for. The predicate is invoked with two
	     * arguments: (value, key).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {Function} [predicate=_.identity] The function invoked per property.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': '2', 'c': 3 };
	     *
	     * _.omitBy(object, _.isNumber);
	     * // => { 'b': '2' }
	     */
	    function omitBy(object, predicate) {
	      return pickBy(object, negate(getIteratee(predicate)));
	    }

	    /**
	     * Creates an object composed of the picked `object` properties.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {...(string|string[])} [paths] The property paths to pick.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': '2', 'c': 3 };
	     *
	     * _.pick(object, ['a', 'c']);
	     * // => { 'a': 1, 'c': 3 }
	     */
	    var pick = flatRest(function(object, paths) {
	      return object == null ? {} : basePick(object, paths);
	    });

	    /**
	     * Creates an object composed of the `object` properties `predicate` returns
	     * truthy for. The predicate is invoked with two arguments: (value, key).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {Function} [predicate=_.identity] The function invoked per property.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': '2', 'c': 3 };
	     *
	     * _.pickBy(object, _.isNumber);
	     * // => { 'a': 1, 'c': 3 }
	     */
	    function pickBy(object, predicate) {
	      if (object == null) {
	        return {};
	      }
	      var props = arrayMap(getAllKeysIn(object), function(prop) {
	        return [prop];
	      });
	      predicate = getIteratee(predicate);
	      return basePickBy(object, props, function(value, path) {
	        return predicate(value, path[0]);
	      });
	    }

	    /**
	     * This method is like `_.get` except that if the resolved value is a
	     * function it's invoked with the `this` binding of its parent object and
	     * its result is returned.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the property to resolve.
	     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
	     *
	     * _.result(object, 'a[0].b.c1');
	     * // => 3
	     *
	     * _.result(object, 'a[0].b.c2');
	     * // => 4
	     *
	     * _.result(object, 'a[0].b.c3', 'default');
	     * // => 'default'
	     *
	     * _.result(object, 'a[0].b.c3', _.constant('default'));
	     * // => 'default'
	     */
	    function result(object, path, defaultValue) {
	      path = castPath(path, object);

	      var index = -1,
	          length = path.length;

	      // Ensure the loop is entered when path is empty.
	      if (!length) {
	        length = 1;
	        object = undefined$1;
	      }
	      while (++index < length) {
	        var value = object == null ? undefined$1 : object[toKey(path[index])];
	        if (value === undefined$1) {
	          index = length;
	          value = defaultValue;
	        }
	        object = isFunction(value) ? value.call(object) : value;
	      }
	      return object;
	    }

	    /**
	     * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
	     * it's created. Arrays are created for missing index properties while objects
	     * are created for all other missing properties. Use `_.setWith` to customize
	     * `path` creation.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.7.0
	     * @category Object
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to set.
	     * @param {*} value The value to set.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	     *
	     * _.set(object, 'a[0].b.c', 4);
	     * console.log(object.a[0].b.c);
	     * // => 4
	     *
	     * _.set(object, ['x', '0', 'y', 'z'], 5);
	     * console.log(object.x[0].y.z);
	     * // => 5
	     */
	    function set(object, path, value) {
	      return object == null ? object : baseSet(object, path, value);
	    }

	    /**
	     * This method is like `_.set` except that it accepts `customizer` which is
	     * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
	     * path creation is handled by the method instead. The `customizer` is invoked
	     * with three arguments: (nsValue, key, nsObject).
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to set.
	     * @param {*} value The value to set.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var object = {};
	     *
	     * _.setWith(object, '[0][1]', 'a', Object);
	     * // => { '0': { '1': 'a' } }
	     */
	    function setWith(object, path, value, customizer) {
	      customizer = typeof customizer == 'function' ? customizer : undefined$1;
	      return object == null ? object : baseSet(object, path, value, customizer);
	    }

	    /**
	     * Creates an array of own enumerable string keyed-value pairs for `object`
	     * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
	     * entries are returned.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @alias entries
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the key-value pairs.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.toPairs(new Foo);
	     * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
	     */
	    var toPairs = createToPairs(keys);

	    /**
	     * Creates an array of own and inherited enumerable string keyed-value pairs
	     * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
	     * or set, its entries are returned.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @alias entriesIn
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the key-value pairs.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.toPairsIn(new Foo);
	     * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
	     */
	    var toPairsIn = createToPairs(keysIn);

	    /**
	     * An alternative to `_.reduce`; this method transforms `object` to a new
	     * `accumulator` object which is the result of running each of its own
	     * enumerable string keyed properties thru `iteratee`, with each invocation
	     * potentially mutating the `accumulator` object. If `accumulator` is not
	     * provided, a new object with the same `[[Prototype]]` will be used. The
	     * iteratee is invoked with four arguments: (accumulator, value, key, object).
	     * Iteratee functions may exit iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.3.0
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The custom accumulator value.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * _.transform([2, 3, 4], function(result, n) {
	     *   result.push(n *= n);
	     *   return n % 2 == 0;
	     * }, []);
	     * // => [4, 9]
	     *
	     * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
	     *   (result[value] || (result[value] = [])).push(key);
	     * }, {});
	     * // => { '1': ['a', 'c'], '2': ['b'] }
	     */
	    function transform(object, iteratee, accumulator) {
	      var isArr = isArray(object),
	          isArrLike = isArr || isBuffer(object) || isTypedArray(object);

	      iteratee = getIteratee(iteratee, 4);
	      if (accumulator == null) {
	        var Ctor = object && object.constructor;
	        if (isArrLike) {
	          accumulator = isArr ? new Ctor : [];
	        }
	        else if (isObject(object)) {
	          accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
	        }
	        else {
	          accumulator = {};
	        }
	      }
	      (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
	        return iteratee(accumulator, value, index, object);
	      });
	      return accumulator;
	    }

	    /**
	     * Removes the property at `path` of `object`.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Object
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to unset.
	     * @returns {boolean} Returns `true` if the property is deleted, else `false`.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 7 } }] };
	     * _.unset(object, 'a[0].b.c');
	     * // => true
	     *
	     * console.log(object);
	     * // => { 'a': [{ 'b': {} }] };
	     *
	     * _.unset(object, ['a', '0', 'b', 'c']);
	     * // => true
	     *
	     * console.log(object);
	     * // => { 'a': [{ 'b': {} }] };
	     */
	    function unset(object, path) {
	      return object == null ? true : baseUnset(object, path);
	    }

	    /**
	     * This method is like `_.set` except that accepts `updater` to produce the
	     * value to set. Use `_.updateWith` to customize `path` creation. The `updater`
	     * is invoked with one argument: (value).
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.6.0
	     * @category Object
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to set.
	     * @param {Function} updater The function to produce the updated value.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	     *
	     * _.update(object, 'a[0].b.c', function(n) { return n * n; });
	     * console.log(object.a[0].b.c);
	     * // => 9
	     *
	     * _.update(object, 'x[0].y.z', function(n) { return n ? n + 1 : 0; });
	     * console.log(object.x[0].y.z);
	     * // => 0
	     */
	    function update(object, path, updater) {
	      return object == null ? object : baseUpdate(object, path, castFunction(updater));
	    }

	    /**
	     * This method is like `_.update` except that it accepts `customizer` which is
	     * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
	     * path creation is handled by the method instead. The `customizer` is invoked
	     * with three arguments: (nsValue, key, nsObject).
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.6.0
	     * @category Object
	     * @param {Object} object The object to modify.
	     * @param {Array|string} path The path of the property to set.
	     * @param {Function} updater The function to produce the updated value.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var object = {};
	     *
	     * _.updateWith(object, '[0][1]', _.constant('a'), Object);
	     * // => { '0': { '1': 'a' } }
	     */
	    function updateWith(object, path, updater, customizer) {
	      customizer = typeof customizer == 'function' ? customizer : undefined$1;
	      return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
	    }

	    /**
	     * Creates an array of the own enumerable string keyed property values of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property values.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.values(new Foo);
	     * // => [1, 2] (iteration order is not guaranteed)
	     *
	     * _.values('hi');
	     * // => ['h', 'i']
	     */
	    function values(object) {
	      return object == null ? [] : baseValues(object, keys(object));
	    }

	    /**
	     * Creates an array of the own and inherited enumerable string keyed property
	     * values of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property values.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.valuesIn(new Foo);
	     * // => [1, 2, 3] (iteration order is not guaranteed)
	     */
	    function valuesIn(object) {
	      return object == null ? [] : baseValues(object, keysIn(object));
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Clamps `number` within the inclusive `lower` and `upper` bounds.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Number
	     * @param {number} number The number to clamp.
	     * @param {number} [lower] The lower bound.
	     * @param {number} upper The upper bound.
	     * @returns {number} Returns the clamped number.
	     * @example
	     *
	     * _.clamp(-10, -5, 5);
	     * // => -5
	     *
	     * _.clamp(10, -5, 5);
	     * // => 5
	     */
	    function clamp(number, lower, upper) {
	      if (upper === undefined$1) {
	        upper = lower;
	        lower = undefined$1;
	      }
	      if (upper !== undefined$1) {
	        upper = toNumber(upper);
	        upper = upper === upper ? upper : 0;
	      }
	      if (lower !== undefined$1) {
	        lower = toNumber(lower);
	        lower = lower === lower ? lower : 0;
	      }
	      return baseClamp(toNumber(number), lower, upper);
	    }

	    /**
	     * Checks if `n` is between `start` and up to, but not including, `end`. If
	     * `end` is not specified, it's set to `start` with `start` then set to `0`.
	     * If `start` is greater than `end` the params are swapped to support
	     * negative ranges.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.3.0
	     * @category Number
	     * @param {number} number The number to check.
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
	     * @see _.range, _.rangeRight
	     * @example
	     *
	     * _.inRange(3, 2, 4);
	     * // => true
	     *
	     * _.inRange(4, 8);
	     * // => true
	     *
	     * _.inRange(4, 2);
	     * // => false
	     *
	     * _.inRange(2, 2);
	     * // => false
	     *
	     * _.inRange(1.2, 2);
	     * // => true
	     *
	     * _.inRange(5.2, 4);
	     * // => false
	     *
	     * _.inRange(-3, -2, -6);
	     * // => true
	     */
	    function inRange(number, start, end) {
	      start = toFinite(start);
	      if (end === undefined$1) {
	        end = start;
	        start = 0;
	      } else {
	        end = toFinite(end);
	      }
	      number = toNumber(number);
	      return baseInRange(number, start, end);
	    }

	    /**
	     * Produces a random number between the inclusive `lower` and `upper` bounds.
	     * If only one argument is provided a number between `0` and the given number
	     * is returned. If `floating` is `true`, or either `lower` or `upper` are
	     * floats, a floating-point number is returned instead of an integer.
	     *
	     * **Note:** JavaScript follows the IEEE-754 standard for resolving
	     * floating-point values which can produce unexpected results.
	     *
	     * @static
	     * @memberOf _
	     * @since 0.7.0
	     * @category Number
	     * @param {number} [lower=0] The lower bound.
	     * @param {number} [upper=1] The upper bound.
	     * @param {boolean} [floating] Specify returning a floating-point number.
	     * @returns {number} Returns the random number.
	     * @example
	     *
	     * _.random(0, 5);
	     * // => an integer between 0 and 5
	     *
	     * _.random(5);
	     * // => also an integer between 0 and 5
	     *
	     * _.random(5, true);
	     * // => a floating-point number between 0 and 5
	     *
	     * _.random(1.2, 5.2);
	     * // => a floating-point number between 1.2 and 5.2
	     */
	    function random(lower, upper, floating) {
	      if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
	        upper = floating = undefined$1;
	      }
	      if (floating === undefined$1) {
	        if (typeof upper == 'boolean') {
	          floating = upper;
	          upper = undefined$1;
	        }
	        else if (typeof lower == 'boolean') {
	          floating = lower;
	          lower = undefined$1;
	        }
	      }
	      if (lower === undefined$1 && upper === undefined$1) {
	        lower = 0;
	        upper = 1;
	      }
	      else {
	        lower = toFinite(lower);
	        if (upper === undefined$1) {
	          upper = lower;
	          lower = 0;
	        } else {
	          upper = toFinite(upper);
	        }
	      }
	      if (lower > upper) {
	        var temp = lower;
	        lower = upper;
	        upper = temp;
	      }
	      if (floating || lower % 1 || upper % 1) {
	        var rand = nativeRandom();
	        return nativeMin(lower + (rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1)))), upper);
	      }
	      return baseRandom(lower, upper);
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the camel cased string.
	     * @example
	     *
	     * _.camelCase('Foo Bar');
	     * // => 'fooBar'
	     *
	     * _.camelCase('--foo-bar--');
	     * // => 'fooBar'
	     *
	     * _.camelCase('__FOO_BAR__');
	     * // => 'fooBar'
	     */
	    var camelCase = createCompounder(function(result, word, index) {
	      word = word.toLowerCase();
	      return result + (index ? capitalize(word) : word);
	    });

	    /**
	     * Converts the first character of `string` to upper case and the remaining
	     * to lower case.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to capitalize.
	     * @returns {string} Returns the capitalized string.
	     * @example
	     *
	     * _.capitalize('FRED');
	     * // => 'Fred'
	     */
	    function capitalize(string) {
	      return upperFirst(toString(string).toLowerCase());
	    }

	    /**
	     * Deburrs `string` by converting
	     * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	     * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
	     * letters to basic Latin letters and removing
	     * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to deburr.
	     * @returns {string} Returns the deburred string.
	     * @example
	     *
	     * _.deburr('déjà vu');
	     * // => 'deja vu'
	     */
	    function deburr(string) {
	      string = toString(string);
	      return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
	    }

	    /**
	     * Checks if `string` ends with the given target string.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to inspect.
	     * @param {string} [target] The string to search for.
	     * @param {number} [position=string.length] The position to search up to.
	     * @returns {boolean} Returns `true` if `string` ends with `target`,
	     *  else `false`.
	     * @example
	     *
	     * _.endsWith('abc', 'c');
	     * // => true
	     *
	     * _.endsWith('abc', 'b');
	     * // => false
	     *
	     * _.endsWith('abc', 'b', 2);
	     * // => true
	     */
	    function endsWith(string, target, position) {
	      string = toString(string);
	      target = baseToString(target);

	      var length = string.length;
	      position = position === undefined$1
	        ? length
	        : baseClamp(toInteger(position), 0, length);

	      var end = position;
	      position -= target.length;
	      return position >= 0 && string.slice(position, end) == target;
	    }

	    /**
	     * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
	     * corresponding HTML entities.
	     *
	     * **Note:** No other characters are escaped. To escape additional
	     * characters use a third-party library like [_he_](https://mths.be/he).
	     *
	     * Though the ">" character is escaped for symmetry, characters like
	     * ">" and "/" don't need escaping in HTML and have no special meaning
	     * unless they're part of a tag or unquoted attribute value. See
	     * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
	     * (under "semi-related fun fact") for more details.
	     *
	     * When working with HTML you should always
	     * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
	     * XSS vectors.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escape('fred, barney, & pebbles');
	     * // => 'fred, barney, &amp; pebbles'
	     */
	    function escape(string) {
	      string = toString(string);
	      return (string && reHasUnescapedHtml.test(string))
	        ? string.replace(reUnescapedHtml, escapeHtmlChar)
	        : string;
	    }

	    /**
	     * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
	     * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escapeRegExp('[lodash](https://lodash.com/)');
	     * // => '\[lodash\]\(https://lodash\.com/\)'
	     */
	    function escapeRegExp(string) {
	      string = toString(string);
	      return (string && reHasRegExpChar.test(string))
	        ? string.replace(reRegExpChar, '\\$&')
	        : string;
	    }

	    /**
	     * Converts `string` to
	     * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the kebab cased string.
	     * @example
	     *
	     * _.kebabCase('Foo Bar');
	     * // => 'foo-bar'
	     *
	     * _.kebabCase('fooBar');
	     * // => 'foo-bar'
	     *
	     * _.kebabCase('__FOO_BAR__');
	     * // => 'foo-bar'
	     */
	    var kebabCase = createCompounder(function(result, word, index) {
	      return result + (index ? '-' : '') + word.toLowerCase();
	    });

	    /**
	     * Converts `string`, as space separated words, to lower case.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the lower cased string.
	     * @example
	     *
	     * _.lowerCase('--Foo-Bar--');
	     * // => 'foo bar'
	     *
	     * _.lowerCase('fooBar');
	     * // => 'foo bar'
	     *
	     * _.lowerCase('__FOO_BAR__');
	     * // => 'foo bar'
	     */
	    var lowerCase = createCompounder(function(result, word, index) {
	      return result + (index ? ' ' : '') + word.toLowerCase();
	    });

	    /**
	     * Converts the first character of `string` to lower case.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the converted string.
	     * @example
	     *
	     * _.lowerFirst('Fred');
	     * // => 'fred'
	     *
	     * _.lowerFirst('FRED');
	     * // => 'fRED'
	     */
	    var lowerFirst = createCaseFirst('toLowerCase');

	    /**
	     * Pads `string` on the left and right sides if it's shorter than `length`.
	     * Padding characters are truncated if they can't be evenly divided by `length`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.pad('abc', 8);
	     * // => '  abc   '
	     *
	     * _.pad('abc', 8, '_-');
	     * // => '_-abc_-_'
	     *
	     * _.pad('abc', 3);
	     * // => 'abc'
	     */
	    function pad(string, length, chars) {
	      string = toString(string);
	      length = toInteger(length);

	      var strLength = length ? stringSize(string) : 0;
	      if (!length || strLength >= length) {
	        return string;
	      }
	      var mid = (length - strLength) / 2;
	      return (
	        createPadding(nativeFloor(mid), chars) +
	        string +
	        createPadding(nativeCeil(mid), chars)
	      );
	    }

	    /**
	     * Pads `string` on the right side if it's shorter than `length`. Padding
	     * characters are truncated if they exceed `length`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.padEnd('abc', 6);
	     * // => 'abc   '
	     *
	     * _.padEnd('abc', 6, '_-');
	     * // => 'abc_-_'
	     *
	     * _.padEnd('abc', 3);
	     * // => 'abc'
	     */
	    function padEnd(string, length, chars) {
	      string = toString(string);
	      length = toInteger(length);

	      var strLength = length ? stringSize(string) : 0;
	      return (length && strLength < length)
	        ? (string + createPadding(length - strLength, chars))
	        : string;
	    }

	    /**
	     * Pads `string` on the left side if it's shorter than `length`. Padding
	     * characters are truncated if they exceed `length`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.padStart('abc', 6);
	     * // => '   abc'
	     *
	     * _.padStart('abc', 6, '_-');
	     * // => '_-_abc'
	     *
	     * _.padStart('abc', 3);
	     * // => 'abc'
	     */
	    function padStart(string, length, chars) {
	      string = toString(string);
	      length = toInteger(length);

	      var strLength = length ? stringSize(string) : 0;
	      return (length && strLength < length)
	        ? (createPadding(length - strLength, chars) + string)
	        : string;
	    }

	    /**
	     * Converts `string` to an integer of the specified radix. If `radix` is
	     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a
	     * hexadecimal, in which case a `radix` of `16` is used.
	     *
	     * **Note:** This method aligns with the
	     * [ES5 implementation](https://es5.github.io/#x15.1.2.2) of `parseInt`.
	     *
	     * @static
	     * @memberOf _
	     * @since 1.1.0
	     * @category String
	     * @param {string} string The string to convert.
	     * @param {number} [radix=10] The radix to interpret `value` by.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {number} Returns the converted integer.
	     * @example
	     *
	     * _.parseInt('08');
	     * // => 8
	     *
	     * _.map(['6', '08', '10'], _.parseInt);
	     * // => [6, 8, 10]
	     */
	    function parseInt(string, radix, guard) {
	      if (guard || radix == null) {
	        radix = 0;
	      } else if (radix) {
	        radix = +radix;
	      }
	      return nativeParseInt(toString(string).replace(reTrimStart, ''), radix || 0);
	    }

	    /**
	     * Repeats the given string `n` times.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to repeat.
	     * @param {number} [n=1] The number of times to repeat the string.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {string} Returns the repeated string.
	     * @example
	     *
	     * _.repeat('*', 3);
	     * // => '***'
	     *
	     * _.repeat('abc', 2);
	     * // => 'abcabc'
	     *
	     * _.repeat('abc', 0);
	     * // => ''
	     */
	    function repeat(string, n, guard) {
	      if ((guard ? isIterateeCall(string, n, guard) : n === undefined$1)) {
	        n = 1;
	      } else {
	        n = toInteger(n);
	      }
	      return baseRepeat(toString(string), n);
	    }

	    /**
	     * Replaces matches for `pattern` in `string` with `replacement`.
	     *
	     * **Note:** This method is based on
	     * [`String#replace`](https://mdn.io/String/replace).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to modify.
	     * @param {RegExp|string} pattern The pattern to replace.
	     * @param {Function|string} replacement The match replacement.
	     * @returns {string} Returns the modified string.
	     * @example
	     *
	     * _.replace('Hi Fred', 'Fred', 'Barney');
	     * // => 'Hi Barney'
	     */
	    function replace() {
	      var args = arguments,
	          string = toString(args[0]);

	      return args.length < 3 ? string : string.replace(args[1], args[2]);
	    }

	    /**
	     * Converts `string` to
	     * [snake case](https://en.wikipedia.org/wiki/Snake_case).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the snake cased string.
	     * @example
	     *
	     * _.snakeCase('Foo Bar');
	     * // => 'foo_bar'
	     *
	     * _.snakeCase('fooBar');
	     * // => 'foo_bar'
	     *
	     * _.snakeCase('--FOO-BAR--');
	     * // => 'foo_bar'
	     */
	    var snakeCase = createCompounder(function(result, word, index) {
	      return result + (index ? '_' : '') + word.toLowerCase();
	    });

	    /**
	     * Splits `string` by `separator`.
	     *
	     * **Note:** This method is based on
	     * [`String#split`](https://mdn.io/String/split).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to split.
	     * @param {RegExp|string} separator The separator pattern to split by.
	     * @param {number} [limit] The length to truncate results to.
	     * @returns {Array} Returns the string segments.
	     * @example
	     *
	     * _.split('a-b-c', '-', 2);
	     * // => ['a', 'b']
	     */
	    function split(string, separator, limit) {
	      if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
	        separator = limit = undefined$1;
	      }
	      limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
	      if (!limit) {
	        return [];
	      }
	      string = toString(string);
	      if (string && (
	            typeof separator == 'string' ||
	            (separator != null && !isRegExp(separator))
	          )) {
	        separator = baseToString(separator);
	        if (!separator && hasUnicode(string)) {
	          return castSlice(stringToArray(string), 0, limit);
	        }
	      }
	      return string.split(separator, limit);
	    }

	    /**
	     * Converts `string` to
	     * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
	     *
	     * @static
	     * @memberOf _
	     * @since 3.1.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the start cased string.
	     * @example
	     *
	     * _.startCase('--foo-bar--');
	     * // => 'Foo Bar'
	     *
	     * _.startCase('fooBar');
	     * // => 'Foo Bar'
	     *
	     * _.startCase('__FOO_BAR__');
	     * // => 'FOO BAR'
	     */
	    var startCase = createCompounder(function(result, word, index) {
	      return result + (index ? ' ' : '') + upperFirst(word);
	    });

	    /**
	     * Checks if `string` starts with the given target string.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to inspect.
	     * @param {string} [target] The string to search for.
	     * @param {number} [position=0] The position to search from.
	     * @returns {boolean} Returns `true` if `string` starts with `target`,
	     *  else `false`.
	     * @example
	     *
	     * _.startsWith('abc', 'a');
	     * // => true
	     *
	     * _.startsWith('abc', 'b');
	     * // => false
	     *
	     * _.startsWith('abc', 'b', 1);
	     * // => true
	     */
	    function startsWith(string, target, position) {
	      string = toString(string);
	      position = position == null
	        ? 0
	        : baseClamp(toInteger(position), 0, string.length);

	      target = baseToString(target);
	      return string.slice(position, position + target.length) == target;
	    }

	    /**
	     * Creates a compiled template function that can interpolate data properties
	     * in "interpolate" delimiters, HTML-escape interpolated data properties in
	     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
	     * properties may be accessed as free variables in the template. If a setting
	     * object is given, it takes precedence over `_.templateSettings` values.
	     *
	     * **Note:** In the development build `_.template` utilizes
	     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
	     * for easier debugging.
	     *
	     * For more information on precompiling templates see
	     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
	     *
	     * For more information on Chrome extension sandboxes see
	     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The template string.
	     * @param {Object} [options={}] The options object.
	     * @param {RegExp} [options.escape=_.templateSettings.escape]
	     *  The HTML "escape" delimiter.
	     * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
	     *  The "evaluate" delimiter.
	     * @param {Object} [options.imports=_.templateSettings.imports]
	     *  An object to import into the template as free variables.
	     * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
	     *  The "interpolate" delimiter.
	     * @param {string} [options.sourceURL='lodash.templateSources[n]']
	     *  The sourceURL of the compiled template.
	     * @param {string} [options.variable='obj']
	     *  The data object variable name.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Function} Returns the compiled template function.
	     * @example
	     *
	     * // Use the "interpolate" delimiter to create a compiled template.
	     * var compiled = _.template('hello <%= user %>!');
	     * compiled({ 'user': 'fred' });
	     * // => 'hello fred!'
	     *
	     * // Use the HTML "escape" delimiter to escape data property values.
	     * var compiled = _.template('<b><%- value %></b>');
	     * compiled({ 'value': '<script>' });
	     * // => '<b>&lt;script&gt;</b>'
	     *
	     * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
	     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
	     * compiled({ 'users': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // Use the internal `print` function in "evaluate" delimiters.
	     * var compiled = _.template('<% print("hello " + user); %>!');
	     * compiled({ 'user': 'barney' });
	     * // => 'hello barney!'
	     *
	     * // Use the ES template literal delimiter as an "interpolate" delimiter.
	     * // Disable support by replacing the "interpolate" delimiter.
	     * var compiled = _.template('hello ${ user }!');
	     * compiled({ 'user': 'pebbles' });
	     * // => 'hello pebbles!'
	     *
	     * // Use backslashes to treat delimiters as plain text.
	     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
	     * compiled({ 'value': 'ignored' });
	     * // => '<%- value %>'
	     *
	     * // Use the `imports` option to import `jQuery` as `jq`.
	     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
	     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
	     * compiled({ 'users': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // Use the `sourceURL` option to specify a custom sourceURL for the template.
	     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
	     * compiled(data);
	     * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
	     *
	     * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
	     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
	     * compiled.source;
	     * // => function(data) {
	     * //   var __t, __p = '';
	     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
	     * //   return __p;
	     * // }
	     *
	     * // Use custom template delimiters.
	     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
	     * var compiled = _.template('hello {{ user }}!');
	     * compiled({ 'user': 'mustache' });
	     * // => 'hello mustache!'
	     *
	     * // Use the `source` property to inline compiled templates for meaningful
	     * // line numbers in error messages and stack traces.
	     * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
	     *   var JST = {\
	     *     "main": ' + _.template(mainText).source + '\
	     *   };\
	     * ');
	     */
	    function template(string, options, guard) {
	      // Based on John Resig's `tmpl` implementation
	      // (http://ejohn.org/blog/javascript-micro-templating/)
	      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
	      var settings = lodash.templateSettings;

	      if (guard && isIterateeCall(string, options, guard)) {
	        options = undefined$1;
	      }
	      string = toString(string);
	      options = assignInWith({}, options, settings, customDefaultsAssignIn);

	      var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
	          importsKeys = keys(imports),
	          importsValues = baseValues(imports, importsKeys);

	      var isEscaping,
	          isEvaluating,
	          index = 0,
	          interpolate = options.interpolate || reNoMatch,
	          source = "__p += '";

	      // Compile the regexp to match each delimiter.
	      var reDelimiters = RegExp(
	        (options.escape || reNoMatch).source + '|' +
	        interpolate.source + '|' +
	        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
	        (options.evaluate || reNoMatch).source + '|$'
	      , 'g');

	      // Use a sourceURL for easier debugging.
	      // The sourceURL gets injected into the source that's eval-ed, so be careful
	      // with lookup (in case of e.g. prototype pollution), and strip newlines if any.
	      // A newline wouldn't be a valid sourceURL anyway, and it'd enable code injection.
	      var sourceURL = '//# sourceURL=' +
	        (hasOwnProperty.call(options, 'sourceURL')
	          ? (options.sourceURL + '').replace(/[\r\n]/g, ' ')
	          : ('lodash.templateSources[' + (++templateCounter) + ']')
	        ) + '\n';

	      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
	        interpolateValue || (interpolateValue = esTemplateValue);

	        // Escape characters that can't be included in string literals.
	        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

	        // Replace delimiters with snippets.
	        if (escapeValue) {
	          isEscaping = true;
	          source += "' +\n__e(" + escapeValue + ") +\n'";
	        }
	        if (evaluateValue) {
	          isEvaluating = true;
	          source += "';\n" + evaluateValue + ";\n__p += '";
	        }
	        if (interpolateValue) {
	          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
	        }
	        index = offset + match.length;

	        // The JS engine embedded in Adobe products needs `match` returned in
	        // order to produce the correct `offset` value.
	        return match;
	      });

	      source += "';\n";

	      // If `variable` is not specified wrap a with-statement around the generated
	      // code to add the data object to the top of the scope chain.
	      // Like with sourceURL, we take care to not check the option's prototype,
	      // as this configuration is a code injection vector.
	      var variable = hasOwnProperty.call(options, 'variable') && options.variable;
	      if (!variable) {
	        source = 'with (obj) {\n' + source + '\n}\n';
	      }
	      // Cleanup code by stripping empty strings.
	      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
	        .replace(reEmptyStringMiddle, '$1')
	        .replace(reEmptyStringTrailing, '$1;');

	      // Frame code as the function body.
	      source = 'function(' + (variable || 'obj') + ') {\n' +
	        (variable
	          ? ''
	          : 'obj || (obj = {});\n'
	        ) +
	        "var __t, __p = ''" +
	        (isEscaping
	           ? ', __e = _.escape'
	           : ''
	        ) +
	        (isEvaluating
	          ? ', __j = Array.prototype.join;\n' +
	            "function print() { __p += __j.call(arguments, '') }\n"
	          : ';\n'
	        ) +
	        source +
	        'return __p\n}';

	      var result = attempt(function() {
	        return Function(importsKeys, sourceURL + 'return ' + source)
	          .apply(undefined$1, importsValues);
	      });

	      // Provide the compiled function's source by its `toString` method or
	      // the `source` property as a convenience for inlining compiled templates.
	      result.source = source;
	      if (isError(result)) {
	        throw result;
	      }
	      return result;
	    }

	    /**
	     * Converts `string`, as a whole, to lower case just like
	     * [String#toLowerCase](https://mdn.io/toLowerCase).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the lower cased string.
	     * @example
	     *
	     * _.toLower('--Foo-Bar--');
	     * // => '--foo-bar--'
	     *
	     * _.toLower('fooBar');
	     * // => 'foobar'
	     *
	     * _.toLower('__FOO_BAR__');
	     * // => '__foo_bar__'
	     */
	    function toLower(value) {
	      return toString(value).toLowerCase();
	    }

	    /**
	     * Converts `string`, as a whole, to upper case just like
	     * [String#toUpperCase](https://mdn.io/toUpperCase).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the upper cased string.
	     * @example
	     *
	     * _.toUpper('--foo-bar--');
	     * // => '--FOO-BAR--'
	     *
	     * _.toUpper('fooBar');
	     * // => 'FOOBAR'
	     *
	     * _.toUpper('__foo_bar__');
	     * // => '__FOO_BAR__'
	     */
	    function toUpper(value) {
	      return toString(value).toUpperCase();
	    }

	    /**
	     * Removes leading and trailing whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trim('  abc  ');
	     * // => 'abc'
	     *
	     * _.trim('-_-abc-_-', '_-');
	     * // => 'abc'
	     *
	     * _.map(['  foo  ', '  bar  '], _.trim);
	     * // => ['foo', 'bar']
	     */
	    function trim(string, chars, guard) {
	      string = toString(string);
	      if (string && (guard || chars === undefined$1)) {
	        return string.replace(reTrim, '');
	      }
	      if (!string || !(chars = baseToString(chars))) {
	        return string;
	      }
	      var strSymbols = stringToArray(string),
	          chrSymbols = stringToArray(chars),
	          start = charsStartIndex(strSymbols, chrSymbols),
	          end = charsEndIndex(strSymbols, chrSymbols) + 1;

	      return castSlice(strSymbols, start, end).join('');
	    }

	    /**
	     * Removes trailing whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trimEnd('  abc  ');
	     * // => '  abc'
	     *
	     * _.trimEnd('-_-abc-_-', '_-');
	     * // => '-_-abc'
	     */
	    function trimEnd(string, chars, guard) {
	      string = toString(string);
	      if (string && (guard || chars === undefined$1)) {
	        return string.replace(reTrimEnd, '');
	      }
	      if (!string || !(chars = baseToString(chars))) {
	        return string;
	      }
	      var strSymbols = stringToArray(string),
	          end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

	      return castSlice(strSymbols, 0, end).join('');
	    }

	    /**
	     * Removes leading whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trimStart('  abc  ');
	     * // => 'abc  '
	     *
	     * _.trimStart('-_-abc-_-', '_-');
	     * // => 'abc-_-'
	     */
	    function trimStart(string, chars, guard) {
	      string = toString(string);
	      if (string && (guard || chars === undefined$1)) {
	        return string.replace(reTrimStart, '');
	      }
	      if (!string || !(chars = baseToString(chars))) {
	        return string;
	      }
	      var strSymbols = stringToArray(string),
	          start = charsStartIndex(strSymbols, stringToArray(chars));

	      return castSlice(strSymbols, start).join('');
	    }

	    /**
	     * Truncates `string` if it's longer than the given maximum string length.
	     * The last characters of the truncated string are replaced with the omission
	     * string which defaults to "...".
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to truncate.
	     * @param {Object} [options={}] The options object.
	     * @param {number} [options.length=30] The maximum string length.
	     * @param {string} [options.omission='...'] The string to indicate text is omitted.
	     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
	     * @returns {string} Returns the truncated string.
	     * @example
	     *
	     * _.truncate('hi-diddly-ho there, neighborino');
	     * // => 'hi-diddly-ho there, neighbo...'
	     *
	     * _.truncate('hi-diddly-ho there, neighborino', {
	     *   'length': 24,
	     *   'separator': ' '
	     * });
	     * // => 'hi-diddly-ho there,...'
	     *
	     * _.truncate('hi-diddly-ho there, neighborino', {
	     *   'length': 24,
	     *   'separator': /,? +/
	     * });
	     * // => 'hi-diddly-ho there...'
	     *
	     * _.truncate('hi-diddly-ho there, neighborino', {
	     *   'omission': ' [...]'
	     * });
	     * // => 'hi-diddly-ho there, neig [...]'
	     */
	    function truncate(string, options) {
	      var length = DEFAULT_TRUNC_LENGTH,
	          omission = DEFAULT_TRUNC_OMISSION;

	      if (isObject(options)) {
	        var separator = 'separator' in options ? options.separator : separator;
	        length = 'length' in options ? toInteger(options.length) : length;
	        omission = 'omission' in options ? baseToString(options.omission) : omission;
	      }
	      string = toString(string);

	      var strLength = string.length;
	      if (hasUnicode(string)) {
	        var strSymbols = stringToArray(string);
	        strLength = strSymbols.length;
	      }
	      if (length >= strLength) {
	        return string;
	      }
	      var end = length - stringSize(omission);
	      if (end < 1) {
	        return omission;
	      }
	      var result = strSymbols
	        ? castSlice(strSymbols, 0, end).join('')
	        : string.slice(0, end);

	      if (separator === undefined$1) {
	        return result + omission;
	      }
	      if (strSymbols) {
	        end += (result.length - end);
	      }
	      if (isRegExp(separator)) {
	        if (string.slice(end).search(separator)) {
	          var match,
	              substring = result;

	          if (!separator.global) {
	            separator = RegExp(separator.source, toString(reFlags.exec(separator)) + 'g');
	          }
	          separator.lastIndex = 0;
	          while ((match = separator.exec(substring))) {
	            var newEnd = match.index;
	          }
	          result = result.slice(0, newEnd === undefined$1 ? end : newEnd);
	        }
	      } else if (string.indexOf(baseToString(separator), end) != end) {
	        var index = result.lastIndexOf(separator);
	        if (index > -1) {
	          result = result.slice(0, index);
	        }
	      }
	      return result + omission;
	    }

	    /**
	     * The inverse of `_.escape`; this method converts the HTML entities
	     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to
	     * their corresponding characters.
	     *
	     * **Note:** No other HTML entities are unescaped. To unescape additional
	     * HTML entities use a third-party library like [_he_](https://mths.be/he).
	     *
	     * @static
	     * @memberOf _
	     * @since 0.6.0
	     * @category String
	     * @param {string} [string=''] The string to unescape.
	     * @returns {string} Returns the unescaped string.
	     * @example
	     *
	     * _.unescape('fred, barney, &amp; pebbles');
	     * // => 'fred, barney, & pebbles'
	     */
	    function unescape(string) {
	      string = toString(string);
	      return (string && reHasEscapedHtml.test(string))
	        ? string.replace(reEscapedHtml, unescapeHtmlChar)
	        : string;
	    }

	    /**
	     * Converts `string`, as space separated words, to upper case.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the upper cased string.
	     * @example
	     *
	     * _.upperCase('--foo-bar');
	     * // => 'FOO BAR'
	     *
	     * _.upperCase('fooBar');
	     * // => 'FOO BAR'
	     *
	     * _.upperCase('__foo_bar__');
	     * // => 'FOO BAR'
	     */
	    var upperCase = createCompounder(function(result, word, index) {
	      return result + (index ? ' ' : '') + word.toUpperCase();
	    });

	    /**
	     * Converts the first character of `string` to upper case.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the converted string.
	     * @example
	     *
	     * _.upperFirst('fred');
	     * // => 'Fred'
	     *
	     * _.upperFirst('FRED');
	     * // => 'FRED'
	     */
	    var upperFirst = createCaseFirst('toUpperCase');

	    /**
	     * Splits `string` into an array of its words.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category String
	     * @param {string} [string=''] The string to inspect.
	     * @param {RegExp|string} [pattern] The pattern to match words.
	     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
	     * @returns {Array} Returns the words of `string`.
	     * @example
	     *
	     * _.words('fred, barney, & pebbles');
	     * // => ['fred', 'barney', 'pebbles']
	     *
	     * _.words('fred, barney, & pebbles', /[^, ]+/g);
	     * // => ['fred', 'barney', '&', 'pebbles']
	     */
	    function words(string, pattern, guard) {
	      string = toString(string);
	      pattern = guard ? undefined$1 : pattern;

	      if (pattern === undefined$1) {
	        return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
	      }
	      return string.match(pattern) || [];
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Attempts to invoke `func`, returning either the result or the caught error
	     * object. Any additional arguments are provided to `func` when it's invoked.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Util
	     * @param {Function} func The function to attempt.
	     * @param {...*} [args] The arguments to invoke `func` with.
	     * @returns {*} Returns the `func` result or error object.
	     * @example
	     *
	     * // Avoid throwing errors for invalid selectors.
	     * var elements = _.attempt(function(selector) {
	     *   return document.querySelectorAll(selector);
	     * }, '>_>');
	     *
	     * if (_.isError(elements)) {
	     *   elements = [];
	     * }
	     */
	    var attempt = baseRest(function(func, args) {
	      try {
	        return apply(func, undefined$1, args);
	      } catch (e) {
	        return isError(e) ? e : new Error(e);
	      }
	    });

	    /**
	     * Binds methods of an object to the object itself, overwriting the existing
	     * method.
	     *
	     * **Note:** This method doesn't set the "length" property of bound functions.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @param {Object} object The object to bind and assign the bound methods to.
	     * @param {...(string|string[])} methodNames The object method names to bind.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'click': function() {
	     *     console.log('clicked ' + this.label);
	     *   }
	     * };
	     *
	     * _.bindAll(view, ['click']);
	     * jQuery(element).on('click', view.click);
	     * // => Logs 'clicked docs' when clicked.
	     */
	    var bindAll = flatRest(function(object, methodNames) {
	      arrayEach(methodNames, function(key) {
	        key = toKey(key);
	        baseAssignValue(object, key, bind(object[key], object));
	      });
	      return object;
	    });

	    /**
	     * Creates a function that iterates over `pairs` and invokes the corresponding
	     * function of the first predicate to return truthy. The predicate-function
	     * pairs are invoked with the `this` binding and arguments of the created
	     * function.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {Array} pairs The predicate-function pairs.
	     * @returns {Function} Returns the new composite function.
	     * @example
	     *
	     * var func = _.cond([
	     *   [_.matches({ 'a': 1 }),           _.constant('matches A')],
	     *   [_.conforms({ 'b': _.isNumber }), _.constant('matches B')],
	     *   [_.stubTrue,                      _.constant('no match')]
	     * ]);
	     *
	     * func({ 'a': 1, 'b': 2 });
	     * // => 'matches A'
	     *
	     * func({ 'a': 0, 'b': 1 });
	     * // => 'matches B'
	     *
	     * func({ 'a': '1', 'b': '2' });
	     * // => 'no match'
	     */
	    function cond(pairs) {
	      var length = pairs == null ? 0 : pairs.length,
	          toIteratee = getIteratee();

	      pairs = !length ? [] : arrayMap(pairs, function(pair) {
	        if (typeof pair[1] != 'function') {
	          throw new TypeError(FUNC_ERROR_TEXT);
	        }
	        return [toIteratee(pair[0]), pair[1]];
	      });

	      return baseRest(function(args) {
	        var index = -1;
	        while (++index < length) {
	          var pair = pairs[index];
	          if (apply(pair[0], this, args)) {
	            return apply(pair[1], this, args);
	          }
	        }
	      });
	    }

	    /**
	     * Creates a function that invokes the predicate properties of `source` with
	     * the corresponding property values of a given object, returning `true` if
	     * all predicates return truthy, else `false`.
	     *
	     * **Note:** The created function is equivalent to `_.conformsTo` with
	     * `source` partially applied.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {Object} source The object of property predicates to conform to.
	     * @returns {Function} Returns the new spec function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': 2, 'b': 1 },
	     *   { 'a': 1, 'b': 2 }
	     * ];
	     *
	     * _.filter(objects, _.conforms({ 'b': function(n) { return n > 1; } }));
	     * // => [{ 'a': 1, 'b': 2 }]
	     */
	    function conforms(source) {
	      return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
	    }

	    /**
	     * Creates a function that returns `value`.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.4.0
	     * @category Util
	     * @param {*} value The value to return from the new function.
	     * @returns {Function} Returns the new constant function.
	     * @example
	     *
	     * var objects = _.times(2, _.constant({ 'a': 1 }));
	     *
	     * console.log(objects);
	     * // => [{ 'a': 1 }, { 'a': 1 }]
	     *
	     * console.log(objects[0] === objects[1]);
	     * // => true
	     */
	    function constant(value) {
	      return function() {
	        return value;
	      };
	    }

	    /**
	     * Checks `value` to determine whether a default value should be returned in
	     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
	     * or `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.14.0
	     * @category Util
	     * @param {*} value The value to check.
	     * @param {*} defaultValue The default value.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * _.defaultTo(1, 10);
	     * // => 1
	     *
	     * _.defaultTo(undefined, 10);
	     * // => 10
	     */
	    function defaultTo(value, defaultValue) {
	      return (value == null || value !== value) ? defaultValue : value;
	    }

	    /**
	     * Creates a function that returns the result of invoking the given functions
	     * with the `this` binding of the created function, where each successive
	     * invocation is supplied the return value of the previous.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Util
	     * @param {...(Function|Function[])} [funcs] The functions to invoke.
	     * @returns {Function} Returns the new composite function.
	     * @see _.flowRight
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var addSquare = _.flow([_.add, square]);
	     * addSquare(1, 2);
	     * // => 9
	     */
	    var flow = createFlow();

	    /**
	     * This method is like `_.flow` except that it creates a function that
	     * invokes the given functions from right to left.
	     *
	     * @static
	     * @since 3.0.0
	     * @memberOf _
	     * @category Util
	     * @param {...(Function|Function[])} [funcs] The functions to invoke.
	     * @returns {Function} Returns the new composite function.
	     * @see _.flow
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var addSquare = _.flowRight([square, _.add]);
	     * addSquare(1, 2);
	     * // => 9
	     */
	    var flowRight = createFlow(true);

	    /**
	     * This method returns the first argument it receives.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @param {*} value Any value.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * var object = { 'a': 1 };
	     *
	     * console.log(_.identity(object) === object);
	     * // => true
	     */
	    function identity(value) {
	      return value;
	    }

	    /**
	     * Creates a function that invokes `func` with the arguments of the created
	     * function. If `func` is a property name, the created function returns the
	     * property value for a given element. If `func` is an array or object, the
	     * created function returns `true` for elements that contain the equivalent
	     * source properties, otherwise it returns `false`.
	     *
	     * @static
	     * @since 4.0.0
	     * @memberOf _
	     * @category Util
	     * @param {*} [func=_.identity] The value to convert to a callback.
	     * @returns {Function} Returns the callback.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * // The `_.matches` iteratee shorthand.
	     * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
	     * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
	     *
	     * // The `_.matchesProperty` iteratee shorthand.
	     * _.filter(users, _.iteratee(['user', 'fred']));
	     * // => [{ 'user': 'fred', 'age': 40 }]
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.map(users, _.iteratee('user'));
	     * // => ['barney', 'fred']
	     *
	     * // Create custom iteratee shorthands.
	     * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
	     *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
	     *     return func.test(string);
	     *   };
	     * });
	     *
	     * _.filter(['abc', 'def'], /ef/);
	     * // => ['def']
	     */
	    function iteratee(func) {
	      return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
	    }

	    /**
	     * Creates a function that performs a partial deep comparison between a given
	     * object and `source`, returning `true` if the given object has equivalent
	     * property values, else `false`.
	     *
	     * **Note:** The created function is equivalent to `_.isMatch` with `source`
	     * partially applied.
	     *
	     * Partial comparisons will match empty array and empty object `source`
	     * values against any array or object value, respectively. See `_.isEqual`
	     * for a list of supported value comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Util
	     * @param {Object} source The object of property values to match.
	     * @returns {Function} Returns the new spec function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': 1, 'b': 2, 'c': 3 },
	     *   { 'a': 4, 'b': 5, 'c': 6 }
	     * ];
	     *
	     * _.filter(objects, _.matches({ 'a': 4, 'c': 6 }));
	     * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
	     */
	    function matches(source) {
	      return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
	    }

	    /**
	     * Creates a function that performs a partial deep comparison between the
	     * value at `path` of a given object to `srcValue`, returning `true` if the
	     * object value is equivalent, else `false`.
	     *
	     * **Note:** Partial comparisons will match empty array and empty object
	     * `srcValue` values against any array or object value, respectively. See
	     * `_.isEqual` for a list of supported value comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.2.0
	     * @category Util
	     * @param {Array|string} path The path of the property to get.
	     * @param {*} srcValue The value to match.
	     * @returns {Function} Returns the new spec function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': 1, 'b': 2, 'c': 3 },
	     *   { 'a': 4, 'b': 5, 'c': 6 }
	     * ];
	     *
	     * _.find(objects, _.matchesProperty('a', 4));
	     * // => { 'a': 4, 'b': 5, 'c': 6 }
	     */
	    function matchesProperty(path, srcValue) {
	      return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
	    }

	    /**
	     * Creates a function that invokes the method at `path` of a given object.
	     * Any additional arguments are provided to the invoked method.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.7.0
	     * @category Util
	     * @param {Array|string} path The path of the method to invoke.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {Function} Returns the new invoker function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': { 'b': _.constant(2) } },
	     *   { 'a': { 'b': _.constant(1) } }
	     * ];
	     *
	     * _.map(objects, _.method('a.b'));
	     * // => [2, 1]
	     *
	     * _.map(objects, _.method(['a', 'b']));
	     * // => [2, 1]
	     */
	    var method = baseRest(function(path, args) {
	      return function(object) {
	        return baseInvoke(object, path, args);
	      };
	    });

	    /**
	     * The opposite of `_.method`; this method creates a function that invokes
	     * the method at a given path of `object`. Any additional arguments are
	     * provided to the invoked method.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.7.0
	     * @category Util
	     * @param {Object} object The object to query.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {Function} Returns the new invoker function.
	     * @example
	     *
	     * var array = _.times(3, _.constant),
	     *     object = { 'a': array, 'b': array, 'c': array };
	     *
	     * _.map(['a[2]', 'c[0]'], _.methodOf(object));
	     * // => [2, 0]
	     *
	     * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
	     * // => [2, 0]
	     */
	    var methodOf = baseRest(function(object, args) {
	      return function(path) {
	        return baseInvoke(object, path, args);
	      };
	    });

	    /**
	     * Adds all own enumerable string keyed function properties of a source
	     * object to the destination object. If `object` is a function, then methods
	     * are added to its prototype as well.
	     *
	     * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
	     * avoid conflicts caused by modifying the original.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @param {Function|Object} [object=lodash] The destination object.
	     * @param {Object} source The object of functions to add.
	     * @param {Object} [options={}] The options object.
	     * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
	     * @returns {Function|Object} Returns `object`.
	     * @example
	     *
	     * function vowels(string) {
	     *   return _.filter(string, function(v) {
	     *     return /[aeiou]/i.test(v);
	     *   });
	     * }
	     *
	     * _.mixin({ 'vowels': vowels });
	     * _.vowels('fred');
	     * // => ['e']
	     *
	     * _('fred').vowels().value();
	     * // => ['e']
	     *
	     * _.mixin({ 'vowels': vowels }, { 'chain': false });
	     * _('fred').vowels();
	     * // => ['e']
	     */
	    function mixin(object, source, options) {
	      var props = keys(source),
	          methodNames = baseFunctions(source, props);

	      if (options == null &&
	          !(isObject(source) && (methodNames.length || !props.length))) {
	        options = source;
	        source = object;
	        object = this;
	        methodNames = baseFunctions(source, keys(source));
	      }
	      var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
	          isFunc = isFunction(object);

	      arrayEach(methodNames, function(methodName) {
	        var func = source[methodName];
	        object[methodName] = func;
	        if (isFunc) {
	          object.prototype[methodName] = function() {
	            var chainAll = this.__chain__;
	            if (chain || chainAll) {
	              var result = object(this.__wrapped__),
	                  actions = result.__actions__ = copyArray(this.__actions__);

	              actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
	              result.__chain__ = chainAll;
	              return result;
	            }
	            return func.apply(object, arrayPush([this.value()], arguments));
	          };
	        }
	      });

	      return object;
	    }

	    /**
	     * Reverts the `_` variable to its previous value and returns a reference to
	     * the `lodash` function.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @returns {Function} Returns the `lodash` function.
	     * @example
	     *
	     * var lodash = _.noConflict();
	     */
	    function noConflict() {
	      if (root._ === this) {
	        root._ = oldDash;
	      }
	      return this;
	    }

	    /**
	     * This method returns `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.3.0
	     * @category Util
	     * @example
	     *
	     * _.times(2, _.noop);
	     * // => [undefined, undefined]
	     */
	    function noop() {
	      // No operation performed.
	    }

	    /**
	     * Creates a function that gets the argument at index `n`. If `n` is negative,
	     * the nth argument from the end is returned.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {number} [n=0] The index of the argument to return.
	     * @returns {Function} Returns the new pass-thru function.
	     * @example
	     *
	     * var func = _.nthArg(1);
	     * func('a', 'b', 'c', 'd');
	     * // => 'b'
	     *
	     * var func = _.nthArg(-2);
	     * func('a', 'b', 'c', 'd');
	     * // => 'c'
	     */
	    function nthArg(n) {
	      n = toInteger(n);
	      return baseRest(function(args) {
	        return baseNth(args, n);
	      });
	    }

	    /**
	     * Creates a function that invokes `iteratees` with the arguments it receives
	     * and returns their results.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {...(Function|Function[])} [iteratees=[_.identity]]
	     *  The iteratees to invoke.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var func = _.over([Math.max, Math.min]);
	     *
	     * func(1, 2, 3, 4);
	     * // => [4, 1]
	     */
	    var over = createOver(arrayMap);

	    /**
	     * Creates a function that checks if **all** of the `predicates` return
	     * truthy when invoked with the arguments it receives.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {...(Function|Function[])} [predicates=[_.identity]]
	     *  The predicates to check.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var func = _.overEvery([Boolean, isFinite]);
	     *
	     * func('1');
	     * // => true
	     *
	     * func(null);
	     * // => false
	     *
	     * func(NaN);
	     * // => false
	     */
	    var overEvery = createOver(arrayEvery);

	    /**
	     * Creates a function that checks if **any** of the `predicates` return
	     * truthy when invoked with the arguments it receives.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {...(Function|Function[])} [predicates=[_.identity]]
	     *  The predicates to check.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var func = _.overSome([Boolean, isFinite]);
	     *
	     * func('1');
	     * // => true
	     *
	     * func(null);
	     * // => true
	     *
	     * func(NaN);
	     * // => false
	     */
	    var overSome = createOver(arraySome);

	    /**
	     * Creates a function that returns the value at `path` of a given object.
	     *
	     * @static
	     * @memberOf _
	     * @since 2.4.0
	     * @category Util
	     * @param {Array|string} path The path of the property to get.
	     * @returns {Function} Returns the new accessor function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': { 'b': 2 } },
	     *   { 'a': { 'b': 1 } }
	     * ];
	     *
	     * _.map(objects, _.property('a.b'));
	     * // => [2, 1]
	     *
	     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
	     * // => [1, 2]
	     */
	    function property(path) {
	      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
	    }

	    /**
	     * The opposite of `_.property`; this method creates a function that returns
	     * the value at a given path of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.0.0
	     * @category Util
	     * @param {Object} object The object to query.
	     * @returns {Function} Returns the new accessor function.
	     * @example
	     *
	     * var array = [0, 1, 2],
	     *     object = { 'a': array, 'b': array, 'c': array };
	     *
	     * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
	     * // => [2, 0]
	     *
	     * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
	     * // => [2, 0]
	     */
	    function propertyOf(object) {
	      return function(path) {
	        return object == null ? undefined$1 : baseGet(object, path);
	      };
	    }

	    /**
	     * Creates an array of numbers (positive and/or negative) progressing from
	     * `start` up to, but not including, `end`. A step of `-1` is used if a negative
	     * `start` is specified without an `end` or `step`. If `end` is not specified,
	     * it's set to `start` with `start` then set to `0`.
	     *
	     * **Note:** JavaScript follows the IEEE-754 standard for resolving
	     * floating-point values which can produce unexpected results.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} [step=1] The value to increment or decrement by.
	     * @returns {Array} Returns the range of numbers.
	     * @see _.inRange, _.rangeRight
	     * @example
	     *
	     * _.range(4);
	     * // => [0, 1, 2, 3]
	     *
	     * _.range(-4);
	     * // => [0, -1, -2, -3]
	     *
	     * _.range(1, 5);
	     * // => [1, 2, 3, 4]
	     *
	     * _.range(0, 20, 5);
	     * // => [0, 5, 10, 15]
	     *
	     * _.range(0, -4, -1);
	     * // => [0, -1, -2, -3]
	     *
	     * _.range(1, 4, 0);
	     * // => [1, 1, 1]
	     *
	     * _.range(0);
	     * // => []
	     */
	    var range = createRange();

	    /**
	     * This method is like `_.range` except that it populates values in
	     * descending order.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} [step=1] The value to increment or decrement by.
	     * @returns {Array} Returns the range of numbers.
	     * @see _.inRange, _.range
	     * @example
	     *
	     * _.rangeRight(4);
	     * // => [3, 2, 1, 0]
	     *
	     * _.rangeRight(-4);
	     * // => [-3, -2, -1, 0]
	     *
	     * _.rangeRight(1, 5);
	     * // => [4, 3, 2, 1]
	     *
	     * _.rangeRight(0, 20, 5);
	     * // => [15, 10, 5, 0]
	     *
	     * _.rangeRight(0, -4, -1);
	     * // => [-3, -2, -1, 0]
	     *
	     * _.rangeRight(1, 4, 0);
	     * // => [1, 1, 1]
	     *
	     * _.rangeRight(0);
	     * // => []
	     */
	    var rangeRight = createRange(true);

	    /**
	     * This method returns a new empty array.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.13.0
	     * @category Util
	     * @returns {Array} Returns the new empty array.
	     * @example
	     *
	     * var arrays = _.times(2, _.stubArray);
	     *
	     * console.log(arrays);
	     * // => [[], []]
	     *
	     * console.log(arrays[0] === arrays[1]);
	     * // => false
	     */
	    function stubArray() {
	      return [];
	    }

	    /**
	     * This method returns `false`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.13.0
	     * @category Util
	     * @returns {boolean} Returns `false`.
	     * @example
	     *
	     * _.times(2, _.stubFalse);
	     * // => [false, false]
	     */
	    function stubFalse() {
	      return false;
	    }

	    /**
	     * This method returns a new empty object.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.13.0
	     * @category Util
	     * @returns {Object} Returns the new empty object.
	     * @example
	     *
	     * var objects = _.times(2, _.stubObject);
	     *
	     * console.log(objects);
	     * // => [{}, {}]
	     *
	     * console.log(objects[0] === objects[1]);
	     * // => false
	     */
	    function stubObject() {
	      return {};
	    }

	    /**
	     * This method returns an empty string.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.13.0
	     * @category Util
	     * @returns {string} Returns the empty string.
	     * @example
	     *
	     * _.times(2, _.stubString);
	     * // => ['', '']
	     */
	    function stubString() {
	      return '';
	    }

	    /**
	     * This method returns `true`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.13.0
	     * @category Util
	     * @returns {boolean} Returns `true`.
	     * @example
	     *
	     * _.times(2, _.stubTrue);
	     * // => [true, true]
	     */
	    function stubTrue() {
	      return true;
	    }

	    /**
	     * Invokes the iteratee `n` times, returning an array of the results of
	     * each invocation. The iteratee is invoked with one argument; (index).
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @param {number} n The number of times to invoke `iteratee`.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @returns {Array} Returns the array of results.
	     * @example
	     *
	     * _.times(3, String);
	     * // => ['0', '1', '2']
	     *
	     *  _.times(4, _.constant(0));
	     * // => [0, 0, 0, 0]
	     */
	    function times(n, iteratee) {
	      n = toInteger(n);
	      if (n < 1 || n > MAX_SAFE_INTEGER) {
	        return [];
	      }
	      var index = MAX_ARRAY_LENGTH,
	          length = nativeMin(n, MAX_ARRAY_LENGTH);

	      iteratee = getIteratee(iteratee);
	      n -= MAX_ARRAY_LENGTH;

	      var result = baseTimes(length, iteratee);
	      while (++index < n) {
	        iteratee(index);
	      }
	      return result;
	    }

	    /**
	     * Converts `value` to a property path array.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Util
	     * @param {*} value The value to convert.
	     * @returns {Array} Returns the new property path array.
	     * @example
	     *
	     * _.toPath('a.b.c');
	     * // => ['a', 'b', 'c']
	     *
	     * _.toPath('a[0].b.c');
	     * // => ['a', '0', 'b', 'c']
	     */
	    function toPath(value) {
	      if (isArray(value)) {
	        return arrayMap(value, toKey);
	      }
	      return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
	    }

	    /**
	     * Generates a unique ID. If `prefix` is given, the ID is appended to it.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Util
	     * @param {string} [prefix=''] The value to prefix the ID with.
	     * @returns {string} Returns the unique ID.
	     * @example
	     *
	     * _.uniqueId('contact_');
	     * // => 'contact_104'
	     *
	     * _.uniqueId();
	     * // => '105'
	     */
	    function uniqueId(prefix) {
	      var id = ++idCounter;
	      return toString(prefix) + id;
	    }

	    /*------------------------------------------------------------------------*/

	    /**
	     * Adds two numbers.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.4.0
	     * @category Math
	     * @param {number} augend The first number in an addition.
	     * @param {number} addend The second number in an addition.
	     * @returns {number} Returns the total.
	     * @example
	     *
	     * _.add(6, 4);
	     * // => 10
	     */
	    var add = createMathOperation(function(augend, addend) {
	      return augend + addend;
	    }, 0);

	    /**
	     * Computes `number` rounded up to `precision`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.10.0
	     * @category Math
	     * @param {number} number The number to round up.
	     * @param {number} [precision=0] The precision to round up to.
	     * @returns {number} Returns the rounded up number.
	     * @example
	     *
	     * _.ceil(4.006);
	     * // => 5
	     *
	     * _.ceil(6.004, 2);
	     * // => 6.01
	     *
	     * _.ceil(6040, -2);
	     * // => 6100
	     */
	    var ceil = createRound('ceil');

	    /**
	     * Divide two numbers.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.7.0
	     * @category Math
	     * @param {number} dividend The first number in a division.
	     * @param {number} divisor The second number in a division.
	     * @returns {number} Returns the quotient.
	     * @example
	     *
	     * _.divide(6, 4);
	     * // => 1.5
	     */
	    var divide = createMathOperation(function(dividend, divisor) {
	      return dividend / divisor;
	    }, 1);

	    /**
	     * Computes `number` rounded down to `precision`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.10.0
	     * @category Math
	     * @param {number} number The number to round down.
	     * @param {number} [precision=0] The precision to round down to.
	     * @returns {number} Returns the rounded down number.
	     * @example
	     *
	     * _.floor(4.006);
	     * // => 4
	     *
	     * _.floor(0.046, 2);
	     * // => 0.04
	     *
	     * _.floor(4060, -2);
	     * // => 4000
	     */
	    var floor = createRound('floor');

	    /**
	     * Computes the maximum value of `array`. If `array` is empty or falsey,
	     * `undefined` is returned.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @returns {*} Returns the maximum value.
	     * @example
	     *
	     * _.max([4, 2, 8, 6]);
	     * // => 8
	     *
	     * _.max([]);
	     * // => undefined
	     */
	    function max(array) {
	      return (array && array.length)
	        ? baseExtremum(array, identity, baseGt)
	        : undefined$1;
	    }

	    /**
	     * This method is like `_.max` except that it accepts `iteratee` which is
	     * invoked for each element in `array` to generate the criterion by which
	     * the value is ranked. The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {*} Returns the maximum value.
	     * @example
	     *
	     * var objects = [{ 'n': 1 }, { 'n': 2 }];
	     *
	     * _.maxBy(objects, function(o) { return o.n; });
	     * // => { 'n': 2 }
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.maxBy(objects, 'n');
	     * // => { 'n': 2 }
	     */
	    function maxBy(array, iteratee) {
	      return (array && array.length)
	        ? baseExtremum(array, getIteratee(iteratee, 2), baseGt)
	        : undefined$1;
	    }

	    /**
	     * Computes the mean of the values in `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @returns {number} Returns the mean.
	     * @example
	     *
	     * _.mean([4, 2, 8, 6]);
	     * // => 5
	     */
	    function mean(array) {
	      return baseMean(array, identity);
	    }

	    /**
	     * This method is like `_.mean` except that it accepts `iteratee` which is
	     * invoked for each element in `array` to generate the value to be averaged.
	     * The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.7.0
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {number} Returns the mean.
	     * @example
	     *
	     * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
	     *
	     * _.meanBy(objects, function(o) { return o.n; });
	     * // => 5
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.meanBy(objects, 'n');
	     * // => 5
	     */
	    function meanBy(array, iteratee) {
	      return baseMean(array, getIteratee(iteratee, 2));
	    }

	    /**
	     * Computes the minimum value of `array`. If `array` is empty or falsey,
	     * `undefined` is returned.
	     *
	     * @static
	     * @since 0.1.0
	     * @memberOf _
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @returns {*} Returns the minimum value.
	     * @example
	     *
	     * _.min([4, 2, 8, 6]);
	     * // => 2
	     *
	     * _.min([]);
	     * // => undefined
	     */
	    function min(array) {
	      return (array && array.length)
	        ? baseExtremum(array, identity, baseLt)
	        : undefined$1;
	    }

	    /**
	     * This method is like `_.min` except that it accepts `iteratee` which is
	     * invoked for each element in `array` to generate the criterion by which
	     * the value is ranked. The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {*} Returns the minimum value.
	     * @example
	     *
	     * var objects = [{ 'n': 1 }, { 'n': 2 }];
	     *
	     * _.minBy(objects, function(o) { return o.n; });
	     * // => { 'n': 1 }
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.minBy(objects, 'n');
	     * // => { 'n': 1 }
	     */
	    function minBy(array, iteratee) {
	      return (array && array.length)
	        ? baseExtremum(array, getIteratee(iteratee, 2), baseLt)
	        : undefined$1;
	    }

	    /**
	     * Multiply two numbers.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.7.0
	     * @category Math
	     * @param {number} multiplier The first number in a multiplication.
	     * @param {number} multiplicand The second number in a multiplication.
	     * @returns {number} Returns the product.
	     * @example
	     *
	     * _.multiply(6, 4);
	     * // => 24
	     */
	    var multiply = createMathOperation(function(multiplier, multiplicand) {
	      return multiplier * multiplicand;
	    }, 1);

	    /**
	     * Computes `number` rounded to `precision`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.10.0
	     * @category Math
	     * @param {number} number The number to round.
	     * @param {number} [precision=0] The precision to round to.
	     * @returns {number} Returns the rounded number.
	     * @example
	     *
	     * _.round(4.006);
	     * // => 4
	     *
	     * _.round(4.006, 2);
	     * // => 4.01
	     *
	     * _.round(4060, -2);
	     * // => 4100
	     */
	    var round = createRound('round');

	    /**
	     * Subtract two numbers.
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Math
	     * @param {number} minuend The first number in a subtraction.
	     * @param {number} subtrahend The second number in a subtraction.
	     * @returns {number} Returns the difference.
	     * @example
	     *
	     * _.subtract(6, 4);
	     * // => 2
	     */
	    var subtract = createMathOperation(function(minuend, subtrahend) {
	      return minuend - subtrahend;
	    }, 0);

	    /**
	     * Computes the sum of the values in `array`.
	     *
	     * @static
	     * @memberOf _
	     * @since 3.4.0
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @returns {number} Returns the sum.
	     * @example
	     *
	     * _.sum([4, 2, 8, 6]);
	     * // => 20
	     */
	    function sum(array) {
	      return (array && array.length)
	        ? baseSum(array, identity)
	        : 0;
	    }

	    /**
	     * This method is like `_.sum` except that it accepts `iteratee` which is
	     * invoked for each element in `array` to generate the value to be summed.
	     * The iteratee is invoked with one argument: (value).
	     *
	     * @static
	     * @memberOf _
	     * @since 4.0.0
	     * @category Math
	     * @param {Array} array The array to iterate over.
	     * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
	     * @returns {number} Returns the sum.
	     * @example
	     *
	     * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
	     *
	     * _.sumBy(objects, function(o) { return o.n; });
	     * // => 20
	     *
	     * // The `_.property` iteratee shorthand.
	     * _.sumBy(objects, 'n');
	     * // => 20
	     */
	    function sumBy(array, iteratee) {
	      return (array && array.length)
	        ? baseSum(array, getIteratee(iteratee, 2))
	        : 0;
	    }

	    /*------------------------------------------------------------------------*/

	    // Add methods that return wrapped values in chain sequences.
	    lodash.after = after;
	    lodash.ary = ary;
	    lodash.assign = assign;
	    lodash.assignIn = assignIn;
	    lodash.assignInWith = assignInWith;
	    lodash.assignWith = assignWith;
	    lodash.at = at;
	    lodash.before = before;
	    lodash.bind = bind;
	    lodash.bindAll = bindAll;
	    lodash.bindKey = bindKey;
	    lodash.castArray = castArray;
	    lodash.chain = chain;
	    lodash.chunk = chunk;
	    lodash.compact = compact;
	    lodash.concat = concat;
	    lodash.cond = cond;
	    lodash.conforms = conforms;
	    lodash.constant = constant;
	    lodash.countBy = countBy;
	    lodash.create = create;
	    lodash.curry = curry;
	    lodash.curryRight = curryRight;
	    lodash.debounce = debounce;
	    lodash.defaults = defaults;
	    lodash.defaultsDeep = defaultsDeep;
	    lodash.defer = defer;
	    lodash.delay = delay;
	    lodash.difference = difference;
	    lodash.differenceBy = differenceBy;
	    lodash.differenceWith = differenceWith;
	    lodash.drop = drop;
	    lodash.dropRight = dropRight;
	    lodash.dropRightWhile = dropRightWhile;
	    lodash.dropWhile = dropWhile;
	    lodash.fill = fill;
	    lodash.filter = filter;
	    lodash.flatMap = flatMap;
	    lodash.flatMapDeep = flatMapDeep;
	    lodash.flatMapDepth = flatMapDepth;
	    lodash.flatten = flatten;
	    lodash.flattenDeep = flattenDeep;
	    lodash.flattenDepth = flattenDepth;
	    lodash.flip = flip;
	    lodash.flow = flow;
	    lodash.flowRight = flowRight;
	    lodash.fromPairs = fromPairs;
	    lodash.functions = functions;
	    lodash.functionsIn = functionsIn;
	    lodash.groupBy = groupBy;
	    lodash.initial = initial;
	    lodash.intersection = intersection;
	    lodash.intersectionBy = intersectionBy;
	    lodash.intersectionWith = intersectionWith;
	    lodash.invert = invert;
	    lodash.invertBy = invertBy;
	    lodash.invokeMap = invokeMap;
	    lodash.iteratee = iteratee;
	    lodash.keyBy = keyBy;
	    lodash.keys = keys;
	    lodash.keysIn = keysIn;
	    lodash.map = map;
	    lodash.mapKeys = mapKeys;
	    lodash.mapValues = mapValues;
	    lodash.matches = matches;
	    lodash.matchesProperty = matchesProperty;
	    lodash.memoize = memoize;
	    lodash.merge = merge;
	    lodash.mergeWith = mergeWith;
	    lodash.method = method;
	    lodash.methodOf = methodOf;
	    lodash.mixin = mixin;
	    lodash.negate = negate;
	    lodash.nthArg = nthArg;
	    lodash.omit = omit;
	    lodash.omitBy = omitBy;
	    lodash.once = once;
	    lodash.orderBy = orderBy;
	    lodash.over = over;
	    lodash.overArgs = overArgs;
	    lodash.overEvery = overEvery;
	    lodash.overSome = overSome;
	    lodash.partial = partial;
	    lodash.partialRight = partialRight;
	    lodash.partition = partition;
	    lodash.pick = pick;
	    lodash.pickBy = pickBy;
	    lodash.property = property;
	    lodash.propertyOf = propertyOf;
	    lodash.pull = pull;
	    lodash.pullAll = pullAll;
	    lodash.pullAllBy = pullAllBy;
	    lodash.pullAllWith = pullAllWith;
	    lodash.pullAt = pullAt;
	    lodash.range = range;
	    lodash.rangeRight = rangeRight;
	    lodash.rearg = rearg;
	    lodash.reject = reject;
	    lodash.remove = remove;
	    lodash.rest = rest;
	    lodash.reverse = reverse;
	    lodash.sampleSize = sampleSize;
	    lodash.set = set;
	    lodash.setWith = setWith;
	    lodash.shuffle = shuffle;
	    lodash.slice = slice;
	    lodash.sortBy = sortBy;
	    lodash.sortedUniq = sortedUniq;
	    lodash.sortedUniqBy = sortedUniqBy;
	    lodash.split = split;
	    lodash.spread = spread;
	    lodash.tail = tail;
	    lodash.take = take;
	    lodash.takeRight = takeRight;
	    lodash.takeRightWhile = takeRightWhile;
	    lodash.takeWhile = takeWhile;
	    lodash.tap = tap;
	    lodash.throttle = throttle;
	    lodash.thru = thru;
	    lodash.toArray = toArray;
	    lodash.toPairs = toPairs;
	    lodash.toPairsIn = toPairsIn;
	    lodash.toPath = toPath;
	    lodash.toPlainObject = toPlainObject;
	    lodash.transform = transform;
	    lodash.unary = unary;
	    lodash.union = union;
	    lodash.unionBy = unionBy;
	    lodash.unionWith = unionWith;
	    lodash.uniq = uniq;
	    lodash.uniqBy = uniqBy;
	    lodash.uniqWith = uniqWith;
	    lodash.unset = unset;
	    lodash.unzip = unzip;
	    lodash.unzipWith = unzipWith;
	    lodash.update = update;
	    lodash.updateWith = updateWith;
	    lodash.values = values;
	    lodash.valuesIn = valuesIn;
	    lodash.without = without;
	    lodash.words = words;
	    lodash.wrap = wrap;
	    lodash.xor = xor;
	    lodash.xorBy = xorBy;
	    lodash.xorWith = xorWith;
	    lodash.zip = zip;
	    lodash.zipObject = zipObject;
	    lodash.zipObjectDeep = zipObjectDeep;
	    lodash.zipWith = zipWith;

	    // Add aliases.
	    lodash.entries = toPairs;
	    lodash.entriesIn = toPairsIn;
	    lodash.extend = assignIn;
	    lodash.extendWith = assignInWith;

	    // Add methods to `lodash.prototype`.
	    mixin(lodash, lodash);

	    /*------------------------------------------------------------------------*/

	    // Add methods that return unwrapped values in chain sequences.
	    lodash.add = add;
	    lodash.attempt = attempt;
	    lodash.camelCase = camelCase;
	    lodash.capitalize = capitalize;
	    lodash.ceil = ceil;
	    lodash.clamp = clamp;
	    lodash.clone = clone;
	    lodash.cloneDeep = cloneDeep;
	    lodash.cloneDeepWith = cloneDeepWith;
	    lodash.cloneWith = cloneWith;
	    lodash.conformsTo = conformsTo;
	    lodash.deburr = deburr;
	    lodash.defaultTo = defaultTo;
	    lodash.divide = divide;
	    lodash.endsWith = endsWith;
	    lodash.eq = eq;
	    lodash.escape = escape;
	    lodash.escapeRegExp = escapeRegExp;
	    lodash.every = every;
	    lodash.find = find;
	    lodash.findIndex = findIndex;
	    lodash.findKey = findKey;
	    lodash.findLast = findLast;
	    lodash.findLastIndex = findLastIndex;
	    lodash.findLastKey = findLastKey;
	    lodash.floor = floor;
	    lodash.forEach = forEach;
	    lodash.forEachRight = forEachRight;
	    lodash.forIn = forIn;
	    lodash.forInRight = forInRight;
	    lodash.forOwn = forOwn;
	    lodash.forOwnRight = forOwnRight;
	    lodash.get = get;
	    lodash.gt = gt;
	    lodash.gte = gte;
	    lodash.has = has;
	    lodash.hasIn = hasIn;
	    lodash.head = head;
	    lodash.identity = identity;
	    lodash.includes = includes;
	    lodash.indexOf = indexOf;
	    lodash.inRange = inRange;
	    lodash.invoke = invoke;
	    lodash.isArguments = isArguments;
	    lodash.isArray = isArray;
	    lodash.isArrayBuffer = isArrayBuffer;
	    lodash.isArrayLike = isArrayLike;
	    lodash.isArrayLikeObject = isArrayLikeObject;
	    lodash.isBoolean = isBoolean;
	    lodash.isBuffer = isBuffer;
	    lodash.isDate = isDate;
	    lodash.isElement = isElement;
	    lodash.isEmpty = isEmpty;
	    lodash.isEqual = isEqual;
	    lodash.isEqualWith = isEqualWith;
	    lodash.isError = isError;
	    lodash.isFinite = isFinite;
	    lodash.isFunction = isFunction;
	    lodash.isInteger = isInteger;
	    lodash.isLength = isLength;
	    lodash.isMap = isMap;
	    lodash.isMatch = isMatch;
	    lodash.isMatchWith = isMatchWith;
	    lodash.isNaN = isNaN;
	    lodash.isNative = isNative;
	    lodash.isNil = isNil;
	    lodash.isNull = isNull;
	    lodash.isNumber = isNumber;
	    lodash.isObject = isObject;
	    lodash.isObjectLike = isObjectLike;
	    lodash.isPlainObject = isPlainObject;
	    lodash.isRegExp = isRegExp;
	    lodash.isSafeInteger = isSafeInteger;
	    lodash.isSet = isSet;
	    lodash.isString = isString;
	    lodash.isSymbol = isSymbol;
	    lodash.isTypedArray = isTypedArray;
	    lodash.isUndefined = isUndefined;
	    lodash.isWeakMap = isWeakMap;
	    lodash.isWeakSet = isWeakSet;
	    lodash.join = join;
	    lodash.kebabCase = kebabCase;
	    lodash.last = last;
	    lodash.lastIndexOf = lastIndexOf;
	    lodash.lowerCase = lowerCase;
	    lodash.lowerFirst = lowerFirst;
	    lodash.lt = lt;
	    lodash.lte = lte;
	    lodash.max = max;
	    lodash.maxBy = maxBy;
	    lodash.mean = mean;
	    lodash.meanBy = meanBy;
	    lodash.min = min;
	    lodash.minBy = minBy;
	    lodash.stubArray = stubArray;
	    lodash.stubFalse = stubFalse;
	    lodash.stubObject = stubObject;
	    lodash.stubString = stubString;
	    lodash.stubTrue = stubTrue;
	    lodash.multiply = multiply;
	    lodash.nth = nth;
	    lodash.noConflict = noConflict;
	    lodash.noop = noop;
	    lodash.now = now;
	    lodash.pad = pad;
	    lodash.padEnd = padEnd;
	    lodash.padStart = padStart;
	    lodash.parseInt = parseInt;
	    lodash.random = random;
	    lodash.reduce = reduce;
	    lodash.reduceRight = reduceRight;
	    lodash.repeat = repeat;
	    lodash.replace = replace;
	    lodash.result = result;
	    lodash.round = round;
	    lodash.runInContext = runInContext;
	    lodash.sample = sample;
	    lodash.size = size;
	    lodash.snakeCase = snakeCase;
	    lodash.some = some;
	    lodash.sortedIndex = sortedIndex;
	    lodash.sortedIndexBy = sortedIndexBy;
	    lodash.sortedIndexOf = sortedIndexOf;
	    lodash.sortedLastIndex = sortedLastIndex;
	    lodash.sortedLastIndexBy = sortedLastIndexBy;
	    lodash.sortedLastIndexOf = sortedLastIndexOf;
	    lodash.startCase = startCase;
	    lodash.startsWith = startsWith;
	    lodash.subtract = subtract;
	    lodash.sum = sum;
	    lodash.sumBy = sumBy;
	    lodash.template = template;
	    lodash.times = times;
	    lodash.toFinite = toFinite;
	    lodash.toInteger = toInteger;
	    lodash.toLength = toLength;
	    lodash.toLower = toLower;
	    lodash.toNumber = toNumber;
	    lodash.toSafeInteger = toSafeInteger;
	    lodash.toString = toString;
	    lodash.toUpper = toUpper;
	    lodash.trim = trim;
	    lodash.trimEnd = trimEnd;
	    lodash.trimStart = trimStart;
	    lodash.truncate = truncate;
	    lodash.unescape = unescape;
	    lodash.uniqueId = uniqueId;
	    lodash.upperCase = upperCase;
	    lodash.upperFirst = upperFirst;

	    // Add aliases.
	    lodash.each = forEach;
	    lodash.eachRight = forEachRight;
	    lodash.first = head;

	    mixin(lodash, (function() {
	      var source = {};
	      baseForOwn(lodash, function(func, methodName) {
	        if (!hasOwnProperty.call(lodash.prototype, methodName)) {
	          source[methodName] = func;
	        }
	      });
	      return source;
	    }()), { 'chain': false });

	    /*------------------------------------------------------------------------*/

	    /**
	     * The semantic version number.
	     *
	     * @static
	     * @memberOf _
	     * @type {string}
	     */
	    lodash.VERSION = VERSION;

	    // Assign default placeholders.
	    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
	      lodash[methodName].placeholder = lodash;
	    });

	    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
	    arrayEach(['drop', 'take'], function(methodName, index) {
	      LazyWrapper.prototype[methodName] = function(n) {
	        n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);

	        var result = (this.__filtered__ && !index)
	          ? new LazyWrapper(this)
	          : this.clone();

	        if (result.__filtered__) {
	          result.__takeCount__ = nativeMin(n, result.__takeCount__);
	        } else {
	          result.__views__.push({
	            'size': nativeMin(n, MAX_ARRAY_LENGTH),
	            'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
	          });
	        }
	        return result;
	      };

	      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
	        return this.reverse()[methodName](n).reverse();
	      };
	    });

	    // Add `LazyWrapper` methods that accept an `iteratee` value.
	    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
	      var type = index + 1,
	          isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

	      LazyWrapper.prototype[methodName] = function(iteratee) {
	        var result = this.clone();
	        result.__iteratees__.push({
	          'iteratee': getIteratee(iteratee, 3),
	          'type': type
	        });
	        result.__filtered__ = result.__filtered__ || isFilter;
	        return result;
	      };
	    });

	    // Add `LazyWrapper` methods for `_.head` and `_.last`.
	    arrayEach(['head', 'last'], function(methodName, index) {
	      var takeName = 'take' + (index ? 'Right' : '');

	      LazyWrapper.prototype[methodName] = function() {
	        return this[takeName](1).value()[0];
	      };
	    });

	    // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
	    arrayEach(['initial', 'tail'], function(methodName, index) {
	      var dropName = 'drop' + (index ? '' : 'Right');

	      LazyWrapper.prototype[methodName] = function() {
	        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
	      };
	    });

	    LazyWrapper.prototype.compact = function() {
	      return this.filter(identity);
	    };

	    LazyWrapper.prototype.find = function(predicate) {
	      return this.filter(predicate).head();
	    };

	    LazyWrapper.prototype.findLast = function(predicate) {
	      return this.reverse().find(predicate);
	    };

	    LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
	      if (typeof path == 'function') {
	        return new LazyWrapper(this);
	      }
	      return this.map(function(value) {
	        return baseInvoke(value, path, args);
	      });
	    });

	    LazyWrapper.prototype.reject = function(predicate) {
	      return this.filter(negate(getIteratee(predicate)));
	    };

	    LazyWrapper.prototype.slice = function(start, end) {
	      start = toInteger(start);

	      var result = this;
	      if (result.__filtered__ && (start > 0 || end < 0)) {
	        return new LazyWrapper(result);
	      }
	      if (start < 0) {
	        result = result.takeRight(-start);
	      } else if (start) {
	        result = result.drop(start);
	      }
	      if (end !== undefined$1) {
	        end = toInteger(end);
	        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
	      }
	      return result;
	    };

	    LazyWrapper.prototype.takeRightWhile = function(predicate) {
	      return this.reverse().takeWhile(predicate).reverse();
	    };

	    LazyWrapper.prototype.toArray = function() {
	      return this.take(MAX_ARRAY_LENGTH);
	    };

	    // Add `LazyWrapper` methods to `lodash.prototype`.
	    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
	      var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
	          isTaker = /^(?:head|last)$/.test(methodName),
	          lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
	          retUnwrapped = isTaker || /^find/.test(methodName);

	      if (!lodashFunc) {
	        return;
	      }
	      lodash.prototype[methodName] = function() {
	        var value = this.__wrapped__,
	            args = isTaker ? [1] : arguments,
	            isLazy = value instanceof LazyWrapper,
	            iteratee = args[0],
	            useLazy = isLazy || isArray(value);

	        var interceptor = function(value) {
	          var result = lodashFunc.apply(lodash, arrayPush([value], args));
	          return (isTaker && chainAll) ? result[0] : result;
	        };

	        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
	          // Avoid lazy use if the iteratee has a "length" value other than `1`.
	          isLazy = useLazy = false;
	        }
	        var chainAll = this.__chain__,
	            isHybrid = !!this.__actions__.length,
	            isUnwrapped = retUnwrapped && !chainAll,
	            onlyLazy = isLazy && !isHybrid;

	        if (!retUnwrapped && useLazy) {
	          value = onlyLazy ? value : new LazyWrapper(this);
	          var result = func.apply(value, args);
	          result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined$1 });
	          return new LodashWrapper(result, chainAll);
	        }
	        if (isUnwrapped && onlyLazy) {
	          return func.apply(this, args);
	        }
	        result = this.thru(interceptor);
	        return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
	      };
	    });

	    // Add `Array` methods to `lodash.prototype`.
	    arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
	      var func = arrayProto[methodName],
	          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
	          retUnwrapped = /^(?:pop|shift)$/.test(methodName);

	      lodash.prototype[methodName] = function() {
	        var args = arguments;
	        if (retUnwrapped && !this.__chain__) {
	          var value = this.value();
	          return func.apply(isArray(value) ? value : [], args);
	        }
	        return this[chainName](function(value) {
	          return func.apply(isArray(value) ? value : [], args);
	        });
	      };
	    });

	    // Map minified method names to their real names.
	    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
	      var lodashFunc = lodash[methodName];
	      if (lodashFunc) {
	        var key = lodashFunc.name + '';
	        if (!hasOwnProperty.call(realNames, key)) {
	          realNames[key] = [];
	        }
	        realNames[key].push({ 'name': methodName, 'func': lodashFunc });
	      }
	    });

	    realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
	      'name': 'wrapper',
	      'func': undefined$1
	    }];

	    // Add methods to `LazyWrapper`.
	    LazyWrapper.prototype.clone = lazyClone;
	    LazyWrapper.prototype.reverse = lazyReverse;
	    LazyWrapper.prototype.value = lazyValue;

	    // Add chain sequence methods to the `lodash` wrapper.
	    lodash.prototype.at = wrapperAt;
	    lodash.prototype.chain = wrapperChain;
	    lodash.prototype.commit = wrapperCommit;
	    lodash.prototype.next = wrapperNext;
	    lodash.prototype.plant = wrapperPlant;
	    lodash.prototype.reverse = wrapperReverse;
	    lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

	    // Add lazy aliases.
	    lodash.prototype.first = lodash.prototype.head;

	    if (symIterator) {
	      lodash.prototype[symIterator] = wrapperToIterator;
	    }
	    return lodash;
	  });

	  /*--------------------------------------------------------------------------*/

	  // Export lodash.
	  var _ = runInContext();

	  // Some AMD build optimizers, like r.js, check for condition patterns like:
	  if (freeModule) {
	    // Export for Node.js.
	    (freeModule.exports = _)._ = _;
	    // Export for CommonJS support.
	    freeExports._ = _;
	  }
	  else {
	    // Export to the global object.
	    root._ = _;
	  }
	}.call(commonjsGlobal));
	});

	/* eslint-env es6 */

	class FewViewNode {
	    /**
	     * Create VirtualDomElement
	     * @param {string} nodeName name of DOM node
	     */
	    constructor( nodeName ) {
	        /**
	         * type name
	         */
	        this.type = nodeName;

	        // For typical ES6 practice, we better put all member variable
	        // in constructor as a good practice. But for thi atom type, we
	        // break the rule for better performance. But still we list here
	        // for better readability


	        /**
	         * constant attributes or evaluation result for variable attrbutes
	         * this.data = {};
	         */

	        /**
	         * child nodes
	         * this.children = [];
	         */

	        /**
	         * correcponding dom node as anchor
	         * this.domNode = <DOMNode>
	         */
	    }

	    /**
	     * Set value for constant attribute or evaluation result of variable attribute
	     * @param {string} name attribute name
	     * @param {string} val attribute value
	     */
	    setValue( name, val ) {
	        this.data = this.data || {};
	        this.data[name] = val;
	    }

	    /**
	     * Get value for constant attribute or evaluation result of variable attribute
	     * @param {string} name attribute name
	     * @returns {string} return value
	     */
	    getValue( name ) {
	        return this.data ? this.data[name] : undefined;
	    }

	    hasValue( name ) {
	        return this.data && this.data.hasOwnProperty( name );
	    }

	    /**
	     * Add child element
	     * @param {VirtualDomElement} child child element
	     */
	    addChild( child ) {
	        this.children = this.children || [];
	        this.children.push( child );
	    }

	    getChildren() {
	        return this.children || [];
	    }

	    /**
	     * Check if current FewViewUnit object is text node
	     * @returns {boolean} return true if the FewViewUnit object is for text node
	     */
	    isTextNode() {
	        return this.type === '#text';
	    }

	    /**
	     * Print object for test purpose
	     * @returns {JSON} JSON object that presents the content of FewViewUnit
	     */
	    toJSON() {
	        let obj = Object.assign( {}, this );
	        if ( this.children ) {
	            obj.children = this.children.map( ( o ) => o.toJSON() );
	        }
	        delete obj.domNode;
	        delete obj._parser;

	        // wash out methods
	        return obj;
	    }

	    /**
	     * Refresh/create HTML DOM for current FewDOM
	     * NOTE: no usage for now
	     * @param {FewComponent} vm view model object
	     * @returns {Node} HTML dom Node
	     */
	    createHtmlDom( vm ) {
	        let newNode = null;
	        if( this.isTextNode() ) {
	            newNode = document.createTextNode( this.data.textContent );
	        } else {
	            newNode = document.createElement( this.type );
	            for ( let attr in this.data ) {
	                newNode.setAttribute( attr, this.data[attr] );
	            }
	            this.children.forEach( ( c ) => {
	                newNode.appendChild( c.createHtmlDom( vm ) );
	            } );
	        }

	        return newNode;
	    }
	}

	/* eslint-env es6 */

	class FewViewUnit extends FewViewNode {
	    /**
	     * Create FewViewUnit
	     * @param {Node} domNode DOM node
	     * @param {StringTemplateParser} parser string template parser
	     */
	    constructor( domNode, parser ) {
	        super( domNode.nodeName );

	        /**
	         * string template parser
	         */
	        this._parser = parser;

	        /**
	         * variable attributes
	         * this.input = {};
	         */

	        /**
	         * directive attributes
	         * this.directives = {};
	         */

	        /**
	         * domNode reference
	         */
	        this.domNode = this._compile( domNode );

	        return this.domNode ? this : undefined;
	    }

	    get hasInput() {
	        return Boolean( this.input || this.directives || this.children );
	    }

	    /**
	     * Add variable attribute
	     * @param {string} name attribute name
	     * @param {string} val attribute value
	     */
	    setInput( name, val ) {
	        // var shuld be string
	        if ( val ) {
	            this.input = this.input || {};
	            this.input[name] = val;
	        }
	    }

	    /**
	     * Get attribute expression by name
	     * @param {string} name attribute name
	     * @returns {string} expression as string
	     */
	    getInput( name ) {
	        return this.input ? this.input[name] : undefined;
	    }

	    /**
	     * Get the all definition for variable attributes
	     * @returns {object} expression as string
	     */
	    getInputScope() {
	        return this.input || {};
	    }

	    /**
	     * general render function
	     * @param {Object} vm view model object
	     * @returns {Node} dom element as result
	     */
	    render( vm ) {
	        let newNode = this._update( this.domNode, vm );
	        if ( newNode !== this.domNode ) {
	            this.domNode = newNode;
	        }
	        return newNode;
	    }

	    /**
	     * Set directives definition to unit
	     * @param {string} name name of directives
	     * @param {string} expr expression as directive input
	     */
	    setDirective( name, expr ) {
	        this.directives = this.directives || {};
	        this.directives[name] = expr;
	    }

	    /**
	     * Get directive definition from unit by name
	     * @param {string} name name of directives
	     * @returns {string} expression as string
	     */
	    getDirective( name ) {
	        return this.directives ? this.directives[name] : undefined;
	    }

	    /**
	     * Get all directive definitions from unit
	     * @returns {object} expression as string
	     */
	    getDirectives() {
	        return this.directives || {};
	    }

	    /**
	     * Check if directive is defined or not
	     * @param {string} name name of directives
	     * @returns {boolean} true if directive is defined
	     */
	    hasDirective( name ) {
	        return this.directives && this.directives.hasOwnProperty( name );
	    }

	    /**
	     * compile dom node input to curren unit context
	     * @param {Node} domNode DOM Node input
	     * @returns {Node} DOM Node as anchor
	     */
	    /*
	    _compile( domNode ) {
	        return domNode;
	    }
	    */

	    /**
	     * update DOM node based on vm
	     * @param {Node} domNode input dom node
	     * @param {Object} vm model
	     */
	    /*
	    _update( domNode, vm ) {
	        return domNode;
	    }
	     */
	}

	/**
	 * Singleton factory template
	 */
	let _factories = [];

	/**
	 * Create FewViewUnit structure based on input DOM
	 * @param {Node} node DOM Node
	 * @param {StringTemplateParser} parser string template parser
	 * @param {boolean} skipConstant if true result without input will not be returned
	 * @returns {FewViewUnit} FewViewUnit object
	 */
	function _createUnit( node, parser, skipConstant ) {
	    let unit = null;
	    if( node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE ||    // only process text and dom for now
	        hasScope( node ) ) ; else {
	        for( let idx in _factories ) {
	            let factory = _factories[idx];
	            if( factory.when( node ) ) {
	                unit = factory.createUnit( node, parser );
	                break;
	            }
	        }
	    }
	    return unit && unit.hasInput || !skipConstant ? unit : undefined;
	}

	var viewUnitFactory = {
	    addFactory: ( factory ) => _factories.push( factory ),
	    createUnit: _createUnit
	};

	/* eslint-env es6 */

	class FewViewVarUnit extends FewViewUnit {
	    /**
	     * compile dom node input to curren unit context
	     * @param {Node} domNode DOM Node input
	     * @returns {Node} DOM Node as anchor
	     */
	    _compile( domNode ) {
	        for( let i = 0; i < domNode.attributes.length; i++ ) {
	            let name = domNode.attributes[i].name;
	            let value = domNode.attributes[i].value;

	            let expr = this._parser.parse( value );

	            // TODO: if it is directive
	            if( getDirective( name ) ) {
	                this.setDirective( name, value );
	            } else if( expr ) {
	                // if name is event like onclick
	                // TODO: make it as expression later
	                if ( /^on.+/.test( name ) ) {
	                    domNode.setAttribute( name, `few.handleEvent(this, '${expr}', event)` );
	                } else {
	                    this.setInput( name, expr );
	                    domNode.setAttribute( name, '' );
	                }
	            } else {
	                this.setValue( name, value );
	            }
	        }

	        for ( let i = 0; i < domNode.childNodes.length; i++ ) {
	            let childDomNode = domNode.childNodes[i];
	            let childUnit = viewUnitFactory.createUnit( childDomNode, this._parser, true );
	            if( childUnit ) {
	                this.addChild( childUnit );
	            }
	        }


	        return domNode;
	    }

	    /**
	     * update dom node based on vm
	     * @param {Node} domNode input dom node
	     * @param {Object} vm model
	     * @returns {Node} updated dom node
	     */
	    _update( domNode, vm ) {
	        let inputScope = this.getInputScope();
	        for( let key in inputScope ) {
	            let res = evalExpression( inputScope[key], vm, true );
	            let last = this.getValue( key );
	            // TODO: should be string or primitive value. But still need error handling
	            if ( last !== res ) {
	                this.setValue( key, res );
	                domNode.setAttribute( key, res );
	            }
	        }

	        for( let child of this.getChildren() ) {
	            child.render( vm );
	        }

	        let directives = this.getDirectives();
	        for( let key in directives ) {
	            let last = this.getValue( key );
	            let res = evalExpression( directives[key], vm, true );
	            if ( !this.hasValue( key ) || last !== res ) {
	                getDirective( key ).update( this, res );
	                this.setValue( key, res );
	            }
	        }

	        return domNode;
	    }
	}

	var varUnitFactory = {
	    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE,
	    createUnit: ( domNode, parser ) => new FewViewVarUnit( domNode, parser )
	};

	/* eslint-env es6 */

	class FewViewTextUnit extends FewViewUnit {
	    static get TEXT_PROP_NAME() {
	        return 'textContent';
	    }

	    /**
	     * compile dom node input to curren unit context
	     * @param {Node} domNode DOM Node input
	     * @returns {Node} DOM Node as anchor
	     */
	    _compile( domNode ) {
	        let name = this.constructor.TEXT_PROP_NAME;

	        // TODO: we can do it better later by supporting "aaa {bbb} ccc"
	        this.setInput( name, this._parser.parse( domNode[name] ) );
	        return domNode;
	    }

	    /**
	     * update dom node based on vm
	     * @param {Node} domNode input dom node
	     * @param {Object} vm model
	     * @returns {Node} updated dom node
	     */
	    _update( domNode, vm ) {
	        let name = this.constructor.TEXT_PROP_NAME;
	        let expr = this.getInput( name );
	        if ( expr ) {
	            let name = this.constructor.TEXT_PROP_NAME;
	            let res = evalExpression( this.getInput( name ), vm, true );
	            let last = this.getValue( name );
	            // string. TODO: error handling
	            if ( last === undefined || last !== res ) {
	                this.setValue( name, res );
	                domNode[name] = res ? res : '';
	            }
	        }
	        return domNode;
	    }
	}

	var textUnitFactory = {
	    when: ( domNode ) => domNode.nodeType === Node.TEXT_NODE,
	    createUnit: ( domNode, parser ) => new FewViewTextUnit( domNode, parser )
	};

	/* eslint-env es6 */

	class FewViewCondUnit extends FewViewUnit {
	    static get KEY() {
	        return 'f-cond';
	    }

	    /**
	     * compile dom node input to curren unit context
	     * @param {Node} domNode DOM Node input
	     * @returns {Node} DOM Node as anchor
	     */
	    _compile( domNode ) {
	        let key = this.constructor.KEY;
	        this.setInput( key, domNode.getAttribute( key ) );

	        domNode.removeAttribute( key );
	        this.addChild( viewUnitFactory.createUnit( domNode, this._parser ) );
	        return domNode;
	    }

	    /**
	     * update dom node based on vm
	     * @param {Node} domNode input dom node
	     * @param {Object} vm model
	     * @returns {Node} updated dom node
	     */
	    _update( domNode, vm ) {
	        let newNode = domNode;
	        let name = this.constructor.KEY;

	        let vExpr = this.getInput( name );
	        let vIfRes = evalExpression( vExpr, vm, true );
	        let vIfLst = this.getValue( name );
	        if ( vIfLst === undefined || vIfLst !== Boolean( vIfRes ) ) {
	            let parentNode = domNode.parentNode;
	            if( vIfRes ) {
	                newNode = this.getChildren()[0].render( vm );
	                if ( newNode !== domNode ) {
	                    parentNode.replaceChild( newNode, domNode );
	                }
	            } else {
	                newNode = document.createComment( `f-cond ${vExpr} = ${vIfRes}` );
	                parentNode.replaceChild( newNode, domNode );
	            }
	        }
	        this.setValue( name, Boolean( vIfRes ) );

	        return newNode;
	    }
	}

	var condUnitFactory = {
	    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE && domNode.hasAttribute( FewViewCondUnit.KEY ),
	    createUnit: ( domNode, parser ) => new FewViewCondUnit( domNode, parser )
	};

	/* eslint-env es6 */

	class FewViewEachUnit extends FewViewUnit {
	    static get KEY() {
	        return 'f-each';
	    }

	    static get EACH_VAR_NAME() {
	        return 'f-var';
	    }

	    static get EACH_SET_NAME() {
	        return 'f-set';
	    }

	    static get EACH_TEMPLATE() {
	        return 'f-template';
	    }

	    /**
	     * compile dom node input to curren unit context
	     * @param {Node} domNode DOM Node input
	     * @returns {Node} DOM Node as anchor
	     */
	    _compile( domNode ) {
	        let name = this.constructor.KEY;
	        let varKey = this.constructor.EACH_VAR_NAME;
	        let setKey = this.constructor.EACH_SET_NAME;
	        let templKey = this.constructor.EACH_TEMPLATE;

	        // Process f-each clause
	        let vForExpr = domNode.getAttribute( name );
	        let match = vForExpr.match( /^\s*(\S+)\s+(in|of)\s+(\S+)\s*$/ );

	        // TODO: Error handling
	        // TODO: put template DOM at child unit #0, need a better solution later
	        domNode.removeAttribute( name );
	        this.setInput( varKey, match[1] );
	        this.setInput( setKey, match[3] );
	        this.setInput( templKey, domNode );


	        // TODO: couple with HTML/DOM, can be abstract later
	        // Backup node input for for purpose
	        let commentNode = document.createComment( `${name}(${vForExpr})` );
	        if ( domNode.parentNode ) {
	            domNode.parentNode.replaceChild( commentNode, domNode );
	        }


	        // this.addChild( { domNode: node } );

	        // Use current node as anchor
	        // TODO: we can put a global comment anchor later rather than use node
	        return commentNode;
	    }

	    /**
	     * update dom node based on vm
	     * @param {Node} domNode input dom node
	     * @param {Object} vm model
	     * @returns {Node} updated dom node
	     */
	    _update( domNode, vm ) {
	        let newNode = domNode;
	        let parentNode = domNode.parentNode;
	        let varKey = this.constructor.EACH_VAR_NAME;
	        let setKey = this.constructor.EACH_SET_NAME;
	        let templKey = this.constructor.EACH_TEMPLATE;
	        let childUnits = this.getChildren();

	        let varName = this.getInput( varKey );
	        let setName = this.getInput( setKey );
	        let templNode = this.getInput( templKey );
	        let vForLst = childUnits.length;
	        // let vForRes = vm[setName] ? vm[setName].length + 1 : 1;
	        let vForRes = vm[setName];
	        let vForResLength = vForRes ? vForRes.length : 0;

	        // TODO:we can do either length check, order check, shallow compare...
	        if ( vForLst  > vForResLength ) {
	            // Remove exceeded template
	            // TODO: Make sure no memory leak later
	            childUnits.splice( vForResLength );

	            // Update DOM
	            for( let i = vForResLength; i < vForLst; i++ ) {
	                let prevNode = newNode.previousSibling;
	                parentNode.removeChild( newNode );
	                newNode = prevNode;
	            }
	        } else if ( vForLst < vForResLength ) {
	            // Append new template
	            let fragment = document.createDocumentFragment();
	            for( let i = vForLst; i < vForResLength; i++ ) {
	                let newNode = templNode.cloneNode( true );
	                this.addChild( viewUnitFactory.createUnit( newNode, this._parser ) );
	                fragment.appendChild( newNode );
	            }
	            newNode = fragment.lastChild;
	            parentNode.insertBefore( fragment, domNode.nextSibling );
	        }

	        // Re-render template set
	        if ( vForResLength > 0 ) {
	            let iCount = 0;
	            // re-fetch children because of one side effect
	            this.getChildren().map( ( ch ) => {
	                let vVar = {};
	                vVar[varName] = vForRes[iCount++];
	                return ch.render( Object.assign( Object.assign( {}, vm ), vVar ) );
	            } );
	        }

	        return newNode;
	    }
	}

	var eachUnitFactory = {
	    when: ( domNode ) => domNode.nodeType === Node.ELEMENT_NODE && domNode.hasAttribute( FewViewEachUnit.KEY ),
	    createUnit: ( domNode, parser ) => new FewViewEachUnit( domNode, parser )
	};

	/* eslint-env es6 */


	// Unit
	viewUnitFactory.addFactory( textUnitFactory );
	viewUnitFactory.addFactory( nullUnitFactory );
	viewUnitFactory.addFactory( eachUnitFactory );
	viewUnitFactory.addFactory( condUnitFactory );
	viewUnitFactory.addFactory( varUnitFactory );

	var htmlViewFactory = {
	    createView: ( templateString, parser ) => viewUnitFactory.createUnit( parseView( templateString ), parser )
	};

	/* eslint-env es6 */
	// Default module loader for few, for difference case user may need to implement
	// there own
	// In this OOTB example, we assume we are using single bundle without code split.
	// So ther is a simple delegate for this purpose
	// import FewButton from './few-button';

	/**
	 * load single module
	 * @param {string} moduleName module name or rel path as key
	 * @returns {Promise} promise with module object
	 */
	function loadModule( moduleName ) {
	    /*
	    if ( /few-button$/.test( moduleName ) ) {
	        return Promise.resolve( FewButton );
	    }
	    */
	    return new Promise(function (resolve, reject) { require([ moduleName ], function (m) { resolve(_interopNamespace(m)); }, reject) });
	}

	/**
	 * load single module
	 * @param {Array} moduleNames array of name or rel path for modules as key
	 * @returns {Promise} promise with module objects
	 */
	function loadModules( moduleNames ) {
	    return Promise.all( moduleNames.map( ( key ) => {
	        return new Promise(function (resolve, reject) { require([ key ], function (m) { resolve(_interopNamespace(m)); }, reject) });
	    } ) );
	}

	var moduleLoader = {
	    loadModule,
	    loadModules
	};

	/* eslint-env es6 */

	/**
	 * String Template Parser
	 */
	class StringTemplateParser {
	    constructor( template ) {
	        let tpl = template ? template : this.constructor.defaultTemplate;

	        // regular expression object
	        this._regExpObj = evalExpression( tpl.pattern );

	        // match index
	        this._matchIdx = tpl.index;
	    }

	    /**
	     * Parse string with template
	     * @param {string} str input string
	     * @returns {string} expression define by input string
	     */
	    parse( str ) {
	        let match = this._regExpObj.exec( str );
	        if ( match ) {
	            return match[this._matchIdx];
	        }
	    }
	}

	StringTemplateParser.defaultTemplate = {
	    // eslint-disable-next-line no-template-curly-in-string
	    pattern: '/^\\s*\\${\\s*([\\S\\s\\r\\n]*)\\s*}\\s*$/m',
	    index: 1
	};

	/* eslint-env es6 */

	class FewComponent {
	    /**
	     * Constructor for View Model Object
	     * @param {FewComponent} parent parent view model
	     * @param {Object} componentDef component definition
	     * @param {string} scopeExpr expression to fetch scope in parent component
	     */
	    constructor( parent, componentDef, scopeExpr ) {
	        /**
	         * parent view model
	         */
	        this._parent = parent;

	        this._children = [];

	        if ( parent ) {
	            parent._children.push( this );
	        }

	        /**
	         * view object
	         */
	        this._view = null;

	        /**
	         * component definition
	         */
	        this._vm = componentDef;

	        /**
	         * Dirty flag, we can put it to model, for now put it here
	         */
	        this._isDirty = false;


	        /**
	         * Default options
	         */
	        this._option = componentDef.option || {};

	        if ( !this._option.moduleLoader ) {
	            this._option.moduleLoader = moduleLoader;
	        }

	        if ( !this._option.scopePath ) {
	            this._option.scopePath = 'scope';
	        }

	        if( !this._option.actionPaths ) {
	            this._option.actionPaths = [ 'action' ];
	        }
	        this._option.actionPaths.push( '' );

	        if ( !this._option.stringTemplate ) {
	            this._option.stringTemplate = {
	                // eslint-disable-next-line no-template-curly-in-string
	                pattern: '/^\\s*\\${\\s*([\\S\\s\\r\\n]*)\\s*}\\s*$/m',
	                index: 1
	            };
	        }

	        // Load string template
	        this._strTplParser = new StringTemplateParser( this._option.stringTemplate );

	        // Load Scope
	        if ( scopeExpr ) {
	            let parentScope = evalExpression( scopeExpr, this._parent._vm.model );
	            Object.assign( parentScope, this._vm.model );
	            this._vm.model = parentScope;
	        } else if ( !this._vm.model ) {
	            this._vm.model = {};
	        }

	        /**
	         * method update view
	         * TODO: can we return promise here
	         */
	        this._updateViewDebounce = lodash.debounce( () => {
	            this._updateView();
	        }, 100 );
	    }

	    ///////////////////////////////////////////////////////////////////////////////////////
	    _updateView() {
	        if ( this._view ) {
	            this._view.render( this._vm.model );
	            this._isDirty = false;
	        }

	        // TODO: If parent and child share the same scope, and the scope is updated in parent, when msg is destributed
	        // to child, the child cannot diffrenciate the value has been changed or not.
	        // For now do a hard update for every child node, which is bad practice
	        lodash.forEach( this._children, ( c ) => {
	            c._updateView();
	       } );
	    }

	    _requestViewUpdate() {
	        if ( this._parent ) {
	            this._parent._requestViewUpdate();
	        } else {
	            this._updateViewDebounce();
	        }
	    }

	    /**
	     * set view for current view model
	     * @param {Object} view view input
	     * @returns {Promise} promise with view element
	     */
	    async createView( view ) {
	        await this._option.moduleLoader.loadModules( view.import ? view.import : [] );

	        this._view = htmlViewFactory.createView( view.template, this._strTplParser );

	        return this._view;

	        // let elem = this._view.render( this._vm.model );
	        // setComponent( elem, this );
	        // return elem;
	    }

	    /**
	     * attach current view to DOM in page
	     * @param {Element} elem DOM Element in page
	     */
	    attachViewToPage( elem ) {
	        /**
	         * - The raw temple is a HTML which all custom element functon is not executed.
	         * - We need to attach the view to actual page so all the custom element render takes priority
	         * - Then we render -> it will have some overhead
	         * - Then the custom directive gets executed to make sure no crash with custom element logic
	         */
	        setComponent( this._view.domNode, this );
	        elem.appendChild( this._view.domNode );
	        this._view.render( this._vm.model );
	    }

	    /**
	     * get root dom node for current component
	     * @returns {Node} dom node
	     */
	    getDomNode() {
	        return this._view.domNode;
	    }

	    /////////////////////////////////////////////////////////////////////////////////////////

	    /**
	     * Update value and trigger view update
	     * @param {string} path value path on model
	     * @param {string} value value itself
	     */
	    _updateModel( path, value ) {
	        lodash.set( this._vm.model, path, value );
	        this._isDirty = true;
	    }

	    _getActionDefinition( key ) {
	        let methodDef = null;
	        lodash.forEach( this._option.actionPaths, ( p ) => {
	            methodDef = lodash.get( this._vm,  p && p.length > 0 ? `${p}.${key}` : key );
	            if ( methodDef ) {
	                return false;
	            }
	        } );

	        return methodDef;
	    }

	    _setScope( scope ) {
	        this._vm.model[this._option.scopePath] = scope;
	    }

	    _evalActionInput( input, level = 0 ) {
	        // Make the method to be immutable at top level
	        let obj = level > 0 ? input : cloneDeepJsonObject( input );

	        for( let key in obj ) {
	            // TODO: we can do it at compile to save performance
	            let value = obj[key];
	            if ( typeof value === 'string' ) {
	                let template = this._strTplParser.parse( value );
	                if ( template ) {
	                    obj[key] = evalExpression( template, this._vm.model );
	                }
	            } else {
	                this._evalActionInput( obj[key], level + 1 );
	            }
	        }
	        return obj;
	    }

	    async _executeAction( actionDef, scope ) {
	        let dep =  actionDef.import ? await this._option.moduleLoader.loadModule( actionDef.import ) : window;

	        // backup and apply scope
	        // For now only support on level scope
	        let originArg = this._vm.model[this._option.scopePath];
	        this._setScope( scope );

	        let input = this._evalActionInput( actionDef.input );
	        let vals = actionDef.input ? Object.values( input ) : [];

	        let func = lodash.get( dep, actionDef.name );
	        let res = actionDef.name ? await func.apply( dep, vals ) : input;

	        // restore origin namespace
	        if ( originArg ) {
	            this._setScope( originArg );
	        }

	        lodash.forEach( actionDef.output, ( valPath, vmPath ) => {
	            this._updateModel( vmPath, valPath && valPath.length > 0 ? lodash.get( res, valPath ) : res );
	        } );

	        // scope as next input
	        // return Object.assign( scope, res );
	        return res !== undefined ? res : scope;
	    }

	    /**
	     * check if action exist on current component
	     * @param {string} methodName action name
	     * @returns {boolean} true if action exist in current definition
	     */
	    hasAction( methodName ) {
	        return this._getActionDefinition( methodName );
	    }


	    /**
	     * evaluate method in view model
	     * @param {string} methodName method name in view model
	     * @param {object} scope input from upstream
	     * @param {boolean} updateView if true will update view
	     * @returns {Promise} promise with scope value
	     */
	    async update( methodName, scope, updateView = true ) {
	        let actionDef = this._getActionDefinition( methodName );

	        let res = null;
	        if ( lodash.isArray( actionDef ) ) {
	            res = await actionDef.reduce( async( scope, name ) => {
	                return this.update( name, await scope, false );
	            }, scope );
	        } else {
	            res = await this._executeAction( actionDef, scope );
	        }

	        if( updateView ) {
	            this._requestViewUpdate();
	        }

	        return res;
	    }
	}

	/* eslint-env es6 */

	class FewView extends HTMLElement {
	    static get tag() {
	        return 'few-view';
	    }

	    static get observedAttributes() {
	        return [ 'src', 'model' ];
	    }

	    constructor() {
	        super();

	        /**
	         * view model
	         */
	        this._component = null;

	        // SLOT: get all children and save at slot as template
	        // TODO: we can do it outside and passin unit which will be better
	        let size = this.childNodes.length;
	        if ( size > 0 ) {
	            this._slot = {
	                domFragement: document.createDocumentFragment(),
	                nameSlotMap: {}
	            };
	            for( let i = 0; i < size; i++ ) {
	                let domNode = this.firstChild;
	                if ( domNode.getAttribute && domNode.getAttribute( 'slot' ) ) {
	                    this._slot.nameSlotMap[domNode.getAttribute( 'slot' )] = domNode;
	                }
	                this._slot.domFragement.appendChild( domNode );
	            }
	        }
	    }

	    async attributeChangedCallback( name, oldValue, newValue ) {
	        // console.log( `${name}: ${oldValue} => ${newValue}` );

	        if ( name === 'src' && newValue && oldValue !== newValue ) {
	            this._pendingView = newValue;
	            try {
	                // clean up
	                this.innerHTML = '';

	                // TODO: clean up model except attribute defined by parent
	                // also need to destroy its ref in parent
	                // this._component.model = _.filter( modelPath );
	                // this._component.parent.remove(this._component);

	                let modelPath = this.getAttribute( 'model' );

	                // load component definition
	                let componentDef = yaml.parse( await http.get( `${newValue}.yml` ) );

	                if ( this._pendingView !== newValue ) {
	                    return;
	                }

	                this._component = new FewComponent( getComponent( this ), componentDef, modelPath );

	                // View has too be initialized separately since it is async
	                // let viewElem = await this._component.createView( componentDef.view );
	                // this.appendChild( viewElem );

	                await this._component.createView( componentDef.view );

	                if ( this._pendingView !== newValue ) {
	                    return;
	                }


	                // SLOT: apply slot to current DOM
	                // TODO: we can do it before atttachViewPage to save performance later
	                let slotElements = this._component.getDomNode().getElementsByTagName( 'SLOT' );
	                let size = slotElements.length;
	                if ( size > 0 ) {
	                    let unNamedSlot = null;
	                    for( let i = 0; i < size; i++ ) {
	                        let slotElem = slotElements[0];  // <-- HTMLCollection is a dynamic list
	                        let slotName = slotElem.getAttribute( 'name' );
	                        if ( slotName && this._slot.nameSlotMap[slotName] ) {
	                            slotElem.parentElement.replaceChild( this._slot.nameSlotMap[slotName], slotElem );
	                        } else if( !unNamedSlot ) {
	                            // match thi 1st unnamed slot
	                            unNamedSlot = slotElem;
	                        }
	                    }

	                    // if we have unname slot, put all the rest into unname slot
	                    if ( unNamedSlot ) {
	                        unNamedSlot.parentElement.replaceChild( this._slot.domFragement, unNamedSlot );
	                    }
	                }

	                // One time apply, no dynamic featue
	                delete this._slot;


	                this._component.attachViewToPage( this );

	                delete this._pendingView;
	            } catch ( e ) {
	                if ( this._pendingView !== newValue ) {
	                    return;
	                }
	                this.appendChild( parseViewToDiv( `<code style="color:red" >${newValue}.yml: ${e}</code>` ) );
	            }
	        }
	    }
	}
	customElements.define( FewView.tag, FewView );

	// main entrance for debug test site

	// even though Rollup is bundling all your files together, errors and
	// logs will still point to your original source modules

	return few;

});
//# sourceMappingURL=few.js.map
