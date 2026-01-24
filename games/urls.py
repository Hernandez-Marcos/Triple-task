from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name='index'),
    path("api/validate/", views.validate, name='validate'),
    path("api/timer/", views.timer, name="timer")
]   