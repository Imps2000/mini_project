from django.db import models
from django.utils import timezone


class UploadedImage(models.Model):
    """업로드된 이미지와 분석 결과를 저장하는 모델"""

    image = models.ImageField(upload_to='uploads/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(default=timezone.now)

    # 분석 결과 필드
    analysis_completed = models.BooleanField(default=False)
    analysis_result = models.JSONField(null=True, blank=True)

    # 이미지 메타데이터
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(null=True, blank=True)
    image_width = models.IntegerField(null=True, blank=True)
    image_height = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} - {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"
