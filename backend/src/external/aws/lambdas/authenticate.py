import logging
import os

from src import context
from src.external.aws.iam import Iam
from src.external.aws.secret_manager import SecretManager
from src.logging_config import setup_logger
from src.login.authenticate import generate_role, has_valid_token
from src.login.user.role import Role
from src.secret.cloud_secret_manager import CloudSecretManager

appContext = context.ApplicationContext()
appContext.register(CloudSecretManager, SecretManager())
appContext.register(Role, Iam())

setup_logger()

ENVIRONMENT = os.environ["ENVIRONMENT"]


def lambda_handler(event, context):
    token = event["authorizationToken"].replace("Bearer ", "")
    logging.info("Verifying JWT token")
    if has_valid_token(token, ENVIRONMENT):
        logging.info("A valid token is present. Generating allow policy...")
        return generate_role("user", "Allow", event["methodArn"])
    else:
        logging.info("A invalid token is present. Generating deny policy...")
        return generate_role("user", "Deny", event["methodArn"])
