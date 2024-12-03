# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document



class PortalPaymentRecord(Document):
	def on_submit(self):
		if self.fake_attachment:
			for fee in self.student_fee_details:
				frappe.db.set_value("Fees", fee.fees, "parent_attachment", 0)
				frappe.db.set_value("Fees", fee.fees, "portal_status", "No Attachments")
		else:
			if len(self.fee_collection_payment) == 0:
				frappe.throw("Please select mode of payment.")
			fee_collection = frappe.get_doc({
				"doctype": "Fee Collections",
				"family_code": self.family_code,
				"posting_date": self.posting_date,
				"reference": self.name,
			})

			for fee in self.student_fee_details:
				fee_collection.append("student_fee_details", {
					'fees': fee.fees,
					'student_id': fee.student_id,
					'student_name': fee.student_name,
					'discount_type': fee.discount_type,
					'discount_amount': fee.discount_amount,
					'percentage': fee.percentage,
					'amount_before_discount': fee.amount_before_discount,
					'due_date': fee.due_date,
					'posting_date': fee.posting_date,
					'grand_total_before_tax': fee.grand_total_before_tax,
					'total_amount': fee.total_amount,
					'total_taxes_and_charges': fee.total_taxes_and_charges,
					'outstanding_amount': fee.outstanding_amount,
					'allocated_amount': fee.allocated_amount,
					'month': fee.month,
					'is_return': fee.is_return,
					'components': fee.components,
				})

			for payment in self.fee_collection_payment:
				fee_collection.append("fee_collection_payment", {
					'mode_of_payment': payment.mode_of_payment,
					'amount': payment.amount
				})
			fee_collection.insert(ignore_permissions=True)
				# "student_fee_details": self.student_fee_details,
				# "fee_collection_payment": self.fee_collection_payment,
			
