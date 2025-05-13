from abc import ABC, abstractmethod

from src.database.data.document_item import DocumentItem


class Database(ABC):
    @abstractmethod
    def get_document(self, document_id: str) -> DocumentItem | None:
        pass

    @abstractmethod
    def write_document(self, document: DocumentItem):
        pass
