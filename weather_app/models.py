from django.db import models
from transliterate import translit

class City(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    quantity_requests = models.IntegerField(default=1)

    def save(self, *args, **kwargs):
        self.slug = translit(self.name.replace(', ', '_'), reversed=True).lower()
        super(City, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

