import frappe
from frappe.utils import formatdate



@frappe.whitelist()
def get_fee_list(isPaid=0):
    # Fetch students
    students = get_students()

    fee_list = []
    if isPaid:
        fee_list = frappe.db.get_all(
            "Fees",
            filters=[["student_id", "in", students], ["outstanding_amount", "=", 0]],
            fields=["name", "student_name", "posting_date", "due_date", "grand_total", "total_taxes_and_charges", "program", "parent_attachment", "family_code"],
        )
    else:
        fee_list = frappe.db.get_all(
            "Fees",
            filters=[["student_id", "in", students], ["outstanding_amount", ">", 0]],
            fields=["name", "student_name", "posting_date", "due_date", "grand_total", "total_taxes_and_charges", "program", "parent_attachment", "family_code"],
        )

    return fee_list

def get_students():
	user = frappe.session.user
	last_doc = frappe.get_last_doc('Guardian', filters={"email_address": user})
	gardian = frappe.get_doc("Guardian", last_doc.name)
	students = [d.student for d in gardian.students]

	return students

@frappe.whitelist()
def get_currentuser():
    user = frappe.session.user
    user = frappe.get_doc("User", user)
    return user

@frappe.whitelist()
def set_fee_paid(fee_id):
    frappe.db.set_value("Fees", fee_id, "parent_attachment", 1)
    frappe.db.set_value("Fees", fee_id, "portal_status", "Attachments")
    return "Fee Paid Successfully"

@frappe.whitelist()
def get_fees_attachment(fee_id):
    attachment = frappe.db.get_all("File", filters=[["File","attached_to_doctype","=","Fees"],["File","attached_to_name","=",fee_id]], fields=["name", "file_name", "file_url"])

    return attachment


@frappe.whitelist()
def make_portal_payment_record(fees=[]):
    if not fees or not isinstance(fees, list):
        frappe.throw("Fees must be a list of fee records.")

    portal_record = frappe.get_doc({
        "doctype": "Portal Payment Record",
        "family_code": fees[0].get("family_code") if len(fees) > 0 else "",
    })

    for fee in fees:
        if not fee.get("name"):
            frappe.throw("Fee name is missing in the provided data.")
        fee_doc = frappe.get_doc("Fees", fee.get("name"))
        frappe.db.set_value("Fees", fee_doc.name, "parent_attachment", 1)
        frappe.db.set_value("Fees", fee_doc.name, "portal_status", "Attachments")
        row = portal_record.append('student_fee_details', {})
        row.update({
            'fees': fee_doc.name,
            'student_id': fee_doc.student,
            'student_name': fee_doc.student_name,
            'discount_type': fee_doc.discount_type,
            'discount_amount': fee_doc.discount_amount,
            'percentage': fee_doc.percentage,
            'amount_before_discount': fee_doc.amount_before_discount,
            'due_date': fee_doc.due_date,
            'posting_date': fee_doc.posting_date,
            'grand_total_before_tax': fee_doc.grand_total_before_tax,
            'total_amount': fee_doc.grand_total,
            'total_taxes_and_charges': fee_doc.total_taxes_and_charges,
            'outstanding_amount': fee_doc.outstanding_amount,
            'allocated_amount': fee_doc.outstanding_amount,
            'month': formatdate(fee_doc.posting_date, "MMMM-yyyy"),
            'is_return': fee_doc.is_return
        })
        compoArray = []
        components = frappe.db.get_values("Fee Component", filters={'parent': fee_doc.name}, fieldname=['fees_category', 'gross_amount', 'amount'], as_dict=1)
        
        for fee_com in components:
            compoArray.append(fee_com.fees_category)

        row.components = ", ".join(compoArray)

    try:
        portal_record.insert(ignore_permissions=True)
    except Exception as e:
        frappe.log_error(message=str(e), title="Error Creating Portal Payment Record")
        frappe.throw("An error occurred while creating the portal payment record.")

    return {"message": "Payment Record Created Successfully", "record_name": portal_record.name}


@frappe.whitelist()
def set_fee_attachment(fee_id, file_url):
    file = frappe.get_doc({
        "doctype": "File",
        "file_url": file_url,
        "attached_to_doctype": "Fees",
        "attached_to_name": fee_id
    })
    file.save()
    return "File Uploaded Successfully"


@frappe.whitelist(allow_guest=True)
def get_app_logo():
    app_name = frappe.get_value("Website Settings", None, "app_name")
    app_logo = frappe.get_all("File", filters=[["attached_to_name", "=", "Website Settings"], ["attached_to_field", "=", "app_logo"]], fields=["file_url"])
    banner_image = frappe.get_all("File", filters=[["attached_to_name", "=", "Website Settings"], ["attached_to_field", "=", "banner_image"]], fields=["file_url"])
    if len(app_logo) > 0:
        app_logo = app_logo[0].get("file_url")
    else:
        app_logo = None

    if len(banner_image) > 0:
        banner_image = banner_image[0].get("file_url")
    else:
        banner_image = None
    return {"app_name": app_name, "app_logo": app_logo, "banner_image": banner_image}