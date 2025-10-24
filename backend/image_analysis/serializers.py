from rest_framework import serializers
from .models import UploadedImage
from PIL import Image


class UploadedImageSerializer(serializers.ModelSerializer):
    """업로드된 이미지 시리얼라이저"""

    class Meta:
        model = UploadedImage
        fields = [
            'id',
            'image',
            'uploaded_at',
            'analysis_completed',
            'analysis_result',
            'file_name',
            'file_size',
            'image_width',
            'image_height',
        ]
        read_only_fields = [
            'id',
            'uploaded_at',
            'analysis_completed',
            'analysis_result',
            'file_name',
            'file_size',
            'image_width',
            'image_height',
        ]

    def validate_image(self, value):
        """이미지 파일 검증"""
        # 파일 크기 제한 (10MB)
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"이미지 파일 크기는 10MB를 초과할 수 없습니다. (현재: {value.size / 1024 / 1024:.2f}MB)"
            )

        # 이미지 포맷 검증
        allowed_formats = ['JPEG', 'JPG', 'PNG', 'GIF', 'BMP', 'WEBP']
        try:
            img = Image.open(value)
            if img.format.upper() not in allowed_formats:
                raise serializers.ValidationError(
                    f"지원되지 않는 이미지 포맷입니다. 지원 포맷: {', '.join(allowed_formats)}"
                )
            # 파일 포인터를 처음으로 되돌림
            value.seek(0)
        except Exception as e:
            raise serializers.ValidationError(f"유효하지 않은 이미지 파일입니다: {str(e)}")

        return value


class ImageAnalysisRequestSerializer(serializers.Serializer):
    """이미지 분석 요청 시리얼라이저"""
    image = serializers.ImageField()

    def validate_image(self, value):
        """이미지 파일 검증"""
        max_size = 10 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"이미지 파일 크기는 10MB를 초과할 수 없습니다."
            )
        return value
