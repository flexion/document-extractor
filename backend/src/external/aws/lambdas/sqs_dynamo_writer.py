import json
import logging
import os

import boto3
from types_boto3_sqs import SQSClient

from src.context import ApplicationContext
from src.database.database import Database
from src.documents import write_document
from src.external.aws.dynamodb import DynamoDb
from src.logging_config import setup_logger

sqs_queue_url = os.environ["SQS_QUEUE_URL"]

appContext = ApplicationContext()
appContext.register(Database, DynamoDb())
appContext.register(SQSClient, boto3.client("sqs"))

setup_logger()


def lambda_handler(event, context):
    logging.info("Process to write from SQS to Dynamo has started...")
    for record in event["Records"]:
        try:
            message_body = json.loads(record["body"])

            document_url = message_body["document_url"]
            document_type = message_body.get("document_type")
            extracted_data = message_body.get("extracted_data", {})

            write_document.update_document(document_url, document_type, extracted_data)

            sqs_client = appContext.implementation(SQSClient)
            sqs_client.delete_message(QueueUrl=sqs_queue_url, ReceiptHandle=record["receiptHandle"])
        except Exception as e:
            exception_message = "An internal error happened while trying to save a document to the database"
            logging.error(exception_message)
            logging.exception(e)
            raise

    logging.info("Process complete")
