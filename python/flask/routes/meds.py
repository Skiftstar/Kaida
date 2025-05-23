from . import meds_bp
from util import require_fields
from flask import request, jsonify
from db import get_db_connection, execute_and_fetchone_query, execute_and_fetchall_query, execute_query
from flask_login import login_required, current_user

@login_required
@meds_bp.route("get", methods=["GET"])
def get_user_meds():
    data = request.args
    count = data.get("count", type=int) if data.get("count") else None

    query = "SELECT id, med_name, start_date, end_date, dose, dose_unit, interval, interval_unit FROM prescriptions WHERE user_id = %s"

    if count is not None:
        query = f"{query} AND end_date >= CURRENT_DATE - INTERVAL '{count} days'"
    query = f"{query} ORDER BY end_date DESC"

    rows = execute_and_fetchall_query(query, (current_user.id,))

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
    data = request.json
    med_name, start_date, end_date, dose, dose_unit, interval, interval_unit = require_fields(data, "medName", "startDate", "endDate", "dose", "doseUnit", "interval", "intervalUnit")

    id = execute_and_fetchone_query("INSERT INTO prescriptions (med_name, start_date, end_date, dose, dose_unit, interval, interval_unit, user_id) VALUES(%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id", (med_name, start_date, end_date, dose, dose_unit, interval, interval_unit, current_user.id))

    if id is None:
        return jsonify("Failed inserting prescription!"), 500

    return jsonify({"id": id}), 201

@login_required
@meds_bp.route("<id>", methods=["PUT"])
def update_med(id):
    data = request.json
    med_name, start_date, end_date, dose, dose_unit, interval, interval_unit = require_fields(data, "medName", "startDate", "endDate", "dose", "doseUnit", "interval", "intervalUnit")

    updated = execute_query("UPDATE prescriptions SET med_name = %s, start_date = %s, end_date = %s, dose = %s, dose_unit = %s, interval = %s, interval_unit = %s WHERE id = %s", (med_name, start_date, end_date, dose, dose_unit, interval, interval_unit, id))

    if not updated:
        return jsonify("Failed updating prescription!"), 500

    return jsonify({}), 200


@login_required
@meds_bp.route("<id>", methods=["DELETE"])
def delete_med(id):
    is_deleted = execute_query("DELETE FROM prescriptions WHERE id = %s", (id,))

    if not is_deleted:
        return jsonify({"error deleting prescription"}), 500

    return jsonify({}), 204
