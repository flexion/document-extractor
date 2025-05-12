from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class DocumentItem:
    document_id: str = None
    document_url: str = None
    status: str = "processing"
    document_type: str | None = None
    extracted_data: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}
