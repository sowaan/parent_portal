import frappe
from frappe.utils import formatdate, today, add_days

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
def get_fee_list(isPaid=0):
    try:
        students = get_students()
        if not students:
            frappe.throw("No students found.", frappe.DoesNotExistError)

        outstanding_filter = "=" if isPaid else ">"
        
        fee_list = frappe.db.get_all(
            "Fees",
            filters=[["student_id", "in", students], ["outstanding_amount", outstanding_filter, 0]],
            fields=[
                "name", "student_name", "custom_status", "posting_date", "due_date",
                "grand_total", "total_taxes_and_charges", "program", "parent_attachment",
                "family_code", "outstanding_amount"
            ],
        )

        return fee_list

    except frappe.DoesNotExistError as e:
        frappe.log_error(message=str(e), title="No Students Found")
        return {"error": "No students found."}
    
    except frappe.db.InternalError as e:
        frappe.log_error(message=str(e), title="Database Query Error")
        return {"error": "Database error occurred. Please try again later."}
    
    except Exception as e:
        frappe.log_error(message=str(e), title="Unexpected Error")
        return {"error": "An unexpected error occurred."}

@frappe.whitelist()
def get_students():
    user = frappe.session.user
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
def make_portal_payment_record(bank_name,tran_number,holder_name,number,fees=[]):
    print(fees, "fees ***********")
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