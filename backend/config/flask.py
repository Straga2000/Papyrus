import os
from decouple import config

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FLASK_PROJECT_DIR = BASE_DIR + '/'
FLASK_UPLOAD_DIR = BASE_DIR + '/media/'


class Config(object):
    # Set up the App SECRET_KEY
    SECRET_KEY = config('SECRET_KEY', default='')
    STATIC_FOLDER = BASE_DIR + '/static/'
    UPLOAD_FOLDER = BASE_DIR + '/static/media'


class ProductionConfig(Config):
    DEBUG = False

    # Security
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_DURATION = 3600


class DebugConfig(Config):
    DEBUG = True


# Load all possible configurations
config_dict = {
    'Production': ProductionConfig,
    'Debug': DebugConfig
}
