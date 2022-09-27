"""The page compiler."""
import sys

from dataclasses import dataclass
from lark import Lark, ast_utils, Token
from lark.ast_utils import Ast, Transformer
from typing import List


grammar = r'''
page: _statement*

_statement: markdown | checkbox

markdown: "Markdown" "(" _string ")"
checkbox: "Checkbox" "(" CNAME "," _value "," _label ")"

_value: _string
_label: _string

_string: INLINE_STRING | BLOCK_STRING
INLINE_STRING: ("\"" | "'") _STRING_ESC_INNER ("\"" | "'")
BLOCK_STRING: "\"\"\"" ( _STRING_ESC_INNER | NEWLINE)* "\"\"\""

%import common._STRING_ESC_INNER
%import common.NEWLINE
%import common.CNAME
%import common.WS
%ignore WS
'''


class _Statement(Ast):
    """Type definition for base statement rule."""

    def to_json(self: '_Statement') -> dict:
        """Return a JSON representation."""
        return {'op': 'NoOp'}


@dataclass
class Page(Ast, ast_utils.AsList):
    """The Page is the top-level Ast container."""

    statements: List[_Statement]

    def to_json(self: 'Page') -> list:
        """Return a JSON representation."""
        return [stmt.to_json() for stmt in self.statements]


@dataclass
class Markdown(_Statement):
    """The Markdown statement holds the string value."""

    string: str

    def to_json(self: 'Markdown') -> dict:
        """Return a JSON representation."""
        return {'op': 'Markdown', 'string': self.string}


@dataclass
class Checkbox(_Statement):
    """The Checkbox statement consists of a name, value, and label."""

    name: str
    value: str
    label: str

    def to_json(self: 'Markdown') -> dict:
        """Return a JSON representation."""
        return {'op': 'Checkbox',
                'name': self.name,
                'value': self.value,
                'label': self.label}


class ToAst(Transformer):
    """Transformer for terminals."""

    def INLINE_STRING(self: 'ToAst', string: str) -> str:
        """Strip the quotation marks from an inline string."""
        return string[1:-1]

    def BLOCK_STRING(self: 'ToAst', string: str) -> str:
        """Strip the quotation marks from a multiline string."""
        return string[3:-3]

    def CNAME(self: 'ToAst', token: Token) -> str:
        """Return the token value for CNAMEs."""
        return token.value


parser = Lark(grammar, parser='lalr', start='page')
transformer = ast_utils.create_transformer(sys.modules[__name__], ToAst())


def parse(text: str) -> Page:
    """Parse the given text, returning the abstract syntax tree."""
    tree = parser.parse(text)
    return transformer.transform(tree)


def compile(text: str) -> list:
    """Compile the given text into a list of operations."""
    page = parse(text)
    return page.to_json()
