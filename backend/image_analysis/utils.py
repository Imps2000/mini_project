from PIL import Image
import io
import os


def analyze_image(image_file):
    """
    이미지를 분석하여 다양한 정보를 추출합니다.

    Args:
        image_file: Django UploadedFile 객체

    Returns:
        dict: 분석 결과를 담은 딕셔너리
    """
    try:
        # 이미지 열기
        img = Image.open(image_file)

        # 기본 정보 추출
        width, height = img.size
        format_name = img.format
        mode = img.mode

        # 색상 분석
        colors = analyze_colors(img)

        # 밝기 분석
        brightness = analyze_brightness(img)

        # 파일 크기
        image_file.seek(0, os.SEEK_END)
        file_size = image_file.tell()
        image_file.seek(0)

        analysis_result = {
            'dimensions': {
                'width': width,
                'height': height,
                'aspect_ratio': round(width / height, 2)
            },
            'format': format_name,
            'mode': mode,
            'file_size_bytes': file_size,
            'file_size_kb': round(file_size / 1024, 2),
            'colors': colors,
            'brightness': brightness,
            'is_grayscale': mode in ['L', 'LA'],
            'has_transparency': mode in ['RGBA', 'LA', 'PA']
        }

        return analysis_result

    except Exception as e:
        return {
            'error': str(e),
            'message': '이미지 분석 중 오류가 발생했습니다.'
        }


def analyze_colors(img):
    """이미지의 주요 색상 정보를 분석합니다."""
    try:
        # RGB로 변환
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # 이미지 크기 조정 (성능 향상)
        img_small = img.resize((100, 100))

        # 색상 히스토그램
        colors = img_small.getcolors(10000)

        if colors:
            # 가장 많이 사용된 색상 상위 5개
            sorted_colors = sorted(colors, key=lambda x: x[0], reverse=True)[:5]
            dominant_colors = [
                {
                    'rgb': color[1],
                    'count': color[0]
                }
                for color in sorted_colors
            ]

            return {
                'dominant_colors': dominant_colors,
                'unique_colors_count': len(colors)
            }

        return {'dominant_colors': [], 'unique_colors_count': 0}

    except Exception as e:
        return {'error': str(e)}


def analyze_brightness(img):
    """이미지의 평균 밝기를 분석합니다."""
    try:
        # 그레이스케일로 변환
        grayscale = img.convert('L')

        # 작은 크기로 리사이즈
        grayscale_small = grayscale.resize((100, 100))

        # 픽셀 값들의 평균 계산
        pixels = list(grayscale_small.getdata())
        avg_brightness = sum(pixels) / len(pixels)

        # 0-255를 0-100으로 정규화
        brightness_percentage = round((avg_brightness / 255) * 100, 2)

        # 밝기 레벨 분류
        if brightness_percentage < 30:
            level = 'dark'
        elif brightness_percentage < 70:
            level = 'medium'
        else:
            level = 'bright'

        return {
            'average': brightness_percentage,
            'level': level
        }

    except Exception as e:
        return {'error': str(e)}


def get_image_metadata(image_file):
    """이미지 파일의 메타데이터를 추출합니다."""
    try:
        img = Image.open(image_file)

        # EXIF 데이터가 있는 경우
        exif_data = {}
        if hasattr(img, '_getexif') and img._getexif():
            exif = img._getexif()
            if exif:
                for tag_id, value in exif.items():
                    try:
                        from PIL.ExifTags import TAGS
                        tag = TAGS.get(tag_id, tag_id)
                        exif_data[tag] = str(value)
                    except:
                        pass

        image_file.seek(0)
        return exif_data

    except Exception as e:
        return {}
