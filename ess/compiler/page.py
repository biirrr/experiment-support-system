"""The page compiler."""
import sys

from dataclasses import dataclass
from lark import Lark, ast_utils
from lark.ast_utils import Ast, Transformer
from typing import List


grammar = r'''
page: _statement*

_statement: markdown

markdown: "Markdown" "(" _string ")"

_string: INLINE_STRING | BLOCK_STRING
INLINE_STRING: ("\"" | "'") _STRING_ESC_INNER ("\"" | "'")
BLOCK_STRING: ("\"\"\"" | "\'\'\'") ( _STRING_ESC_INNER | NEWLINE)* ("\"\"\"" | "\'\'\'")

%import common._STRING_ESC_INNER
%import common.NEWLINE
%import common.WS
%ignore WS
'''


class _Statement(Ast):
    """Type definition for base statement rule."""
    pass


@dataclass
class Page(Ast, ast_utils.AsList):
    """The Page is the top-level Ast container."""
    statements: List[_Statement]


@dataclass
class Markdown(_Statement):
    """The Markdown statement holds the string value."""
    string: str


class ToAst(Transformer):
    """Transformer for terminals."""

    def INLINE_STRING(self: 'ToAst', string: str) -> str:
        """Strip the quotation marks from an inline string."""
        return string[1:-1]

    def BLOCK_STRING(self: 'ToAst', string: str) -> str:
        """Strip the quotation marks from a multiline string."""
        return string[3:-3]


parser = Lark(grammar, parser='lalr', start='page')
transformer = ast_utils.create_transformer(sys.modules[__name__], ToAst())

def parse(text: str) -> Page:
    """Parse the given text, returning the abstract syntax tree."""
    tree = parser.parse(text)
    return transformer.transform(tree)
