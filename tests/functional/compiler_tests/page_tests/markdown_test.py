"""Test the markdown functionality in the page compiler."""
from ess.compiler import compile_page


def test_markdown_singleline() -> None:
    """Test that the singleline strings work in the Markdown command."""
    ops = compile_page('''
Markdown('# Informed Consent')
''')
    assert ops == [{'op': 'Markdown', 'string': '# Informed Consent'}]

    ops = compile_page('''
Markdown("# Informed Consent")
''')
    assert ops == [{'op': 'Markdown', 'string': '# Informed Consent'}]


def test_markdown_multiline() -> None:
    """Test that multiline strings work in the Markdown command."""
    ops = compile_page('''
Markdown("""# Informed Consent

Legionary, you are the volunteer.""")
''')
    assert ops == [{'op': 'Markdown', 'string': '''# Informed Consent

Legionary, you are the volunteer.'''}]
