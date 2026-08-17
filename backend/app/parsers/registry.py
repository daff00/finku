from app.models.models import BankEnum
from app.parsers.base_parser import BaseParser
from app.parsers.bca_pdf import BcaPdfParser

PARSER_REGISTRY: dict[BankEnum, type[BaseParser]] = {
    BankEnum.BCA: BcaPdfParser,
}


def get_parser_for_bank(bank: BankEnum) -> BaseParser:
    parser_cls = PARSER_REGISTRY.get(bank)
    if parser_cls is None:
        raise ValueError(f"{bank.value} statement import is not supported yet")
    return parser_cls()


def is_bank_supported(bank: BankEnum) -> bool:
    return bank in PARSER_REGISTRY
