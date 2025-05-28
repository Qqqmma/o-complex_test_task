import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry

cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)


def get_weather_prediction(latitude: float, longitude: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": [
            "temperature_2m",
            "apparent_temperature",  # Ощущаемая температура
            "cloud_cover",           # Облачность (%)
            "precipitation_probability"  # Вероятность осадков (%)
        ],
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    hourly = response.Hourly()
    
    hourly_data = {
        "date": pd.date_range(
            start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
            end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left"
        )
    }

    hourly_data["temperature_2m"] = hourly.Variables(0).ValuesAsNumpy()
    hourly_data["apparent_temperature"] = hourly.Variables(1).ValuesAsNumpy()
    hourly_data["cloud_cover"] = hourly.Variables(2).ValuesAsNumpy()
    hourly_data["precipitation_probability"] = hourly.Variables(3).ValuesAsNumpy()

    hourly_dataframe = pd.DataFrame(data=hourly_data)
    return hourly_dataframe.to_json()