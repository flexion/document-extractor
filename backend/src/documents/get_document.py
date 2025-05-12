from src import context
from src.database.data.document_item import DocumentItem
from src.database.database import Database
from src.storage import CloudStorage


@context.inject
def get_document(
    document_id: str, database: Database = None, cloud_storage: CloudStorage = None
) -> tuple[DocumentItem | None, str | None, bytes | None]:
    document_info = database.get_document(document_id)
    if document_info is None:
        return None, None, None

    remote_storage_url = document_info.document_url
    storage_access_url = cloud_storage.access_url(remote_storage_url)
    document_data = cloud_storage.get_file(remote_storage_url)

    return document_info, storage_access_url, document_data
