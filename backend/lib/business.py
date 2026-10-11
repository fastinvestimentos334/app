"""Server-side business rules: Brazilian business days, groups, modalities, yield accrual.

All money is handled in BRL with 2-decimal rounding. All "today" anchors use America/Sao_Paulo
(the platform's reference timezone) so the daily 00h rollover matches the Brazilian calendar.
"""

from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

APP_TZ = ZoneInfo("America/Sao_Paulo")

# National holidays (fixed + computed Easter-derived) for the operating window.
_FIXED_HOLIDAYS = {(1, 1), (4, 21), (5, 1), (9, 7), (10, 12), (11, 2), (11, 15), (11, 20), (12, 25)}


def _easter(year: int) -> date:
    a, b, c = year % 19, year // 100, year % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    el = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * el) // 451
    month = (h + el - 7 * m + 114) // 31
    day = ((h + el - 7 * m + 114) % 31) + 1
    return date(year, month, day)


def _movable_holidays(year: int) -> set[date]:
    easter = _easter(year)
    return {
        easter - timedelta(days=48),  # Carnaval (Monday)
        easter - timedelta(days=47),  # Carnaval (Tuesday)
        easter - timedelta(days=2),  # Sexta-feira Santa
        easter + timedelta(days=60),  # Corpus Christi
    }


def is_business_day(day: date) -> bool:
    if day.weekday() >= 5:
        return False
    if (day.month, day.day) in _FIXED_HOLIDAYS:
        return False
    return day not in _movable_holidays(day.year)


def today_br() -> date:
    """Current date in America/Sao_Paulo — the daily rollover anchor (00h local)."""
    return datetime.now(APP_TZ).date()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(value: datetime) -> datetime:
    """Motor returns naive datetimes; normalise them to aware UTC before any comparison."""
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def next_business_day(day: date) -> date:
    cursor = day
    while not is_business_day(cursor):
        cursor += timedelta(days=1)
    return cursor


def business_days_between(start: date, end: date) -> int:
    """Business days strictly after `start` up to and including `end` (0 when end <= start)."""
    if end <= start:
        return 0
    count, cursor = 0, start + timedelta(days=1)
    while cursor <= end:
        if is_business_day(cursor):
            count += 1
        cursor += timedelta(days=1)
    return count


def add_business_days(start: date, amount: int) -> date:
    cursor, added = start, 0
    while added < amount:
        cursor += timedelta(days=1)
        if is_business_day(cursor):
            added += 1
    return cursor


def business_day_series(start: date, amount: int) -> list[date]:
    out: list[date] = []
    cursor = start
    while len(out) < amount:
        cursor += timedelta(days=1)
        if is_business_day(cursor):
            out.append(cursor)
    return out


# --- Catalog -----------------------------------------------------------------

GROUPS: list[dict] = [
    {"id": "GR50", "code": "GR 50", "amount": 50.0},
    {"id": "GR100", "code": "GR 100", "amount": 100.0},
    {"id": "GR200", "code": "GR 200", "amount": 200.0},
    {"id": "GR250", "code": "GR 250", "amount": 250.0},
    {"id": "GR300", "code": "GR 300", "amount": 300.0},
    {"id": "GR400", "code": "GR 400", "amount": 400.0},
    {"id": "GR500", "code": "GR 500", "amount": 500.0},
    {"id": "GR700", "code": "GR 700", "amount": 700.0},
    {"id": "GR800", "code": "GR 800", "amount": 800.0},
    {"id": "GR1000", "code": "GR 1000", "amount": 1000.0},
]

GROUPS_BY_ID = {g["id"]: g for g in GROUPS}

MODALITIES: list[dict] = [
    {
        "id": "MOD_15",
        "name": "15 dias úteis",
        "business_days": 15,
        "yield_percent": 15.0,
        "description": "Rendimento apurado linearmente a cada dia útil do período.",
    },
    {
        "id": "MOD_30",
        "name": "30 dias úteis",
        "business_days": 30,
        "yield_percent": 35.0,
        "description": "Rendimento apurado linearmente a cada dia útil do período.",
    },
]

MODALITIES_BY_ID = {m["id"]: m for m in MODALITIES}


def money(value: float) -> float:
    return round(value + 1e-9, 2)


def accrual(amount: float, yield_percent: float, business_days: int, elapsed: int) -> dict:
    """Linear daily accrual. Returns projected/accrued figures for `elapsed` business days."""
    total_yield = amount * yield_percent / 100.0
    per_day = total_yield / business_days if business_days else 0.0
    capped = max(0, min(elapsed, business_days))
    accrued_yield = per_day * capped
    return {
        "projected_yield": money(total_yield),
        "projected_total": money(amount + total_yield),
        "daily_yield": money(per_day),
        "accrued_yield": money(accrued_yield),
        "accrued_total": money(amount + accrued_yield),
        "elapsed_business_days": capped,
    }
