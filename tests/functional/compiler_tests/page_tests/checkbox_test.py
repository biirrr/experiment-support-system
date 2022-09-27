"""Test the markdown functionality in the page compiler."""
from ess.compiler import compile_page


def test_basic_checkbox() -> None:
    """Test the checkbox command."""
    ops = compile_page('''
Checkbox(consent, 'yes', 'I consent to participating as outlined above.')
''')
    assert ops == [{'op': 'Checkbox',
                    'name': 'consent',
                    'value': 'yes',
                    'label': 'I consent to participating as outlined above.'}]
