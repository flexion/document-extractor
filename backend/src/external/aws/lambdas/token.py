import json
import logging
import os

from src import context
from src.external.aws.secret_manager import SecretManager
from src.logging_config import setup_logger
from src.login.login import generate_token, has_valid_credentials
from src.secret.cloud_secret_manager import CloudSecretManager

appContext = context.ApplicationContext()
appContext.register(CloudSecretManager, SecretManager())

environment = os.environ["ENVIRONMENT"]

setup_logger()


def lambda_handler(event, context):
    logging.info("Getting username and password from request body")
    if "body" not in event or "username" not in event["body"] or "password" not in event["body"]:
        logging.warning("Credentials missing in request body")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "No file provided"}),
        }
    body = json.loads(event["body"])
    username = body["username"]
    password = body["password"]

    try:
        if not has_valid_credentials(username, password, environment):
            logging.warning("Invalid credentials")
            return {"statusCode": 401, "body": json.dumps({"error": "Invalid credentials"})}
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e)),
        }

    # Create JWT token
    try:
        logging.info("Generating JWT")
        token = generate_token(username, environment)
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps(str(e)),
        }

    return {"statusCode": 200, "body": json.dumps({"access_token": token, "token_type": "bearer"})}
