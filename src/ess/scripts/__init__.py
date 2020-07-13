import click
import os

from pyramid.paster import get_appsettings, setup_logging

from . import config, db, cron, settings, admin


@click.group()
@click.option('-c', '--config', default='production.ini')
@click.pass_context
def main(ctx, config):
    """Administration Utility for TOJA"""
    os.environ['TOJA_WITHIN_WEBAPP'] = 'True'
    #from ..tasks import setup_broker  # noqa
    try:
        setup_logging(config)
        settings = get_appsettings(config)
        ctx.obj = {'settings': settings}
    #    setup_broker(settings)
    except FileNotFoundError:
        pass


main.add_command(config.create_config)
main.add_command(db.init_db)
main.add_command(cron.cron)
main.add_command(settings.list_settings)
main.add_command(settings.set_setting)
main.add_command(admin.add_user)
main.add_command(admin.delete_user)
main.add_command(admin.set_user_status)
