import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transit_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Vehicle, Driver, Trip, Maintenance, FuelLog, Expense

User = get_user_model()

print("Clearing demo data...")
Vehicle.objects.all().delete()
Driver.objects.all().delete()
Trip.objects.all().delete()
Maintenance.objects.all().delete()
FuelLog.objects.all().delete()
Expense.objects.all().delete()
User.objects.all().delete()

print("Creating admin credentials...")
# Create admin@gmail.com user
user = User.objects.create_user(
    username="admin@gmail.com",
    email="admin@gmail.com",
    password="admin@123",
    role="manager"
)
user.is_superuser = True
user.is_staff = True
user.save()

print("Database reset successfully! Created user admin@gmail.com with password admin@123")
