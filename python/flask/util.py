def require_fields(data, *fields):
    missing = [f for f in fields if f not in data]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
    return [data[f] for f in fields]
