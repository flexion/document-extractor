from src.forms.form import Form


class DDTwoOneFour(Form):
    def identifier(self) -> str:
        return "DD214"

    def form_matches(self) -> str:
        return "DD FORM 214"

    def queries(self) -> list[str]:
        return [
            "1. NAME (Last, First, Middle)",
            "2. DEPARTMENT, COMPONENT AND BRANCH",
            "12. RECORD OF SERVICE, a. DATE ENTERED AD THIS PERIOD, YEAR(S) MONTHS(S) DAY(S)",
            "12. RECORD OF SERVICE, b. SEPARATION DATE THIS PERIOD, YEAR(S) MONTHS(S) DAY(S)",
            "12. RECORD OF SERVICE, e. TOTAL PRIOR INACTIVE SERVICE, YEAR(S) MONTHS(S) DAY(S)",
            "13. DECORATIONS, MEDALS, BADGES, CITATIONS AND CAMPAIGN RIBBONS AWARDED OR AUTHORIZED (All periods of "
            "service)",
            "16. DAYS ACCRUED LEAVE PAID",
            "19a. MAILING ADDRESS AFTER SEPARATION (Include ZIP Code)",
            "21.a. MEMBER SIGNATURE",
            "21.b. DATE (YYYY/MM/DD)",
        ]
