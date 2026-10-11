"""Public catalog: investment groups, modalities and public settings (WhatsApp, support)."""

from fastapi import APIRouter

from lib.business import GROUPS, MODALITIES, today_br
from lib.security import get_settings, resolve_support_link
from models.schemas import CatalogOut

router = APIRouter(tags=["catalog"])


@router.get("/catalog", response_model=CatalogOut)
async def catalog():
    settings = await get_settings()
    return {
        "groups": GROUPS,
        "modalities": MODALITIES,
        "settings": {
            "whatsapp_number": settings["whatsapp_number"],
            "whatsapp_message": settings["whatsapp_message"],
            "whatsapp_link": resolve_support_link(settings),
            "support_email": settings["support_email"],
            "company_name": settings["company_name"],
        },
        "reference_date": today_br(),
    }
