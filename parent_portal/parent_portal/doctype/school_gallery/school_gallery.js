// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt

frappe.ui.form.on("School Gallery", {
    refresh(frm) {
        frm.add_custom_button(__("Upload Image"), function () {
            frm.trigger("upload_image");
        });
    },
    upload_image(frm) {
        frappe.prompt([
            {
                fieldname: "image",
                label: __("Image"),
                fieldtype: "Attach",
                reqd: 1
            }
        ], (values) => {
            frappe.call({
                method: "upload_file",
                args: {
                    file_url: values.image,
                    is_private: 0,
                    optimize: 1,
                    doctype: "School Gallery",
                    docname: frm.doc.name
                },
                callback: (r) => {
                    if (r.message) {
                        frm.reload_doc();
                    }
                }
            });
            var row = frappe.model.add_child(
                frm.doc,
                "Gallery Attachments",
                "gallery_attachments"
            );
            row.image = values.image;
            frm.refresh_field("gallery_attachments");
            frm.save();
        }, __("Upload Image"), __("Upload"));
    }
});
