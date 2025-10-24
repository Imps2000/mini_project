from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
import io

from .models import UploadedImage
from .serializers import UploadedImageSerializer, ImageAnalysisRequestSerializer
from .utils import analyze_image, get_image_metadata
from .spotify_service import spotify_service


class ImageAnalysisViewSet(viewsets.ModelViewSet):
    """
    이미지 업로드 및 분석 API ViewSet

    - list: 업로드된 이미지 목록 조회
    - create: 이미지 업로드 및 자동 분석
    - retrieve: 특정 이미지 조회
    - update/partial_update: 이미지 정보 수정
    - destroy: 이미지 삭제
    - analyze: 이미지 재분석
    """

    queryset = UploadedImage.objects.all()
    serializer_class = UploadedImageSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        """이미지 업로드 및 자동 분석"""
        print("=== Image Upload Request ===")
        print("FILES:", request.FILES)
        print("DATA:", request.data)

        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # serializer.is_valid(raise_exception=True)

        # 이미지 파일 가져오기
        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': '이미지 파일이 필요합니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 파일 이름 저장
        file_name = image_file.name

        # 이미지 정보 추출
        try:
            img = Image.open(image_file)
            width, height = img.size
            file_size = image_file.size

            # 파일 포인터 초기화
            image_file.seek(0)
        except Exception as e:
            return Response(
                {'error': f'이미지 파일을 읽을 수 없습니다: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 모델 인스턴스 생성
        instance = serializer.save(
            file_name=file_name,
            file_size=file_size,
            image_width=width,
            image_height=height
        )

        # 이미지 분석 수행
        try:
            image_file.seek(0)
            analysis_result = analyze_image(image_file)

            # EXIF 메타데이터 추출
            image_file.seek(0)
            metadata = get_image_metadata(image_file)
            if metadata:
                analysis_result['metadata'] = metadata

            # 분석 결과 저장
            instance.analysis_result = analysis_result
            instance.analysis_completed = True
            instance.save()

        except Exception as e:
            instance.analysis_result = {
                'error': str(e),
                'message': '이미지 분석 중 오류가 발생했습니다.'
            }
            instance.analysis_completed = False
            instance.save()

        # 응답 반환
        response_serializer = self.get_serializer(instance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """
        특정 이미지 재분석
        POST /api/images/{id}/analyze/
        """
        instance = self.get_object()

        try:
            # 저장된 이미지 파일 열기
            image_file = instance.image.open('rb')

            # 이미지 분석
            analysis_result = analyze_image(image_file)

            # EXIF 메타데이터 추출
            image_file.seek(0)
            metadata = get_image_metadata(image_file)
            if metadata:
                analysis_result['metadata'] = metadata

            # 결과 저장
            instance.analysis_result = analysis_result
            instance.analysis_completed = True
            instance.save()

            image_file.close()

            serializer = self.get_serializer(instance)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e), 'message': '이미지 분석 중 오류가 발생했습니다.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def quick_analyze(self, request):
        """
        이미지를 저장하지 않고 즉시 분석
        POST /api/images/quick_analyze/
        """
        serializer = ImageAnalysisRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': '이미지 파일이 필요합니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 이미지 분석
            analysis_result = analyze_image(image_file)

            # 기본 정보 추가
            image_file.seek(0)
            img = Image.open(image_file)
            width, height = img.size

            result = {
                'file_name': image_file.name,
                'file_size': image_file.size,
                'dimensions': {
                    'width': width,
                    'height': height
                },
                'analysis': analysis_result
            }

            # EXIF 메타데이터 추출
            image_file.seek(0)
            metadata = get_image_metadata(image_file)
            if metadata:
                result['metadata'] = metadata

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e), 'message': '이미지 분석 중 오류가 발생했습니다.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def list(self, request, *args, **kwargs):
        """업로드된 이미지 목록 조회"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """특정 이미지 상세 조회"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['POST'])
def spotify_recommend(request):
    """
    Spotify 음악 추천 API
    POST /api/spotify/recommend/
    Body: { "category": "bright_warm" }
    """
    category = request.data.get('category', 'balanced')

    try:
        track = spotify_service.get_recommendations(category)
        return Response(track, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e), 'message': '음악 추천에 실패했습니다.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
