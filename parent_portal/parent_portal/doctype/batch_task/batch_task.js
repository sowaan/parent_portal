// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Batch Task", {
	refresh(frm) {

	},

	course(frm) {
		if (frm.doc.course) {
			frappe.call({
				method: "parent_portal.parent_portal.api.get_current_program_course",
				args: {
					"course": frm.doc.course
				},
				callback: (r) => {
					frm.fields_dict.students.grid.get_field("student").get_query = function (frm, cdt, cdn) {
						return {
							filters: [
								["Student", "current_program_enrollment", "in", r.message],
							],
						};
					}
				}
			})
		}
	},
	batch(frm) {
		if (frm.doc.course && frm.doc.batch) {
			frappe.call({
				method: "parent_portal.parent_portal.api.get_current_program_course",
				args: {
					"course": frm.doc.course
				},
				callback: (r) => {
					frm.fields_dict.students.grid.get_field("student").get_query = function (frm, cdt, cdn) {
						return {
							filters: [
								["Student", "current_program_enrollment", "in", r.message],
								["Student", "custom_student_batch", "in", frm.doc.batch]
							],
						};
					}
				}
			});
		}
		if (frm.doc.batch) {
			frappe.call({
				method: "parent_portal.parent_portal.api.get_batch_students",
				args: {
					"batch": frm.doc.batch
				},
				callback: (r) => {
					if (r.message) {
						frm.set_value("students", [])
						for (let i = 0; i < r.message.length; i++) {
							let ele = r.message[i];
							let row = frappe.model.add_child(frm.doc, "Student Batch Task", "students");
							row.student = ele.name;
							row.student_name = ele.student_name
						}
						frm.refresh_field("students");
					}
				}
			})
		}
	}
});
