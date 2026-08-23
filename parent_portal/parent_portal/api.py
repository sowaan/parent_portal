import frappe
from frappe.utils import formatdate, today, add_days, get_first_day
from urllib.parse import urlencode

@frappe.whitelist()
def get_attendance_summary(start_date=None, end_date=None, student=None):
    students = get_students()
    # Default to the last 30 days if no date range is provided
    if not start_date:
        start_date = add_days(today(), -30)
    if not end_date:
        end_date = today()

    # Fetch attendance records for the week
    attendance_records = frappe.get_all(
        "Student Attendance",
        fields=["date", "status"],
        filters=[
            ["student", "in", [student] if student else students],
            ["date", "between", [start_date, end_date]]
        ],
    )

    # Initialize the data structure for each day of the week
    progress_group = [
        {"title": "Monday", "present": 0, "absent": 0},
        {"title": "Tuesday", "present": 0, "absent": 0},
        {"title": "Wednesday", "present": 0, "absent": 0},
        {"title": "Thursday", "present": 0, "absent": 0},
        {"title": "Friday", "present": 0, "absent": 0},
        {"title": "Saturday", "present": 0, "absent": 0},
        {"title": "Sunday", "present": 0, "absent": 0},
    ]

    # Process the fetched records
    for record in attendance_records:
        # Derive the day from the attendance_date
        day_of_week = record["date"].strftime("%A")
        for day in progress_group:
            if day["title"] == day_of_week:
                if record["status"] == "Present":
                    day["present"] += 1
                elif record["status"] == "Absent":
                    day["absent"] += 1

    present = [entry['present'] for entry in progress_group]
    absent = [entry['absent'] for entry in progress_group]

    total_present = 0
    total_absent = 0

    # Process attendance records
    for record in attendance_records:
        if record["status"] == "Present":
            total_present += 1
        elif record["status"] == "Absent":
            total_absent += 1

    return {"summary": progress_group, 'presents': present, 'absents': absent, "total_present": total_present, "total_absent": total_absent}


@frappe.whitelist()
def get_fee_list(isPaid="0", asc="1", student=None):
    try:
        students = get_students()
        if student:
            students = [student]

        # Fetch Fees records with required filters
        filters = {"student_id": ["in", students], "docstatus": ["<", 2]}
        if isPaid == "1":
            filters["outstanding_amount"] = 0
        else:
            filters["outstanding_amount"] = [">", 0]

        order_by = "posting_date asc" if asc == "1" else "posting_date desc"
        fee_list = frappe.get_all(
            "Fees",
            filters=filters,
            fields=[
                "name", "student_id", "student_name", "student_category", "custom_status",
                "posting_date", "due_date", "grand_total", "total_taxes_and_charges", "program",
                "parent_attachment", "family_code", "outstanding_amount"
            ],
            order_by=order_by
        )

        # Fetch all Fee Components for these fees in one go
        fee_names = [fee["name"] for fee in fee_list]
        components = frappe.get_all(
            "Fee Component",
            filters={"parent": ["in", fee_names]},
            fields=["parent", "fees_category"]
        )

        # Map fee name to its categories
        from collections import defaultdict
        fee_categories = defaultdict(list)
        for comp in components:
            fee_categories[comp["parent"]].append(comp["fees_category"])

        # Attach categories to each fee record
        for fee in fee_list:
            fee["fees_category"] = ", ".join(fee_categories.get(fee["name"], []))

        return fee_list

    except frappe.db.InternalError as e:
        frappe.log_error(message=str(e), title="Database Query Error")
        return {"error": "Database error occurred. Please try again later."}
    
    except Exception as e:
        frappe.log_error(message=str(e), title="Unexpected Error")
        return {"error": "An unexpected error occurred."}


def get_family_codes():
    students = get_students()
    if not students:
        return []
    codes = frappe.get_all("Fees", filters={"student_id": ["in", students]}, pluck="family_code")
    return list({str(code) for code in codes if code})


