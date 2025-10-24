from django.contrib import admin
from .models import UploadedImage


@admin.register(UploadedImage)
class UploadedImageAdmin(admin.ModelAdmin):
    """업로드된 이미지 관리자 인터페이스"""

    list_display = [
        'id',
        'file_name',
        'image_width',
        'image_height',
        'file_size_display',
        'analysis_completed',
        'uploaded_at'
    ]
    list_filter = ['analysis_completed', 'uploaded_at']
    search_fields = ['file_name']
    readonly_fields = [
        'uploaded_at',
        'file_size',
        'image_width',
        'image_height',
        'analysis_result'
    ]

    fieldsets = (
        ('이미지 정보', {
            'fields': ('image', 'file_name', 'uploaded_at')
        }),
        ('메타데이터', {
            'fields': ('file_size', 'image_width', 'image_height')
        }),
        ('분석 결과', {
            'fields': ('analysis_completed', 'analysis_result')
        }),
    )

    def file_size_display(self, obj):
        """파일 크기를 읽기 쉬운 형식으로 표시"""
        if obj.file_size:
            size_kb = obj.file_size / 1024
            if size_kb < 1024:
                return f"{size_kb:.2f} KB"
            else:
                return f"{size_kb / 1024:.2f} MB"
        return "-"

    file_size_display.short_description = '파일 크기'
