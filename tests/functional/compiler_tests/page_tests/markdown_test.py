"""Test the markdown functionality in the page compiler."""
from ess.compiler import parse_page
from ess.compiler.page import Page, Markdown


def test_markdown_singleline() -> None:
    """Test that the singleline strings work in the Markdown command."""
    ast = parse_page('''
Markdown('# Informed Consent')
''')
    assert ast == Page([Markdown('# Informed Consent')])

    ast = parse_page('''
Markdown("# Informed Consent")
''')
    assert ast == Page([Markdown('# Informed Consent')])


def test_markdown_multiline() -> None:
    """Test that multiline strings work in the Markdown command."""
    ast = parse_page('''
Markdown("""# Informed Consent

Legionary, you are the volunteer.""")
''')
    assert ast == Page([Markdown('''# Informed Consent

Legionary, you are the volunteer.''')])
