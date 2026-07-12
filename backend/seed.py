import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transit_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Vehicle, Driver, Trip, Maintenance, FuelLog, Expense

User = get_user_model()

def seed_db():
    print("Seeding database with exact specification statuses...")

    # Clear existing data to prevent status clashes
    Trip.objects.all().delete()
    Vehicle.objects.all().delete()
    Driver.objects.all().delete()
    Maintenance.objects.all().delete()
    FuelLog.objects.all().delete()
    Expense.objects.all().delete()
    print("Seeding database...")

    # Seed Users
    users_data = [
        ("manager", "manager@transitops.com", "demo1234", "Manager User", "manager"),
        ("driver", "driver@transitops.com", "demo1234", "Driver User", "driver"),
        ("safety", "safety@transitops.com", "demo1234", "Safety Officer", "safety"),
        ("finance", "finance@transitops.com", "demo1234", "Financial Analyst", "finance"),
    ]
    for username, email, pwd, name, role in users_data:
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=pwd,
                first_name=name,
                role=role
            )
            print(f"Created user: {user}")

    # Seed Vehicles
    vehicles_data = [
        {"plate": "TX-4821", "make": "Volvo", "model": "FH16", "year": 2022, "type": "Truck", "status": "On Trip", "odometer": 128430, "fuel_type": "Diesel", "driver": "James Carter", "max_load": 15000, "acquisition_cost": 85000},
        {"plate": "TX-9012", "make": "Mercedes", "model": "Actros", "year": 2021, "type": "Truck", "status": "In Shop", "odometer": 214800, "fuel_type": "Diesel", "driver": "Priya Shah", "max_load": 15000, "acquisition_cost": 85000},
        {"plate": "TX-1145", "make": "Ford", "model": "Transit", "year": 2023, "type": "Van", "status": "On Trip", "odometer": 45200, "fuel_type": "Diesel", "driver": "Mia Nguyen", "max_load": 2500, "acquisition_cost": 35000},
        {"plate": "TX-7788", "make": "Tesla", "model": "Semi", "year": 2024, "type": "Truck", "status": "Available", "odometer": 12030, "fuel_type": "Electric", "max_load": 15000, "acquisition_cost": 150000},
        {"plate": "TX-3391", "make": "Scania", "model": "R500", "year": 2020, "type": "Truck", "status": "On Trip", "odometer": 302180, "fuel_type": "Diesel", "driver": "Daniel Ochieng", "max_load": 15000, "acquisition_cost": 85000},
        {"plate": "TX-6620", "make": "Renault", "model": "Master", "year": 2022, "type": "Van", "status": "On Trip", "odometer": 76540, "fuel_type": "Diesel", "driver": "Sofia Rossi", "max_load": 2500, "acquisition_cost": 35000},
        {"plate": "TX-8834", "make": "Iveco", "model": "Daily", "year": 2019, "type": "Van", "status": "Retired", "odometer": 410500, "fuel_type": "Diesel", "max_load": 2500, "acquisition_cost": 35000},
        {"plate": "TX-2251", "make": "MAN", "model": "TGX", "year": 2023, "type": "Truck", "status": "On Trip", "odometer": 61220, "fuel_type": "Diesel", "driver": "Ahmed Al-Farsi", "max_load": 15000, "acquisition_cost": 85000},
    ]
    for v in vehicles_data:
        Vehicle.objects.create(**v)
        print(f"Created vehicle: {v['plate']}")

    # Seed Drivers
    drivers_data = [
        {"name": "James Carter", "email": "james@transitops.com", "phone": "+1 415 555 0142", "license": "CDL-A", "status": "On Trip", "rating": 4.8, "trips": 312, "vehicle": "TX-4821", "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Priya Shah", "email": "priya@transitops.com", "phone": "+1 415 555 0178", "license": "CDL-A", "status": "Off Duty", "rating": 4.9, "trips": 428, "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Mia Nguyen", "email": "mia@transitops.com", "phone": "+1 415 555 0154", "license": "CDL-B", "status": "On Trip", "rating": 4.7, "trips": 201, "vehicle": "TX-1145", "license_category": "Light Truck", "license_expiry": "2027-12-31"},
        {"name": "Daniel Ochieng", "email": "daniel@transitops.com", "phone": "+254 700 123456", "license": "CDL-A", "status": "Available", "rating": 4.6, "trips": 178, "vehicle": "TX-3391", "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Sofia Rossi", "email": "sofia@transitops.com", "phone": "+39 331 555 8821", "license": "CDL-B", "status": "On Trip", "rating": 4.9, "trips": 355, "vehicle": "TX-6620", "license_category": "Light Truck", "license_expiry": "2027-12-31"},
        {"name": "Ahmed Al-Farsi", "email": "ahmed@transitops.com", "phone": "+971 50 555 3311", "license": "CDL-A", "status": "Available", "rating": 4.5, "trips": 142, "vehicle": "TX-2251", "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Lena Müller", "email": "lena@transitops.com", "phone": "+49 151 555 7788", "license": "CDL-A", "status": "Suspended", "rating": 3.9, "trips": 88, "license_category": "Heavy Truck", "license_expiry": "2024-01-01"},
    ]
    for d in drivers_data:
        Driver.objects.create(**d)
        print(f"Created driver: {d['name']}")

    # Seed Trips
    trips_data = [
        {"vehicle": "TX-4821", "driver": "James Carter", "origin": "San Francisco, CA", "destination": "Los Angeles, CA", "distance": 615, "started_at": "2026-07-11 06:20", "status": "Dispatched", "cargo_weight": 450, "planned_distance": 615},
        {"vehicle": "TX-1145", "driver": "Mia Nguyen", "origin": "Oakland, CA", "destination": "Sacramento, CA", "distance": 138, "started_at": "2026-07-11 08:00", "status": "Dispatched", "cargo_weight": 300, "planned_distance": 138},
        {"vehicle": "TX-3391", "driver": "Daniel Ochieng", "origin": "Portland, OR", "destination": "Seattle, WA", "distance": 280, "started_at": "2026-07-11 05:15", "status": "Completed", "cargo_weight": 800, "planned_distance": 280},
        {"vehicle": "TX-6620", "driver": "Sofia Rossi", "origin": "Milan, IT", "destination": "Rome, IT", "distance": 580, "started_at": "2026-07-12 07:00", "status": "Draft", "cargo_weight": 600, "planned_distance": 580},
        {"vehicle": "TX-2251", "driver": "Ahmed Al-Farsi", "origin": "Dubai, AE", "destination": "Abu Dhabi, AE", "distance": 150, "started_at": "2026-07-10 14:30", "status": "Completed", "cargo_weight": 200, "planned_distance": 150},
        {"vehicle": "TX-4821", "driver": "James Carter", "origin": "Fresno, CA", "destination": "San Diego, CA", "distance": 520, "started_at": "2026-07-09 09:00", "status": "Cancelled", "cargo_weight": 400, "planned_distance": 520},
    ]
    for t in trips_data:
        Trip.objects.create(**t)
        print(f"Created trip: {t['origin']} -> {t['destination']}")
        {"plate": "TX-4821", "make": "Volvo", "model": "FH16", "year": 2022, "type": "Truck", "status": "active", "odometer": 128430, "fuel_type": "Diesel", "driver": "James Carter", "max_load": 15000, "acquisition_cost": 85000},
        {"plate": "TX-9012", "make": "Mercedes", "model": "Actros", "year": 2021, "type": "Truck", "status": "maintenance", "odometer": 214800, "fuel_type": "Diesel", "driver": "Priya Shah", "max_load": 15000, "acquisition_cost": 85000},
        {"plate": "TX-1145", "make": "Ford", "model": "Transit", "year": 2023, "type": "Van", "status": "active", "odometer": 45200, "fuel_type": "Diesel", "driver": "Mia Nguyen", "max_load": 2500, "acquisition_cost": 35000},
        {"plate": "TX-7788", "make": "Tesla", "model": "Semi", "year": 2024, "type": "Truck", "status": "idle", "odometer": 12030, "fuel_type": "Electric", "max_load": 15000, "acquisition_cost": 150000},
        {"plate": "TX-3391", "make": "Scania", "model": "R500", "year": 2020, "type": "Truck", "status": "active", "odometer": 302180, "fuel_type": "Diesel", "driver": "Daniel Ochieng", "max_load": 15000, "acquisition_cost": 85000},
        {"plate": "TX-6620", "make": "Renault", "model": "Master", "year": 2022, "type": "Van", "status": "active", "odometer": 76540, "fuel_type": "Diesel", "driver": "Sofia Rossi", "max_load": 2500, "acquisition_cost": 35000},
        {"plate": "TX-8834", "make": "Iveco", "model": "Daily", "year": 2019, "type": "Van", "status": "retired", "odometer": 410500, "fuel_type": "Diesel", "max_load": 2500, "acquisition_cost": 35000},
        {"plate": "TX-2251", "make": "MAN", "model": "TGX", "year": 2023, "type": "Truck", "status": "active", "odometer": 61220, "fuel_type": "Diesel", "driver": "Ahmed Al-Farsi", "max_load": 15000, "acquisition_cost": 85000},
    ]
    for v in vehicles_data:
        if not Vehicle.objects.filter(plate=v["plate"]).exists():
            Vehicle.objects.create(**v)
            print(f"Created vehicle: {v['plate']}")

    # Seed Drivers
    drivers_data = [
        {"name": "James Carter", "email": "james@transitops.com", "phone": "+1 415 555 0142", "license": "CDL-A", "status": "on-trip", "rating": 4.8, "trips": 312, "vehicle": "TX-4821", "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Priya Shah", "email": "priya@transitops.com", "phone": "+1 415 555 0178", "license": "CDL-A", "status": "off-duty", "rating": 4.9, "trips": 428, "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Mia Nguyen", "email": "mia@transitops.com", "phone": "+1 415 555 0154", "license": "CDL-B", "status": "on-trip", "rating": 4.7, "trips": 201, "vehicle": "TX-1145", "license_category": "Light Truck", "license_expiry": "2027-12-31"},
        {"name": "Daniel Ochieng", "email": "daniel@transitops.com", "phone": "+254 700 123456", "license": "CDL-A", "status": "available", "rating": 4.6, "trips": 178, "vehicle": "TX-3391", "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Sofia Rossi", "email": "sofia@transitops.com", "phone": "+39 331 555 8821", "license": "CDL-B", "status": "on-trip", "rating": 4.9, "trips": 355, "vehicle": "TX-6620", "license_category": "Light Truck", "license_expiry": "2027-12-31"},
        {"name": "Ahmed Al-Farsi", "email": "ahmed@transitops.com", "phone": "+971 50 555 3311", "license": "CDL-A", "status": "available", "rating": 4.5, "trips": 142, "vehicle": "TX-2251", "license_category": "Heavy Truck", "license_expiry": "2027-12-31"},
        {"name": "Lena Müller", "email": "lena@transitops.com", "phone": "+49 151 555 7788", "license": "CDL-A", "status": "suspended", "rating": 3.9, "trips": 88, "license_category": "Heavy Truck", "license_expiry": "2024-01-01"},
    ]
    for d in drivers_data:
        if not Driver.objects.filter(email=d["email"]).exists():
            Driver.objects.create(**d)
            print(f"Created driver: {d['name']}")

    # Seed Trips
    trips_data = [
        {"vehicle": "TX-4821", "driver": "James Carter", "origin": "San Francisco, CA", "destination": "Los Angeles, CA", "distance": 615, "started_at": "2026-07-11 06:20", "status": "in-progress", "cargo_weight": 450, "planned_distance": 615},
        {"vehicle": "TX-1145", "driver": "Mia Nguyen", "origin": "Oakland, CA", "destination": "Sacramento, CA", "distance": 138, "started_at": "2026-07-11 08:00", "status": "in-progress", "cargo_weight": 300, "planned_distance": 138},
        {"vehicle": "TX-3391", "driver": "Daniel Ochieng", "origin": "Portland, OR", "destination": "Seattle, WA", "distance": 280, "started_at": "2026-07-11 05:15", "status": "completed", "cargo_weight": 800, "planned_distance": 280},
        {"vehicle": "TX-6620", "driver": "Sofia Rossi", "origin": "Milan, IT", "destination": "Rome, IT", "distance": 580, "started_at": "2026-07-12 07:00", "status": "scheduled", "cargo_weight": 600, "planned_distance": 580},
        {"vehicle": "TX-2251", "driver": "Ahmed Al-Farsi", "origin": "Dubai, AE", "destination": "Abu Dhabi, AE", "distance": 150, "started_at": "2026-07-10 14:30", "status": "completed", "cargo_weight": 200, "planned_distance": 150},
        {"vehicle": "TX-4821", "driver": "James Carter", "origin": "Fresno, CA", "destination": "San Diego, CA", "distance": 520, "started_at": "2026-07-09 09:00", "status": "cancelled", "cargo_weight": 400, "planned_distance": 520},
    ]
    for t in trips_data:
        if not Trip.objects.filter(started_at=t["started_at"], vehicle=t["vehicle"]).exists():
            Trip.objects.create(**t)
            print(f"Created trip: {t['origin']} -> {t['destination']}")

    # Seed Maintenance
    maintenance_data = [
        {"vehicle": "TX-9012", "type": "Engine overhaul", "due_date": "2026-07-15", "cost": 4800, "status": "in-progress", "workshop": "MetroFleet Garage"},
        {"vehicle": "TX-4821", "type": "Tire rotation", "due_date": "2026-07-20", "cost": 220, "status": "scheduled", "workshop": "QuickTire Center"},
        {"vehicle": "TX-3391", "type": "Brake service", "due_date": "2026-07-05", "cost": 640, "status": "overdue", "workshop": "MetroFleet Garage"},
        {"vehicle": "TX-1145", "type": "Oil change", "due_date": "2026-06-28", "cost": 145, "status": "completed", "workshop": "Rapid Lube"},
        {"vehicle": "TX-2251", "type": "Annual inspection", "due_date": "2026-08-01", "cost": 380, "status": "scheduled", "workshop": "MetroFleet Garage"},
        {"vehicle": "TX-7788", "type": "Battery diagnostics", "due_date": "2026-07-13", "cost": 210, "status": "scheduled", "workshop": "EV Service Hub"},
    ]
    for m in maintenance_data:
        Maintenance.objects.create(**m)
        print(f"Created maintenance: {m['type']} for {m['vehicle']}")
        if not Maintenance.objects.filter(vehicle=m["vehicle"], due_date=m["due_date"]).exists():
            Maintenance.objects.create(**m)
            print(f"Created maintenance: {m['type']} for {m['vehicle']}")

    # Seed Fuel Logs
    fuel_data = [
        {"vehicle": "TX-4821", "driver": "James Carter", "date": "2026-07-10", "liters": 320, "cost": 512.8, "odometer": 128200, "station": "Shell #221"},
        {"vehicle": "TX-3391", "driver": "Daniel Ochieng", "date": "2026-07-10", "liters": 280, "cost": 448.0, "odometer": 301950, "station": "BP Truckstop 14"},
        {"vehicle": "TX-1145", "driver": "Mia Nguyen", "date": "2026-07-09", "liters": 95, "cost": 152.3, "odometer": 45080, "station": "Chevron #98"},
        {"vehicle": "TX-6620", "driver": "Sofia Rossi", "date": "2026-07-09", "liters": 110, "cost": 189.2, "odometer": 76400, "station": "Eni Autostrada"},
        {"vehicle": "TX-2251", "driver": "Ahmed Al-Farsi", "date": "2026-07-08", "liters": 210, "cost": 178.5, "odometer": 61080, "station": "ADNOC 03"},
    ]
    for f in fuel_data:
        FuelLog.objects.create(**f)
        print(f"Created fuel log: {f['vehicle']} on {f['date']}")
        if not FuelLog.objects.filter(vehicle=f["vehicle"], date=f["date"]).exists():
            FuelLog.objects.create(**f)
            print(f"Created fuel log: {f['vehicle']} on {f['date']}")

    # Seed Expenses
    expenses_data = [
        {"date": "2026-07-10", "category": "Fuel", "vehicle": "TX-4821", "description": "Diesel refill — Shell #221", "amount": 512.8, "status": "approved"},
        {"date": "2026-07-09", "category": "Tolls", "vehicle": "TX-1145", "description": "I-80 toll pass", "amount": 42, "status": "approved"},
        {"date": "2026-07-08", "category": "Maintenance", "vehicle": "TX-9012", "description": "Engine overhaul deposit", "amount": 2400, "status": "pending"},
        {"date": "2026-07-07", "category": "Insurance", "description": "Fleet policy renewal", "amount": 8600, "status": "approved"},
        {"date": "2026-07-06", "category": "Other", "vehicle": "TX-3391", "description": "Cabin cleaning", "amount": 85, "status": "rejected"},
        {"date": "2026-07-05", "category": "Salary", "description": "Driver overtime — June", "amount": 3200, "status": "approved"},
    ]
    for e in expenses_data:
        Expense.objects.create(**e)
        print(f"Created expense: {e['description']}")
        if not Expense.objects.filter(description=e["description"], date=e["date"]).exists():
            Expense.objects.create(**e)
            print(f"Created expense: {e['description']}")

    print("Database seeding completed.")

if __name__ == '__main__':
    seed_db()
