import json
import logging
import os

from src import context
from src.database.database import Database
from src.documents import write_document
from src.documents.upload_document import upload_file_data
from src.external.aws.dynamodb import DynamoDb
from src.external.aws.s3 import S3
from src.logging_config import setup_logger
from src.storage import CloudStorage

appContext = context.ApplicationContext()
appContext.register(CloudStorage, S3())
appContext.register(Database, DynamoDb())

setup_logger()


def lambda_handler(event, context):
    try:
        if "body" not in event:
            error_message = "No file provided"
            logging.error(error_message)
            return {
                "statusCode": 400,
                "body": json.dumps({"error": error_message}),
            }

        body = json.loads(event["body"])
        try:
            bucket_name = os.environ.get("S3_BUCKET_NAME", "ocr-poc-flex")
            default_folder = "input/"
            document_id, key = upload_file_data(body["file_name"], body["file_content"], bucket_name, default_folder)
            s3_url = f"s3://{bucket_name}/{key}"
            write_document.write_document(document_id, s3_url)
        except Exception as e:
            logging.exception(e)
            return {
                "statusCode": 500,
                "body": json.dumps({"error": str(e)}),
            }

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "File uploaded successfully.", "documentId": document_id}),
        }

    except Exception as e:
        logging.exception(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }
