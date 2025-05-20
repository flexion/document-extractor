import logging

import jwt

from src import context
from src.login.user.role import Role
from src.secret import CloudSecretManager


@context.inject
def has_valid_token(token, environment, cloud_secret_manager: CloudSecretManager = None) -> bool:
    public_key = cloud_secret_manager.get_secret(f"document-extractor-{environment}-public-key")
    try:
        jwt.decode(token, public_key, algorithms=["RS512"])
        return True
    except jwt.PyJWTError:
        exception_message = "Failed to authenticate token"
        logging.warning(exception_message)
        return False


@context.inject
def generate_role(principal_id, effect, resource, role: Role = None):
    return role.get_role(principal_id, effect, resource)
