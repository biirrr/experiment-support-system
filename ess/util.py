"""Utility functions."""

_config = {}


def set_config(config: dict) -> None:
    """Set the configuration to use.

    :param config: The configuration to use
    :type config: `dict`
    """
    global _config
    _config = config


def config() -> dict:
    """Get the active configuration.

    :return: The active configuration
    :return_type: `dict`
    """
    return _config
