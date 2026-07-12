from rest_framework.permissions import BasePermission, SAFE_METHODS

class RoleBasedPermission(BasePermission):
    def has_permission(self, request, view):
        # Admin or superuser bypass
        if request.user and request.user.is_superuser:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        user_role = getattr(request.user, 'role', None)
        if not user_role:
            return False

        allowed_roles = getattr(view, 'allowed_roles', {})
        allowed_methods = allowed_roles.get(user_role, [])

        if request.method in allowed_methods:
            return True

        if 'SAFE_METHODS' in allowed_methods and request.method in SAFE_METHODS:
            return True

        return False
