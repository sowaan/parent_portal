# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Timetable(Document):
	@frappe.whitelist()
	def get_program_courses(self):
		program_courses = frappe.get_all("Program Course", filters={"parent": self.program}, pluck="course")
		return program_courses
