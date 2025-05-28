from django.urls import path
from . import views

app_name = 'weather_app'

urlpatterns = [
    path('', views.index, name='index'),
    path('city-autocomplite/', views.autocomplite, name='city-autocomplete'),
    path('weather-prediction/', views.get_weather, name='weather-predict'),
    path('api/quantity-requests/<int:city_id>/', views.search_counter, name='search_counter')
]