"""CLI base functionality."""
import click
import logging

from generic_cli_base import create_cli_base

from ..util import set_config


logger = logging.getLogger(__name__)

CONFIG_SCHEMA = {
    'app': {
        'type': 'dict',
        'required': True,
        'default': {
            'title': 'Experiment Support System'
        },
        'schema': {
            'title': {
                'type': 'string',
                'required': True,
                'default': 'Experiment Support System'
            }
        }
    },
    'debug': {
        'type': 'boolean',
        'default': False,
    },
    'logging': {
        'type': 'dict'
    }
}


cli_app = create_cli_base('ess',
                          'Experiment Support System',
                          config_schema=CONFIG_SCHEMA,
                          set_config=set_config)


@click.command()
def setup() -> None:
    """Run the setup process."""
    logging.debug('Running the setup process')


cli_app.add_command(setup)


def main() -> None:
    """Entry point for the CLI application."""
    cli_app()
