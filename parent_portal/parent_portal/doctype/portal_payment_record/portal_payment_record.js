// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Portal Payment Record", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Fee Collection Payment", {
    fee_collection_payment_add(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        let amount = 0;

        for (let i = 0; i < frm.doc.student_fee_details.length; i++) {
            const fee = frm.doc.student_fee_details[i];
            amount += fee.outstanding_amount;
        }
        row.amount = amount;
        refresh_field("choose_units");
    }
});
