# Copyright (c) 2024, Sowaan and contributors
# For license information, please see license.txt

import frappe
import base64
import os
import json
from frappe.utils.file_manager import save_file
from frappe.model.document import Document


class SchoolGallery(Document):
	pass

@frappe.whitelist()
def upload_image(doc, image, image_name):
	print(doc, image, image_name, "Images")

	# get the file
	# file = frappe.request.files.get('file')
	# if not file:
	# 	frappe.throw("No file attached")

	# save the file
	file_doc = save_file(image, image, "School Gallery", image_name)
	frappe.msgprint("File uploaded successfully")

	return file_doc.file_url
