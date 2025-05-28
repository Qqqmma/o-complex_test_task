import requests

def get_city_coordinates(city_name):
    url = "https://geocoding-api.open-meteo.com/v1/search"
    params = {
        'name': city_name,
        'count': 5,
        'language': 'ru'
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200 and response.json():
        data = response.json()['results']
        suggestions = []
        
        for item in data:
            suggestion = {
                'name': f'{item['name']}, {item['country']}',
                'lat': item['latitude'],
                'lon': item['longitude']
            }
            suggestions.append(suggestion)

        return suggestions