@frappe.whitelist()
def get_fee_collection_list():
    family_codes = get_family_codes()
    if not family_codes:
        return []

    return frappe.get_all(
        "Fee Collections",
        filters={"family_code": ["in", family_codes], "docstatus": 1},
        fields=[
            "name", "family_code", "grand_total", "net_total",
            "reference_no", "reference_date", "is_return", "creation"
        ],
        order_by="creation desc"
    )


@frappe.whitelist(methods=["POST"])
def get_fee_collection_print_url(name):
    family_code = frappe.db.get_value("Fee Collections", name, "family_code")
    if not family_code or str(family_code) not in get_family_codes():
        frappe.throw("Not permitted", frappe.PermissionError)

    key = frappe.get_doc("Fee Collections", name).get_document_share_key()
    query = urlencode({
        "doctype": "Fee Collections",
        "name": name,
        "format": "Zatca Print",
        "no_letterhead": 0,
        "key": key,
    })
    return f"/printview?{query}"


def is_fee_paid_uptodate(student_id):
    cutoff = get_first_day(today())
    unpaid = frappe.db.count("Fees", {
        "student_id": student_id,
        "docstatus": ["<", 2],
        "posting_date": ["<", cutoff],
        "outstanding_amount": [">", 0],
    })
    return unpaid == 0


def grade_in_range(student_group, low=1, high=8):
    parts = (student_group or "").split("-")
    if len(parts) < 2:
        return False
    try:
        grade = int(parts[1])
    except ValueError:
        return False
    return low <= grade <= high


def get_final_academic_result(student_id):
    """Returns (academic_result_name, student_group) for the student's submitted
    Final result in a grade 1-8 class, or (None, None) if none exists."""
    rows = frappe.get_all(
        "Student Group Student",
        filters={"parenttype": "Academic Result", "student": student_id},
        fields=["parent"]
    )
    if not rows:
        return None, None

    parent_names = list({row["parent"] for row in rows})
    results = frappe.get_all(
        "Academic Result",
        filters={"name": ["in", parent_names], "trimester_type": "Final", "docstatus": 1},
        fields=["name", "student_group"],
        order_by="date desc"
    )
    for result in results:
        if grade_in_range(result["student_group"]):
            return result["name"], result["student_group"]
    return None, None


@frappe.whitelist()
def get_final_result_list():
    students = get_students()
    if not students:
        return []

    student_details = frappe.get_all(
        "Student",
        filters={"name": ["in", students]},
        fields=["name", "student_name"]
    )

    results = []
    for student in student_details:
        academic_result, student_group = get_final_academic_result(student["name"])
        if not academic_result:
            continue
        results.append({
            "student_id": student["name"],
            "student_name": student["student_name"],
            "class": student_group,
            "can_print": is_fee_paid_uptodate(student["name"]),
        })
    return results


@frappe.whitelist()
def download_student_result_pdf(student):
    if student not in get_students():
        frappe.throw("Not permitted", frappe.PermissionError)

    academic_result, student_group = get_final_academic_result(student)
    if not academic_result:
        frappe.throw("Result not available", frappe.PermissionError)

    if not is_fee_paid_uptodate(student):
        frappe.throw("Not permitted", frappe.PermissionError)

    doc = frappe.get_doc("Academic Result", academic_result)

    # Restrict the in-memory doc to this student's rows only before rendering,
    # so the shared class-wide print format never exposes other students' results.
    target_rolls = {s.group_roll_number for s in doc.students if s.student == student}
    doc.students = [s for s in doc.students if s.student == student]
    doc.students_result = [r for r in doc.students_result if r.group_roll_number in target_rolls]

    pdf = frappe.get_print(
        "Academic Result", academic_result, "Final Result 1-8 Print 2026",
        doc=doc, as_pdf=True
    )
    frappe.local.response.filename = f"{student}-result.pdf"
    frappe.local.response.filecontent = pdf
    frappe.local.response.type = "pdf"

@frappe.whitelist()
def get_students():
    user = frappe.session.user
    students = []
    if frappe.db.exists("Guardian", {"email_address": user}):
        last_doc = frappe.get_last_doc('Guardian', filters={"email_address": user})
        # gardian = frappe.get_doc("Guardian", last_doc.name)
        students = [d.student for d in last_doc.students]
    return students

