import io
import qrcode

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER


# =========================================
# 🔳 QR IMAGE GENERATOR
# =========================================

def generate_qr_image(token: str):
    qr = qrcode.QRCode(box_size=6, border=2)
    qr.add_data(token)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer


# =========================================
# 🎟 MAIN PDF GENERATOR
# =========================================

def generate_ticket_pdf(user, main_event, registration):

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)

    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CenteredTitle",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1d4ed8"),
        fontSize=22,
        spaceAfter=20
    )

    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#111827"),
        spaceAfter=10
    )

    normal_style = styles["Normal"]

    # =====================================
    # HEADER
    # =====================================

    elements.append(Paragraph("EVENT ENTRY PASS", title_style))
    elements.append(Spacer(1, 0.3 * inch))

    info_data = [
        ["Participant", user.name],
        ["Email", user.email],
        ["Main Event", main_event.title],
    ]

    info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))

    elements.append(info_table)
    elements.append(Spacer(1, 0.6 * inch))

    # =====================================
    # EVENT QR
    # =====================================

    if registration.main_event_qr_token:
        elements.append(Paragraph("Event Entry QR", section_style))
        elements.append(Spacer(1, 0.2 * inch))

        qr_buffer = generate_qr_image(registration.main_event_qr_token)
        qr_img = Image(qr_buffer, 2.2 * inch, 2.2 * inch)

        elements.append(qr_img)
        elements.append(Spacer(1, 0.6 * inch))

    # =====================================
    # FOOD QR
    # =====================================

    if registration.food_qr_token:
        elements.append(Paragraph("Food Access QR", section_style))
        elements.append(Spacer(1, 0.2 * inch))

        qr_buffer = generate_qr_image(registration.food_qr_token)
        qr_img = Image(qr_buffer, 2.2 * inch, 2.2 * inch)

        elements.append(qr_img)
        elements.append(Spacer(1, 0.6 * inch))

    # =====================================
    # FOOTER
    # =====================================

    elements.append(Paragraph(
        "Please present this QR at the event entrance.",
        styles["Italic"]
    ))

    doc.build(elements)
    buffer.seek(0)

    return buffer