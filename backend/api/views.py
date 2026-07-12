from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Vehicle, Driver, Trip, Maintenance, FuelLog, Expense
from .serializers import (
    VehicleSerializer,
    DriverSerializer,
    TripSerializer,
    MaintenanceSerializer,
    FuelLogSerializer,
    ExpenseSerializer,
)

User = get_user_model()

# Custom JWT View
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['email'] = self.user.email
        data['name'] = self.user.username
        data['role'] = getattr(self.user, 'role', 'manager')
        data['token'] = data['access']
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# ViewSets
class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by('-id')
    serializer_class = VehicleSerializer

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-id')
    serializer_class = DriverSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-id')
    serializer_class = TripSerializer

    def create(self, request, *args, **kwargs):
        # Handle custom creation payload mapping vehiclePlate -> vehicle, driverName -> driver
        data = request.data
        vehicle_plate = data.get('vehiclePlate')
        driver_name = data.get('driverName')
        cargo_weight = int(data.get('cargoWeight', 0))
        distance = int(data.get('distance', 100))

        # Check vehicle exists and is available
        try:
            vehicle = Vehicle.objects.get(plate=vehicle_plate)
        except Vehicle.DoesNotExist:
            return Response({"detail": "Vehicle not found"}, status=status.HTTP_400_BAD_REQUEST)

        if vehicle.status in ['maintenance', 'retired']:
            return Response({"detail": "Vehicle is in maintenance or retired"}, status=status.HTTP_400_BAD_REQUEST)
        if vehicle.status == 'active':
            return Response({"detail": "Vehicle is already marked On Trip"}, status=status.HTTP_400_BAD_REQUEST)
        if cargo_weight > vehicle.max_load:
            return Response({"detail": f"Cargo weight exceeds vehicle max load of {vehicle.max_load} kg"}, status=status.HTTP_400_BAD_REQUEST)

        # Check driver exists and is available
        try:
            driver = Driver.objects.get(name=driver_name)
        except Driver.DoesNotExist:
            return Response({"detail": "Driver not found"}, status=status.HTTP_400_BAD_REQUEST)

        if driver.status == 'suspended':
            return Response({"detail": "Driver has suspended status"}, status=status.HTTP_400_BAD_REQUEST)
        if driver.status == 'on-trip':
            return Response({"detail": "Driver is already assigned to an active trip"}, status=status.HTTP_400_BAD_REQUEST)

        started_at = timezone.now().strftime("%Y-%m-%d %H:%M")

        # Create Trip
        trip = Trip.objects.create(
            vehicle=vehicle_plate,
            driver=driver_name,
            origin=data.get('origin'),
            destination=data.get('destination'),
            distance=distance,
            cargo_weight=cargo_weight,
            planned_distance=distance,
            started_at=started_at,
            status='scheduled'
        )

        serializer = self.get_serializer(trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        trip = self.get_object()
        new_status = request.data.get('status')
        actual_distance = request.data.get('actualDistance')
        fuel_consumed = request.data.get('fuelConsumed')

        if new_status == 'in-progress':
            # Dispatch
            Vehicle.objects.filter(plate=trip.vehicle).update(status='active')
            Driver.objects.filter(name=trip.driver).update(status='on-trip')
        elif new_status == 'completed':
            # Complete
            dist = int(actual_distance) if actual_distance else trip.distance
            # Update vehicle odometer and status
            try:
                v = Vehicle.objects.get(plate=trip.vehicle)
                v.odometer += dist
                v.status = 'idle'
                v.save()
            except Vehicle.DoesNotExist:
                pass
            
            # Update driver
            try:
                d = Driver.objects.get(name=trip.driver)
                d.status = 'available'
                d.trips += 1
                d.save()
            except Driver.DoesNotExist:
                pass

            # Create Fuel Log automatically if provided
            if fuel_consumed:
                liters = Decimal(fuel_consumed)
                cost = liters * Decimal(1.6) # auto cost logic
                today = timezone.now().strftime("%Y-%m-%d")
                
                # Fetch fresh odometer
                odo = 100000
                try:
                    odo = Vehicle.objects.get(plate=trip.vehicle).odometer
                except:
                    pass

                FuelLog.objects.create(
                    vehicle=trip.vehicle,
                    driver=trip.driver,
                    date=today,
                    liters=liters,
                    cost=cost,
                    odometer=odo,
                    station="Auto Shell"
                )

                # Create Expense
                Expense.objects.create(
                    date=today,
                    category='Fuel',
                    vehicle=trip.vehicle,
                    description=f"Auto-logged fuel from trip {trip.id}",
                    amount=cost,
                    status='approved'
                )

        elif new_status == 'cancelled':
            # Restore Available
            Vehicle.objects.filter(plate=trip.vehicle).update(status='idle')
            Driver.objects.filter(name=trip.driver).update(status='available')

        trip.status = new_status
        trip.save()

        serializer = self.get_serializer(trip)
        return Response(serializer.data)

class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all().order_by('-id')
    serializer_class = MaintenanceSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Switch vehicle status to maintenance
        vehicle_plate = serializer.validated_data.get('vehicle')
        Vehicle.objects.filter(plate=vehicle_plate).update(status='maintenance')

        # Auto log maintenance expense
        Expense.objects.create(
            date=serializer.validated_data.get('due_date'),
            category='Maintenance',
            vehicle=vehicle_plate,
            description=f"Maintenance: {serializer.validated_data.get('type')}",
            amount=Decimal(serializer.validated_data.get('cost')),
            status='approved'
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        maint = self.get_object()
        maint.status = 'completed'
        maint.save()

        # Restore vehicle status to idle unless it's retired
        Vehicle.objects.filter(plate=maint.vehicle).exclude(status='retired').update(status='idle')

        serializer = self.get_serializer(maint)
        return Response(serializer.data)

class FuelLogViewSet(viewsets.ModelViewSet):
    queryset = FuelLog.objects.all().order_by('-id')
    serializer_class = FuelLogSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Auto log fuel expense
        Expense.objects.create(
            date=serializer.validated_data.get('date'),
            category='Fuel',
            vehicle=serializer.validated_data.get('vehicle'),
            description=f"Fuel refill - {serializer.validated_data.get('station')}",
            amount=Decimal(serializer.validated_data.get('cost')),
            status='approved'
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-id')
    serializer_class = ExpenseSerializer

# Analytics & Reports View
class AnalyticsView(viewsets.ViewSet):
    @decorators.action(detail=False, methods=['get'], url_path='monthly')
    def get_monthly(self, request):
        data = [
            { "month": "Jan", "trips": 210, "distance": 42000, "fuelCost": 18400 },
            { "month": "Feb", "trips": 232, "distance": 46800, "fuelCost": 19200 },
            { "month": "Mar", "trips": 268, "distance": 51200, "fuelCost": 21400 },
            { "month": "Apr", "trips": 254, "distance": 49200, "fuelCost": 20800 },
            { "month": "May", "trips": 289, "distance": 55100, "fuelCost": 22600 },
            { "month": "Jun", "trips": 305, "distance": 58400, "fuelCost": 23800 },
            { "month": "Jul", "trips": 322, "distance": 61200, "fuelCost": 24950 }
        ]
        return Response(data)

    @decorators.action(detail=False, methods=['get'], url_path='breakdown')
    def get_breakdown(self, request):
        data = [
            { "name": "Fuel", "value": 24950 },
            { "name": "Maintenance", "value": 12480 },
            { "name": "Insurance", "value": 8600 },
            { "name": "Tolls", "value": 3120 },
            { "name": "Salary", "value": 18400 },
            { "name": "Other", "value": 2100 }
        ]
        return Response(data)
