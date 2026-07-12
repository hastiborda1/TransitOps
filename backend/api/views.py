from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction

from .models import Vehicle, Driver, Trip, Maintenance, FuelLog, Expense
from .serializers import (
    VehicleSerializer,
    DriverSerializer,
    TripSerializer,
    MaintenanceSerializer,
    FuelLogSerializer,
    ExpenseSerializer,
)
from .permissions import RoleBasedPermission

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
    permission_classes = [RoleBasedPermission]
    allowed_roles = {
        'manager': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        'driver': ['SAFE_METHODS'],
        'safety': ['SAFE_METHODS'],
        'finance': ['SAFE_METHODS'],
    }

class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.all().order_by('-id')
    serializer_class = DriverSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = {
        'manager': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        'driver': ['SAFE_METHODS'],
        'safety': ['GET', 'PUT', 'PATCH'],
        'finance': ['SAFE_METHODS'],
    }

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-id')
    serializer_class = TripSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = {
        'manager': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        'driver': ['GET', 'POST'],
        'safety': ['SAFE_METHODS'],
        'finance': ['SAFE_METHODS'],
    }

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        vehicle_plate = data.get('vehiclePlate')
        driver_name = data.get('driverName')
        cargo_weight = int(data.get('cargoWeight', 0))
        distance = int(data.get('distance', 100))

        # Check vehicle exists and is available, using select_for_update() to prevent concurrent changes
        try:
            vehicle = Vehicle.objects.select_for_update().get(plate=vehicle_plate)
        except Vehicle.DoesNotExist:
            return Response({"detail": "Vehicle not found"}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce business rules
        if vehicle.status in ['In Shop', 'Retired']:
            return Response({"detail": "Vehicle is in maintenance or retired"}, status=status.HTTP_400_BAD_REQUEST)
        if vehicle.status == 'On Trip':
            return Response({"detail": "Vehicle is already assigned to an active trip"}, status=status.HTTP_400_BAD_REQUEST)
        if cargo_weight > vehicle.max_load:
            return Response({"detail": f"Cargo weight exceeds vehicle max load of {vehicle.max_load} kg"}, status=status.HTTP_400_BAD_REQUEST)

        # Check driver exists and is available, using select_for_update() to prevent concurrent changes
        try:
            driver = Driver.objects.select_for_update().get(name=driver_name)
        except Driver.DoesNotExist:
            return Response({"detail": "Driver not found"}, status=status.HTTP_400_BAD_REQUEST)

        if driver.status == 'Suspended':
            return Response({"detail": "Driver has suspended status"}, status=status.HTTP_400_BAD_REQUEST)
        if driver.status == 'On Trip':
            return Response({"detail": "Driver is already assigned to an active trip"}, status=status.HTTP_400_BAD_REQUEST)
        
        if driver.license_expiry:
            try:
                # Simple date check
                expiry_date = timezone.datetime.strptime(driver.license_expiry, "%Y-%m-%d").date()
                if expiry_date < timezone.now().date():
                    return Response({"detail": "Driver's license is expired"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                pass

        started_at = timezone.now().strftime("%Y-%m-%d %H:%M")

        # Create Trip as Draft
        trip = Trip.objects.create(
            vehicle=vehicle,
            driver=driver,
            origin=data.get('origin'),
            destination=data.get('destination'),
            distance=distance,
            cargo_weight=cargo_weight,
            planned_distance=distance,
            started_at=started_at,
            status='Draft'
        )

        serializer = self.get_serializer(trip)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=['post'], url_path='update-status')
    @transaction.atomic
    def update_status(self, request, pk=None):
        trip = Trip.objects.select_for_update().get(pk=pk)
        new_status = request.data.get('status')
        actual_distance = request.data.get('actualDistance')
        fuel_consumed = request.data.get('fuelConsumed')

        # Select vehicle and driver for update
        vehicle = Vehicle.objects.select_for_update().get(id=trip.vehicle_id)
        driver = Driver.objects.select_for_update().get(id=trip.driver_id)

        # Dispatching changes statuses to 'On Trip'
        if new_status == 'Dispatched':
            vehicle.status = 'On Trip'
            vehicle.save()
            driver.status = 'On Trip'
            driver.save()
        
        # Completing changes statuses back to 'Available'
        elif new_status == 'Completed':
            dist = int(actual_distance) if actual_distance else trip.distance
            vehicle.odometer += dist
            vehicle.status = 'Available'
            vehicle.save()
            
            driver.status = 'Available'
            driver.trips += 1
            driver.save()

            # Create Fuel Log automatically if provided
            if fuel_consumed:
                liters = Decimal(fuel_consumed)
                cost = liters * Decimal(1.6)
                today = timezone.now().strftime("%Y-%m-%d")

                FuelLog.objects.create(
                    vehicle=vehicle,
                    driver=driver,
                    date=today,
                    liters=liters,
                    cost=cost,
                    odometer=vehicle.odometer,
                    station="Auto Shell"
                )

                # Create Expense
                Expense.objects.create(
                    date=today,
                    category='Fuel',
                    vehicle=vehicle,
                    description=f"Auto-logged fuel from trip {trip.id}",
                    amount=cost,
                    status='approved'
                )

        # Cancelling a dispatched trip restores statuses to 'Available'
        elif new_status == 'Cancelled':
            vehicle.status = 'Available'
            vehicle.save()
            driver.status = 'Available'
            driver.save()

        trip.status = new_status
        trip.save()

        serializer = self.get_serializer(trip)
        return Response(serializer.data)

class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all().order_by('-id')
    serializer_class = MaintenanceSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = {
        'manager': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        'driver': [],
        'safety': ['SAFE_METHODS'],
        'finance': ['SAFE_METHODS'],
    }

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Switch vehicle status to In Shop
        vehicle = serializer.validated_data.get('vehicle')
        vehicle.status = 'In Shop'
        vehicle.save()

        # Auto log maintenance expense
        Expense.objects.create(
            date=serializer.validated_data.get('due_date'),
            category='Maintenance',
            vehicle=vehicle,
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

        # Restore vehicle status to Available unless it's Retired
        if maint.vehicle.status != 'Retired':
            maint.vehicle.status = 'Available'
            maint.vehicle.save()

        serializer = self.get_serializer(maint)
        return Response(serializer.data)

class FuelLogViewSet(viewsets.ModelViewSet):
    queryset = FuelLog.objects.all().order_by('-id')
    serializer_class = FuelLogSerializer
    permission_classes = [RoleBasedPermission]
    allowed_roles = {
        'manager': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        'driver': ['GET', 'POST'],
        'safety': ['SAFE_METHODS'],
        'finance': ['SAFE_METHODS'],
    }

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
    permission_classes = [RoleBasedPermission]
    allowed_roles = {
        'manager': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        'driver': [],
        'safety': ['SAFE_METHODS'],
        'finance': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    }

# Analytics & Reports View - Teammate B owns it, kept unmodified
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

# Custom Auth Actions
import random
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OTPStore
from .utils_email import send_brevo_email

@decorators.api_view(['POST'])
@decorators.permission_classes([])
def register_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'driver')

    if not username or not email or not password:
        return Response({"detail": "All fields (username, email, password) are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({"detail": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role
    )

    refresh = RefreshToken.for_user(user)
    
    # Send welcome email template
    welcome_template = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Welcome to TransitOps, {username}!</h2>
        <p>Your account has been registered successfully as a <strong>{role.capitalize()}</strong>.</p>
        <p>You can now manage fleet operations, track operational costs, and log dispatch trips.</p>
        <br/>
        <p>Best regards,<br/>The TransitOps Team</p>
      </body>
    </html>
    """
    send_brevo_email(email, username, "Welcome to TransitOps!", welcome_template)

    return Response({
        "token": str(refresh.access_token),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "name": user.username
    }, status=status.HTTP_201_CREATED)

@decorators.api_view(['POST'])
@decorators.permission_classes([])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    otp = str(random.randint(100000, 999999))
    OTPStore.objects.create(email=email, otp=otp)

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">TransitOps Authentication Code</h2>
        <p>Use the following 6-digit One-Time Password (OTP) to complete your sign-in / verification request:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; color: #1e3a8a; letter-spacing: 4px; margin: 20px 0;">
          {otp}
        </div>
        <p>This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        <br/>
        <p>Best regards,<br/>The TransitOps Team</p>
      </body>
    </html>
    """
    success = send_brevo_email(email, "TransitOps User", "Your Verification OTP Code", html_content)
    if success:
        return Response({"detail": "OTP sent successfully"})
    else:
        return Response({"detail": "Failed to send email OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@decorators.api_view(['POST'])
@decorators.permission_classes([])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    role = request.data.get('role', 'driver')

    if not email or not otp:
        return Response({"detail": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check OTP in last 5 minutes
    time_threshold = timezone.now() - timezone.timedelta(minutes=5)
    otp_record = OTPStore.objects.filter(email=email, otp=otp, created_at__gte=time_threshold, is_verified=False).last()

    if not otp_record:
        return Response({"detail": "Invalid or expired OTP code"}, status=status.HTTP_400_BAD_REQUEST)

    otp_record.is_verified = True
    otp_record.save()

    # Get or create user
    user, created = User.objects.get_or_create(email=email, defaults={
        'username': email.split('@')[0],
        'role': role
    })
    
    if created:
        user.set_unusable_password()
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        "token": str(refresh.access_token),
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "name": user.username
    })

@decorators.api_view(['POST'])
@decorators.permission_classes([])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Avoid user enumeration by returning 200 anyway
        return Response({"detail": "If the email exists, a reset code has been sent"})

    otp = str(random.randint(100000, 999999))
    OTPStore.objects.create(email=email, otp=otp)

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">TransitOps Password Reset Request</h2>
        <p>You requested to reset your TransitOps account password. Use this verification code to proceed:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; color: #1e3a8a; letter-spacing: 4px; margin: 20px 0;">
          {otp}
        </div>
        <p>This code expires in 10 minutes. If you did not request this, please secure your account.</p>
        <br/>
        <p>Best regards,<br/>The TransitOps Team</p>
      </body>
    </html>
    """
    send_brevo_email(email, user.username, "Reset Password Code", html_content)
    return Response({"detail": "Reset code sent successfully"})

@decorators.api_view(['POST'])
@decorators.permission_classes([])
def reset_password(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('password')

    if not email or not otp or not new_password:
        return Response({"detail": "Email, OTP and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate OTP in last 10 minutes
    time_threshold = timezone.now() - timezone.timedelta(minutes=10)
    otp_record = OTPStore.objects.filter(email=email, otp=otp, created_at__gte=time_threshold, is_verified=False).last()

    if not otp_record:
        return Response({"detail": "Invalid or expired reset code"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    otp_record.is_verified = True
    otp_record.save()

    return Response({"detail": "Password has been successfully updated"})

import urllib.request
import json

@decorators.api_view(['POST'])
@decorators.permission_classes([])
def google_login(request):
    credential = request.data.get('credential')
    role = request.data.get('role', 'manager')

    if not credential:
        return Response({"detail": "Google credential token is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Verify ID token via Google TokenInfo API (avoids dependency overhead)
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req) as response:
            payload = json.loads(response.read().decode('utf-8'))
            
        if payload.get("aud") != "901970136857-g9taqknvcb75apssmtt91ftqoluoterh.apps.googleusercontent.com":
            return Response({"detail": "Invalid client ID audience mismatch"}, status=status.HTTP_400_BAD_REQUEST)
            
        email = payload.get("email")
        name = payload.get("name", email.split('@')[0])
        
        # Get or create user
        user, created = User.objects.get_or_create(email=email, defaults={
            'username': email.split('@')[0],
            'role': role
        })
        
        refresh = RefreshToken.for_user(user)
        return Response({
            "token": str(refresh.access_token),
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "name": name
        })
    except Exception as e:
        return Response({"detail": f"Google authentication failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
