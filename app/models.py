from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=200)
    start = models.DateField()
    end = models.DateField()
    def as_dict(self):
        return {'id': self.id, 'title': self.title, 'start': str(self.start), 'end': str(self.end)}
