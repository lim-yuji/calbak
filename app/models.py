from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start = models.DateTimeField()
    end = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    def as_dict(self):
        return {'id': self.id, 'title': self.title, 'description': self.description, 'start': str(self.start), 'end': str(self.end)}