@frappe.whitelist()
def get_student_details():
    student_ids = get_students()
    student = frappe.db.get_all(
        "Student",
        filters=[["name", "in", student_ids]],
        fields=["name", "first_name", "admission_registration_id", "current_program_enrollment", "custom_student_batch"]
    )
    return student

@frappe.whitelist()
def get_student_batch():
    student_ids = get_students()
    batch = frappe.db.get_all(
        "Student",
        filters=[["name", "in", student_ids]],
        fields=["custom_student_batch"],
        pluck="custom_student_batch"
    )
    return batch

@frappe.whitelist()
def get_currentuser():
    user = frappe.get_doc("Guardian", {"email_address": frappe.session.user})
    user_image = frappe.get_value("User", frappe.session.user, "user_image")
    if user_image:
        user.image = user_image
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
def make_portal_payment_record(bank_name,tran_number,holder_name,number,fees=[]):
    if not fees or not isinstance(fees, list):
        frappe.throw("Fees must be a list of fee records.")

    portal_record = frappe.get_doc({
        "doctype": "Portal Payment Record",
        "family_code": fees[0].get("family_code") if len(fees) > 0 else "",
        "bank_name": bank_name,
        "transaction_number": tran_number,
        "account_holder_name": holder_name,
        "mobile_number": number
    })

    for fee in fees:
        if not fee.get("name"):
            frappe.throw("Fee name is missing in the provided data.")
        fee_doc = frappe.get_doc("Fees", fee.get("name"))
        frappe.db.set_value("Fees", fee_doc.name, "parent_attachment", 1)
        frappe.db.set_value("Fees", fee_doc.name, "portal_status", "Attachments")
        frappe.db.set_value("Fees", fee_doc.name, "custom_bank_name", bank_name)
        frappe.db.set_value("Fees", fee_doc.name, "custom_account_holder_name", tran_number)
        frappe.db.set_value("Fees", fee_doc.name, "custom_transaction_number", holder_name)
        frappe.db.set_value("Fees", fee_doc.name, "custom_mobile_number", number)
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
    app_logo, app_name = frappe.db.get_value("Parent Portal Settings", None, ["app_logo", "app_name"])
    
    return {"app_name": app_name, "app_logo": app_logo}



@frappe.whitelist()
def get_lectures_for_students(student=None, title=None, date=None, course=None):
    students = get_students()
    # Get the current academic year based on the provided date
    current_academic_year = frappe.get_last_doc(
        "Academic Year",
        filters={"year_start_date": ["<=", today()], "year_end_date": [">=", today()]}
    )

    # Fetch all Program Enrollments for the students
    program_enrollments = frappe.get_all(
        "Program Enrollment",
        filters=[
            ["student", "in", [student] if student else students],
            ["academic_year", "=", current_academic_year.name],
        ],
        pluck="name"
    )
    
    # Fetch all courses for the filtered Program Enrollments
    courses = frappe.get_all(
        "Program Enrollment Course",
        filters={
            "parentfield": "courses",
            "parenttype": "Program Enrollment",
            "parent": ["in", program_enrollments]
        },
        pluck="course"
    )

    filters = []
    if course:
        filters.append(["course", "=", course])
    else:
        filters.append(["course", "in", courses])

    if date:
        filters.append(["date", "=", date])

    if title:
        filters.append(["title", "like", f"%{title}%"])
    
    # Fetch Lectures for the filtered courses
    lectures = frappe.get_all("Lecture", filters=filters, fields=["*"])
    
    return lectures


@frappe.whitelist()
def get_timetable(batch):
    timetable = frappe.get_doc("Timetable", batch)
    return timetable


@frappe.whitelist()
def is_potral_enable():
    students = get_students()
    enable = True
    for stu in students:
        status = frappe.db.get_value("Student", stu, "status")
        if status == "Fee Not Paid":
            enable = False
            break

    return enable


