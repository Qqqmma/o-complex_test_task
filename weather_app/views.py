from django.shortcuts import render, get_object_or_404
from django.http import HttpRequest, JsonResponse
from .utils.geocoding import get_city_coordinates
from .utils.weather_api import get_weather_prediction
from .models import City


def index(request: HttpRequest):
    search_history = None

    if 'search_history' in request.session:
        search_history = request.session['search_history'][:3]

    return render(request, 'weather_app/index.html', {'history': search_history})


def autocomplite(request: HttpRequest):
    query = request.GET.get('city', '').strip()

    if len(query) <= 2:
        return JsonResponse({'suggestions': []})
    
    suggestions = get_city_coordinates(query)

    return JsonResponse({'suggestions': suggestions}, json_dumps_params={'ensure_ascii': False})


def get_weather(request: HttpRequest):
    latitude = request.GET.get('lat', '').strip()
    longitude = request.GET.get('lon', '').strip()
    query = request.GET.get('city', '').strip()

    if 'search_history' not in request.session:
        request.session['search_history'] = []

    if query not in request.session['search_history']:
        request.session['search_history'].insert(0, query)
        request.session['search_history'] = request.session['search_history'][:3]
        request.session.modified = True


    if City.objects.filter(name=query).exists():
        city = City.objects.filter(name=query).first()
        city.quantity_requests += 1
        city.save()
    else:
        city = City(name=query)
        city.save()

    weather = get_weather_prediction(latitude, longitude)
    
    return JsonResponse({'weather_data': weather}, json_dumps_params={'ensure_ascii': False})


def search_counter(request: HttpRequest, city_id: int):
    city = get_object_or_404(City, id=city_id)
    return JsonResponse({'city': city.name, 'quantity_requests': city.quantity_requests}, json_dumps_params={'ensure_ascii': False})