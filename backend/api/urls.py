from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VehicleViewSet,
    DriverViewSet,
    TripViewSet,
    MaintenanceViewSet,
    FuelLogViewSet,
    ExpenseViewSet,
    AnalyticsView,
    CustomTokenObtainPairView,
    register_user,
    send_otp,
    verify_otp,
    forgot_password,
    reset_password,
    google_login
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'drivers', DriverViewSet, basename='driver')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'maintenance', MaintenanceViewSet, basename='maintenance')
router.register(r'fuel', FuelLogViewSet, basename='fuel')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'analytics', AnalyticsView, basename='analytics')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/register/', register_user, name='auth_register'),
    path('auth/send-otp/', send_otp, name='auth_send_otp'),
    path('auth/verify-otp/', verify_otp, name='auth_verify_otp'),
    path('auth/forgot-password/', forgot_password, name='auth_forgot_password'),
    path('auth/reset-password/', reset_password, name='auth_reset_password'),
    path('auth/google/', google_login, name='auth_google_login'),
    path('', include(router.urls)),
]
