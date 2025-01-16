// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Timetable", {
    program(frm) {
        frappe.call({
            method: "get_program_courses",
            doc: frm.doc,
            callback: function (r) {
                if (r.message) {
                    console.log(r.message);

                    frm.fields_dict.timetable_details.grid.get_field("course").get_query = function (frm, cdt, cdn) {
                        return {
                            filters: [["name", "in", r.message]],
                        };
                    };
                }
            }
        });
    }
});
