from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, UserViewSet, JobViewSet, ProfileViewSet, SavedCandidateViewSet, ApplicationViewSet, ConversationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'saved-candidates', SavedCandidateViewSet, basename='saved-candidate')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
]