@frappe.whitelist()
def get_current_program_course(course):
    program = frappe.get_all("Program", filters=[
        ["Program Course", "course", "in", course]
    ], pluck="name")

    return program

@frappe.whitelist()
def get_batch_students(batch):
    students = frappe.get_all("Student", filters={"custom_student_batch": batch}, fields=["name", "student_name"])
    return students


@frappe.whitelist()
def get_student_assignments():
    students = get_students()
    assignments = frappe.get_all("Batch Task", filters=[
        ["Student Group Student", "student", "in", students]
    ], fields=["*"])
    return assignments


@frappe.whitelist()
def submit_student_assignment(name, student_id, file_url=None):
    assignment = frappe.get_doc("Batch Task", name)
    for student in assignment.students:
        print(student.is_attach, student.student, student_id, "student.student == student_id ***********")
        if student.student == student_id:
            print(student.is_attach, "student.student == student_id ***********")
            frappe.db.set_value("Student Batch Task", student.name, "is_attach", 1)
            frappe.db.set_value("Student Batch Task", student.name, "attachment", file_url)
            break

    return assignment


@frappe.whitelist()
def get_latest_newsletter(name=None):
    newsletter = None
    if name:
        newsletter = frappe.get_doc("Newsletter", name)
    else:
        newsletter = frappe.get_last_doc("Newsletter", filters={"for_parent": 1})

    return newsletter

@frappe.whitelist()
def get_assessment_groups():
    assessment_groups = frappe.get_all("Assessment Group", fields=["*"], pluck="name")
    return assessment_groups

@frappe.whitelist()
def get_student_results(student=None, assessment=None, course=None):
    students = get_students()
    
    if student:
        students = [student]

    filters = [["student", "in", students]]
    if course:
        filters.append(["course", "=", course])

    if assessment:
        filters.append(["assessment_group", "=", assessment])
        
    assessment_reports = frappe.get_all("Assessment Result", filters=filters, fields=["*"])

    assessment_result_names = [report.name for report in assessment_reports]

    assesment_result_details = frappe.get_all("Assessment Result Detail", filters=[["parent", "in", assessment_result_names]], fields=["*"])

    for report in assessment_reports:
        report["details"] = [detail for detail in assesment_result_details if detail.parent == report.name]

    return assessment_reports


@frappe.whitelist()
def get_student_leave_applications(student=None):
    students = get_students()
    if student:
        students = [student]

    leave_applications = frappe.get_all("Student Leave Application", filters=[["student", "in", students]], fields=["*"])
    return leave_applications


@frappe.whitelist()
def get_student_group(student):
    students = get_students()
    if student:
        students = [student]
    student_group = frappe.get_all("Student Group", filters=[["Student Group Student", "student", "in", students]], fields=["name"], pluck="name" )
    return student_group


@frappe.whitelist()
def submit_student_leave_application(
    student=None, from_date=None, to_date=None, reason=None, student_group=None
):
    leave_application = frappe.get_doc({
        "doctype": "Student Leave Application",
        "student": student,
        "from_date": from_date,
        "to_date": to_date,
        "reason": reason,
        "attendance_based_on": "Student Group",
        "student_group": student_group
    }).insert()

    return leave_application


@frappe.whitelist()
def get_student_gallery():
    gallery = frappe.get_all("School Gallery", fields=["*"])
    images = frappe.get_all("Gallery Attachments", filters=[
        ["parent", "in", [g.name for g in gallery]]
    ], fields=["*"])
    for g in gallery:
        g["images"] = [i for i in images if i.parent == g.name]

    return gallery


@frappe.whitelist()
def total_paid_fees(student=None):
    if not student:
        student = get_students()
    total_paid_fees = frappe.db.count('Fees', [['student', 'in', student], ['outstanding_amount', '=', 0]])
    return total_paid_fees

@frappe.whitelist()
def total_unpaid_fees(student=None):
    if not student:
        student = get_students()
    total_paid_fees = frappe.db.count('Fees', [['student', 'in', student], ['outstanding_amount', '>', 0]])
    return total_paid_fees