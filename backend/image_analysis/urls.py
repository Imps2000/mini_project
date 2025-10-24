from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ImageAnalysisViewSet, spotify_recommend

router = DefaultRouter()
router.register(r'images', ImageAnalysisViewSet, basename='image')

urlpatterns = [
    path('', include(router.urls)),
    path('spotify/recommend/', spotify_recommend, name='spotify-recommend'),
]
