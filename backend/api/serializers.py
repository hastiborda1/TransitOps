from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Vehicle, Driver, Trip, Maintenance, FuelLog, Expense

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class VehicleSerializer(serializers.ModelSerializer):
    fuelType = serializers.CharField(source='fuel_type')
    maxLoad = serializers.IntegerField(source='max_load')
    acquisitionCost = serializers.IntegerField(source='acquisition_cost')

    class Meta:
        model = Vehicle
        fields = ['id', 'plate', 'make', 'model', 'year', 'type', 'status', 'odometer', 'fuelType', 'driver', 'maxLoad', 'acquisitionCost']

class DriverSerializer(serializers.ModelSerializer):
    licenseCategory = serializers.CharField(source='license_category')
    licenseExpiry = serializers.CharField(source='license_expiry')

    class Meta:
        model = Driver
        fields = ['id', 'name', 'email', 'phone', 'license', 'status', 'rating', 'trips', 'vehicle', 'licenseCategory', 'licenseExpiry']

class TripSerializer(serializers.ModelSerializer):
    startedAt = serializers.CharField(source='started_at')
    cargoWeight = serializers.IntegerField(source='cargo_weight')
    plannedDistance = serializers.IntegerField(source='planned_distance')

    class Meta:
        model = Trip
        fields = ['id', 'vehicle', 'driver', 'origin', 'destination', 'distance', 'startedAt', 'status', 'cargoWeight', 'plannedDistance']

class MaintenanceSerializer(serializers.ModelSerializer):
    dueDate = serializers.CharField(source='due_date')

    class Meta:
        model = Maintenance
        fields = ['id', 'vehicle', 'type', 'workshop', 'dueDate', 'cost', 'status']

class FuelLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelLog
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
