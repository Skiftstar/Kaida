from . import meds_bp
from flask import request, jsonify
from db import get_db_connection, execute_and_fetchone_query, execute_and_fetchall_query
from flask_login import login_required, current_user

@login_required
@meds_bp.route("get", methods=["GET"])
def get_user_meds():
    rows = execute_and_fetchall_query("SELECT id, med_name, start_date, end_date, dose, dose_unit, interval, interval_unit FROM prescriptions WHERE user_id = %s", (current_user.id,))

    if rows is None:
        return jsonify("Failed fetching user meds"), 500

    meds = [{
        "id": row[0],
        "medName": row[1],
        "startDate": row[2],
        "endDate": row[3],
        "dose": row[4],
        "doseUnit": row[5],
        "interval": row[6],
        "intervalUnit": row[7]
    } for row in rows]

    return jsonify({"meds": meds}), 200

@login_required
@meds_bp.route("insert", methods=["POST"])
def insert_med():
    data = request.json()
    med_name, start_date, end_date, dose, dose_unit, interval, interval_unit = require_fields(data, "medName", "startDate", "endDate", "dose", "doseUnit", "interval", "interval_unit")

    id = execute_and_fetchone_query("INSERT INTO prescriptions (med_name, start_date, end_date, dose, dose_unit, interval, interval_unit) VALUES(%s, %s, %s, %s, %s, %s, %s)", (med_name, start_date, end_date, dose, dose_unit, interval, interval_unit))

    if id is None:
        return jsonify("Failed inserting prescription!"), 500

    return jsonify({"id": id}), 201

