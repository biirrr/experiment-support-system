import cerberus
import inflect
import logging
import smtplib

from cgi import FieldStorage
from email.mime.text import MIMEText
from email.utils import formatdate
from sqlalchemy import and_

from .models import Page, Transition, Setting


def convert_type(value, target_type, default=None):
    """Attempts to convert the ``value`` to the given ``target_type``. Will
    return ``default`` if the conversion fails.

    Supported ``target_type`` values are:

    * `int` -- Convert to an integer value
    * `boolean` -- Convert to a boolean value (``True`` if the value is the
      ``unicode`` string "true" in any capitalisation
    * `list` -- Convert to a list, splitting on line-breaks and commas

    :param value: The value to convert
    :type value: `unicode`
    :param target_type: The target type to convert to
    :type target_type: `unicode`
    :param default: The default value if the conversion fails
    :return: The converted value
    """
    if target_type == 'int':
        try:
            return int(value)
        except ValueError:
            return default
    elif target_type == 'boolean':
        if value and value.lower() == 'true':
            return True
        else:
            return False
    elif target_type == 'list':
        return [v.strip() for line in value.split('\n') for v in line.split(',') if v.strip()]
    if value:
        return value
    else:
        return default


# Cached application settings for faster access
CACHED_SETTINGS = {}


def get_config_setting(request, key, target_type=None, default=None):
    """Gets a configuration setting from the application configuration.
    Settings are cached for faster access.

    :param request: The request used to access the configuration settings
    :type request: :class:`~pyramid.request.Request`
    :param key: The configuration key
    :type key: `unicode`
    :param target_type: If specified, will convert the configuration setting
                        to the given type using :func:`~toja.util.convert_type`
    :type default: The default value to return if there is no setting with the
                   given key
    :return: The configuration setting value or ``default``
    """
    global CACHED_SETTINGS
    if key in CACHED_SETTINGS:
        return CACHED_SETTINGS[key]
    else:
        if key in request.registry.settings:
            if target_type:
                CACHED_SETTINGS[key] = convert_type(request.registry.settings[key], target_type, default=default)
            else:
                CACHED_SETTINGS[key] = request.registry.settings[key]
        else:
            CACHED_SETTINGS[key] = default
        return get_config_setting(request, key, target_type=target_type, default=default)


def get_setting(request, key, target_type=None, default=None):
    """Gets a configuration setting from the application settings.

    :param request: The request used to access the configuration settings
    :type request: :class:`~pyramid.request.Request`
    :param key: The configuration key
    :type key: `unicode`
    :param target_type: If specified, will convert the configuration setting
                        to the given type using :func:`~toja.util.convert_type`
    :type default: The default value to return if there is no setting with the
                   given key
    :return: The configuration setting value or ``default``
    """
    setting = request.dbsession.query(Setting).filter(Setting.key == key).first()
    if setting:
        if target_type:
            return convert_type(setting.value, target_type, default=default)
        else:
            return setting.value
    else:
        return default


def send_email(request, recipient, sender, subject, text):  # pragma: no cover
    """Sends an e-mail based on the settings in the configuration file. If
    the configuration does not have e-mail settings or if there is an
    exception sending the e-mail, then it will log an error.

    :param request: The current request used to access the settings
    :type request: :class:`pyramid.request.Request`
    :param recipient: The recipient's e-mail address
    :type recipient: `unicode`
    :param sender: The sender's e-mail address
    :type sender: `unicode`
    :param subject: The e-mail's subject line
    :type subject: `unicode`
    :param text: The e-mail's text body content
    :type text: `unicode`
    """
    if get_config_setting(request, 'app.email.smtp_host'):
        email = MIMEText(text)
        email['Subject'] = subject
        email['From'] = sender
        email['To'] = recipient
        email['Date'] = formatdate()
        try:
            smtp = smtplib.SMTP(get_config_setting(request, 'app.email.smtp_host'))
            if get_config_setting(request, 'app.email.ssl', target_type='bool', default=False):
                smtp.starttls()
            username = get_config_setting(request, 'app.email.username')
            password = get_config_setting(request, 'app.email.password')
            if username and password:
                smtp.login(username, password)
            smtp.sendmail(sender, recipient, email.as_string())
            smtp.quit()
        except Exception as e:
            logging.getLogger("toja").error(str(e))
            print(text)  # noqa TODO: Remove
    else:
        logging.getLogger("toja").error('Could not send e-mail as "app.email.smtp_host" setting not specified')
        print(text)  # noqa TODO: Remove


fieldstorage_type = cerberus.TypeDefinition('fieldstorage', (FieldStorage,), ())


class Validator(cerberus.Validator):
    """Extended Validator that can check whether two fields match."""

    types_mapping = cerberus.Validator.types_mapping.copy()
    types_mapping['fieldstorage'] = fieldstorage_type

    def _validate_matches(self, other, field, value):
        if other not in self.document:
            self._error(field, 'You must provide a value.')
        if self.document[other] != value:
            self._error(field, 'The value does not match.')

    def _validate_belongs_to_experiment(self, enabled, field, value):
        if enabled and 'type' in value and 'id' in value:
            request = self._config['request']
            query = None
            if value['type'] == 'pages':
                query = request.dbsession.query(Page).filter(and_(Page.id == value['id'],
                                                                  Page.experiment_id == request.matchdict['eid']))
            elif value['type'] == 'transition':
                query = request.dbsession.query(Transition).join(Transition.source).\
                    filter(and_(Transition.id == value['id'], Page.experiment_id == request.matchdict['eid']))
            elif value['type'] == 'experiment':
                if value['id'] != request.matchdict['eid']:
                    self._error(field, 'This object does not belong to the request experiment')
            if query is not None and query.first() is None:
                self._error(field, 'This object does not belong to the request experiment')


def date_to_json(date):
    """Converts a date into ISO-XXX representation for use in JSON data."""
    return date.strftime('%Y-%m-%dT%H:%M:%SZ')


def strftime(value, format):
    """Apply a stftime format to a date value."""
    return value.strftime(format)


def format(value, *args, **kwargs):
    """String format the given value."""
    return value.format(*args, **kwargs)


inflect_engine = inflect.engine()


def includeme(config):
    config.get_jinja2_environment().filters['config'] = get_config_setting
    config.get_jinja2_environment().filters['setting'] = get_setting
    config.get_jinja2_environment().filters['zip'] = zip
    config.get_jinja2_environment().filters['strftime'] = strftime
    config.get_jinja2_environment().filters['format'] = format
    config.get_jinja2_environment().filters['plural'] = inflect_engine.plural
