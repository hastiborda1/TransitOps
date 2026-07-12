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
    CustomTokenObtainPairView
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
    path('', include(router.urls)),
]
