import datetime
import logging

import bcrypt
import jwt

from src import context
from src.secret import CloudSecretManager


@context.inject
def has_valid_credentials(username, password, environment, cloud_secret_manager: CloudSecretManager = None):
    logging.info("Getting username from AWS Secrets Manager")
    stored_username = cloud_secret_manager.get_secret(f"document-extractor-{environment}-username")
    logging.info("Getting password from AWS Secrets Manager")
    stored_password = cloud_secret_manager.get_secret(f"document-extractor-{environment}-password")

    # AWS Secret Manager to hold one user credential
    logging.info("Validating credentials")
    return username == stored_username and bcrypt.checkpw(password.encode("utf-8"), stored_password.encode("utf-8"))


@context.inject
def generate_token(username, environment, cloud_secret_manager: CloudSecretManager = None):
    # Create JWT token
    logging.info("Getting private key from AWS Secrets Manager")
    private_key = cloud_secret_manager.get_secret(f"document-extractor-{environment}-private-key")

    try:
        payload = {"sub": username, "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)}
        return jwt.encode(payload, private_key, algorithm="RS512")
    except Exception as e:
        logging.exception(e)
        raise Exception("Failed to generate Token") from e
