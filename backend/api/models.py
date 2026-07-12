from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('manager', 'Manager'),
        ('driver', 'Driver'),
        ('safety', 'Safety Officer'),
        ('finance', 'Financial Analyst'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='manager')

    def __str__(self):
        return f"{self.username} ({self.role})"

class Vehicle(models.Model):
    STATUS_CHOICES = (
        ('Available', 'Available'),
        ('On Trip', 'On Trip'),
        ('In Shop', 'In Shop'),
        ('Retired', 'Retired'),
    )
    FUEL_CHOICES = (
        ('Diesel', 'Diesel'),
        ('Petrol', 'Petrol'),
        ('Electric', 'Electric'),
        ('Hybrid', 'Hybrid'),
    )
    TYPE_CHOICES = (
        ('Truck', 'Truck'),
        ('Van', 'Van'),
        ('Car', 'Car'),
        ('Bus', 'Bus'),
    )
    plate = models.CharField(max_length=50, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    odometer = models.IntegerField(default=0)
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES)
    driver = models.CharField(max_length=100, blank=True, null=True)
    max_load = models.IntegerField(default=1000)
    acquisition_cost = models.IntegerField(default=20000)

    def __str__(self):
        return self.plate

class Driver(models.Model):
    STATUS_CHOICES = (
        ('Available', 'Available'),
        ('On Trip', 'On Trip'),
        ('Off Duty', 'Off Duty'),
        ('Suspended', 'Suspended'),
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50)
    license = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    trips = models.IntegerField(default=0)
    vehicle = models.CharField(max_length=50, blank=True, null=True)
    license_category = models.CharField(max_length=50, default='Light Truck')
    license_expiry = models.CharField(max_length=50, default='2027-12-31')

    def __str__(self):
        return self.name

class Trip(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Dispatched', 'Dispatched'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )
    vehicle = models.CharField(max_length=50)
    driver = models.CharField(max_length=100)
    origin = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance = models.IntegerField()
    started_at = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    cargo_weight = models.IntegerField(default=500)
    planned_distance = models.IntegerField(default=100)

    def __str__(self):
        return f"{self.origin} -> {self.destination} ({self.status})"

class Maintenance(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('in-progress', 'In Progress'),
        ('overdue', 'Overdue'),
        ('completed', 'Completed'),
    )
    vehicle = models.CharField(max_length=50)
    type = models.CharField(max_length=100)
    workshop = models.CharField(max_length=100)
    due_date = models.CharField(max_length=50)
    cost = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in-progress')

    def __str__(self):
        return f"Maint: {self.vehicle} - {self.type}"

class FuelLog(models.Model):
    vehicle = models.CharField(max_length=50)
    driver = models.CharField(max_length=100)
    date = models.CharField(max_length=50)
    liters = models.DecimalField(max_digits=10, decimal_places=2)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    odometer = models.IntegerField()
    station = models.CharField(max_length=100)

    def __str__(self):
        return f"Fuel: {self.vehicle} - {self.date}"

class Expense(models.Model):
    CATEGORY_CHOICES = (
        ('Fuel', 'Fuel'),
        ('Maintenance', 'Maintenance'),
        ('Insurance', 'Insurance'),
        ('Tolls', 'Tolls'),
        ('Salary', 'Salary'),
        ('Other', 'Other'),
    )
    STATUS_CHOICES = (
        ('approved', 'Approved'),
        ('pending', 'Pending'),
        ('rejected', 'Rejected'),
    )
    date = models.CharField(max_length=50)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    vehicle = models.CharField(max_length=50, blank=True, null=True)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')

    def __str__(self):
        return f"Expense: {self.category} - {self.amount}"
